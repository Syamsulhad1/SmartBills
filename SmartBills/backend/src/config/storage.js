const fs = require("fs");
const path = require("path");

const { UPLOAD_DIR } = require("./environment");

const uploadRoot = path.resolve(__dirname, "../..", UPLOAD_DIR);
const receiptDirectory = path.join(uploadRoot, "receipts");
const receiptExtensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

const ensurePrivateReceiptStorage = () => {
    fs.mkdirSync(receiptDirectory, { recursive: true });
};

const getReceiptPath = (filename) => {
    if (
        typeof filename !== "string"
        || path.basename(filename) !== filename
        || !/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)
    ) {
        return null;
    }

    return path.join(receiptDirectory, filename);
};

const validateReceiptBuffer = (buffer, mimeType) => {
    const signatureChecks = {
        "image/jpeg": () => buffer.length >= 3
            && buffer[0] === 0xff
            && buffer[1] === 0xd8
            && buffer[2] === 0xff,
        "image/png": () => buffer.length >= 8
            && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
        "image/webp": () => buffer.length >= 12
            && buffer.toString("ascii", 0, 4) === "RIFF"
            && buffer.toString("ascii", 8, 12) === "WEBP"
    };

    if (!signatureChecks[mimeType] || !signatureChecks[mimeType]()) {
        const error = new Error("Receipt must be a valid JPEG, PNG, or WebP image");
        error.statusCode = 400;
        throw error;
    }
};

module.exports = {
    receiptDirectory,
    receiptExtensions,
    ensurePrivateReceiptStorage,
    getReceiptPath,
    validateReceiptBuffer
};
