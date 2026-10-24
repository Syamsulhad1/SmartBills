const { getDashboardNews } = require("../services/newsService");
const { success } = require("../utils/response");

const getNews = async (req, res) => {
    const news = await getDashboardNews();
    return success(res, news, "Dashboard news retrieved");
};

module.exports = { getNews };
