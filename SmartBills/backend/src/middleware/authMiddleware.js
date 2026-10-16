const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/environment");
const { findUserById } = require("../models/userModel");

const unauthorized = (res) => res.status(401).json({
    success: false,
    message: "Authentication required"
});

const protect = async (req, res, next) => {
    if (!JWT_SECRET) {
        const error = new Error("JWT secret is not configured");
        error.statusCode = 500;
        return next(error);
    }

    const authorization = req.get("Authorization");
    const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return unauthorized(res);
    }

    try {
        const payload = jwt.verify(match[1], JWT_SECRET);

        if (
            typeof payload !== "object"
            || payload === null
            || (typeof payload.userId !== "string" && typeof payload.userId !== "number")
        ) {
            return unauthorized(res);
        }

        const user = await findUserById(payload.userId);

        if (!user) {
            return unauthorized(res);
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return unauthorized(res);
        }

        return next(error);
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return unauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource"
        });
    }

    return next();
};

module.exports = {
    protect,
    authorize
};
