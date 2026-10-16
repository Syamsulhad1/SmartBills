const pool = require("../config/database");

const migrateUserRoles = async () => {
    try {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
        `);

        const constraintResult = await pool.query(`
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'users_role_check'
              AND conrelid = 'public.users'::regclass;
        `);

        if (constraintResult.rowCount === 0) {
            await pool.query(`
                ALTER TABLE users
                ADD CONSTRAINT users_role_check
                CHECK (role IN ('user', 'admin'));
            `);
        }

        console.log("User role migration completed");
    } finally {
        await pool.end();
    }
};

migrateUserRoles().catch((error) => {
    console.error("User role migration failed:", error.message);
    process.exitCode = 1;
});
