const test = require("node:test");
const assert = require("node:assert/strict");
const { parseReceiptText } = require("../src/services/aiService");

const categories = [
    { category_id: 1, name: "Gaji", type: "INCOME" },
    { category_id: 2, name: "Tagihan", type: "EXPENSE" },
    { category_id: 3, name: "Pendidikan", type: "EXPENSE" }
];

const result = {
    type: "EXPENSE",
    amount: "21500",
    merchantName: "PLN",
    transactionDate: "2026-10-17",
    categoryName: "Tagihan",
    items: []
};

const response = (status, payload) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => payload
});

test("parses Gemini structured output into an unpersisted review draft", async () => {
    let request;
    const draft = await parseReceiptText("PLN TOTAL Rp21.500", categories, {
        apiKey: "test-api-key",
        model: "gemini-3.5-flash-lite",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return response(200, {
                candidates: [{
                    content: { parts: [{ text: JSON.stringify(result) }] }
                }]
            });
        }
    });

    assert.equal(
        request.url,
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
    );
    assert.equal(request.options.headers["x-goog-api-key"], "test-api-key");
    assert.equal(request.options.body.includes('"maxOutputTokens":4096'), true);
    assert.match(request.options.body, /GRAND TOTAL, TOTAL BAYAR/);
    assert.match(request.options.body, /Toleransi salah baca OCR/);
    assert.match(request.options.body, /Tentukan EXPENSE untuk bukti pembelian/);
    assert.match(request.options.body, /bukti pembayaran layanan dan pendidikan/);
    assert.equal(draft.status, "ready_for_review");
    assert.equal(draft.transaction.amount, "21500.00");
    assert.equal(draft.transaction.categoryId, 2);
    assert.deepEqual(draft.warnings, []);
});

test("fills payment-proof fields from OCR labels when AI leaves them blank", async () => {
    const text = [
        "BUKTI PEMBAYARAN PRAKTIK PENGGANTI",
        "NAMA : Contoh Pengguna",
        "TANGGAL PEMBAYARAN : Selasa, 13 Oktober 2026",
        "Total Bayar",
        "Rp 10.000"
    ].join("\n");
    const draft = await parseReceiptText(text, categories, {
        apiKey: "test-api-key",
        fetchImpl: async () => response(200, {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            type: "UNKNOWN",
                            amount: "",
                            merchantName: "",
                            transactionDate: "",
                            categoryName: "",
                            items: []
                        })
                    }]
                }
            }]
        })
    });

    assert.equal(draft.status, "ready_for_review");
    assert.equal(draft.transaction.type, "EXPENSE");
    assert.equal(draft.transaction.amount, "10000.00");
    assert.equal(draft.transaction.categoryId, 3);
    assert.equal(draft.transaction.merchantName, "PRAKTIK PENGGANTI");
    assert.equal(draft.transaction.transactionDate, "2026-10-13");
    assert.deepEqual(draft.warnings, []);
});

test("normalizes Indonesian rupiah formatting and category capitalization", async () => {
    const draft = await parseReceiptText("PLN TOTAL Rp21.500", categories, {
        apiKey: "test-api-key",
        fetchImpl: async () => response(200, {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            ...result,
                            amount: "Rp 21.500",
                            categoryName: "tagihan"
                        })
                    }]
                }
            }]
        })
    });

    assert.equal(draft.transaction.amount, "21500.00");
    assert.equal(draft.transaction.categoryId, 2);
    assert.deepEqual(draft.warnings, []);
});

test("does not guess missing values and warns for invalid items", async () => {
    const draft = await parseReceiptText("PLN", categories, {
        apiKey: "test-api-key",
        fetchImpl: async () => response(200, {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            ...result,
                            type: "UNKNOWN",
                            amount: "",
                            categoryName: "",
                            merchantName: "",
                            transactionDate: "",
                            items: [{
                                itemName: "Token",
                                quantity: 0,
                                unitPrice: "",
                                totalPrice: ""
                            }]
                        })
                    }]
                }
            }]
        })
    });

    assert.equal(draft.status, "needs_review");
    assert.equal(draft.transaction.type, null);
    assert.equal(draft.transaction.amount, null);
    assert.equal(draft.transaction.items.length, 0);
    assert.deepEqual(
        draft.warnings.map(({ code }) => code),
        [
            "TRANSACTION_TYPE_UNCLEAR",
            "AMOUNT_MISSING_OR_INVALID",
            "CATEGORY_MISSING",
            "DATE_MISSING",
            "MERCHANT_MISSING",
            "ITEM_INVALID"
        ]
    );
});

test("rejects empty, oversized, and malformed provider responses", async () => {
    let called = false;
    const fetchImpl = async () => {
        called = true;
        return response(200, { candidates: [] });
    };

    await assert.rejects(
        parseReceiptText(" ", categories, {
            apiKey: "test-api-key",
            fetchImpl
        }),
        { statusCode: 400, code: "AI_TEXT_REQUIRED" }
    );
    await assert.rejects(
        parseReceiptText("x".repeat(20001), categories, {
            apiKey: "test-api-key",
            fetchImpl
        }),
        { statusCode: 413, code: "AI_TEXT_TOO_LARGE" }
    );
    assert.equal(called, false);
    await assert.rejects(
        parseReceiptText("PLN", categories, {
            apiKey: "test-api-key",
            fetchImpl
        }),
        { statusCode: 502, code: "AI_INVALID_RESPONSE" }
    );
});

test("maps provider quota errors without exposing the provider message", async () => {
    await assert.rejects(
        parseReceiptText("PLN", categories, {
            apiKey: "test-api-key",
            fetchImpl: async () => response(429, {
                error: {
                    status: "RESOURCE_EXHAUSTED",
                    message: "private provider response must not be logged"
                }
            })
        }),
        (error) => {
            assert.equal(error.statusCode, 503);
            assert.equal(error.code, "AI_RATE_LIMITED");
            assert.equal(error.providerStatus, 429);
            assert.equal(error.providerCode, "RESOURCE_EXHAUSTED");
            assert.equal(error.message.includes("private provider"), false);
            return true;
        }
    );
});
