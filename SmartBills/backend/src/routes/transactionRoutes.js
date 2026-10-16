const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", (req, res) => {
    res.json({
        message: "Transaction API"
    });
});

module.exports = router;