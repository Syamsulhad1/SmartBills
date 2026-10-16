const express = require("express");
const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const {
    getMyProfile,
    getAllUsers
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/me", getMyProfile);
router.get("/", authorize("admin"), getAllUsers);

module.exports = router;
