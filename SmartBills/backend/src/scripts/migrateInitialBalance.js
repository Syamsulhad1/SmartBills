
const pool = require("../config/database");

const migrate = async () => {
    let client;

    try {
        client = await pool.connect();

        // Pastikan koneksi mengarah ke database yang diharapkan.
        const { rows } = await client.query(
            "SELECT current_database() AS database_name"
        );

        const databaseName = rows[0].database_name;

        if (
            process.env.NODE_ENV === "test" &&
            !databaseName.toLowerCase().includes("test")
        ) {
            throw new Error(
                `Migrasi dibatalkan: database tes tidak valid (${databaseName})`
            );
        }

        await client.query("BEGIN");

        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(15, 2)
            CHECK (initial_balance >= 0)
        `);

        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS initial_balance_set_at TIMESTAMP NULL
        `);

        await client.query("COMMIT");

        console.log(
            `Initial balance migration completed (${databaseName})`
        );
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Migration rollback failed:",
                    rollbackError.message
                );
            }
        }

        console.error(
            "Initial balance migration failed:",
            error.message
        );

        process.exitCode = 1;
    } finally {
        if (client) {
            client.release();
        }

        await pool.end();
    }
};

migrate();
