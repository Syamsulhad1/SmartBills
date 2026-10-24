const { findCategories } = require("../models/categoryModel");
const { parseReceiptText } = require("../services/aiService");
const { recognizeReceipt } = require("../services/ocrService");
const { failure, success } = require("../utils/response");

const recognizeReceiptText = async (req, res) => {
    if (!req.file) {
        return failure(res, "Receipt image is required", 400, {
            code: "OCR_IMAGE_REQUIRED"
        });
    }

    const result = await recognizeReceipt(req.file.buffer, req.file.mimetype);
    return success(res, result, "Receipt text extracted");
};

const parseReceiptTransaction = async (req, res) => {
    const categories = await findCategories();
    const draft = await parseReceiptText(req.body?.text, categories);

    return success(
        res,
        draft,
        "Transaction draft parsed; review it before saving"
    );
};

module.exports = {
    recognizeReceiptText,
    parseReceiptTransaction
};
