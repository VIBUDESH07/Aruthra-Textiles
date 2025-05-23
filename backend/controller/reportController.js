const Sold = require("../model/Sold");

exports.getSalesReport = async (req, res) => {
  const { from, to, productName, receiverName } = req.query;

  const filter = {};

  // Date filter
  if (from && to) {
    filter.date = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  // Product name filter (case-insensitive)
  if (productName) {
    filter.productName = { $regex: new RegExp(productName, "i") };
  }

  // Customer name filter (case-insensitive)
  if (receiverName) {
    filter.receiverName = { $regex: new RegExp(receiverName, "i") };
  }

  try {
    // Fetch all raw data based on the filters
    const rawData = await Sold.find(filter);

    // Send the raw data to the frontend
    res.json(rawData);
  } catch (err) {
    console.error("Error fetching raw sales data:", err);
    res.status(500).json({ error: "Server error" });
  }
};