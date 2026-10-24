const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const uploadOcrImage = require("../middleware/ocrUploadMiddleware");
const {
    recognizeReceiptText,
    parseReceiptTransaction
} = require("../controllers/aiController");

const router = express.Router();

router.use(protect);
router.post("/ocr", uploadOcrImage, recognizeReceiptText);
router.post("/parse-transaction", parseReceiptTransaction);

module.exports = router;
