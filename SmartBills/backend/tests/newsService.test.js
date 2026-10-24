const test = require("node:test");
const assert = require("node:assert/strict");
const { getDashboardNews } = require("../src/services/newsService");

const now = Date.parse("2026-10-24T00:00:00.000Z");

const rssItem = (title, description, link, pubDate, imageUrl) => `
    <item>
        <title><![CDATA[${title}]]></title>
        <description><![CDATA[<img src="${imageUrl}"/> ${description}]]></description>
        <link>${link}</link>
        <pubDate>${pubDate}</pubDate>
    </item>
`;

test("returns recent food and IHSG stories with safe source and image URLs", async () => {
    const foodXml = `<rss><channel>${rssItem(
        "Harga Pangan Hari Ini: Harga Beras Naik",
        "Harga pangan pokok terbaru",
        "https://www.cnbcindonesia.com/news/food-story",
        "Fri, 23 Oct 2026 10:00:00 +0700",
        "https://akcdn.detik.net.id/food.jpg"
    )}</channel></rss>`;
    const ihsgXml = `<rss><channel>${rssItem(
        "IHSG Menguat pada Perdagangan Hari Ini",
        "Indeks saham gabungan bergerak positif",
        "https://www.cnbcindonesia.com/market/ihsg-story",
        "Fri, 23 Oct 2026 11:00:00 +0700",
        "https://awsimages.detik.net.id/market.jpg"
    )}</channel></rss>`;
    const result = await getDashboardNews({
        now,
        fetchImpl: async (url) => ({
            ok: true,
            status: 200,
            headers: { get: () => null },
            text: async () => url.endsWith("/news/rss") ? foodXml : ihsgXml
        })
    });

    assert.equal(result.food.length, 1);
    assert.equal(result.food[0].title, "Harga Pangan Hari Ini: Harga Beras Naik");
    assert.equal(result.food[0].source, "CNBC Indonesia");
    assert.equal(result.food[0].imageUrl, "https://akcdn.detik.net.id/food.jpg");
    assert.equal(result.ihsg.length, 1);
    assert.equal(result.ihsg[0].title, "IHSG Menguat pada Perdagangan Hari Ini");
    assert.equal(result.ihsg[0].imageUrl, "https://awsimages.detik.net.id/market.jpg");
    assert.deepEqual(result.unavailable, []);
});

test("omits unrelated, stale, unsafe-link, and unsafe-image stories", async () => {
    const feed = `
        <rss><channel>
            ${rssItem(
        "Harga pangan: beras stabil",
        "Kabar beras",
        "https://www.cnbcindonesia.com/news/food",
        "Fri, 23 Oct 2026 10:00:00 +0700",
        "https://images.example.org/track.jpg"
    )}
            ${rssItem(
        "IHSG menguat",
        "Berita pasar",
        "https://www.cnbcindonesia.com/market/old",
        "Tue, 1 Sep 2026 10:00:00 +0700",
        "https://akcdn.detik.net.id/old.jpg"
    )}
            ${rssItem(
        "Harga cabai naik",
        "Berita pangan",
        "https://example.org/untrusted",
        "Fri, 23 Oct 2026 10:00:00 +0700",
        "https://akcdn.detik.net.id/image.jpg"
    )}
        </channel></rss>
    `;
    const result = await getDashboardNews({
        now,
        fetchImpl: async () => ({
            ok: true,
            status: 200,
            headers: { get: () => null },
            text: async () => feed
        })
    });

    assert.equal(result.food.length, 1);
    assert.equal(result.food[0].imageUrl, null);
    assert.equal(result.ihsg.length, 0);
});

test("reports partial and total RSS provider failures", async () => {
    let callCount = 0;
    const partial = await getDashboardNews({
        fetchImpl: async () => {
            callCount += 1;
            if (callCount === 1) throw new Error("feed unavailable");
            return {
                ok: true,
                status: 200,
                headers: { get: () => null },
                text: async () => "<rss><channel></channel></rss>"
            };
        }
    });
    assert.deepEqual(partial.unavailable, ["food"]);

    await assert.rejects(
        getDashboardNews({
            fetchImpl: async () => { throw new Error("feed unavailable"); }
        }),
        { statusCode: 502, code: "NEWS_PROVIDER_FAILED" }
    );
});
