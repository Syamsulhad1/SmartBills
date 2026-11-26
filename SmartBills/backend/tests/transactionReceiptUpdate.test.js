const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const pool = require("../src/config/database");
const { getReceiptPath, ensurePrivateReceiptStorage } = require("../src/config/storage");
const { updateExpenseTransaction } = require("../src/controllers/transactionController");

test("editing a transaction stores an uploaded receipt filename", async () => {
    const originalConnect = pool.connect;
    const filename = "123e4567-e89b-12d3-a456-426614174000.png";
    const receiptPath = getReceiptPath(filename);
    const receiptBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    let updateValues;
    const transaction = {
        transaction_id: 51,
        user_id: 9,
        category_id: null,
        type: "EXPENSE",
        amount: "12.00",
        merchant_name: "Test",
        notes: null,
        source: "MANUAL",
        image_url: filename,
        transaction_date: new Date("2026-11-13T00:00:00.000Z"),
        created_at: new Date("2026-11-13T00:00:00.000Z")
    };
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

    ensurePrivateReceiptStorage();
    await fs.promises.writeFile(receiptPath, receiptBuffer);
    pool.connect = async () => ({
        query: async (sql, values) => {
            if (/^\s*(BEGIN|COMMIT)/i.test(sql)) {
                return { rows: [] };
            }
            if (/SELECT transaction_id, type, amount, image_url/i.test(sql)) {
                return {
                    rows: [{
                        transaction_id: 51,
                        type: "EXPENSE",
                        amount: "10.00",
                        image_url: null
                    }]
                };
            }
            if (/UPDATE transactions/i.test(sql)) {
                updateValues = values;
                return { rows: [transaction] };
            }
            if (/UPDATE users/i.test(sql)) {
                return { rows: [{ current_balance: "98.00" }] };
            }
            if (/DELETE FROM transaction_items/i.test(sql)) {
                return { rows: [], rowCount: 0 };
            }
            if (/SELECT\s+item_id/i.test(sql)) {
                return { rows: [] };
            }
            throw new Error("Unexpected transaction query");
        },
        release: () => {}
    });

    try {
        await updateExpenseTransaction({
            params: { transactionId: "51" },
            body: {
                type: "EXPENSE",
                amount: "12.00",
                categoryId: "",
                merchantName: "Test",
                notes: "",
                transactionDate: "2026-11-13",
                items: "[]"
            },
            file: {
                filename,
                path: receiptPath,
                mimetype: "image/png"
            },
            user: { user_id: 9 }
        }, response);

        assert.equal(response.statusCode, 200);
        assert.equal(updateValues[8], filename);
        assert.equal(
            response.body.data.receipt_url,
            "/api/transactions/51/receipt"
        );
    } finally {
        pool.connect = originalConnect;
        await fs.promises.unlink(receiptPath).catch((error) => {
            if (error.code !== "ENOENT") throw error;
        });
    }
});
