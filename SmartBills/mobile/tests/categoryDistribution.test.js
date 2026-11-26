import assert from "node:assert/strict";
import test from "node:test";
import { buildCategoryDistribution } from "../src/utils/categoryDistribution.js";

test("category distribution shows the top five and groups the remaining expenses", () => {
    const result = buildCategoryDistribution([
        { category_name: "Food", amount: "600", transaction_count: 3 },
        { category_name: "Travel", amount: "200", transaction_count: 2 },
        { category_name: "Bills", amount: "100", transaction_count: 1 },
        { category_name: "Health", amount: "50", transaction_count: 1 },
        { category_name: "Shopping", amount: "30", transaction_count: 2 },
        { category_name: "Other A", amount: "15", transaction_count: 1 },
        { category_name: "Other B", amount: "5", transaction_count: 1 }
    ]);

    assert.equal(result.totalAmount, 1000);
    assert.deepEqual(result.categories.map((category) => category.category_name), [
        "Food",
        "Travel",
        "Bills",
        "Health",
        "Shopping",
        "Lainnya"
    ]);
    assert.equal(result.categories[0].percentage, 60);
    assert.equal(result.categories[5].amount, 20);
    assert.equal(result.categories[5].transaction_count, 2);
    assert.equal(result.categories[5].percentage, 2);
    assert.equal(
        result.categories.reduce((total, category) => total + category.amount, 0),
        result.totalAmount
    );
});

test("a few expense categories retain their actual totals and shares", () => {
    const result = buildCategoryDistribution([
        { category_name: "Food", amount: "75", transaction_count: 2 },
        { category_name: "Transport", amount: "25", transaction_count: 1 }
    ]);

    assert.equal(result.totalAmount, 100);
    assert.deepEqual(result.categories.map((category) => category.percentage), [75, 25]);
});

test("category distribution handles empty and invalid amounts", () => {
    assert.deepEqual(buildCategoryDistribution([]), {
        totalAmount: 0,
        categories: []
    });
    assert.deepEqual(buildCategoryDistribution([
        { category_name: "Invalid", amount: "not-an-amount", transaction_count: 2 },
        { category_name: "Zero", amount: "0", transaction_count: 1 }
    ]), {
        totalAmount: 0,
        categories: []
    });
});
