require("dotenv").config();

const parseNumber = (value, fallback) => {
    if (value === undefined || value === "") {
        return fallback;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? fallback : parsed;
};

const config = {
    PORT: parseNumber(process.env.PORT, 5000),
    NODE_ENV: process.env.NODE_ENV || "development",

    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST || process.env.PGHOST || "localhost",
    DB_PORT: parseNumber(process.env.DB_PORT || process.env.PGPORT, 5432),
    DB_NAME: process.env.DB_NAME || process.env.PGDATABASE || "smartbills",
    DB_USER: process.env.DB_USER || process.env.PGUSER || "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD || process.env.PGPASSWORD || "",

    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    BCRYPT_SALT_ROUNDS: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 10),

    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:3000",

    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    OCR_API_KEY: process.env.OCR_API_KEY
};

module.exports = config;
