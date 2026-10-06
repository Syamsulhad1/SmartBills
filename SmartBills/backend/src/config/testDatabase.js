const pool = require("./database");

async function testDatabaseConnection() {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                current_user AS user,
                version() AS version;
        `);

        console.log("");
        console.log("=================================");
        console.log("DATABASE CONNECTION SUCCESS");
        console.log("=================================");
        console.log("Database :", result.rows[0].database);
        console.log("User     :", result.rows[0].user);
        console.log("Version  :", result.rows[0].version);
        console.log("=================================");
        console.log("");

    } catch (error) {
        console.error("");
        console.error("=================================");
        console.error("DATABASE CONNECTION FAILED");
        console.error("=================================");
        console.error("Error:", error.message);
        console.error("=================================");
        console.error("");

    } finally {
        await pool.end();
    }
}

testDatabaseConnection();