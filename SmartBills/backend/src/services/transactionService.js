const pool = require("../config/database");
const {
    createTransaction,
    findCategoryById
} = require("../models/transactionModel");
const { createTransactionItem } = require("../models/transactionItemModel");

const createTransactionWithItems = async ({
    userId,
    categoryId,
    type,
    amount,
    merchantName,
    notes,
    transactionDate,
    imageUrl,
    items
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (categoryId !== null) {
            const category = await findCategoryById(categoryId, client);
            if (!category || category.type !== type) {
                const error = new Error("Category does not exist or does not match the transaction type");
                error.statusCode = 400;
                throw error;
            }
        }

        const transaction = await createTransaction({
            userId,
            categoryId,
            type,
            amount,
            merchantName,
            notes,
            source: "MANUAL",
            imageUrl,
            transactionDate
        }, client);

        const savedItems = [];
        for (const item of items) {
            savedItems.push(await createTransactionItem({
                transactionId: transaction.transaction_id,
                ...item
            }, client));
        }

        await client.query("COMMIT");
        return { ...transaction, items: savedItems };
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Transaction rollback failed:", rollbackError);
        }

        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createTransactionWithItems
};
