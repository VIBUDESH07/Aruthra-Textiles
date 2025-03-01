const mongoose = require("mongoose");
const Sold = require("../model/Sold");
const Product = require("../model/Material"); // Import Product model

// Sell Product (store transaction in DB and update stock)
const sellProduct = async (req, res) => {
  try {
    const { productId, productName, sellStock, unitPrice, receiverName, receiverContact, receiverAddress, transportMode, transportCost } = req.body;

    // Ensure productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format." });
    }

    const totalAmount = sellStock * unitPrice + transportCost;

    // Find the product and check stock
    const product = await Product.findById(new mongoose.Types.ObjectId(productId));
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    if (product.stock < sellStock) {
      return res.status(400).json({ error: `Not enough stock available. Only ${product.stock} left.` });
    }

    // Generate Invoice Number
    const lastInvoice = await Sold.findOne().sort({ invoiceNumber: -1 });
    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    // Save transaction in the database
    const sale = new Sold({
      productId: new mongoose.Types.ObjectId(productId),
      productName,
      sellStock,
      unitPrice,
      totalAmount,
      receiverName,
      receiverContact,
      receiverAddress,
      transportMode,
      transportCost,
      invoiceNumber,
    });

    await sale.save();

    // Decrease stock in Product database
    product.stock -= sellStock;
    await product.save();

    res.status(201).json({ message: "Sale recorded successfully!", sale });
  } catch (error) {
    console.error("Sell Product Error:", error);
    res.status(500).json({ error: "Failed to process sale." });
  }
};

// Fetch all transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Sold.find().sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

module.exports = { sellProduct, getTransactionHistory };
