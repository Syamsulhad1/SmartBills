const multer = require("multer");
const { receiptExtensions } = require("../config/storage");

const OCR_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: OCR_MAX_IMAGE_BYTES,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!receiptExtensions[file.mimetype]) {
            const error = new Error(
                "Gambar harus berupa JPEG, PNG, atau WebP dengan ukuran maksimal 5 MB"
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
            if (error.code === "LIMIT_FILE_SIZE") {
                error.statusCode = 413;
                error.message = "Ukuran gambar melebihi batas 5 MB";
            } else {
                error.statusCode = 400;
                error.message = "Upload gambar tidak valid";
            }
        }
        return next(error);
    });
};

module.exports = uploadOcrImage;
