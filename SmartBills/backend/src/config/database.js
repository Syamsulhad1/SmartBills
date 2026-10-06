const { Pool } = require("pg");

const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
} = require("./environment");

const pool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,

    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on("connect", () => {
    console.log("PostgreSQL database connected");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

module.exports = pool;