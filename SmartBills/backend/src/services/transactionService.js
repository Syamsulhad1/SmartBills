
const pool = require("../config/database");
const {
    createTransaction,
    findCategoryById,
    updateTransactionForUser,
    deleteTransactionForUser
} = require("../models/transactionModel");
const {
    createTransactionItem,
    findItemsByTransactionId,
    deleteItemsByTransactionId
} = require("../models/transactionItemModel");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const amountToCents = (value) => {
    const [whole, fraction = ""] = String(value).split(".");
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
};

const centsToAmount = (cents) => {
    const sign = cents < 0n ? "-" : "";
    const absolute = cents < 0n ? -cents : cents;
    return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
};

const transactionEffect = ({ type, amount }) => {
    const cents = amountToCents(amount);
    return type === "INCOME" ? cents : -cents;
};

const withTransaction = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const validateCategory = async (categoryId, type, client) => {
    if (categoryId === null) return;

    const category = await findCategoryById(categoryId, client);
    if (!category || category.type !== type) {
        throw createError("Category does not match transaction type", 400);
    }
};

const updateBalance = async (client, userId, delta) => {
    const result = await client.query(`
        UPDATE users
        SET current_balance = current_balance + $2::numeric
        WHERE user_id = $1
          AND current_balance + $2::numeric >= 0
        RETURNING current_balance;
    `, [userId, centsToAmount(delta)]);

    if (!result.rows[0]) {
        throw createError("Transaction would make current balance negative", 400);
    }

    return result.rows[0].current_balance;
};

const insertItems = async (transactionId, items, client) => {
    for (const item of items) {
        await createTransactionItem({ transactionId, ...item }, client);
    }
};

const createTransactionWithItems = async ({ userId, ...input }) => {
    return withTransaction(async (client) => {
        await validateCategory(input.categoryId, input.type, client);
        const transaction = await createTransaction({
            userId,
            ...input
        }, client);
        const currentBalance = await updateBalance(
            client,
            userId,
            transactionEffect(transaction)
        );

        await insertItems(transaction.transaction_id, input.items, client);

        return {
            ...transaction,
            items: await findItemsByTransactionId(transaction.transaction_id, client),
            current_balance: currentBalance
        };
    });
};

const updateTransactionWithItems = async ({
    transactionId,
    userId,
    ...input
}) => {
    return withTransaction(async (client) => {
        const currentResult = await client.query(`
            SELECT transaction_id, type, amount
            FROM transactions
            WHERE transaction_id = $1 AND user_id = $2
            FOR UPDATE;
        `, [transactionId, userId]);
        const current = currentResult.rows[0];

        if (!current) {
            throw createError("Transaction not found", 404);
        }

        await validateCategory(input.categoryId, input.type, client);
        const transaction = await updateTransactionForUser({
            transactionId,
            userId,
            ...input
        }, client);
        const balanceDelta = transactionEffect(transaction)
            - transactionEffect(current);

        const currentBalance = await updateBalance(client, userId, balanceDelta);
        await deleteItemsByTransactionId(transactionId, client);
        await insertItems(transactionId, input.items, client);

        return {
            ...transaction,
            items: await findItemsByTransactionId(transactionId, client),
            current_balance: currentBalance
        };
    });
};

const deleteTransaction = async ({ transactionId, userId }) => {
    return withTransaction(async (client) => {
        const currentResult = await client.query(`
            SELECT transaction_id, type, amount
            FROM transactions
            WHERE transaction_id = $1 AND user_id = $2
            FOR UPDATE;
        `, [transactionId, userId]);
        const current = currentResult.rows[0];

        if (!current) {
            throw createError("Transaction not found", 404);
        }

        const transaction = await deleteTransactionForUser(
            transactionId,
            userId,
            client
        );
        await updateBalance(client, userId, -transactionEffect(current));

        return transaction;
    });
};

module.exports = {
    createTransactionWithItems,
    updateTransactionWithItems,
    deleteTransaction
};
