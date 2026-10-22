
const {
    describe,
    test,
    before,
    after
} = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");

// Pastikan konfigurasi test dipilih sebelum memuat aplikasi dan database.
process.env.NODE_ENV = "test";

const { JWT_SECRET } = require("../src/config/environment");
const pool = require("../src/config/database");
const app = require("../src/app");

const TEST_PREFIX = `initial_balance_${randomUUID().replace(/-/g, "")}`;
const TEST_PASSWORD = "TestPassword123!";

let server;
let baseUrl;
let databaseAvailable = false;
let testEmails = [];
let testUsers = [];

// Membaca data dari beberapa kemungkinan bentuk envelope respons API.
const getPayload = (body) => body?.data ?? body?.result ?? body;

const getUser = (body) => {
    const payload = getPayload(body);
    return payload?.user ?? payload;
};

const getToken = (body) => {
    const payload = getPayload(body);
    return payload?.token ?? payload?.accessToken;
};

const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    let body;

    try {
        body = await response.json();
    } catch {
        body = null;
    }

    return { status: response.status, body };
};

const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});

const registerUser = async (label = "user") => {
    const email = `${TEST_PREFIX}_${label}_${testEmails.length}@example.test`
    .toLowerCase();
    testEmails.push(email);

    const response = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name: `Test ${label}`,
            email,
            password: TEST_PASSWORD
        })
    });

    assert.equal(
        response.status,
        201,
        `Registrasi gagal: ${JSON.stringify(response.body)}`
    );

    const user = getUser(response.body);
    assert.ok(user?.user_id, "Respons registrasi tidak memiliki user_id");
    assert.equal(user.email, email);

    testUsers.push({ user_id: user.user_id, email });

    return { user, email };
};

const loginUser = async (email) => {
    const response = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password: TEST_PASSWORD
        })
    });

    assert.equal(
        response.status,
        200,
        `Login gagal: ${JSON.stringify(response.body)}`
    );

    const user = getUser(response.body);
    const token = getToken(response.body);

    assert.ok(token, "Respons login tidak memiliki token");

    return { user, token };
};

const getProfile = async (token) => {
    return request("/api/users/me", {
        headers: authHeaders(token)
    });
};

const setBalance = async (token, amount, extra = {}) => {
    return request("/api/users/me/initial-balance", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ amount, ...extra })
    });
};

const createLoggedInUser = async (label) => {
    const { email } = await registerUser(label);
    return { email, ...(await loginUser(email)) };
};

const assertNoPasswordHash = (value) => {
    assert.equal(
        Object.hasOwn(value, "password_hash"),
        false,
        "Respons API tidak boleh menyertakan password_hash"
    );
};

describe("Integration test saldo awal pengguna", () => {
    before(async (t) => {
        // Pemeriksaan database dilakukan sebelum server menerima request test.
        try {
            const result = await pool.query(
                "SELECT current_database() AS database"
            );

            const databaseName = result.rows[0]?.database;

            if (
                typeof databaseName !== "string"
                || !databaseName.toLowerCase().includes("test")
            ) {
                throw new Error(
                    `Database aktif "${databaseName}" bukan database test. ` +
                    "Test dibatalkan demi keamanan."
                );
            }

            if (process.env.ALLOW_DB_TESTS !== "true") {
                throw new Error(
                    "Untuk mengizinkan integration test, tambahkan " +
                    "ALLOW_DB_TESTS=true pada environment test."
                );
            }

            if (!JWT_SECRET) {
                throw new Error("JWT_SECRET belum dikonfigurasi untuk test.");
            }

            databaseAvailable = true;
        } catch (error) {
            // Kegagalan koneksi boleh melewati test, tetapi database yang
            // salah atau konfigurasi keamanan yang salah harus menggagalkan test.
            if (
                error.message.includes("bukan database test")
                || error.message.includes("ALLOW_DB_TESTS")
                || error.message.includes("JWT_SECRET")
            ) {
                throw error;
            }

            t.skip(`Database test tidak dapat diakses: ${error.message}`);
            return;
        }

        server = app.listen(0, "127.0.0.1");

        await new Promise((resolve, reject) => {
            server.once("listening", resolve);
            server.once("error", reject);
        });

        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    after(async () => {
        if (databaseAvailable) {
            // Hanya hapus akun yang dibuat oleh file test ini.
            for (const email of testEmails) {
                await pool.query(
                    "DELETE FROM users WHERE email = $1",
                    [email]
                );
            }
        }

        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        await pool.end();
    });

    test("registrasi, login, dan profil menampilkan saldo awal belum diatur", async () => {
        const { email } = await registerUser("profile");
        const login = await loginUser(email);

        assertNoPasswordHash(login.user);

        assert.equal(
            String(login.user.current_balance),
            "0.00"
        );

        const response = await getProfile(login.token);

        assert.equal(response.status, 200);

        const user = getUser(response.body);

        assert.equal(user.email, email);
        assert.equal(user.current_balance, "0.00");
        assert.equal(user.initial_balance, null);
        assert.equal(user.initial_balance_set_at, null);
        assert.equal(user.has_initial_balance, false);

        assertNoPasswordHash(user);
    });

    test("saldo awal dapat diatur dan sesuai dengan database", async () => {
        const { email, token } = await createLoggedInUser("set");

        const response = await setBalance(token, "1500000.50");

        assert.equal(response.status, 200);

        const user = getUser(response.body);

        assert.equal(user.current_balance, "1500000.50");
        assert.equal(user.initial_balance, "1500000.50");
        assert.ok(user.initial_balance_set_at);
        assert.equal(user.has_initial_balance, true);

        assertNoPasswordHash(user);

        const databaseResult = await pool.query(
            `SELECT current_balance, initial_balance, initial_balance_set_at
             FROM users
             WHERE email = $1`,
            [email]
        );

        assert.equal(databaseResult.rowCount, 1);
        assert.equal(databaseResult.rows[0].current_balance, "1500000.50");
        assert.equal(databaseResult.rows[0].initial_balance, "1500000.50");
        assert.ok(databaseResult.rows[0].initial_balance_set_at);
    });

    test("saldo awal hanya dapat diatur satu kali", async () => {
        const { email, token } = await createLoggedInUser("once");

        const first = await setBalance(token, "100000.00");
        assert.equal(first.status, 200);

        const second = await setBalance(token, "200000.00");
        assert.equal(second.status, 409);

        const payload = getPayload(second.body);
        assert.equal(payload.code, "INITIAL_BALANCE_ALREADY_SET");

        const databaseResult = await pool.query(
            `SELECT current_balance, initial_balance
             FROM users
             WHERE email = $1`,
            [email]
        );

        assert.equal(databaseResult.rows[0].current_balance, "100000.00");
        assert.equal(databaseResult.rows[0].initial_balance, "100000.00");
    });

    test("dua permintaan saldo awal bersamaan hanya menghasilkan satu keberhasilan", async () => {
        const { email, token } = await createLoggedInUser("parallel");

        const results = await Promise.all([
            setBalance(token, "111000.00"),
            setBalance(token, "222000.00")
        ]);

        const statuses = results.map((result) => result.status).sort();

        assert.deepEqual(statuses, [200, 409]);

        const databaseResult = await pool.query(
            `SELECT current_balance, initial_balance
             FROM users
             WHERE email = $1`,
            [email]
        );

        const row = databaseResult.rows[0];

        assert.ok(row);
        assert.equal(row.current_balance, row.initial_balance);
        assert.ok(
            ["111000.00", "222000.00"].includes(row.initial_balance)
        );
    });

    test("request tanpa token ditolak dengan 401", async () => {
        const response = await request("/api/users/me");

        assert.equal(response.status, 401);
    });

    test("request dengan token tidak valid ditolak dengan 401", async () => {
        const response = await getProfile("invalid.token.value");

        assert.equal(response.status, 401);
    });

    test("request dengan token kedaluwarsa ditolak dengan 401", async () => {
        const expiredToken = jwt.sign(
            {
                userId: 2147483647,
                email: "expired@example.test",
                exp: Math.floor(Date.now() / 1000) - 60
            },
            JWT_SECRET,
            { algorithm: "HS256" }
        );

        const response = await getProfile(expiredToken);

        assert.equal(response.status, 401);
        assert.equal(
            getPayload(response.body).code,
            "AUTH_TOKEN_EXPIRED"
        );
    });

    test("user tidak dapat mengubah saldo user lain melalui request body", async () => {
        const userA = await createLoggedInUser("ownerA");
        const userB = await createLoggedInUser("ownerB");

        const initialB = await setBalance(userB.token, "50000.00");
        assert.equal(initialB.status, 200);

        const attack = await setBalance(
            userA.token,
            "700000.00",
            {
                user_id: userB.user.user_id,
                current_balance: "999999999.00"
            }
        );

        assert.equal(attack.status, 200);

        const profileA = await getProfile(userA.token);
        const profileB = await getProfile(userB.token);

        assert.equal(getUser(profileA.body).email, userA.email);
        assert.equal(getUser(profileA.body).current_balance, "700000.00");

        assert.equal(getUser(profileB.body).email, userB.email);
        assert.equal(getUser(profileB.body).current_balance, "50000.00");
        assert.equal(getUser(profileB.body).initial_balance, "50000.00");

        assertNoPasswordHash(getUser(profileA.body));
        assertNoPasswordHash(getUser(profileB.body));
    });

    test("login, profil, dan database konsisten menggunakan dua angka desimal", async () => {
        const { email, token } = await createLoggedInUser("consistency");

        const setResponse = await setBalance(token, "123456.70");
        assert.equal(setResponse.status, 200);

        const login = await loginUser(email);
        const profile = await getProfile(login.token);

        assert.equal(login.user.current_balance, "123456.70");
        assert.equal(getUser(profile.body).current_balance, "123456.70");

        const databaseResult = await pool.query(
            "SELECT current_balance FROM users WHERE email = $1",
            [email]
        );

        assert.equal(databaseResult.rows[0].current_balance, "123456.70");

        assertNoPasswordHash(login.user);
        assertNoPasswordHash(getUser(profile.body));
    });
});
