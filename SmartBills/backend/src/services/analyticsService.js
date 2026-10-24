const pool = require("../config/database");
const { analyticsPeriods } = require("../validators/analyticsValidator");

const createError = (message, statusCode) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const withReadSnapshot = async (callback) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
		const result = await callback(client);
		await client.query("COMMIT");
		return result;
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};

const getWindowParameters = (userId, period) => {
	const config = analyticsPeriods[period];
	return [userId, config.unit, config.count - 1, config.interval];
};

const getAnalyticsOverview = async (userId, period) => {
	return withReadSnapshot(async (client) => {
		const parameters = getWindowParameters(userId, period);
		const userResult = await client.query(`
			SELECT current_balance
			FROM users
			WHERE user_id = $1;
		`, [userId]);

		if (!userResult.rows[0]) {
			throw createError("User not found", 404);
		}

		const [totalsResult, trendResult, categoriesResult] = await Promise.all([
			client.query(`
				WITH bounds AS (
					SELECT
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							- ($3::integer * $4::interval) AS start_at,
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							+ $4::interval AS end_at
				)
				SELECT
					COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'INCOME'), 0)::numeric AS income,
					COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'EXPENSE'), 0)::numeric AS expense,
					COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE -t.amount END), 0)::numeric AS net,
					COUNT(t.transaction_id)::integer AS transaction_count,
					bounds.start_at::date::text AS start_date,
					(bounds.end_at - $4::interval)::date::text AS end_date
				FROM bounds
				LEFT JOIN transactions t
					ON t.user_id = $1
				   AND t.transaction_date >= bounds.start_at
				   AND t.transaction_date < bounds.end_at
				GROUP BY bounds.start_at, bounds.end_at;
			`, parameters),
			client.query(`
				WITH bounds AS (
					SELECT
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							- ($3::integer * $4::interval) AS start_at,
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							+ $4::interval AS end_at
				)
				SELECT
					bucket.bucket_start::date::text AS bucket_start,
					COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'INCOME'), 0)::numeric AS income,
					COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'EXPENSE'), 0)::numeric AS expense
				FROM bounds
				CROSS JOIN LATERAL generate_series(
					bounds.start_at,
					bounds.end_at - $4::interval,
					$4::interval
				) AS bucket(bucket_start)
				LEFT JOIN transactions t
					ON t.user_id = $1
				   AND t.transaction_date >= bucket.bucket_start
				   AND t.transaction_date < bucket.bucket_start + $4::interval
				GROUP BY bucket.bucket_start
				ORDER BY bucket.bucket_start;
			`, parameters),
			client.query(`
				WITH bounds AS (
					SELECT
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							- ($3::integer * $4::interval) AS start_at,
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							+ $4::interval AS end_at
				)
				SELECT
					COALESCE(c.name, 'Tanpa kategori') AS category_name,
					SUM(t.amount)::numeric AS amount,
					COUNT(*)::integer AS transaction_count
				FROM transactions t
				LEFT JOIN categories c ON c.category_id = t.category_id
				CROSS JOIN bounds
				WHERE t.user_id = $1
				  AND t.type = 'EXPENSE'
				  AND t.transaction_date >= bounds.start_at
				  AND t.transaction_date < bounds.end_at
				GROUP BY c.name
				ORDER BY SUM(t.amount) DESC, category_name ASC;
			`, parameters)
		]);

		const totals = totalsResult.rows[0];
		return {
			period,
			range: {
				start_date: totals.start_date,
				end_date: totals.end_date
			},
			current_balance: userResult.rows[0].current_balance,
			summary: {
				income: totals.income,
				expense: totals.expense,
				net: totals.net,
				transaction_count: totals.transaction_count
			},
			trend: trendResult.rows,
			categories: categoriesResult.rows
		};
	});
};

const getReceiptGallery = async ({ userId, period, limit, offset }) => {
	return withReadSnapshot(async (client) => {
		const parameters = getWindowParameters(userId, period);
		const rangeParams = [...parameters, limit, offset];
		const [countResult, receiptsResult] = await Promise.all([
			client.query(`
				WITH bounds AS (
					SELECT
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							- ($3::integer * $4::interval) AS start_at,
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							+ $4::interval AS end_at
				)
				SELECT COUNT(*)::integer AS total
				FROM transactions t
				CROSS JOIN bounds
				WHERE t.user_id = $1
				  AND t.image_url IS NOT NULL
				  AND t.transaction_date >= bounds.start_at
				  AND t.transaction_date < bounds.end_at;
			`, parameters),
			client.query(`
				WITH bounds AS (
					SELECT
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							- ($3::integer * $4::interval) AS start_at,
						date_trunc($2::text, CURRENT_TIMESTAMP)::timestamp
							+ $4::interval AS end_at
				)
				SELECT
					t.transaction_id,
					t.type,
					t.amount,
					t.merchant_name,
					t.notes,
					t.transaction_date,
					t.image_url,
					c.name AS category_name
				FROM transactions t
				LEFT JOIN categories c ON c.category_id = t.category_id
				CROSS JOIN bounds
				WHERE t.user_id = $1
				  AND t.image_url IS NOT NULL
				  AND t.transaction_date >= bounds.start_at
				  AND t.transaction_date < bounds.end_at
				ORDER BY t.transaction_date DESC, t.transaction_id DESC
				LIMIT $5 OFFSET $6;
			`, rangeParams)
		]);

		return {
			receipts: receiptsResult.rows,
			pagination: {
				limit,
				offset,
				total: countResult.rows[0].total,
				has_more: offset + receiptsResult.rowCount < countResult.rows[0].total
			}
		};
	});
};

module.exports = {
	getAnalyticsOverview,
	getReceiptGallery
};
