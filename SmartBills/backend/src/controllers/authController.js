const { registerUser } = require("../services/authService");
const { validateRegisterInput } = require("../validators/authValidator");


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


module.exports = {
    register
};