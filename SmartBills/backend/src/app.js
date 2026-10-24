const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const pool = require("./config/database");
const { CORS_ORIGIN, NODE_ENV } = require("./config/environment");
const { ensurePrivateReceiptStorage } = require("./config/storage");
const openApiSpec = require("./config/openApiSpec");
const logger = require("./utils/logger");
const { success, failure } = require("./utils/response");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const priceRoutes = require("./routes/priceRoutes");
const newsRoutes = require("./routes/newsRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

ensurePrivateReceiptStorage();

// ==============================
// Global Middleware
// ==============================

const allowedOrigins = NODE_ENV === "development"
    ? [...new Set([CORS_ORIGIN, "http://localhost:5173"])]
    : CORS_ORIGIN;

app.use(cors({ origin: allowedOrigins }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));


// ==============================
// Health Check
// ==============================

app.get("/api/health", (req, res) => {
    return success(res, null, "SmartBills API is running");
});

// Database Health Check
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT current_database() AS database;
        `);

        return success(
            res,
            { database: result.rows[0].database },
            "SmartBills API and PostgreSQL are connected"
        );

    } catch (error) {
        logger.error("Database health check failed", {
            error: {
                message: error.message,
                code: error.code,
                stack: error.stack
            }
        });
        return failure(res, "Database connection failed", 500);
    }
});


// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/news", newsRoutes);


// ==============================
// Error Handler
// ==============================

app.use(errorMiddleware);


module.exports = app;
