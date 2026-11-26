const MAX_VISIBLE_CATEGORIES = 5;

export const buildCategoryDistribution = (categories = []) => {
    const normalized = categories
        .map((category) => ({
            category_name: category.category_name || "Tanpa kategori",
            amount: Number(category.amount),
            transaction_count: Number(category.transaction_count) || 0
        }))
        .filter((category) => Number.isFinite(category.amount) && category.amount > 0)
        .sort((left, right) => right.amount - left.amount);

    const totalAmount = normalized.reduce(
        (total, category) => total + category.amount,
        0
    );
    const visibleCategories = normalized.slice(0, MAX_VISIBLE_CATEGORIES);
    const remainingCategories = normalized.slice(MAX_VISIBLE_CATEGORIES);

    if (remainingCategories.length > 0) {
        visibleCategories.push({
            category_name: "Lainnya",
            amount: remainingCategories.reduce(
                (total, category) => total + category.amount,
                0
            ),
            transaction_count: remainingCategories.reduce(
                (total, category) => total + category.transaction_count,
                0
            )
        });
    }

    return {
        totalAmount,
        categories: visibleCategories.map((category) => ({
            ...category,
            percentage: totalAmount > 0
                ? category.amount / totalAmount * 100
                : 0
        }))
    };
};
