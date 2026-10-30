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
const {
    createTransactionWithItems,
    updateTransactionWithItems,
    deleteTransaction
} = require("../services/transactionService");
const logger = require("../utils/logger");
const { success, failure } = require("../utils/response");
const {
    validateCreateTransaction,
    parsePagination,
    parseTransactionId
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

    return success(
        res,
        transactions.map(toTransactionResponse),
        "Transactions retrieved",
        200,
        { pagination }
    );
};

const createTransaction = async (req, res, expectedType = null) => {
    const receiptFilename = req.file?.filename ?? null;
    let transaction;

    try {
        const input = validateCreateTransaction(req.body, expectedType);
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
                    logger.error("Failed to remove rejected receipt upload", {
                        error: {
                            message: cleanupError.message,
                            code: cleanupError.code
                        }
                    });
                }
            }
        }

        throw error;
    }

    return success(
        res,
        {
            ...toTransactionResponse(transaction),
            items: transaction.items
        },
        "Transaction created",
        201
    );
};

const createIncomeTransaction = (req, res) => (
    createTransaction(req, res, "INCOME")
);

const createExpenseTransaction = (req, res) => (
    createTransaction(req, res, "EXPENSE")
);

const getTransactionReceipt = async (req, res) => {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
        return failure(res, "transactionId must be a positive integer", 400);
    }

    const transaction = await findTransactionByIdForUser(
        transactionId,
        req.user.user_id
    );

    if (!transaction || !transaction.image_url) {
        return failure(res, "Receipt not found", 404);
    }

    const receiptPath = getReceiptPath(transaction.image_url);
    if (!receiptPath) {
        return failure(res, "Receipt not found", 404);
    }

    let buffer;
    try {
        buffer = await fs.promises.readFile(receiptPath);
    } catch (error) {
        if (error.code === "ENOENT") {
            return failure(res, "Receipt file is missing", 404);
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
        return failure(res, "transactionId must be a positive integer", 400);
    }

    const transaction = await findTransactionByIdForUser(
        transactionId,
        req.user.user_id
    );

    if (!transaction) {
        return failure(res, "Transaction not found", 404);
    }

    const items = await findItemsByTransactionId(transactionId);
    return success(res, {
        ...toTransactionResponse(transaction),
        items
    }, "Transaction retrieved");
};

const updateTransaction = async (req, res, expectedType = null) => {
    const transactionId = parseTransactionId(
        req.params.transactionId
    );

    const input = validateCreateTransaction(req.body, expectedType);

    const transaction = await updateTransactionWithItems({
        transactionId,
        userId: req.user.user_id,
        ...input
    });

    return success(
        res,
        {
            ...toTransactionResponse(transaction),
            items: transaction.items
        },
        "Transaction updated"
    );
};

const updateIncomeTransaction = (req, res) => (
    updateTransaction(req, res, "INCOME")
);

const updateExpenseTransaction = (req, res) => (
    updateTransaction(req, res, "EXPENSE")
);


const deleteTransactionHandler = async (req, res) => {
    const transactionId = parseTransactionId(
        req.params.transactionId
    );

    const transaction = await deleteTransaction({
        transactionId,
        userId: req.user.user_id
    });

    if (transaction.image_url) {
        const receiptPath = getReceiptPath(transaction.image_url);
        if (receiptPath) {
            try {
                await fs.promises.unlink(receiptPath);
            } catch (error) {
                if (error.code !== "ENOENT") {
                    logger.error("Failed to remove deleted transaction receipt", {
                        error: {
                            message: error.message,
                            code: error.code
                        }
                    });
                }
            }
        }
    }

    return success(
        res,
        {
            transaction_id: transaction.transaction_id
        },
        "Transaction deleted"
    );
};

module.exports = {
    listTransactions,
    createTransaction,
    createIncomeTransaction,
    createExpenseTransaction,
    getTransactionReceipt,
    getTransactionDetails,
    updateTransaction,
    updateIncomeTransaction,
    updateExpenseTransaction,
    deleteTransactionHandler
};
