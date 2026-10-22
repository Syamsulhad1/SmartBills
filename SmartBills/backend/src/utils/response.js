const success = (res, data, message, statusCode = 200, metadata = {}) => res
    .status(statusCode)
    .json({
        ...metadata,
        success: true,
        ...(message ? { message } : {}),
        data
    });

const failure = (res, message, statusCode = 500, details = {}) => res
    .status(statusCode)
    .json({
        success: false,
        message,
        ...details
    });

module.exports = {
    success,
    failure
};
