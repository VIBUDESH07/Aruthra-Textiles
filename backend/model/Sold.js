const mongoose = require("mongoose");

const SoldSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  sellStock: Number,
  unitPrice: Number,
  totalAmount: Number,
  receiverName: String,
  receiverEmail: String,
  receiverContact: String,
  receiverAddress: String,
  transportMode: String,
  transportCost: Number,
  invoiceNumber: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sold", SoldSchema);
