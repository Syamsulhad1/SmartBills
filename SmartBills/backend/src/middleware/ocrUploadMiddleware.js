const multer = require("multer");
const { receiptExtensions } = require("../config/storage");

const OCR_MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: OCR_MAX_IMAGE_BYTES,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!receiptExtensions[file.mimetype]) {
            const error = new Error(
                "Receipt must be a JPEG, PNG, or WebP image no larger than 4 MB"
            );
            error.statusCode = 400;
            return callback(error);
        }
        return callback(null, true);
    }
});

const uploadOcrImage = (req, res, next) => {
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

module.exports = uploadOcrImage;
