const Material = require("../model/Material");

// Add Material (Admin Only)
exports.addMaterial = async (req, res) => {
  const { name, stock, price } = req.body;
  console.log(name)
  try {
    const material = await Material.create({ name, stock, price, createdBy: req.user._id });
  
    res.json({ message: "Material added successfully", material });
  } catch (error) {
    res.status(500).json({ message: "Error adding material" });
  }
};

// Edit Material (Admin Only)
exports.editMaterial = async (req, res) => {
  const { id } = req.params;
  const { name, stock, price } = req.body;
  console.log(id,name)
  try {
    const material = await Material.findByIdAndUpdate(id, { name, stock, price }, { new: true });
    if (!material) return res.status(404).json({ message: "Material not found" });

    res.json({ message: "Material updated successfully", material });
  } catch (error) {
    res.status(500).json({ message: "Error updating material" });
  }
};

// Delete Material (Admin Only)
exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;

  try {
    const material = await Material.findByIdAndDelete(id);
    if (!material) return res.status(404).json({ message: "Material not found" });

    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting material" });
  }
};

// Get All Materials (Anyone can access)
exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials" });
  }
};
