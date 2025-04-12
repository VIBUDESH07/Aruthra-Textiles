const express = require("express");
const { sellProduct, getTransactionHistory,getTransactionsByReceiverEmail } = require("../controller/sellController");

const router = express.Router();

router.post("/", sellProduct);
router.get("/transactions", getTransactionHistory);
router.post("/transactions", getTransactionsByReceiverEmail);

module.exports = router;
