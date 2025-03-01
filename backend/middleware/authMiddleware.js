const jwt = require("jsonwebtoken");
const User = require("../model/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }
    const extractedToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    const decoded = jwt.verify(extractedToken, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) {
      return res.status(401).json({ message: "Invalid Token. User not found." });
    }

    req.user = user; 
    next(); 
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token." });
  }
};

// Middleware to check if the user is an Admin
exports.adminMiddleware = (req, res, next) => {
    console.log(req.user.role)
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admins Only." });
  }
  next();
};
