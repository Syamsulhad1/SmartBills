
const pool = require("../config/database");

const migrate = async () => {
    let client;
    let transactionStarted = false;

    try {
        client = await pool.connect();

        // Pastikan database yang digunakan sesuai.
        const { rows } = await client.query(`
            SELECT current_database() AS database_name
        `);

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
        transactionStarted = true;

        // Pastikan tabel users tersedia di skema public.
        const tableResult = await client.query(`
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'users'
        `);

        if (tableResult.rowCount === 0) {
            throw new Error(
                `Tabel public.users tidak ditemukan pada database ${databaseName}`
            );
        }

        // Tambahkan saldo awal jika belum tersedia.
        await client.query(`
            ALTER TABLE public.users
            ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(15, 2)
            CHECK (initial_balance >= 0)
        `);

        // Tambahkan waktu pencatatan saldo awal jika belum tersedia.
        await client.query(`
            ALTER TABLE public.users
            ADD COLUMN IF NOT EXISTS initial_balance_set_at TIMESTAMP NULL
        `);

        await client.query("COMMIT");
        transactionStarted = false;

        // Verifikasi kolom setelah migrasi.
        const columnsResult = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name IN (
                  'initial_balance',
                  'initial_balance_set_at'
              )
            ORDER BY column_name
        `);

        const columns = columnsResult.rows.map(
            (row) => row.column_name
        );

        if (
            !columns.includes("initial_balance") ||
            !columns.includes("initial_balance_set_at")
        ) {
            throw new Error(
                "Migrasi selesai, tetapi verifikasi kolom gagal."
            );
        }

        console.log(
            `Initial balance migration completed (${databaseName})`
        );

        console.log("Kolom tersedia:", columns.join(", "));
    } catch (error) {
        if (client && transactionStarted) {
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
