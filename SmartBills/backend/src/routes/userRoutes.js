const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getMyProfile,
    postInitialBalance,
    getAllUsers
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/me", getMyProfile);
router.post("/me/initial-balance", postInitialBalance);
router.get("/", authorize("admin"), getAllUsers);

module.exports = router;