const crypto = require("crypto");
const multer = require("multer");

const {
    receiptDirectory,
    receiptExtensions
} = require("../config/storage");

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => callback(null, receiptDirectory),
        filename: (req, file, callback) => callback(
            null,
            `${crypto.randomUUID()}${receiptExtensions[file.mimetype]}`
        )
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!receiptExtensions[file.mimetype]) {
            const error = new Error("Receipt must be a JPEG, PNG, or WebP image");
            error.statusCode = 400;
            return callback(error);
        }

        return callback(null, true);
    }
});

const uploadReceipt = (req, res, next) => {
    upload.single("receipt")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            error.statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        }

        return next(error);
    });
};

module.exports = uploadReceipt;
