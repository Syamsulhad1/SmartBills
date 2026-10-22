const pool = require("../config/database");

const initialCategories = [
    ["Gaji", "INCOME"],
    ["Bonus", "INCOME"],
    ["Pemasukan Lainnya", "INCOME"],
    ["Pangan Pokok", "EXPENSE"],
    ["F&B", "EXPENSE"],
    ["Kebersihan", "EXPENSE"],
    ["Kesehatan", "EXPENSE"],
    ["BBM", "EXPENSE"],
    ["Transportasi", "EXPENSE"],
    ["Pendidikan", "EXPENSE"],
    ["Hiburan", "EXPENSE"],
    ["Belanja", "EXPENSE"],
    ["Tagihan", "EXPENSE"],
    ["Lainnya", "EXPENSE"]
];

const setupDatabase = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00
                    CHECK (current_balance >= 0),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                role VARCHAR(20) NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'admin'))
            );

            CREATE TABLE IF NOT EXISTS categories (
                category_id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
                UNIQUE (name, type)
            );

            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
                amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
                merchant_name VARCHAR(100),
                image_url TEXT,
                transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                source VARCHAR(20) NOT NULL DEFAULT 'MANUAL'
                    CHECK (source IN ('MANUAL', 'OCR', 'AI'))
            );

            CREATE TABLE IF NOT EXISTS transaction_items (
                item_id SERIAL PRIMARY KEY,
                transaction_id INTEGER NOT NULL
                    REFERENCES transactions(transaction_id) ON DELETE CASCADE,
                item_name VARCHAR(150) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
                unit_price NUMERIC(15, 2) CHECK (unit_price >= 0),
                total_price NUMERIC(15, 2) NOT NULL CHECK (total_price >= 0)
            );

            CREATE TABLE IF NOT EXISTS master_commodity_prices (
                commodity_id SERIAL PRIMARY KEY,
                commodity_name VARCHAR(100) NOT NULL,
                unit VARCHAR(30) NOT NULL,
                reference_price NUMERIC(15, 2) NOT NULL CHECK (reference_price >= 0),
                region VARCHAR(100),
                recorded_date DATE NOT NULL DEFAULT CURRENT_DATE
            );
        `);

        for (const [name, type] of initialCategories) {
            await client.query(`
                INSERT INTO categories (name, type)
                VALUES ($1, $2)
                ON CONFLICT (name, type) DO NOTHING;
            `, [name, type]);
        }

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_transactions_user_id
                ON transactions (user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_category_id
                ON transactions (category_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_date
                ON transactions (transaction_date);
            CREATE INDEX IF NOT EXISTS transactions_user_date_idx
                ON transactions (user_id, transaction_date DESC);
            CREATE INDEX IF NOT EXISTS transactions_user_category_idx
                ON transactions (user_id, category_id);
            CREATE INDEX IF NOT EXISTS transactions_type_date_idx
                ON transactions (type, transaction_date DESC);
            CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id
                ON transaction_items (transaction_id);
        `);

        await client.query("COMMIT");
        console.log("SmartBills database setup completed");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

setupDatabase().catch((error) => {
    console.error("SmartBills database setup failed:", error.message);
    process.exitCode = 1;
});
