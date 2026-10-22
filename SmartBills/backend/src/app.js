const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const pool = require("./config/database");
const { CORS_ORIGIN } = require("./config/environment");
const { ensurePrivateReceiptStorage } = require("./config/storage");
const openApiSpec = require("./config/openApiSpec");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const priceRoutes = require("./routes/priceRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

ensurePrivateReceiptStorage();

// ==============================
// Global Middleware
// ==============================

app.use(cors({ origin: CORS_ORIGIN }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));


// ==============================
// Health Check
// ==============================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartBills API is running"
    });
});

// Database Health Check
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT current_database() AS database;
        `);

        res.status(200).json({
            success: true,
            message: "SmartBills API and PostgreSQL are connected",
            database: result.rows[0].database
        });

    } catch (error) {
        console.error("Database health check failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
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


// ==============================
// Error Handler
// ==============================

app.use(errorMiddleware);


module.exports = app;
