import { getApiUrl } from "../config/api";

/**
 * Client-side cache for the EcoMate Feed (stale-while-revalidate).
 *
 * Two tiers:
 *  1. Module-level memory cache — instant, survives route changes for the
 *     whole SPA session (Feed → Home → Feed shows zero loading state).
 *  2. localStorage — survives full page reloads and browser restarts.
 *
 * A cached payload is considered "fresh" for FRESH_DURATION_MS. Fresh caches
 * are served with no network call at all; stale caches are shown immediately
 * while a background refresh updates them (see FeedPage).
 */

const STORAGE_KEY = "ecomate.feed.eco.v1";
const MAX_CACHED_ARTICLES = 30;

export const FRESH_DURATION_MS = 10 * 60 * 1000; // 10 minutes

let memoryCache = null;

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.articles)) return null;
    return parsed;
  } catch {
    return null; // corrupted entry or storage unavailable — ignore
  }
};

const writeStorage = (payload) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Private browsing / quota exceeded — memory cache still works
  }
};

/** Returns the cached feed ({ articles, hasMore, page, demoNotice, savedAt }) or null. */
export const getCachedFeed = () => {
  if (memoryCache) return { ...memoryCache, source: "memory" };
  const stored = readStorage();
  if (stored) {
    memoryCache = stored;
    return { ...stored, source: "storage" };
  }
  return null;
};

/** True when the cache is younger than FRESH_DURATION_MS. */
export const isFresh = (cache, now = Date.now()) =>
  Boolean(cache?.savedAt && now - cache.savedAt < FRESH_DURATION_MS);

/** Persist the current feed state to both cache tiers. */
export const setCachedFeed = ({ articles, hasMore, page, demoNotice }) => {
  const payload = {
    articles: Array.isArray(articles) ? articles.slice(0, MAX_CACHED_ARTICLES) : [],
    hasMore: Boolean(hasMore),
    page: Number(page) || 1,
    demoNotice: Boolean(demoNotice),
    savedAt: Date.now(),
  };
  memoryCache = payload;
  writeStorage(payload);
  return payload;
};

export const clearCachedFeed = () => {
  memoryCache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

// In-flight request dedupe — protects against double-mounts in React 18
// StrictMode and rapid pagination clicks reusing the same page request.
let inflight = null;

/** Fetch one page of the eco feed. Concurrent calls for the same page share one request. */
export const fetchFeedPage = async (page = 1) => {
  if (inflight && inflight.page === page) return inflight.promise;

  const promise = (async () => {
    try {
      const res = await fetch(getApiUrl(`news?feed=eco&page=${page}&limit=5`));
      if (!res.ok) throw new Error(`Feed responded ${res.status}`);
      return await res.json();
    } finally {
      if (inflight?.promise === promise) inflight = null;
    }
  })();

  inflight = { page, promise };
  return promise;
};
