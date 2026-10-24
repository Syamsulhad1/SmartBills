
const path = require("node:path");
const dotenv = require("dotenv");

const envFile =
    process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({
    path: path.resolve(process.cwd(), envFile)
});

const parseNumber = (value, fallback) => {
    if (value === undefined || value === "") {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const clientUrl =
    process.env.CLIENT_URL || "http://localhost:5173";

const corsOrigin =
    process.env.CORS_ORIGIN || clientUrl;

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

    CLIENT_URL: clientUrl,
    CORS_ORIGIN: corsOrigin,

    UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",

    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    OCR_API_KEY: process.env.OCR_API_KEY,
    OCR_SERVICE_URL: process.env.OCR_SERVICE_URL,
    OCR_SERVICE_TOKEN: process.env.OCR_SERVICE_TOKEN
};

module.exports = config;
