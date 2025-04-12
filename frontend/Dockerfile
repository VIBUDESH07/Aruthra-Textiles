# Stage 1: Build the Vite app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy the package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the Vite app
RUN npm run build

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
# Stage 2: Serve the built app with NGINX
FROM nginx:1.23 AS production

# Set NGINX working directory
WORKDIR /usr/share/nginx/html

# Remove default NGINX static content
RUN rm -rf ./*

# Copy Vite build output to NGINX's default folder
COPY --from=build /app/build .

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
