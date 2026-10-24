const {
    after,
    before,
    test
} = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "ocr-route-tests-only-secret";
process.env.OCR_SERVICE_URL = "http://localhost:8080";
process.env.OCR_SERVICE_TOKEN = "ocr-route-tests-token-at-least-32-characters";

let providerAvailable = true;
const nativeFetch = global.fetch;
global.fetch = async (input, options) => {
    if (!String(input).startsWith("http://localhost:8080/")) {
        return nativeFetch(input, options);
    }
    if (!providerAvailable) {
        return {
            ok: false,
            status: 503,
            json: async () => ({ error: "private OCR provider detail" })
        };
    }
    return {
        ok: true,
        status: 200,
        json: async () => ({ text: "TOKO UJI\nTOTAL 25000" })
    };
};

const pool = require("../src/config/database");
pool.query = async () => ({
    rows: [{
        user_id: 42,
        name: "OCR Test User",
        email: "ocr-test@example.test",
        role: "user"
    }]
});
const app = require("../src/app");
const token = jwt.sign({ userId: 42 }, process.env.JWT_SECRET);
const image = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
let server;
let baseUrl;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
    global.fetch = nativeFetch;
    await pool.end();
});

const postImage = async ({ authenticated = true, includeImage = true } = {}) => {
    const form = new FormData();
    if (includeImage) {
        form.append("receipt", new Blob([image], { type: "image/jpeg" }), "receipt.jpg");
    }
    return fetch(`${baseUrl}/api/ai/ocr`, {
        method: "POST",
        headers: authenticated ? { Authorization: `Bearer ${token}` } : {},
        body: form
    });
};

test("OCR upload requires an authenticated user", async () => {
    const response = await postImage({ authenticated: false });
    assert.equal(response.status, 401);
});

test("OCR upload returns raw text from the configured local service", async () => {
    const response = await postImage();
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.data.text, "TOKO UJI\nTOTAL 25000");
});

test("OCR upload rejects missing and unsupported image data", async () => {
    const missing = await postImage({ includeImage: false });
    assert.equal(missing.status, 400);

    const form = new FormData();
    form.append(
        "receipt",
        new Blob([Buffer.from("%PDF")], { type: "application/pdf" }),
        "receipt.pdf"
    );
    const unsupported = await fetch(`${baseUrl}/api/ai/ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
    });
    assert.equal(unsupported.status, 400);
});

test("OCR provider failure is reported without provider details", async () => {
    providerAvailable = false;
    try {
        const response = await postImage();
        const payload = await response.json();
        assert.equal(response.status, 502);
        assert.equal(payload.code, "OCR_SERVICE_FAILED");
        assert.equal(
            JSON.stringify(payload).includes("private OCR provider detail"),
            false
        );
    } finally {
        providerAvailable = true;
    }
});
