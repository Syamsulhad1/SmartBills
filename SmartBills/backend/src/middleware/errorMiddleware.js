const logger = require("../utils/logger");
const { failure } = require("../utils/response");

const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const candidateStatus = err.statusCode || err.status;
    const statusCode = Number.isInteger(candidateStatus)
        && candidateStatus >= 400
        && candidateStatus <= 599
        ? candidateStatus
        : 500;
    const logContext = {
        method: req.method,
        path: req.path,
        statusCode,
        error: {
            name: err.name,
            message: err.message,
            code: err.code
        }
    };
    if (Number.isInteger(err.providerStatus)) {
        logContext.error.providerStatus = err.providerStatus;
    }
    if (typeof err.providerCode === "string") {
        logContext.error.providerCode = err.providerCode.slice(0, 100);
    }

    if (statusCode >= 500) {
        logContext.error.stack = err.stack;
        logger.error("Request failed", logContext);
    } else {
        logger.warn("Request rejected", logContext);
    }

    const message = statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed";

    const details = {};
    if (err.details) {
        details.errors = err.details;
    }
    if (typeof err.code === "string" && /^(AI|OCR)_[A-Z_]+$/.test(err.code)) {
        details.code = err.code;
    }
    if (Number.isInteger(err.providerStatus)) {
        details.providerStatus = err.providerStatus;
    }
    if (typeof err.providerCode === "string") {
        details.providerCode = err.providerCode.slice(0, 100);
    }

    return failure(res, message, statusCode, details);
};

module.exports = errorMiddleware;