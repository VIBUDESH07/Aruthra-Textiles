// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const { getSalesReport } = require("../controller/reportController");

router.get("/sales", getSalesReport);

module.exports = router;
