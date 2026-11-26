import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentPeriodSummaries } from "../src/utils/currentPeriodSummary.js";

test("current period summaries normalize weekly and monthly backend totals", () => {
    const summaries = getCurrentPeriodSummaries({
        weekly: { income: "2500.50", expense: "900.25" },
        monthly: { income: "10000.00", expense: "5400.00" }
    });

    assert.deepEqual(summaries, {
        weekly: { income: 2500.5, expense: 900.25 },
        monthly: { income: 10000, expense: 5400 }
    });
});

test("current period summaries fail explicitly when backend data is missing", () => {
    assert.throws(
        () => getCurrentPeriodSummaries(null),
        /Server tidak mengirim ringkasan minggu dan bulan berjalan/
    );
    assert.throws(
        () => getCurrentPeriodSummaries({
            weekly: { income: "invalid", expense: "0" },
            monthly: { income: "0", expense: "0" }
        }),
        /minggu pemasukan tidak valid/
    );
});
