const bcrypt = require("bcrypt");

const {
    createUser,
    findUserByEmail
} = require("../models/userModel");


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


module.exports = {
    registerUser
};