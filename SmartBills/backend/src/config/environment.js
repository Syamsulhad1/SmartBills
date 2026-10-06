require("dotenv").config();

const config = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 5432,
    DB_NAME: process.env.DB_NAME || "smartbills",
    DB_USER: process.env.DB_USER || "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD,

    JWT_SECRET: process.env.JWT_SECRET,

    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000"
};

module.exports = config;