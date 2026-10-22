const validateInitialBalanceInput = (body) => {
    const errors = [];

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return [{ field: "body", message: "Request body must be an object" }];
    }

    if (!Object.prototype.hasOwnProperty.call(body, "amount")) {
        return [{ field: "amount", message: "Amount is required" }];
    }

    const amount = body.amount;
    let normalized;

    if (typeof amount === "number") {
        if (!Number.isFinite(amount)) {
            return [{ field: "amount", message: "Amount must be a finite number" }];
        }

        if (amount < 0) {
            return [{ field: "amount", message: "Amount cannot be negative" }];
        }

        // Hindari notasi eksponen dan jumlah desimal lebih dari dua digit.
        const asString = String(amount);

        if (/e/i.test(asString)) {
            return [{ field: "amount", message: "Scientific notation is not allowed" }];
        }

        if (!/^\d+(\.\d{1,2})?$/.test(asString)) {
            return [{ field: "amount", message: "Amount must have at most 2 decimal places" }];
        }

        normalized = asString;
    } else if (typeof amount === "string") {
        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
            return [{
                field: "amount",
                message: "Amount must be a non-negative decimal with at most 2 decimal places"
            }];
        }

        normalized = amount;
    } else {
        return [{
            field: "amount",
            message: "Amount must be a finite number or decimal string"
        }];
    }

    const [integerPart, decimalPart = ""] = normalized.split(".");

    if (integerPart.length > 13) {
        return [{
            field: "amount",
            message: "Amount cannot exceed 13 integer digits"
        }];
    }

    const decimal = decimalPart.padEnd(2, "0");
    const integer = integerPart.replace(/^0+(?=\d)/, "");

    return [];
};

const normalizeInitialBalance = (amount) => {
    const value = String(amount);
    const [integerPart, decimalPart = ""] = value.split(".");
    const integer = integerPart.replace(/^0+(?=\d)/, "");
    return `${integer}.${decimalPart.padEnd(2, "0")}`;
};

module.exports = {
    validateInitialBalanceInput,
    normalizeInitialBalance
};