// controllers/reportController.js
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
    const dailySales = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalSold: { $sum: "$sellStock" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$productName",
          totalSold: { $sum: "$sellStock" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    const revenueByProduct = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$productName",
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const transportStats = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$transportMode",
          totalTransportCost: { $sum: "$transportCost" },
          usage: { $sum: 1 },
        },
      },
    ]);

    const productDailyTrend = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            product: "$productName",
          },
          totalSold: { $sum: "$sellStock" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const topCustomers = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$receiverName",
          contact: { $first: "$receiverContact" },
          totalPurchased: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalPurchased: -1 } },
      { $limit: 5 },
    ]);

    const monthlySummary = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalSales: { $sum: "$sellStock" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const overallSummary = await Sold.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSold: { $sum: "$sellStock" },
          totalTransport: { $sum: "$transportCost" },
          orders: { $sum: 1 },
        },
      },
    ]);

    res.json({
      dailySales,
      topProducts,
      revenueByProduct,
      transportStats,
      productDailyTrend,
      topCustomers,
      monthlySummary,
      overallSummary: overallSummary[0] || {},
    });
  } catch (err) {
    console.error("Error in report:", err);
    res.status(500).json({ error: "Server error" });
  }
};
