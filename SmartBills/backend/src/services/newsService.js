const { XMLParser } = require("fast-xml-parser");

const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const MAX_FEED_LENGTH = 1_000_000;
const MAX_ARTICLES_PER_SECTION = 4;
const MAX_ARTICLE_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const imageHosts = new Set([
    "akcdn.detik.net.id",
    "awsimages.detik.net.id",
    "cdn.cnbcindonesia.com"
]);
const parser = new XMLParser({ ignoreAttributes: false });

const feeds = [
    {
        section: "food",
        url: "https://www.cnbcindonesia.com/news/rss",
        matches: /pangan|sembako|beras|cabai|cabe rawit|daging|telur|minyak goreng|bahan pokok|harga pangan|harga beras|bap(an)?as/i
    },
    {
        section: "ihsg",
        url: "https://www.cnbcindonesia.com/market/rss",
        matches: /\bihsg\b|indeks harga saham gabungan|indeks komposit|indeks saham/i
    }
];

let cachedNews;
let cacheExpiresAt = 0;
let pendingRequest;

const asArray = (value) => value === undefined
    ? []
    : Array.isArray(value) ? value : [value];

const cleanText = (value) => String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const getImageUrl = (item) => {
    const enclosureUrl = item.enclosure?.["@_url"];
    const description = String(item.description || "");
    const embeddedImage = description.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
    const candidate = enclosureUrl || embeddedImage;
    if (typeof candidate !== "string") return null;

    try {
        const imageUrl = new URL(candidate.replace(/&amp;/gi, "&"));
        return imageUrl.protocol === "https:" && imageHosts.has(imageUrl.hostname)
            ? imageUrl.href
            : null;
    } catch {
        return null;
    }
};

const parseFeed = (xml, feed, now) => {
    if (typeof xml !== "string" || xml.length > MAX_FEED_LENGTH) {
        throw new Error("News feed response is invalid");
    }

    const parsed = parser.parse(xml);
    const items = asArray(parsed?.rss?.channel?.item);
    const earliestDate = now - MAX_ARTICLE_AGE_MS;

    return items
        .map((item) => {
            const title = cleanText(item.title);
            const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
            const description = cleanText(item.description);
            const link = typeof item.link === "string" ? item.link : "";

            if (
                !title
                || !feed.matches.test(`${title} ${description}`)
                || !publishedAt
                || Number.isNaN(publishedAt.getTime())
                || publishedAt.getTime() < earliestDate
                || !link.startsWith("https://www.cnbcindonesia.com/")
            ) {
                return null;
            }

            return {
                title,
                description: description.slice(0, 240),
                url: link,
                imageUrl: getImageUrl(item),
                source: "CNBC Indonesia",
                publishedAt: publishedAt.toISOString()
            };
        })
        .filter(Boolean)
        .slice(0, MAX_ARTICLES_PER_SECTION);
};

const fetchFeed = async (feed, fetchImpl, now) => {
    const response = await fetchImpl(feed.url, {
        headers: {
            Accept: "application/rss+xml, application/xml, text/xml",
            "User-Agent": "SmartBills/1.0 (RSS dashboard reader)"
        },
        redirect: "error",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (!response.ok) {
        throw new Error(`News provider returned ${response.status}`);
    }

    const contentLength = Number(response.headers?.get?.("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_FEED_LENGTH) {
        throw new Error("News feed response is too large");
    }
    return parseFeed(await response.text(), feed, now);
};

const loadDashboardNews = async (fetchImpl, now) => {
    const results = await Promise.allSettled(
        feeds.map((feed) => fetchFeed(feed, fetchImpl, now))
    );
    const news = { food: [], ihsg: [], unavailable: [] };

    results.forEach((result, index) => {
        const section = feeds[index].section;
        if (result.status === "fulfilled") {
            news[section] = result.value;
        } else {
            news.unavailable.push(section);
        }
    });

    if (news.unavailable.length === feeds.length) {
        const error = new Error("News providers are unavailable");
        error.statusCode = 502;
        error.code = "NEWS_PROVIDER_FAILED";
        throw error;
    }
    return news;
};

const getDashboardNews = async ({ fetchImpl = fetch, now = Date.now() } = {}) => {
    if (fetchImpl === fetch) {
        if (cachedNews && Date.now() < cacheExpiresAt) return cachedNews;
        if (pendingRequest) return pendingRequest;
    }

    const request = loadDashboardNews(fetchImpl, now);
    if (fetchImpl !== fetch) return request;

    pendingRequest = request;
    try {
        cachedNews = await request;
        cacheExpiresAt = Date.now() + CACHE_TTL_MS;
        return cachedNews;
    } finally {
        pendingRequest = null;
    }
};

module.exports = { getDashboardNews };
