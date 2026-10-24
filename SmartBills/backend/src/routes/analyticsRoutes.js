const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    getOverview,
    listReceiptGallery
} = require("../controllers/analyticsController");

const router = express.Router();

router.use(protect);

router.get("/", getOverview);
router.get("/receipts", listReceiptGallery);

module.exports = router;