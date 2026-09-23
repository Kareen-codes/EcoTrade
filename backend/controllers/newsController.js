// EcoMate AI — eco news feed proxy
// Ports the Next.js route logic: title-only search, quoted GNews phrases,
// relevance sort, secondary eco-signal filter, dedupe, pagination.
// Keys are read server-side only (NEWSAPI_KEY / GNEWS_API_KEY).
//
// Server-side cache: the aggregated result is kept in memory for
// NEWS_CACHE_TTL_MS (default 10 min) so upstream APIs are called at most
// once per TTL window no matter how many clients paginate. Free-tier daily
// quotas (NewsAPI ~100/day, GNews ~100/day) are the constraint here.

const NEWSAPI_BASE = "https://newsapi.org/v2/everything";
const GNEWS_BASE = "https://gnews.io/api/v4/search";

const PAGE_SIZE = 5;
const TTL = Number(process.env.NEWS_CACHE_TTL_MS) || 10 * 60 * 1000;

/** NewsAPI qInTitle query — title-only search, well under 500-char limit. */
const NEWS_API_TITLE_QUERY =
  '(recycling OR recycle OR sustainability OR "climate change" OR ' +
  '"plastic pollution" OR "renewable energy" OR "clean energy" OR ' +
  '"carbon emission" OR "global warming" OR upcycling OR ' +
  '"circular economy" OR "e-waste")';

/** GNews query — quoted multi-word phrases, OR has higher precedence than AND. */
const GNEWS_QUERY =
  'recycling OR sustainability OR "climate change" OR "plastic pollution" OR ' +
  '"renewable energy" OR "carbon emission" OR upcycling OR "global warming"';

// Secondary safety filter — drops articles with no eco signal in title+description
const ECO_SIGNALS = [
  "recycl", "sustainab", "climate", "plastic", "environment", "waste",
  "renewable", "carbon", "emission", "green energy", "clean energy",
  "solar", "eco", "upcycl", "circular economy", "e-waste", "biodegradable",
  "pollution", "conservation", "global warming",
];

const isEcoArticle = (title, description) => {
  const combined = `${title} ${description ?? ""}`.toLowerCase();
  return ECO_SIGNALS.some((s) => combined.includes(s));
};

const fetchJson = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const mapNewsApi = (json) =>
  Array.isArray(json?.articles)
    ? json.articles
        .filter((a) => a && a.url && a.title)
        .map((a) => ({
          title: a.title ?? "",
          description: a.description ?? null,
          image: a.urlToImage ?? null,
          url: a.url,
          source: a.source?.name ?? "NewsAPI",
          publishedAt: a.publishedAt,
        }))
    : [];

const mapGNews = (json) =>
  Array.isArray(json?.articles)
    ? json.articles
        .filter((a) => a && a.url && a.title)
        .map((a) => ({
          title: a.title ?? "",
          description: a.description ?? null,
          image: a.image ?? null,
          url: a.url,
          source: a.source?.name ?? "GNews",
          publishedAt: a.publishedAt,
        }))
    : [];

// ── In-memory aggregate cache ────────────────────────────────────────────────
// cache = { at: <timestamp>, articles: [...combined sorted list] }
let cache = null;
let inflightRefresh = null;

/** Fetch all sources, filter, dedupe and sort. Shared by cold miss and refresh. */
const fetchCombined = async () => {
  const newsApiKey = process.env.NEWSAPI_KEY;
  const gnewsApiKey = process.env.GNEWS_API_KEY;

  if (!newsApiKey && !gnewsApiKey) {
    const err = new Error("News sources not configured");
    err.status = 503;
    throw err;
  }

  const jobs = [];
  if (newsApiKey) {
    const newsApiUrl =
      `${NEWSAPI_BASE}` +
      `?qInTitle=${encodeURIComponent(NEWS_API_TITLE_QUERY)}` +
      `&sortBy=relevancy` +
      `&language=en` +
      `&pageSize=50` +
      `&apiKey=${newsApiKey}`;
    jobs.push(fetchJson(newsApiUrl).then(mapNewsApi).catch(() => []));
  }
  if (gnewsApiKey) {
    const gnewsUrl =
      `${GNEWS_BASE}` +
      `?q=${encodeURIComponent(GNEWS_QUERY)}` +
      `&lang=en` +
      `&sortby=relevance` +
      `&max=10` +
      `&apikey=${gnewsApiKey}`;
    jobs.push(fetchJson(gnewsUrl).then(mapGNews).catch(() => []));
  }

  const results = await Promise.all(jobs);
  let combined = results.flat();

  combined = combined.filter((i) => i.title && i.url && isEcoArticle(i.title, i.description));
  combined = Array.from(new Map(combined.map((i) => [i.url, i])).values());
  combined.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return combined;
};

/**
 * GET /api/news?feed=eco&page=1
 * Aggregated eco news with a 10-minute server-side cache. Paginated client-
 * side from the cached list, so paging never re-hits the upstream APIs.
 */
const getEcoFeed = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);

  try {
    const cacheFresh = cache && Date.now() - cache.at < TTL;

    if (cacheFresh) {
      // Serve from cache — zero upstream calls while fresh
      const start = (page - 1) * PAGE_SIZE;
      const paginated = cache.articles.slice(start, start + PAGE_SIZE);
      return res.status(200).json({
        page,
        limit: PAGE_SIZE,
        total: cache.articles.length,
        hasMore: start + PAGE_SIZE < cache.articles.length,
        cached: true,
        data: paginated,
      });
    }

    // Stale or missing — refresh upstream once, deduping concurrent requests
    if (!inflightRefresh) {
      inflightRefresh = fetchCombined()
        .then((articles) => {
          cache = { at: Date.now(), articles };
        })
        .finally(() => {
          inflightRefresh = null;
        });
    }
    await inflightRefresh;

    const start = (page - 1) * PAGE_SIZE;
    const paginated = cache.articles.slice(start, start + PAGE_SIZE);
    return res.status(200).json({
      page,
      limit: PAGE_SIZE,
      total: cache.articles.length,
      hasMore: start + PAGE_SIZE < cache.articles.length,
      cached: false,
      data: paginated,
    });
  } catch (err) {
    if (err.status === 503) {
      return res
        .status(503)
        .json({ error: "News sources not configured. Add NEWSAPI_KEY and/or GNEWS_API_KEY." });
    }
    console.error("Feed fetch failed:", err);
    // Serve stale cache rather than nothing, when available
    if (cache && cache.articles.length) {
      const start = (page - 1) * PAGE_SIZE;
      return res.status(200).json({
        page,
        limit: PAGE_SIZE,
        total: cache.articles.length,
        hasMore: start + PAGE_SIZE < cache.articles.length,
        cached: true,
        data: cache.articles.slice(start, start + PAGE_SIZE),
      });
    }
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
};

module.exports = { getEcoFeed };
