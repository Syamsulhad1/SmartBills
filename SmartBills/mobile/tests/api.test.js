import assert from "node:assert/strict";
import test from "node:test";
import { createApi } from "../src/api/client.js";

test("login sends credentials and returns the backend data", async () => {
    let request;
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { token: "jwt-token", user: { user_id: 7 } }
            });
        }
    });

    const result = await api.login({ email: "user@example.com", password: "secret" });

    assert.equal(request.url, "http://localhost:5000/api/auth/login");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(request.options.body), {
        email: "user@example.com",
        password: "secret"
    });
    assert.equal(result.token, "jwt-token");
});

test("registration posts the account details to the backend", async () => {
    let request;
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { user: { user_id: 7 } }
            }, { status: 201 });
        }
    });

    await api.register({
        name: "Smart User",
        email: "user@example.com",
        password: "secret"
    });

    assert.equal(request.url, "http://localhost:5000/api/auth/register");
    assert.equal(request.options.method, "POST");
    assert.deepEqual(JSON.parse(request.options.body), {
        name: "Smart User",
        email: "user@example.com",
        password: "secret"
    });
});

test("profile sends the JWT and unwraps the user response", async () => {
    let request;
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { user: { user_id: 7, email: "user@example.com" } }
            });
        }
    });

    const result = await api.profile("jwt-token");

    assert.equal(request.url, "http://localhost:5000/api/users/me");
    assert.equal(request.options.headers.Authorization, "Bearer jwt-token");
    assert.equal(result.user.user_id, 7);
});

test("categories loads the authenticated category list for a transaction type", async () => {
    let request;
    const token = "jwt-token";
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { categories: [{ category_id: 3, name: "Makan", type: "EXPENSE" }] }
            });
        }
    });

    const result = await api.categories(token, "EXPENSE");

    assert.equal(request.url, "http://localhost:5000/api/categories?type=EXPENSE");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.equal(result.categories[0].category_id, 3);
});

test("analytics sends the JWT and selected period", async () => {
    let request;
    const token = "jwt-token";
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: {
                    period: "weekly",
                    summary: { income: "1000" },
                    current_periods: {
                        weekly: { income: "300", expense: "50" },
                        monthly: { income: "800", expense: "100" }
                    }
                }
            });
        }
    });

    const result = await api.analytics(token, "weekly");

    assert.equal(request.url, "http://localhost:5000/api/analytics?period=weekly");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.equal(result.period, "weekly");
    assert.equal(result.current_periods.weekly.income, "300");
    assert.equal(result.current_periods.monthly.expense, "100");
});

test("initial balance posts the amount with the authenticated JWT", async () => {
    let request;
    const token = "jwt-token";
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { user: { initial_balance: "1500000.00", has_initial_balance: true } }
            });
        }
    });

    const result = await api.setInitialBalance(token, "1500000");

    assert.equal(request.url, "http://localhost:5000/api/users/me/initial-balance");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.deepEqual(JSON.parse(request.options.body), { amount: "1500000" });
    assert.equal(result.user.has_initial_balance, true);
});

test("receipt recognition posts multipart image data with the authenticated JWT", async () => {
    let request;
    const token = "jwt-token";
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { text: "TOTAL 25.000" }
            });
        }
    });

    const result = await api.recognizeReceipt(token, {
        uri: "file:///receipt.jpg",
        fileName: "receipt.jpg",
        mimeType: "image/jpeg"
    });

    assert.equal(request.url, "http://localhost:5000/api/ai/ocr");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.equal(request.options.headers["Content-Type"], undefined);
    assert.ok(request.options.body instanceof FormData);
    assert.equal(request.options.body.has("receipt"), true);
    assert.equal(result.text, "TOTAL 25.000");
});

test("receipt recognition gets a longer timeout than ordinary API requests", async () => {
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        timeoutMs: 1500,
        ocrTimeoutMs: 10,
        fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("Request aborted")), {
                once: true
            });
        })
    });

    await assert.rejects(
        api.recognizeReceipt("jwt-token", {
            uri: "file:///receipt.jpg",
            fileName: "receipt.jpg",
            mimeType: "image/jpeg"
        }),
        /Server tidak merespons dalam 1 detik/
    );
});

test("AI parsing posts OCR text with the authenticated JWT", async () => {
    let request;
    const token = "jwt-token";
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: {
                    status: "ready_for_review",
                    transaction: { type: "EXPENSE", amount: "25000.00" },
                    warnings: []
                }
            });
        }
    });

    const result = await api.parseReceiptTransaction(token, "TOTAL Rp25.000");

    assert.equal(request.url, "http://localhost:5000/api/ai/parse-transaction");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.equal(request.options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(request.options.body), { text: "TOTAL Rp25.000" });
    assert.equal(result.transaction.amount, "25000.00");
});

test("transaction creation posts the reviewed transaction with the JWT", async () => {
    let request;
    const token = "jwt-token";
    const transaction = {
        type: "EXPENSE",
        amount: "25000",
        categoryId: 3,
        merchantName: "Toko",
        notes: "Belanja kebutuhan dapur",
        transactionDate: "2026-11-11"
    };
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: {
                    transaction_id: 42,
                    ...transaction,
                    current_balance: "125000.00"
                }
            }, { status: 201 });
        }
    });

    const result = await api.createTransaction(token, transaction);

    assert.equal(request.url, "http://localhost:5000/api/transactions");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, `Bearer ${token}`);
    assert.equal(request.options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(request.options.body), transaction);
    assert.equal(result.transaction_id, 42);
});

test("transaction creation uploads the receipt with the reviewed transaction", async () => {
    let request;
    const transaction = {
        type: "EXPENSE",
        amount: "25000",
        categoryId: 3,
        merchantName: "Toko",
        notes: "Belanja kebutuhan dapur",
        transactionDate: "2026-11-11"
    };
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: { transaction_id: 43, receipt_url: "/api/transactions/43/receipt" }
            }, { status: 201 });
        }
    });

    await api.createTransaction("jwt-token", transaction, {
        uri: "file:///receipt.jpg",
        fileName: "receipt.jpg",
        mimeType: "image/jpeg"
    });

    assert.equal(request.url, "http://localhost:5000/api/transactions");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, "Bearer jwt-token");
    assert.equal(request.options.headers["Content-Type"], undefined);
    assert.ok(request.options.body instanceof FormData);
    assert.equal(request.options.body.get("type"), "EXPENSE");
    assert.equal(request.options.body.get("amount"), "25000");
    assert.equal(request.options.body.get("receipt"), "[object Object]");
});

test("transactions loads the authenticated recent transaction list", async () => {
    let request;
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: true,
                data: [{ transaction_id: 42, type: "EXPENSE", amount: "25000.00" }]
            });
        }
    });

    const result = await api.transactions("jwt-token");

    assert.equal(request.url, "http://localhost:5000/api/transactions?limit=50&offset=0");
    assert.equal(request.options.headers.Authorization, "Bearer jwt-token");
    assert.equal(result[0].transaction_id, 42);
});

test("receipt image source uses the private endpoint and bearer token", () => {
    const api = createApi({ baseUrl: "http://localhost:5000/api" });

    assert.deepEqual(api.receiptImageSource("jwt-token", 42), {
        uri: "http://localhost:5000/api/transactions/42/receipt",
        headers: { Authorization: "Bearer jwt-token" }
    });
});

test("receipt image requests expose the backend error when the file is missing", async () => {
    let request;
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        fetchImpl: async (url, options) => {
            request = { url, options };
            return Response.json({
                success: false,
                message: "Receipt file is missing"
            }, { status: 404 });
        }
    });

    await assert.rejects(api.receiptImageUri("jwt-token", 42), (error) => {
        assert.equal(error.status, 404);
        assert.match(error.message, /File bukti tidak ditemukan di server/);
        return true;
    });
    assert.equal(request.url, "http://localhost:5000/api/transactions/42/receipt");
    assert.equal(request.options.headers.Authorization, "Bearer jwt-token");
});

test("API errors retain HTTP status and validation details", async () => {
    const api = createApi({
        fetchImpl: async () => Response.json({
            success: false,
            message: "Validation failed",
            errors: ["Email is required"]
        }, { status: 400 })
    });

    await assert.rejects(api.login({}), (error) => {
        assert.equal(error.status, 400);
        assert.equal(error.message, "Email is required");
        return true;
    });
});

test("expired JWT errors retain the backend authentication code", async () => {
    const api = createApi({
        fetchImpl: async () => Response.json({
            success: false,
            message: "Token has expired",
            code: "AUTH_TOKEN_EXPIRED"
        }, { status: 401 })
    });

    await assert.rejects(api.profile("expired-token"), (error) => {
        assert.equal(error.status, 401);
        assert.equal(error.code, "AUTH_TOKEN_EXPIRED");
        return true;
    });
});

test("network failures report that the backend could not be reached", async () => {
    const api = createApi({
        fetchImpl: async () => {
            throw new TypeError("fetch failed");
        }
    });

    await assert.rejects(api.profile("jwt-token"), (error) => {
        assert.match(error.message, /Tidak dapat terhubung ke server/);
        assert.ok(error.cause instanceof TypeError);
        return true;
    });
});

test("requests that time out report that the backend did not respond", async () => {
    const api = createApi({
        baseUrl: "http://localhost:5000/api",
        timeoutMs: 5,
        fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("Request aborted")), {
                once: true
            });
        })
    });

    await assert.rejects(
        api.login({ email: "user@example.com", password: "secret" }),
        /Server tidak merespons dalam 1 detik/
    );
});
