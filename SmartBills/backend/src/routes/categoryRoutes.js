const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getCategories } = require("../controllers/categoryController");

const router = express.Router();

router.use(protect);

router.get("/", getCategories);

module.exports = router;