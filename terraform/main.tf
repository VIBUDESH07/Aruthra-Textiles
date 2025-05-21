provider "aws" {
  region = "us-east-1"
}

# SSH Key Pair (shared for both)
resource "tls_private_key" "ecs_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "ecs_key" {
  key_name   = "ecs-key"
  public_key = tls_private_key.ecs_key.public_key_openssh
}

output "private_key_pem" {
  value     = tls_private_key.ecs_key.private_key_pem
  sensitive = true
}

# Get default VPC and subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "availability-zone"
    values = ["us-east-1a", "us-east-1b", "us-east-1c"]
  }
}

# === BACKEND ===

# Backend SG for ALB (allow HTTP 80)
resource "aws_security_group" "backend_alb_sg" {
  name        = "backend_alb_sg"
  description = "Allow HTTP inbound to backend ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Backend SG for ECS instances (allow port 5000 from backend ALB only)
resource "aws_security_group" "backend_ecs_sg" {
  name        = "backend_ecs_sg"
  description = "Allow traffic from backend ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# IAM Role & Instance Profile for ECS Instances (shared)
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRolefull"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecsInstanceProfile_v2"
  role = aws_iam_role.ecs_instance_role.name
}

# Backend ECS Cluster
resource "aws_ecs_cluster" "backend_cluster" {
  name = "aruthra-backend-cluster"
}

# Latest ECS Optimized AMI
data "aws_ami" "ecs_ami" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

# Backend Launch Template
resource "aws_launch_template" "backend_lt" {
  name_prefix   = "backend-ecs-launch-template-"
  image_id      = data.aws_ami.ecs_ami.id
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }

  key_name = aws_key_pair.ecs_key.key_name

  vpc_security_group_ids = [aws_security_group.backend_ecs_sg.id]

  user_data = base64encode(<<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.backend_cluster.name} >> /etc/ecs/ecs.config
EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "backend-ecs-instance"
    }
  }
}

# Backend ASG
resource "aws_autoscaling_group" "backend_asg" {
  name_prefix         = "backend-ecs-asg-"
  max_size            = 2
  min_size            = 1
  desired_capacity    = 1
  vpc_zone_identifier = data.aws_subnets.default.ids

  launch_template {
    id      = aws_launch_template.backend_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "backend-ecs-instance"
    propagate_at_launch = true
  }
}

# Backend ALB
resource "aws_lb" "backend_alb" {
  name               = "aruthra-backend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.backend_alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Backend Target Group
resource "aws_lb_target_group" "backend_tg" {
  name     = "aruthra-backend-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }
}

# Backend ALB Listener
resource "aws_lb_listener" "backend_http" {
  load_balancer_arn = aws_lb.backend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend_task" {
  family                   = "aruthra-backend-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "307946674949.dkr.ecr.us-east-1.amazonaws.com/full_stack:backend"
      essential = true
      portMappings = [{
        containerPort = 5000
        hostPort      = 5000
      }]
      environment = [
        {
          name  = "JWT_SECRET"
          value = "86ba1631901f7ffb7f6734ebb0ed715fdd4aa14233f383d8297a8760b16a950dbee06ef283fcae256f099a41c21ff350de0447dd56f49902aa61417d523"
        },
        {
          name  = "MONGO_URI"
          value = "mongodb+srv://sivadeep:sivadeep@cluster0.2q6ww.mongodb.net/Aaruthra?retryWrites=true&w=majority"
        }
      ]
    }
  ])
}

# Backend ECS Service
resource "aws_ecs_service" "backend_service" {
  name            = "aruthra-backend-service"
  cluster         = aws_ecs_cluster.backend_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = 1
  launch_type     = "EC2"

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "backend"
    container_port   = 5000
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  depends_on = [aws_lb_listener.backend_http]
}

output "backend_alb_dns" {
  description = "DNS name of the backend ALB"
  value       = aws_lb.backend_alb.dns_name
}

# === FRONTEND ===

# Frontend SG for ALB (allow HTTP 80)
resource "aws_security_group" "frontend_alb_sg" {
  name        = "frontend_alb_sg"
  description = "Allow HTTP inbound to frontend ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Frontend SG for ECS instances (allow port 3000 from frontend ALB only)
resource "aws_security_group" "frontend_ecs_sg" {
  name        = "frontend_ecs_sg"
  description = "Allow traffic from frontend ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Frontend ECS Cluster
resource "aws_ecs_cluster" "frontend_cluster" {
  name = "aruthra-frontend-cluster"
}

# Frontend Launch Template
resource "aws_launch_template" "frontend_lt" {
  name_prefix   = "frontend-ecs-launch-template-"
  image_id      = data.aws_ami.ecs_ami.id
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }

  key_name = aws_key_pair.ecs_key.key_name

  vpc_security_group_ids = [aws_security_group.frontend_ecs_sg.id]

  user_data = base64encode(<<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.frontend_cluster.name} >> /etc/ecs/ecs.config
EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "frontend-ecs-instance"
    }
  }
}

# Frontend ASG
resource "aws_autoscaling_group" "frontend_asg" {
  name_prefix         = "frontend-ecs-asg-"
  max_size            = 2
  min_size            = 1
  desired_capacity    = 1
  vpc_zone_identifier = data.aws_subnets.default.ids

  launch_template {
    id      = aws_launch_template.frontend_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "frontend-ecs-instance"
    propagate_at_launch = true
  }
}

# Frontend ALB
resource "aws_lb" "frontend_alb" {
  name               = "aruthra-frontend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.frontend_alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Frontend Target Group
resource "aws_lb_target_group" "frontend_tg" {
  name     = "aruthra-frontend-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }
}

# Frontend ALB Listener
resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "aruthra-frontend-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "307946674949.dkr.ecr.us-east-1.amazonaws.com/full_stack:frontend"
      essential = true
      portMappings = [{
        containerPort = 80
        hostPort      = 80
      }]
      environment = [
        {
          name  = "REACT_APP_BACKEND_URL"
          value = "http://${aws_lb.backend_alb.dns_name}"
        }
      ]
    }
  ])
}

# Frontend ECS Service
resource "aws_ecs_service" "frontend_service" {
  name            = "aruthra-frontend-service"
  cluster         = aws_ecs_cluster.frontend_cluster.id
  task_definition = aws_ecs_task_definition.frontend_task.arn
  desired_count   = 1
  launch_type     = "EC2"

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    container_name   = "frontend"
    container_port   = 80
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  depends_on = [aws_lb_listener.frontend_http]
}

output "frontend_alb_dns" {
  description = "DNS name of the frontend ALB"
  value       = aws_lb.frontend_alb.dns_name
}
