const { findCategories } = require("../models/categoryModel");
const { success } = require("../utils/response");

const parseCategoryType = (value) => {
    if (value === undefined) {
        return null;
    }

    const type = typeof value === "string" ? value.trim().toUpperCase() : "";
    if (!["INCOME", "EXPENSE"].includes(type)) {
        const error = new Error("type must be INCOME or EXPENSE");
        error.statusCode = 400;
        throw error;
    }

    return type;
};

const getCategories = async (req, res) => {
    const type = parseCategoryType(req.query.type);
    const categories = await findCategories({ type });

    return success(res, { categories }, "Categories retrieved");
};

module.exports = {
    getCategories,
    parseCategoryType
};
