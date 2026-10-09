const {
    registerUser,
    loginUser
} = require("../services/authService");

const {
    validateRegisterInput,
    validateLoginInput
} = require("../validators/authValidator");


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
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        // Register user
        const user = await registerUser({
            name,
            email,
            password
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user
            }
        });

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
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        const authData = await loginUser({
            email,
            password
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: authData
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login
};
