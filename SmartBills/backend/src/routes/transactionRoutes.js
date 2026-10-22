const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const uploadReceipt = require("../middleware/receiptUploadMiddleware");
const {
    listTransactions,
    createTransaction,
    getTransactionReceipt,
    getTransactionDetails
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);

router.get("/", listTransactions);
router.post("/", uploadReceipt, createTransaction);
router.get("/:transactionId/receipt", getTransactionReceipt);
router.get("/:transactionId", getTransactionDetails);

module.exports = router;