const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role }, // Encrypt id, email, and role
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// User Signup
exports.signup = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });

    const token = generateToken(user); // Generate JWT after signup

    res.json({ message: "User created successfully", token, user: { id: user._id, email, role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user); // Generate JWT after login

    res.json({ message: "Login successful", token, user: { id: user._id, email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};
