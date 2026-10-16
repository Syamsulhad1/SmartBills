const { findAllUsers } = require("../models/userModel");

const getMyProfile = (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await findAllUsers();

        return res.status(200).json({
            success: true,
            data: {
                users
            }
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getMyProfile,
    getAllUsers
};
