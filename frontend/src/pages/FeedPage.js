import { useEffect, useState, useCallback, useRef } from "react";
import useScrollReveal from "../hooks/useScrollReveal";
import logoSeed from "../assets/images/ecomate-logo.svg";
import {
  getCachedFeed,
  setCachedFeed,
  isFresh,
  fetchFeedPage,
} from "../utils/newsCache";

/**
 * EcoMate Feed — environmental, recycling & sustainability news.
 *
 * Data source: GET {API}/news?feed=eco&page=1 (backend aggregates NewsAPI +
 * GNews with an eco-signal filter; keys stay server-side). While API keys
 * are not configured (503) or the request fails, a curated demo list is
 * shown so the page never renders empty.
 *
 * Caching (stale-while-revalidate):
 *  - Revisits within the session render instantly from the memory cache.
 *  - After a full reload, localStorage hydrates the page with no skeleton.
 *  - A background refresh runs only when the cache is older than 10 minutes
 *    (or when the cached state came from the demo fallback), so the upstream
 *    news APIs are not hammered on every navigation.
 *
 * Cards are full-card links to the original article and scale up on hover.
 */

const DEMO_ARTICLES = [
  {
    title: "Nigeria generates over 32 million tonnes of waste yearly — and startups are turning it into gold",
    description:
      "From Lagos to Kano, young entrepreneurs are converting plastic bottles, e-waste and tyres into construction materials, furniture and export-grade recyclables.",
    image: null,
    url: "https://www.google.com/search?q=Nigeria+recycling+startups+waste+to+wealth",
    source: "EcoMate Demo",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: "AI boom could leave an e-waste trail that wraps 6 times around Earth",
    description:
      "Report says estimates focused on GPUs miss the mountains of power, cooling, and networking gear destined for scrap.",
    image: null,
    url: "https://www.theregister.com/2026/09/19/ai_boom_could_leave_an_e/",
    source: "The Register",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    title: "How circular economy hubs are creating jobs across Africa",
    description:
      "Recycling parks that combine collection, sorting and upcycling workshops are proving that sustainability and employment can grow together.",
    image: null,
    url: "https://www.google.com/search?q=circular+economy+hubs+Africa+jobs",
    source: "EcoMate Demo",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    title: "Plastic pollution treaty talks resume: what is at stake for coastal cities?",
    description:
      "Negotiators return to the table with binding targets for single-use plastics and new funding for waste collection infrastructure.",
    image: null,
    url: "https://www.google.com/search?q=plastic+pollution+treaty+negotiations",
    source: "EcoMate Demo",
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    title: "Upcycled art is having a moment — and collectors are paying attention",
    description:
      "Sculptors and designers are transforming scrap metal and discarded electronics into gallery pieces that sell for thousands.",
    image: null,
    url: "https://www.google.com/search?q=upcycled+art+sculpture+collectors",
    source: "EcoMate Demo",
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const FeedPage = () => {
  useScrollReveal();

  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready
  const [demoNotice, setDemoNotice] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(true);
  const articlesRef = useRef([]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  // Write the rendered state into both cache tiers
  const persist = useCallback(({ items, hasMore: more, demo, page: pageNum }) => {
    setCachedFeed({
      articles: items,
      hasMore: more,
      page: pageNum,
      demoNotice: demo,
    });
  }, []);

  const loadFeed = useCallback(
    async (pageNum = 1, append = false) => {
      if (append) setLoadingMore(true);

      try {
        const json = await fetchFeedPage(pageNum);
        const items = Array.isArray(json?.data) ? json.data : [];
        if (!items.length) throw new Error("Empty feed");

        const merged = append ? [...articlesRef.current, ...items] : items;
        setArticles(merged);
        setHasMore(Boolean(json?.hasMore));
        setDemoNotice(false);
        setStatus("ready");

        persist({
          items: merged,
          hasMore: Boolean(json?.hasMore),
          demo: false,
          page: pageNum,
        });
      } catch {
        // Keys not configured or backend unreachable — fall back to demo content
        // (only for the initial load; a failed "load more" just stops paging)
        if (!append) {
          setArticles(DEMO_ARTICLES);
          setDemoNotice(true);
          persist({ items: DEMO_ARTICLES, hasMore: false, demo: true, page: 1 });
        }
        setHasMore(false);
        setStatus("ready");
      } finally {
        setLoadingMore(false);
      }
    },
    [persist]
  );

  useEffect(() => {
    const cache = getCachedFeed();

    if (cache && cache.articles.length) {
      // 1) Hydrate instantly from cache — no skeleton on revisit
      setArticles(cache.articles);
      setHasMore(Boolean(cache.hasMore));
      setDemoNotice(Boolean(cache.demoNotice));
      setPage(cache.page || 1);
      setStatus("ready");

      // 2) Background refresh only when stale (older than 10 min)
      if (!isFresh(cache)) {
        setRefreshing(true);
        fetchFeedPage(1)
          .then((json) => {
            const items = Array.isArray(json?.data) ? json.data : [];
            if (!items.length || !mountedRef.current) return;
            setArticles(items);
            setHasMore(Boolean(json?.hasMore));
            setDemoNotice(false);
            setPage(1);
            setCachedFeed({
              articles: items,
              hasMore: Boolean(json?.hasMore),
              page: 1,
              demoNotice: false,
            });
          })
          .catch(() => {
            /* keep showing cached content — offline or API hiccup */
          })
          .finally(() => {
            if (mountedRef.current) setRefreshing(false);
          });
      }
      return;
    }

    // No cache — first ever visit: show skeletons, fetch page 1
    loadFeed(1, false);
  }, [loadFeed]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFeed(next, true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <h1 className="text-4xl md:text-5xl font-bold text-green-600 flex items-center justify-center gap-3">
            EcoMate Feed
            <img src={logoSeed} alt="" className="w-8 h-8 inline-block" />
          </h1>
          <p className="text-gray-600 mt-3">
            Latest environmental, recycling &amp; sustainability news
          </p>
        </div>

        {/* Loading skeletons — only on the very first visit (no cache) */}
        {status === "loading" && (
          <div className="space-y-8" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
              >
                <div className="h-64 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Articles */}
        {status === "ready" && (
          <>
            {demoNotice && (
              <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm reveal">
                Live news sources aren't connected yet — showing sample stories.
                Add <code className="font-mono">NEWSAPI_KEY</code> or{" "}
                <code className="font-mono">GNEWS_API_KEY</code> to enable the live feed.
              </div>
            )}

            <div className="space-y-10">
              {articles.map((article, i) => (
                <a
                  key={`${article.url}-${i}`}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reveal group block bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transform transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {/* Image */}
                  <div className="h-64 bg-gray-100 overflow-hidden">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
                        <img src={logoSeed} alt="" className="w-16 h-16 opacity-60" />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>{article.source}</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors leading-snug">
                      {article.title}
                    </h2>
                    {article.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {article.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm mt-3 group-hover:gap-2 transition-all">
                      Read more
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Subtle indicator while a background refresh runs */}
            {refreshing && (
              <p className="text-center text-xs text-gray-400 mt-6" role="status">
                Checking for newer stories…
              </p>
            )}

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "Load more stories"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
