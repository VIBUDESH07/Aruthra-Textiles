const express = require("express");
const router = express.Router();
const Material = require("../model/Material");

// GET /api/products - return product name and stock count
router.get("/products", async (req, res) => {
  try {
    const materials = await Material.find({}, "name stock");
    
    // Rename 'stock' to 'count' to match frontend structure
    const products = materials.map(material => ({
      name: material.name,
      count: material.stock,
    }));

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
