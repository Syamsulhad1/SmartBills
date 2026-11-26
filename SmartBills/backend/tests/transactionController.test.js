const test = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../src/config/database");
const { createTransaction } = require("../src/controllers/transactionController");

test("generic transaction route ignores Express next as a type restriction", async () => {
    const originalConnect = pool.connect;
    const transaction = {
        transaction_id: 51,
        user_id: 9,
        category_id: null,
        type: "INCOME",
        amount: "250.00",
        merchant_name: null,
        notes: null,
        source: "MANUAL",
        image_url: null,
        transaction_date: new Date("2026-11-13T00:00:00.000Z"),
        created_at: new Date("2026-11-13T00:00:00.000Z")
    };

    pool.connect = async () => ({
        query: async (sql) => {
            if (/^\s*(BEGIN|COMMIT)/i.test(sql)) {
                return { rows: [] };
            }
            if (/INSERT INTO transactions/i.test(sql)) {
                return { rows: [transaction] };
            }
            if (/UPDATE users/i.test(sql)) {
                return { rows: [{ current_balance: "250.00" }] };
            }
            if (/SELECT\s+item_id/i.test(sql)) {
                return { rows: [] };
            }
            throw new Error("Unexpected transaction query");
        },
        release: () => {}
    });

    const response = {
        statusCode: 200,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };

    try {
        await createTransaction(
            { body: { type: "INCOME", amount: "250" }, user: { user_id: 9 } },
            response,
            () => {}
        );

        assert.equal(response.statusCode, 201);
        assert.equal(response.body.data.type, "INCOME");
        assert.equal(response.body.data.amount, "250.00");
    } finally {
        pool.connect = originalConnect;
    }
});
