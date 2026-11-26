const test = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../src/config/database");
const { getAnalyticsOverview } = require("../src/services/analyticsService");

test("analytics overview includes current week and month totals", async () => {
    const originalConnect = pool.connect;
    const queryResults = [
        { rows: [] },
        { rows: [{ current_balance: "5000.00" }] },
        {
            rows: [{
                income: "1000.00",
                expense: "250.00",
                net: "750.00",
                transaction_count: 2,
                start_date: "2026-10-19",
                end_date: "2027-01-03"
            }]
        },
        { rows: [{ bucket_start: "2026-10-19", income: "500.00", expense: "100.00" }] },
        {
            rows: [{
                week_income: "300.00",
                week_expense: "50.00",
                month_income: "800.00",
                month_expense: "100.00"
            }]
        },
        { rows: [] },
        { rows: [] }
    ];
    const queries = [];

    pool.connect = async () => ({
        query: async (sql, params) => {
            queries.push({ sql, params });
            const result = queryResults.shift();
            assert.ok(result, "unexpected analytics query");
            return result;
        },
        release: () => {}
    });

    try {
        const overview = await getAnalyticsOverview(12, "weekly");

        assert.deepEqual(overview.current_periods, {
            weekly: { income: "300.00", expense: "50.00" },
            monthly: { income: "800.00", expense: "100.00" }
        });

        const currentPeriodsQuery = queries.find(({ sql }) =>
            sql.includes("week_income")
        );
        assert.deepEqual(currentPeriodsQuery.params, [12]);
        assert.match(currentPeriodsQuery.sql, /date_trunc\('week'/);
        assert.match(currentPeriodsQuery.sql, /date_trunc\('month'/);
    } finally {
        pool.connect = originalConnect;
    }
});
