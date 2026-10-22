
const pool = require("../config/database");


/**
 * Membuat user baru.
 *
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.passwordHash
 * @returns {Promise<Object>}
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

    const values = [name, email, passwordHash];

    const result = await pool.query(query, values);

    return result.rows[0];
};


/**
 * Mencari user berdasarkan email.
 *
 * password_hash hanya digunakan secara internal untuk autentikasi.
 * Jangan mengirimkan password_hash ke respons API.
 *
 * @param {string} email
 * @returns {Promise<Object|undefined>}
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
            initial_balance,
            initial_balance_set_at,
            created_at
        FROM users
        WHERE email = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};


/**
 * Mencari user berdasarkan ID.
 *
 * @param {number|string} userId
 * @returns {Promise<Object|undefined>}
 */
const findUserById = async (userId) => {
    const query = `
        SELECT
            user_id,
            name,
            email,
            role,
            current_balance,
            initial_balance,
            initial_balance_set_at,
            created_at
        FROM users
        WHERE user_id = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};


/**
 * Mengatur saldo awal pengguna hanya satu kali.
 *
 * ID pengguna harus berasal dari req.user.user_id
 * pada controller, bukan dari request body.
 *
 * UPDATE bersyarat ini membuat operasi atomik:
 * hanya permintaan pertama yang memenuhi kondisi
 * initial_balance_set_at IS NULL yang berhasil.
 *
 * @param {number|string} userId
 * @param {string} amount Nominal desimal yang sudah dinormalisasi
 * @returns {Promise<Object|null>}
 */
const setInitialBalance = async (userId, amount) => {
    const query = `
        UPDATE users
        SET
            current_balance = $2,
            initial_balance = $2,
            initial_balance_set_at = NOW()
        WHERE user_id = $1
          AND initial_balance_set_at IS NULL
        RETURNING
            user_id,
            name,
            email,
            role,
            current_balance,
            initial_balance,
            initial_balance_set_at,
            created_at;
    `;

    const result = await pool.query(query, [userId, amount]);

    return result.rows[0] || null;
};


/**
 * Mengambil daftar user tanpa informasi saldo
 * dan tanpa password_hash.
 *
 * @returns {Promise<Array<Object>>}
 */
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


/**
 * Memperbarui role user berdasarkan email.
 *
 * @param {string} email
 * @param {string} role
 * @returns {Promise<Object|undefined>}
 */
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
    setInitialBalance,
    findAllUsers,
    updateUserRoleByEmail
};
