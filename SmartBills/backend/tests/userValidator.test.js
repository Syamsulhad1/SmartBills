
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateInitialBalanceInput,
    normalizeInitialBalance
} = require("../src/validators/userValidator");


test("saldo awal menerima nominal valid", () => {
    const validAmounts = [
        0,
        100,
        1500000,
        "0",
        "100",
        "1500000.50",
        "9999999999999.99"
    ];

    for (const amount of validAmounts) {
        const errors = validateInitialBalanceInput({ amount });

        assert.deepEqual(
            errors,
            [],
            `Nominal ${amount} seharusnya valid`
        );
    }
});


test("saldo awal menolak nominal yang tidak diisi", () => {
    const invalidInputs = [
        {},
        { amount: undefined },
        { amount: null },
        { amount: "" },
        { amount: "   " }
    ];

    for (const input of invalidInputs) {
        const errors = validateInitialBalanceInput(input);

        assert.ok(
            errors.length > 0,
            `Input ${JSON.stringify(input)} seharusnya ditolak`
        );
    }
});


test("saldo awal menolak nominal negatif", () => {
    for (const amount of [-1, "-1", "-100.50"]) {
        const errors = validateInitialBalanceInput({ amount });

        assert.ok(errors.length > 0);
    }
});


test("saldo awal menolak format nonnumerik dan notasi eksponen dalam string", () => {
    const invalidAmounts = [
        "abc",
        "1e3",
        "1E3",
        "NaN",
        "Infinity",
        "1,000",
        "Rp1000"
    ];

    for (const amount of invalidAmounts) {
        const errors = validateInitialBalanceInput({ amount });

        assert.ok(
            errors.length > 0,
            `Nominal ${amount} seharusnya ditolak`
        );
    }
});


test("saldo awal menolak nominal dengan lebih dari dua angka desimal", () => {
    const invalidAmounts = [
        "100.123",
        "0.999",
        "12.3456"
    ];

    for (const amount of invalidAmounts) {
        const errors = validateInitialBalanceInput({ amount });

        assert.ok(
            errors.length > 0,
            `Nominal ${amount} seharusnya ditolak`
        );
    }
});


test("saldo awal menolak nominal melebihi 13 digit bagian integer", () => {
    const errors = validateInitialBalanceInput({
        amount: "10000000000000.00"
    });

    assert.ok(errors.length > 0);
});


test("saldo awal menolak angka yang tidak finite", () => {
    const invalidAmounts = [
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY
    ];

    for (const amount of invalidAmounts) {
        const errors = validateInitialBalanceInput({ amount });

        assert.ok(errors.length > 0);
    }
});


test("normalizeInitialBalance menghasilkan string dua angka desimal", () => {
    const cases = [
        { input: 0, expected: "0.00" },
        { input: 100, expected: "100.00" },
        { input: "1500000", expected: "1500000.00" },
        { input: "1500000.5", expected: "1500000.50" },
        { input: "1500000.55", expected: "1500000.55" }
    ];

    for (const { input, expected } of cases) {
        assert.equal(
            normalizeInitialBalance(input),
            expected
        );
    }
});
