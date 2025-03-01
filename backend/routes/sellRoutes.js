const express = require("express");
const { sellProduct, getTransactionHistory } = require("../controller/sellController");

const router = express.Router();

router.post("/", sellProduct);
router.get("/transactions", getTransactionHistory);

module.exports = router;
