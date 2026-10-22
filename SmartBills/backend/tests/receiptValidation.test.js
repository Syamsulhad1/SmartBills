const test = require("node:test");
const assert = require("node:assert/strict");

const {
    getReceiptPath,
    validateReceiptBuffer
} = require("../src/config/storage");
const {
    validateCreateTransaction,
    parsePagination
} = require("../src/validators/transactionValidator");

test("accepts supported receipt signatures only when MIME type matches", () => {
    assert.doesNotThrow(() => validateReceiptBuffer(
        Buffer.from([0xff, 0xd8, 0xff, 0x00]),
        "image/jpeg"
    ));
    assert.doesNotThrow(() => validateReceiptBuffer(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        "image/png"
    ));

    const webp = Buffer.alloc(12);
    webp.write("RIFF", 0, "ascii");
    webp.write("WEBP", 8, "ascii");
    assert.doesNotThrow(() => validateReceiptBuffer(webp, "image/webp"));
    assert.throws(
        () => validateReceiptBuffer(Buffer.from("not an image"), "image/jpeg"),
        { statusCode: 400 }
    );
    assert.throws(
        () => validateReceiptBuffer(Buffer.from([0xff, 0xd8, 0xff]), "image/png"),
        { statusCode: 400 }
    );
});

test("validates transaction fields and calculates item totals", () => {
    const transaction = validateCreateTransaction({
        type: "expense",
        amount: "45000",
        items: JSON.stringify([
            { itemName: "Beras", quantity: 2, unitPrice: 12500 }
        ])
    });

    assert.equal(transaction.type, "EXPENSE");
    assert.equal(transaction.amount, 45000);
    assert.equal(transaction.items[0].totalPrice, 25000);
    assert.throws(
        () => validateCreateTransaction({ type: "TRANSFER", amount: "10" }),
        { statusCode: 400 }
    );
});

test("validates gallery pagination bounds", () => {
    assert.deepEqual(parsePagination({ limit: "20", offset: "5" }), {
        limit: 20,
        offset: 5
    });
    assert.throws(() => parsePagination({ limit: "101" }), { statusCode: 400 });
    assert.throws(() => parsePagination({ offset: "-1" }), { statusCode: 400 });
});

test("receipt paths accept only generated image filenames", () => {
    assert.match(getReceiptPath("12345678-1234-1234-1234-123456789abc.jpg"), /receipts/);
    assert.equal(getReceiptPath("..\\private.jpg"), null);
    assert.equal(getReceiptPath("receipt.jpg"), null);
});
