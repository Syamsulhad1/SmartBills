
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const uploadReceipt = require("../middleware/receiptUploadMiddleware");

const {
    listTransactions,
    createTransaction,
    getTransactionReceipt,
    getTransactionDetails,
    updateTransaction,
    deleteTransactionHandler
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);

router.get("/", listTransactions);
router.post("/", uploadReceipt, createTransaction);

router.get("/:transactionId/receipt", getTransactionReceipt);
router.get("/:transactionId", getTransactionDetails);

// Update transaksi berdasarkan ID.
router.put("/:transactionId", updateTransaction);

// Delete transaksi berdasarkan ID.
router.delete("/:transactionId", deleteTransactionHandler);

module.exports = router;
