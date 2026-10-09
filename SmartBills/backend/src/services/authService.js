const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail
} = require("../models/userModel");

const {
    JWT_SECRET,
    JWT_EXPIRES_IN
} = require("../config/environment");


const createAuthToken = (user) => {
    if (!JWT_SECRET) {
        const error = new Error("JWT secret is not configured");
        error.statusCode = 500;
        throw error;
    }

    return jwt.sign(
        {
            userId: user.user_id,
            email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN || "1d"
        }
    );
};


const toSafeUser = (user) => ({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    current_balance: user.current_balance,
    created_at: user.created_at
});


const registerUser = async ({ name, email, password }) => {
    // Normalisasi data
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Cek apakah email sudah digunakan
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const user = await createUser({
        name: normalizedName,
        email: normalizedEmail,
        passwordHash
    });

    return user;
};


const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = createAuthToken(user);

    return {
        user: toSafeUser(user),
        token
    };
};


module.exports = {
    registerUser,
    loginUser
};
