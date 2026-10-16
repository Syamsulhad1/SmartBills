const pool = require("../config/database");

/**
 * Membuat user baru
 *
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.passwordHash
 * @returns {Object} user
 */
const createUser = async ({ name, email, passwordHash }) => {
    const query = `
        INSERT INTO users (
            name,
            email,
            password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING
            user_id,
            name,
            email,
            role,
            current_balance,
            created_at;
    `;

    const values = [
        name,
        email,
        passwordHash
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


/**
 * Mencari user berdasarkan email
 *
 * Digunakan untuk kebutuhan:
 * - Login
 * - Validasi email
 * - Authentication
 *
 * @param {string} email
 * @returns {Object|undefined} user
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            user_id,
            name,
            email,
            password_hash,
            role,
            current_balance,
            created_at
        FROM users
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};


/**
 * Mencari user berdasarkan ID
 *
 * @param {number} userId
 * @returns {Object|undefined} user
 */
const findUserById = async (userId) => {
    const query = `
        SELECT
            user_id,
            name,
            email,
            role,
            current_balance,
            created_at
        FROM users
        WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};


const findAllUsers = async () => {
    const query = `
        SELECT
            user_id,
            name,
            email,
            role,
            created_at
        FROM users
        ORDER BY user_id ASC;
    `;

    const result = await pool.query(query);

    return result.rows;
};


const updateUserRoleByEmail = async (email, role) => {
    const query = `
        UPDATE users
        SET role = $2
        WHERE email = $1
        RETURNING
            user_id,
            name,
            email,
            role,
            created_at;
    `;

    const result = await pool.query(query, [email, role]);

    return result.rows[0];
};


module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findAllUsers,
    updateUserRoleByEmail
};
