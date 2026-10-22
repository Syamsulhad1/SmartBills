const pool = require("../config/database");

const findCategories = async ({ type = null } = {}) => {
    const result = await pool.query(`
        SELECT category_id, name, type
        FROM categories
        WHERE ($1::VARCHAR IS NULL OR type = $1)
        ORDER BY type, name;
    `, [type]);

    return result.rows;
};

module.exports = {
    findCategories
};
