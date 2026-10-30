
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const uploadReceipt = require("../middleware/receiptUploadMiddleware");

const {
    listTransactions,
    createTransaction,
    createIncomeTransaction,
    createExpenseTransaction,
    getTransactionReceipt,
    getTransactionDetails,
    updateTransaction,
    updateIncomeTransaction,
    updateExpenseTransaction,
    deleteTransactionHandler
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);

router.get("/", listTransactions);
router.post("/income", uploadReceipt, createIncomeTransaction);
router.post("/expense", uploadReceipt, createExpenseTransaction);
router.post("/", uploadReceipt, createTransaction);

router.put("/income/:transactionId", updateIncomeTransaction);
router.put("/expense/:transactionId", updateExpenseTransaction);
router.get("/:transactionId/receipt", getTransactionReceipt);
router.get("/:transactionId", getTransactionDetails);

// Update transaksi berdasarkan ID.
router.put("/:transactionId", updateTransaction);

// Delete transaksi berdasarkan ID.
router.delete("/:transactionId", deleteTransactionHandler);

module.exports = router;
