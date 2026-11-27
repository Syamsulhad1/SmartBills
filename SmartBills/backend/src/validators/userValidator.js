const validateInitialBalanceInput = (body) => {
    const errors = [];

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return [{ field: "body", message: "Data yang dikirim harus berupa objek" }];
    }

    if (!Object.prototype.hasOwnProperty.call(body, "amount")) {
        return [{ field: "amount", message: "Nominal wajib diisi" }];
    }

    const amount = body.amount;
    let normalized;

    if (typeof amount === "number") {
        if (!Number.isFinite(amount)) {
            return [{ field: "amount", message: "Nominal harus berupa angka yang valid" }];
        }

        if (amount < 0) {
            return [{ field: "amount", message: "Nominal tidak boleh negatif" }];
        }

        // Hindari notasi eksponen dan jumlah desimal lebih dari dua digit.
        const asString = String(amount);

        if (/e/i.test(asString)) {
            return [{ field: "amount", message: "Notasi ilmiah tidak diizinkan" }];
        }

        if (!/^\d+(\.\d{1,2})?$/.test(asString)) {
            return [{ field: "amount", message: "Nominal maksimal 2 angka desimal" }];
        }

        normalized = asString;
    } else if (typeof amount === "string") {
        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
            return [{
                field: "amount",
                message: "Nominal harus berupa angka non-negatif dengan maksimal 2 angka desimal"
            }];
        }

        normalized = amount;
    } else {
        return [{
            field: "amount",
            message: "Nominal harus berupa angka atau teks desimal yang valid"
        }];
    }

    const [integerPart, decimalPart = ""] = normalized.split(".");

    if (integerPart.length > 13) {
        return [{
            field: "amount",
            message: "Nominal maksimal 13 digit angka di depan koma"
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