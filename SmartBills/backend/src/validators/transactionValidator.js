const parseAmount = (value, fieldName, { required = true } = {}) => {
    if ((value === undefined || value === null || value === "") && !required) {
        return null;
    }

    if (
        (typeof value !== "string" && typeof value !== "number")
        || !/^\d{1,13}(?:\.\d{1,2})?$/.test(String(value))
    ) {
        const error = new Error(`${fieldName} must be a positive amount with up to 2 decimal places`);
        error.statusCode = 400;
        throw error;
    }

    const amount = Number(value);
    if (!Number.isFinite(amount) || (required && amount <= 0)) {
        const error = new Error(`${fieldName} must be a positive amount`);
        error.statusCode = 400;
        throw error;
    }

    return amount;
};

const parseItems = (value) => {
    if (value === undefined || value === null || value === "") {
        return [];
    }

    let items = value;
    if (typeof value === "string") {
        try {
            items = JSON.parse(value);
        } catch {
            const error = new Error("items must contain valid JSON");
            error.statusCode = 400;
            throw error;
        }
    }

    if (!Array.isArray(items)) {
        const error = new Error("items must be an array");
        error.statusCode = 400;
        throw error;
    }

    return items.map((item, index) => {
        const itemName = item?.itemName ?? item?.item_name;
        const quantity = Number(item?.quantity ?? 1);
        const unitValue = item?.unitPrice ?? item?.unit_price;
        const unitPrice = parseAmount(unitValue, `items[${index}].unitPrice`, { required: false });
        const totalValue = item?.totalPrice ?? item?.total_price;
        const totalPrice = totalValue === undefined || totalValue === null || totalValue === ""
            ? (unitPrice === null ? null : Number((unitPrice * quantity).toFixed(2)))
            : parseAmount(totalValue, `items[${index}].totalPrice`);

        if (
            typeof itemName !== "string"
            || itemName.trim().length === 0
            || itemName.trim().length > 150
            || !Number.isInteger(quantity)
            || quantity <= 0
            || quantity > 2147483647
            || totalPrice === null
        ) {
            const error = new Error(`items[${index}] must have a name, positive quantity, and total price`);
            error.statusCode = 400;
            throw error;
        }

        return {
            itemName: itemName.trim(),
            quantity,
            unitPrice,
            totalPrice
        };
    });
};

const validateCreateTransaction = (body) => {
    const type = typeof body.type === "string" ? body.type.toUpperCase() : "";
    if (!["INCOME", "EXPENSE"].includes(type)) {
        const error = new Error("type must be INCOME or EXPENSE");
        error.statusCode = 400;
        throw error;
    }

    const amount = parseAmount(body.amount, "amount");
    const categoryValue = body.categoryId ?? body.category_id;
    const categoryId = categoryValue === undefined || categoryValue === null || categoryValue === ""
        ? null
        : Number(categoryValue);

    if (categoryId !== null && (!Number.isSafeInteger(categoryId) || categoryId <= 0)) {
        const error = new Error("categoryId must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    const merchantName = body.merchantName ?? body.merchant_name ?? null;
    const notes = body.notes ?? null;
    if (
        merchantName !== null
        && (typeof merchantName !== "string" || merchantName.length > 100)
    ) {
        const error = new Error("merchantName must be at most 100 characters");
        error.statusCode = 400;
        throw error;
    }

    if (notes !== null && typeof notes !== "string") {
        const error = new Error("notes must be text");
        error.statusCode = 400;
        throw error;
    }

    const dateValue = body.transactionDate ?? body.transaction_date;
    const transactionDate = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(transactionDate.getTime())) {
        const error = new Error("transactionDate must be a valid date");
        error.statusCode = 400;
        throw error;
    }

    return {
        type,
        amount,
        categoryId,
        merchantName,
        notes,
        transactionDate,
        items: parseItems(body.items)
    };
};

const parsePagination = (query) => {
    const limit = query.limit === undefined ? 50 : Number(query.limit);
    const offset = query.offset === undefined ? 0 : Number(query.offset);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        const error = new Error("limit must be an integer between 1 and 100");
        error.statusCode = 400;
        throw error;
    }

    if (!Number.isInteger(offset) || offset < 0) {
        const error = new Error("offset must be a non-negative integer");
        error.statusCode = 400;
        throw error;
    }

    return { limit, offset };
};

module.exports = {
    validateCreateTransaction,
    parsePagination
};
