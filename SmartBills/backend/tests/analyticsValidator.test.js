const test = require("node:test");
const assert = require("node:assert/strict");

const {
    parseAnalyticsPeriod,
    parseReceiptPagination
} = require("../src/validators/analyticsValidator");

test("analytics period defaults to monthly and accepts supported ranges", () => {
    assert.equal(parseAnalyticsPeriod(undefined), "monthly");
    assert.equal(parseAnalyticsPeriod("DAILY"), "daily");
    assert.equal(parseAnalyticsPeriod("weekly"), "weekly");
    assert.throws(() => parseAnalyticsPeriod("yearly"), { statusCode: 400 });
});

test("receipt gallery pagination has bounded defaults", () => {
    assert.deepEqual(parseReceiptPagination({}), { limit: 12, offset: 0 });
    assert.deepEqual(parseReceiptPagination({ limit: "8", offset: "16" }), {
        limit: 8,
        offset: 16
    });
    assert.throws(() => parseReceiptPagination({ limit: "101" }), {
        statusCode: 400
    });
    assert.throws(() => parseReceiptPagination({ offset: "-1" }), {
        statusCode: 400
    });
});