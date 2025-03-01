const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Number, required: true }, // Rupee value
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Track who added it
});

module.exports = mongoose.model("Material", MaterialSchema);
