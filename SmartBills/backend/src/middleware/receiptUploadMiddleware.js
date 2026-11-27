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
            const error = new Error("Bukti harus berupa gambar JPEG, PNG, atau WebP");
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
            if (error.code === "LIMIT_FILE_SIZE") {
                error.statusCode = 413;
                error.message = "Ukuran file melebihi batas 5 MB";
            } else {
                error.statusCode = 400;
                error.message = "Upload bukti transaksi tidak valid";
            }
        }

        return next(error);
    });
};

module.exports = uploadReceipt;
