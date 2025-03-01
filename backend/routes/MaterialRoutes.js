const express = require("express");
const { addMaterial, editMaterial, deleteMaterial, getMaterials } = require("../controller/MaterialsController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route - Get all materials
router.get("/", getMaterials);

// Admin routes - Add, edit, delete materials
router.post("/", authMiddleware, adminMiddleware, addMaterial);
router.put("/:id", authMiddleware, adminMiddleware, editMaterial);
router.delete("/:id", authMiddleware, adminMiddleware, deleteMaterial);

module.exports = router;
