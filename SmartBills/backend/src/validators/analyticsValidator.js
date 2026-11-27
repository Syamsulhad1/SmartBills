const analyticsPeriods = {
    daily: { unit: "day", count: 7, interval: "1 day" },
    weekly: { unit: "week", count: 12, interval: "1 week" },
    monthly: { unit: "month", count: 6, interval: "1 month" }
};

const parseAnalyticsPeriod = (value) => {
    const period = value === undefined ? "monthly" : String(value).toLowerCase();

    if (!Object.hasOwn(analyticsPeriods, period)) {
        const error = new Error("period harus daily, weekly, atau monthly");
        error.statusCode = 400;
        throw error;
    }

    return period;
};

const parseReceiptPagination = (query) => {
    const limit = query.limit === undefined ? 12 : Number(query.limit);
    const offset = query.offset === undefined ? 0 : Number(query.offset);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        const error = new Error("limit harus berupa bilangan bulat antara 1 dan 100");
        error.statusCode = 400;
        throw error;
    }

    if (!Number.isInteger(offset) || offset < 0) {
        const error = new Error("offset harus berupa bilangan bulat non-negatif");
        error.statusCode = 400;
        throw error;
    }

    return { limit, offset };
};

module.exports = {
    analyticsPeriods,
    parseAnalyticsPeriod,
    parseReceiptPagination
};