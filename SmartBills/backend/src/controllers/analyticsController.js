const {
	getAnalyticsOverview,
	getReceiptGallery
} = require("../services/analyticsService");
const {
	parseAnalyticsPeriod,
	parseReceiptPagination
} = require("../validators/analyticsValidator");
const { success } = require("../utils/response");

const getOverview = async (req, res) => {
	const period = parseAnalyticsPeriod(req.query.period);
	const overview = await getAnalyticsOverview(req.user.user_id, period);

	return success(res, overview, "Analytics retrieved");
};

const listReceiptGallery = async (req, res) => {
	const period = parseAnalyticsPeriod(req.query.period);
	const pagination = parseReceiptPagination(req.query);
	const result = await getReceiptGallery({
		userId: req.user.user_id,
		period,
		...pagination
	});
	const receipts = result.receipts.map((receipt) => {
		const { image_url: imageUrl, ...fields } = receipt;
		return {
			...fields,
			receipt_url: `/api/transactions/${receipt.transaction_id}/receipt`
		};
	});

	return success(
		res,
		{ receipts, pagination: result.pagination },
		"Receipt gallery retrieved"
	);
};

module.exports = {
	getOverview,
	listReceiptGallery
};
