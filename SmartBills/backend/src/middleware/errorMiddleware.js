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

    if (statusCode >= 500) {
        logContext.error.stack = err.stack;
        logger.error("Request failed", logContext);
    } else {
        logger.warn("Request rejected", logContext);
    }

    const message = statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed";

    return failure(res, message, statusCode, err.details ? { errors: err.details } : {});
};

module.exports = errorMiddleware;