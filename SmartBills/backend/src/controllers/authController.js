const {
    registerUser,
    loginUser
} = require("../services/authService");

const {
    validateRegisterInput,
    validateLoginInput
} = require("../validators/authValidator");
const { success, failure } = require("../utils/response");


const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        // Validasi input
        const errors = validateRegisterInput({
            name,
            email,
            password
        });

        if (errors.length > 0) {
            return failure(res, "Validation failed", 400, { errors });
        }

        // Register user
        const user = await registerUser({
            name,
            email,
            password
        });

        return success(res, { user }, "User registered successfully", 201);

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        const errors = validateLoginInput({
            email,
            password
        });

        if (errors.length > 0) {
            return failure(res, "Validation failed", 400, { errors });
        }

        const authData = await loginUser({
            email,
            password
        });

        return success(res, authData, "Login successful");

    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login
};
