
const {
    findAllUsers,
    findUserById,
    setInitialBalance
} = require("../models/userModel");

const { success, failure } = require("../utils/response");

const {
    validateInitialBalanceInput,
    normalizeInitialBalance
} = require("../validators/userValidator");

const { toUserResponse } = require("../utils/userResponse");


/**
 * Mengambil profil pengguna yang sedang login.
 * ID pengguna diambil dari token yang sudah diverifikasi.
 */
const getMyProfile = async (req, res, next) => {
    try {
        const user = await findUserById(req.user.user_id);

        if (!user) {
            return failure(
                res,
                "User associated with token was not found",
                401,
                {
                    code: "AUTH_USER_NOT_FOUND"
                }
            );
        }

        return success(
            res,
            {
                user: toUserResponse(user)
            },
            "Profile retrieved"
        );
    } catch (error) {
        return next(error);
    }
};


/**
 * Mengatur saldo awal pengguna satu kali.
 */
const postInitialBalance = async (req, res, next) => {
    try {
        const errors = validateInitialBalanceInput(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const amount = normalizeInitialBalance(req.body.amount);

        // Identitas pengguna hanya berasal dari token yang telah diverifikasi.
        const user = await setInitialBalance(
            req.user.user_id,
            amount
        );

        if (!user) {
            return failure(
                res,
                "Initial balance has already been set",
                409,
                {
                    code: "INITIAL_BALANCE_ALREADY_SET"
                }
            );
        }

        return success(
            res,
            {
                user: toUserResponse(user)
            },
            "Initial balance set"
        );
    } catch (error) {
        return next(error);
    }
};


/**
 * Mengambil seluruh pengguna.
 * Data saldo dan password tidak disertakan dalam respons.
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await findAllUsers();

        const safeUsers = users.map((user) => ({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        }));

        return success(
            res,
            {
                users: safeUsers
            },
            "Users retrieved"
        );
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    getMyProfile,
    postInitialBalance,
    getAllUsers
};
