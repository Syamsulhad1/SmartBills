const test = require("node:test");
const assert = require("node:assert/strict");

const { success, failure } = require("../src/utils/response");
const { parseCategoryType } = require("../src/controllers/categoryController");
const errorMiddleware = require("../src/middleware/errorMiddleware");

const createResponse = () => ({
    statusCode: 200,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

test("success response helper preserves data, message, and metadata", () => {
    const res = createResponse();
    success(res, ["category"], "Categories retrieved", 200, { count: 1 });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
        count: 1,
        success: true,
        message: "Categories retrieved",
        data: ["category"]
    });
});

test("failure response helper returns consistent error shape", () => {
    const res = createResponse();
    failure(res, "Validation failed", 400, { errors: ["Invalid type"] });

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
        success: false,
        message: "Validation failed",
        errors: ["Invalid type"]
    });
});

test("category type filter accepts supported values case-insensitively", () => {
    assert.equal(parseCategoryType(undefined), null);
    assert.equal(parseCategoryType("expense"), "EXPENSE");
    assert.equal(parseCategoryType(" INCOME "), "INCOME");
    assert.throws(() => parseCategoryType("TRANSFER"), {
        statusCode: 400,
        message: "type must be INCOME or EXPENSE"
    });
});

test("error middleware hides internal errors and preserves client errors", () => {
    const res = createResponse();
    const originalError = console.error;
    const originalWarn = console.warn;
    console.error = () => {};
    console.warn = () => {};

    try {
        errorMiddleware(
            new Error("database password or query details"),
            { method: "GET", path: "/api/categories" },
            res,
            () => {}
        );
        assert.equal(res.statusCode, 500);
        assert.equal(res.body.message, "Internal server error");
        assert.equal(res.body.message.includes("database password"), false);

        const clientErrorResponse = createResponse();
        const clientError = new Error("type must be INCOME or EXPENSE");
        clientError.statusCode = 400;
        errorMiddleware(
            clientError,
            { method: "GET", path: "/api/categories" },
            clientErrorResponse,
            () => {}
        );
        assert.equal(clientErrorResponse.statusCode, 400);
        assert.equal(clientErrorResponse.body.message, clientError.message);
    } finally {
        console.error = originalError;
        console.warn = originalWarn;
    }
});
