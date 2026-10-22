
process.env.JWT_SECRET = "smartbills-test-secret-for-jwt";
process.env.JWT_EXPIRES_IN = "1d";

const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const path = require("node:path");

const userModelPath = require.resolve("../src/models/userModel");

let findUserByIdImpl = async () => null;
let findUserByIdCalls = 0;

require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: {
        findUserById: async (...args) => {
            findUserByIdCalls += 1;
            return findUserByIdImpl(...args);
        }
    }
};

const { protect, authorize } = require("../src/middleware/authMiddleware");

const SECRET = process.env.JWT_SECRET;

const mockUser = {
    user_id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "user"
};

const createToken = (payload, options = {}) => jwt.sign(
    payload,
    SECRET,
    {
        algorithm: "HS256",
        ...options
    }
);

const createRequest = (authorization) => ({
    get(name) {
        if (name.toLowerCase() === "authorization") {
            return authorization;
        }

        return undefined;
    },
    user: undefined
});

const createResponse = () => {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };

    return res;
};

const runProtect = async (authorization) => {
    const req = createRequest(authorization);
    const res = createResponse();
    const nextCalls = [];

    const next = (...args) => {
        nextCalls.push(args);
    };

    await protect(req, res, next);

    return { req, res, nextCalls };
};

const expectUnauthorized = async (authorization, code, message) => {
    const { res, nextCalls } = await runProtect(authorization);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, {
        success: false,
        message,
        code
    });
    assert.equal(nextCalls.length, 0);

    return res;
};

test.beforeEach(() => {
    findUserByIdCalls = 0;
    findUserByIdImpl = async () => mockUser;
});

test("tanpa header Authorization -> AUTH_TOKEN_MISSING", async () => {
    await expectUnauthorized(
        undefined,
        "AUTH_TOKEN_MISSING",
        "Authentication required"
    );
});

test("format header salah -> AUTH_TOKEN_MISSING", async (t) => {
    for (const header of ["Token abc", "Bearer"]) {
        await t.test(header, async () => {
            await expectUnauthorized(
                header,
                "AUTH_TOKEN_MISSING",
                "Authentication required"
            );
        });
    }
});

test("signature salah -> AUTH_TOKEN_INVALID", async () => {
    const token = jwt.sign(
        { userId: 1 },
        "different-secret",
        { algorithm: "HS256" }
    );

    await expectUnauthorized(
        `Bearer ${token}`,
        "AUTH_TOKEN_INVALID",
        "Invalid token"
    );
});

test("token malformed -> AUTH_TOKEN_INVALID", async () => {
    await expectUnauthorized(
        "Bearer abc.def.ghi",
        "AUTH_TOKEN_INVALID",
        "Invalid token"
    );
});

test("token kedaluwarsa -> AUTH_TOKEN_EXPIRED", async () => {
    const token = createToken({ userId: 1 }, { expiresIn: -10 });

    await expectUnauthorized(
        `Bearer ${token}`,
        "AUTH_TOKEN_EXPIRED",
        "Token has expired, please log in again"
    );
});

test("algoritma none dan HS512 ditolak", async (t) => {
    const header = Buffer.from(
        JSON.stringify({ alg: "none", typ: "JWT" })
    ).toString("base64url");

    const payload = Buffer.from(
        JSON.stringify({ userId: 1 })
    ).toString("base64url");

    const noneToken = `${header}.${payload}.`;

    const hs512Token = jwt.sign(
        { userId: 1 },
        SECRET,
        { algorithm: "HS512" }
    );

    for (const token of [noneToken, hs512Token]) {
        await t.test(token === noneToken ? "none" : "HS512", async () => {
            await expectUnauthorized(
                `Bearer ${token}`,
                "AUTH_TOKEN_INVALID",
                "Invalid token"
            );
        });
    }
});

test("payload tanpa userId ditolak tanpa query database", async () => {
    const token = createToken({ email: "test@example.com" });

    await expectUnauthorized(
        `Bearer ${token}`,
        "AUTH_TOKEN_INVALID",
        "Invalid token"
    );

    assert.equal(findUserByIdCalls, 0);
});

test('payload userId "abc" ditolak tanpa query database', async () => {
    const token = createToken({ userId: "abc" });

    await expectUnauthorized(
        `Bearer ${token}`,
        "AUTH_TOKEN_INVALID",
        "Invalid token"
    );

    assert.equal(findUserByIdCalls, 0);
});

test("user tidak ditemukan -> AUTH_USER_NOT_FOUND", async () => {
    findUserByIdImpl = async () => undefined;

    const token = createToken({ userId: 1 });

    await expectUnauthorized(
        `Bearer ${token}`,
        "AUTH_USER_NOT_FOUND",
        "User associated with token was not found"
    );

    assert.equal(findUserByIdCalls, 1);
});

test("token valid mengisi req.user dan memanggil next tanpa argumen", async () => {
    const token = createToken({
        userId: 1,
        email: mockUser.email
    });

    const { req, res, nextCalls } = await runProtect(`Bearer ${token}`);

    assert.equal(res.statusCode, null);
    assert.deepEqual(req.user, mockUser);
    assert.equal(findUserByIdCalls, 1);
    assert.equal(nextCalls.length, 1);
    assert.deepEqual(nextCalls[0], []);
});

test("error database diteruskan ke next(error)", async () => {
    const databaseError = new Error("Database unavailable");
    findUserByIdImpl = async () => {
        throw databaseError;
    };

    const token = createToken({ userId: 1 });
    const { res, nextCalls } = await runProtect(`Bearer ${token}`);

    assert.equal(res.statusCode, null);
    assert.equal(nextCalls.length, 1);
    assert.equal(nextCalls[0][0], databaseError);
});

test("authorize tanpa req.user -> 401", () => {
    const req = createRequest(undefined);
    const res = createResponse();
    const nextCalls = [];

    authorize("admin")(req, res, (...args) => nextCalls.push(args));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, "AUTH_TOKEN_MISSING");
    assert.equal(nextCalls.length, 0);
});

test("authorize dengan role tidak sesuai -> 403", () => {
    const req = createRequest(undefined);
    req.user = { ...mockUser, role: "user" };

    const res = createResponse();
    const nextCalls = [];

    authorize("admin")(req, res, (...args) => nextCalls.push(args));

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, {
        success: false,
        message: "You do not have permission to access this resource"
    });
    assert.equal(nextCalls.length, 0);
});

test("authorize dengan role sesuai memanggil next tanpa argumen", () => {
    const req = createRequest(undefined);
    req.user = { ...mockUser, role: "admin" };

    const res = createResponse();
    const nextCalls = [];

    authorize("admin")(req, res, (...args) => nextCalls.push(args));

    assert.equal(res.statusCode, null);
    assert.equal(nextCalls.length, 1);
    assert.deepEqual(nextCalls[0], []);
});
