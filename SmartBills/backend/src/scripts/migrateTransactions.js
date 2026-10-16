const pool = require("../config/database");

const migrateTransactions = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
                type VARCHAR(20) NOT NULL
                    CHECK (type IN ('INCOME', 'EXPENSE')),
                amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
                merchant_name VARCHAR(255),
                notes TEXT,
                source VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
                image_url TEXT,
                transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            ALTER TABLE transactions
            ADD COLUMN IF NOT EXISTS notes TEXT,
            ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'MANUAL';
        `);

        const constraintResult = await pool.query(`
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'transactions_source_check'
              AND conrelid = 'public.transactions'::regclass;
        `);

        if (constraintResult.rowCount === 0) {
            await pool.query(`
                ALTER TABLE transactions
                ADD CONSTRAINT transactions_source_check
                CHECK (source IN ('MANUAL', 'OCR', 'AI'));
            `);
        }

        await pool.query(`
            CREATE INDEX IF NOT EXISTS transactions_user_date_idx
            ON transactions (user_id, transaction_date DESC);

            CREATE INDEX IF NOT EXISTS transactions_user_category_idx
            ON transactions (user_id, category_id);

            CREATE INDEX IF NOT EXISTS transactions_type_date_idx
            ON transactions (type, transaction_date DESC);
        `);

        console.log("Transaction migration completed");
    } finally {
        await pool.end();
    }
};

migrateTransactions().catch((error) => {
    console.error("Transaction migration failed:", error.message);
    process.exitCode = 1;
});
