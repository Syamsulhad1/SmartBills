const fs = require("fs");

const {
    getReceiptPath,
    validateReceiptBuffer
} = require("../config/storage");
const {
    findTransactionsByUserId,
    findTransactionByIdForUser
} = require("../models/transactionModel");
const { findItemsByTransactionId } = require("../models/transactionItemModel");
const { createTransactionWithItems } = require("../services/transactionService");
const {
    validateCreateTransaction,
    parsePagination
} = require("../validators/transactionValidator");

const toTransactionResponse = (transaction) => {
    const { image_url: imageUrl, ...fields } = transaction;

    return {
        ...fields,
        receipt_url: imageUrl
            ? `/api/transactions/${transaction.transaction_id}/receipt`
            : null
    };
};

const listTransactions = async (req, res) => {
    const pagination = parsePagination(req.query);
    const transactions = await findTransactionsByUserId(req.user.user_id, pagination);

    res.json({
        success: true,
        data: transactions.map(toTransactionResponse),
        pagination
    });
};

const createTransaction = async (req, res) => {
    const receiptFilename = req.file?.filename ?? null;
    let transaction;

    try {
        const input = validateCreateTransaction(req.body);
        if (req.file) {
            const buffer = await fs.promises.readFile(req.file.path);
            validateReceiptBuffer(buffer, req.file.mimetype);
        }

        transaction = await createTransactionWithItems({
            userId: req.user.user_id,
            ...input,
            imageUrl: receiptFilename
        });
    } catch (error) {
        if (receiptFilename) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (cleanupError) {
                if (cleanupError.code !== "ENOENT") {
                    console.error("Failed to remove rejected receipt upload:", cleanupError);
                }
            }
        }

        throw error;
    }

    res.status(201).json({
        success: true,
        message: "Transaction created",
        data: {
            ...toTransactionResponse(transaction),
            items: transaction.items
        }
    });
};

const getTransactionReceipt = async (req, res) => {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
        return res.status(400).json({
            success: false,
            message: "transactionId must be a positive integer"
        });
    }

    const transaction = await findTransactionByIdForUser(
        transactionId,
        req.user.user_id
    );

    if (!transaction || !transaction.image_url) {
        return res.status(404).json({
            success: false,
            message: "Receipt not found"
        });
    }

    const receiptPath = getReceiptPath(transaction.image_url);
    if (!receiptPath) {
        return res.status(404).json({
            success: false,
            message: "Receipt not found"
        });
    }

    let buffer;
    try {
        buffer = await fs.promises.readFile(receiptPath);
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                success: false,
                message: "Receipt file is missing"
            });
        }

        throw error;
    }

    const contentTypeByExtension = {
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp"
    };

    return res
        .set("Content-Type", contentTypeByExtension[receiptPath.slice(receiptPath.lastIndexOf("."))])
        .set("Content-Disposition", "inline")
        .set("Cache-Control", "private, no-store")
        .set("X-Content-Type-Options", "nosniff")
        .send(buffer);
};

const getTransactionDetails = async (req, res) => {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
        return res.status(400).json({
            success: false,
            message: "transactionId must be a positive integer"
        });
    }

    const transaction = await findTransactionByIdForUser(
        transactionId,
        req.user.user_id
    );

    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found"
        });
    }

    const items = await findItemsByTransactionId(transactionId);
    return res.json({
        success: true,
        data: {
            ...toTransactionResponse(transaction),
            items
        }
    });
};

module.exports = {
    listTransactions,
    createTransaction,
    getTransactionReceipt,
    getTransactionDetails
};
