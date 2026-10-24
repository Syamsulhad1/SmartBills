
const pool = require("../config/database");

const createTransactionItem = async ({
    transactionId,
    itemName,
    quantity,
    unitPrice,
    totalPrice
}, db = pool) => {
    const result = await db.query(`
        INSERT INTO transaction_items (
            transaction_id,
            item_name,
            quantity,
            unit_price,
            total_price
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            item_id,
            transaction_id,
            item_name,
            quantity,
            unit_price,
            total_price;
    `, [transactionId, itemName, quantity, unitPrice, totalPrice]);

    return result.rows[0];
};

const findItemsByTransactionId = async (
    transactionId,
    db = pool
) => {
    const result = await db.query(`
        SELECT
            item_id,
            transaction_id,
            item_name,
            quantity,
            unit_price,
            total_price
        FROM transaction_items
        WHERE transaction_id = $1
        ORDER BY item_id;
    `, [transactionId]);

    return result.rows;
};

const deleteItemsByTransactionId = async (
    transactionId,
    db = pool
) => {
    const result = await db.query(`
        DELETE FROM transaction_items
        WHERE transaction_id = $1
        RETURNING item_id;
    `, [transactionId]);

    return result.rowCount;
};

module.exports = {
    createTransactionItem,
    findItemsByTransactionId,
    deleteItemsByTransactionId
};
