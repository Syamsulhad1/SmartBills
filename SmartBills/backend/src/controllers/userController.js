const { findAllUsers } = require("../models/userModel");
const { success } = require("../utils/response");

const getMyProfile = (req, res) => {
    return success(res, { user: req.user }, "Profile retrieved");
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await findAllUsers();

        return success(res, { users }, "Users retrieved");
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getMyProfile,
    getAllUsers
};
