
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/environment");
const { findUserById } = require("../models/userModel");
const { failure } = require("../utils/response");

const unauthorized = (res, message, code) => failure(
    res,
    message,
    401,
    { code }
);

const protect = async (req, res, next) => {
    if (!JWT_SECRET) {
        const error = new Error("JWT secret is not configured");
        error.statusCode = 500;
        return next(error);
    }

    const authorization = req.get("Authorization");
    const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return unauthorized(
            res,
            "Authentication required",
            "AUTH_TOKEN_MISSING"
        );
    }

    let payload;

    try {
        payload = jwt.verify(match[1], JWT_SECRET, {
            algorithms: ["HS256"]
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return unauthorized(
                res,
                "Token has expired, please log in again",
                "AUTH_TOKEN_EXPIRED"
            );
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return unauthorized(
                res,
                "Invalid token",
                "AUTH_TOKEN_INVALID"
            );
        }

        return next(error);
    }

    if (
        typeof payload !== "object"
        || payload === null
        || Array.isArray(payload)
    ) {
        return unauthorized(res, "Invalid token", "AUTH_TOKEN_INVALID");
    }

    const userId = payload.userId;

    const validNumber = typeof userId === "number"
        && Number.isSafeInteger(userId)
        && userId > 0
        && userId <= 2147483647;

    const validString = typeof userId === "string"
        && /^\d+$/.test(userId)
        && Number.isSafeInteger(Number(userId))
        && Number(userId) > 0
        && Number(userId) <= 2147483647;

    if (!validNumber && !validString) {
        return unauthorized(res, "Invalid token", "AUTH_TOKEN_INVALID");
    }

    let user;

    try {
        user = await findUserById(userId);
    } catch (error) {
        return next(error);
    }

    if (!user) {
        return unauthorized(
            res,
            "User associated with token was not found",
            "AUTH_USER_NOT_FOUND"
        );
    }

    req.user = user;
    return next();
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return unauthorized(
            res,
            "Authentication required",
            "AUTH_TOKEN_MISSING"
        );
    }

    if (!roles.includes(req.user.role)) {
        return failure(
            res,
            "You do not have permission to access this resource",
            403
        );
    }

    return next();
};

module.exports = { protect, authorize };
