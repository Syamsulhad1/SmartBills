
const pool = require("../config/database");

const transactionFields = [
    "transaction_id",
    "user_id",
    "category_id",
    "type",
    "amount",
    "merchant_name",
    "notes",
    "source",
    "image_url",
    "transaction_date",
    "created_at"
];

const transactionColumns = transactionFields.join(",\n            ");
const transactionSelectColumns = transactionFields
    .map((field) => `t.${field}`)
    .join(",\n            ");

const createTransaction = async ({
    userId,
    categoryId = null,
    type,
    amount,
    merchantName = null,
    notes = null,
    source = "MANUAL",
    imageUrl = null,
    transactionDate = new Date()
}, db = pool) => {
    const query = `
        INSERT INTO transactions (
            user_id,
            category_id,
            type,
            amount,
            merchant_name,
            notes,
            source,
            image_url,
            transaction_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING ${transactionColumns};
    `;

    const values = [
        userId,
        categoryId,
        type,
        amount,
        merchantName,
        notes,
        source,
        imageUrl,
        transactionDate
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

const findTransactionsByUserId = async (
    userId,
    { limit = 50, offset = 0 } = {}
) => {
    const query = `
        SELECT
            ${transactionSelectColumns},
            c.name AS category_name
        FROM transactions t
        LEFT JOIN categories c ON c.category_id = t.category_id
        WHERE t.user_id = $1
        ORDER BY t.transaction_date DESC, t.transaction_id DESC
        LIMIT $2 OFFSET $3;
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
};

const findTransactionByIdForUser = async (transactionId, userId) => {
    const query = `
        SELECT
            ${transactionSelectColumns},
            c.name AS category_name
        FROM transactions t
        LEFT JOIN categories c ON c.category_id = t.category_id
        WHERE t.transaction_id = $1
          AND t.user_id = $2;
    `;

    const result = await pool.query(query, [transactionId, userId]);
    return result.rows[0];
};

const findCategoryById = async (categoryId, db = pool) => {
    const result = await db.query(
        "SELECT category_id, type FROM categories WHERE category_id = $1;",
        [categoryId]
    );

    return result.rows[0];
};

// UPDATE: hanya mengubah transaksi milik pengguna terkait.
const updateTransactionForUser = async ({
    transactionId,
    userId,
    categoryId,
    type,
    amount,
    merchantName,
    notes,
    transactionDate
}, db = pool) => {
    const query = `
        UPDATE transactions
        SET
            category_id = $3,
            type = $4,
            amount = $5,
            merchant_name = $6,
            notes = $7,
            transaction_date = $8
        WHERE transaction_id = $1
          AND user_id = $2
        RETURNING ${transactionColumns};
    `;

    const values = [
        transactionId,
        userId,
        categoryId,
        type,
        amount,
        merchantName,
        notes,
        transactionDate
    ];

    const result = await db.query(query, values);
    return result.rows[0] || null;
};

// DELETE: hanya menghapus transaksi milik pengguna terkait.
const deleteTransactionForUser = async (
    transactionId,
    userId,
    db = pool
) => {
    const query = `
        DELETE FROM transactions
        WHERE transaction_id = $1
          AND user_id = $2
        RETURNING ${transactionColumns};
    `;

    const result = await db.query(query, [transactionId, userId]);
    return result.rows[0] || null;
};

module.exports = {
    createTransaction,
    findTransactionsByUserId,
    findTransactionByIdForUser,
    findCategoryById,
    updateTransactionForUser,
    deleteTransactionForUser
};
