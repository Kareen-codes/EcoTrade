import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { apiFetch, formatNaira, timeLeft, CATEGORY_META } from '../utils/marketApi';

/**
 * Recycling Marketplace — browse recyclable-material listings
 * (type=material), filter by category/sale type, buy now or bid on
 * auctions. Consumes GET/POST /api/listings from the ported backend.
 */
const CATEGORIES = ['all', 'plastic', 'metal', 'e-waste', 'glass', 'rubber', 'paper', 'furniture', 'other'];

const MarketplacePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [saleType, setSaleType] = useState('all');
  const [search, setSearch] = useState('');
  const [bidTarget, setBidTarget] = useState(null); // listing open in bid modal
  const [bidAmount, setBidAmount] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type: 'material', page: '1', limit: '24' });
      if (category !== 'all') params.set('category', category);
      if (saleType !== 'all') params.set('saleType', saleType);
      if (search.trim()) params.set('q', search.trim());
      const data = await apiFetch(`/listings?${params.toString()}`);
      setListings(data.items || []);
    } catch (err) {
      setError(err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [category, saleType, search]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const requireAuth = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleBuy = async (listing) => {
    if (!requireAuth()) return;
    setActionBusy(true);
    setNotice(null);
    try {
      const order = await apiFetch(`/listings/${listing._id}/buy`, {
        method: 'POST',
        token: user.token,
        body: {},
      });
      setNotice({ ok: true, text: `Order created (${order.orderNumber}). Complete payment in your profile.` });
      fetchListings();
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    } finally {
      setActionBusy(false);
    }
  };

  const handleBid = async () => {
    if (!requireAuth() || !bidTarget) return;
    setActionBusy(true);
    setNotice(null);
    try {
      await apiFetch(`/listings/${bidTarget._id}/bid`, {
        method: 'POST',
        token: user.token,
        body: { amount: Number(bidAmount) },
      });
      setNotice({ ok: true, text: `Bid placed on "${bidTarget.title}".` });
      setBidTarget(null);
      fetchListings();
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    } finally {
      setActionBusy(false);
    }
  };

  const openBidModal = (listing) => {
    if (!requireAuth()) return;
    const minBid = listing.currentBid > 0 ? Math.ceil(listing.currentBid * 1.05) : listing.price;
    setBidAmount(String(minBid));
    setBidTarget(listing);
  };

  return (
    <div className="min-h-screen bg-ecomate-50/60 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-ecomate-400 font-semibold tracking-wide uppercase text-sm">Recycling Marketplace</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
            Turn your recyclables into <span className="text-ecomate-400">income</span>
          </h1>
          <p className="mt-3 max-w-2xl text-ecomate-100/90">
            Browse materials from across Nigeria — plastic, metal, glass, e-waste and more. Buy at a fixed
            price or win an auction. Every kilo recycled is tracked toward your impact score.
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings… (e.g. PET bottles, copper)"
              className="flex-1 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-transparent focus:border-ecomate-400 focus:ring-2 focus:ring-ecomate-400/40 outline-none"
            />
            <button
              onClick={fetchListings}
              className="px-6 py-3 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 font-semibold transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-ecomate-600 text-white shadow'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-ecomate-100 dark:hover:bg-gray-700'
                }`}
              >
                {meta ? `${meta.emoji} ${meta.label}` : cat}
              </button>
            );
          })}
          <div className="ml-auto flex rounded-lg overflow-hidden border border-ecomate-200 dark:border-gray-700">
            {['all', 'fixed', 'auction'].map((st) => (
              <button
                key={st}
                onClick={() => setSaleType(st)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  saleType === st
                    ? 'bg-ecomate-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {st === 'all' ? 'All' : st === 'fixed' ? 'Buy Now' : 'Auctions'}
              </button>
            ))}
          </div>
        </div>

        {/* Notice */}
        {notice && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              notice.ok ? 'bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/50 dark:text-ecomate-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 h-72 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-200 dark:border-gray-700 p-8 text-center">
            <p className="text-4xl mb-3">🗂️</p>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Marketplace is warming up</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We couldn't load listings{error ? ` (${error})` : ''}. The backend needs its database
              connection — set <code className="font-mono">MONGODB_URI</code> in the environment, or try again shortly.
            </p>
            <button
              onClick={fetchListings}
              className="mt-5 px-5 py-2.5 rounded-lg bg-ecomate-600 hover:bg-ecomate-500 text-white text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-10 text-center border border-dashed border-ecomate-300 dark:border-gray-700">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">No listings match your filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Try a different category — or list your own recyclables and start earning.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const meta = CATEGORY_META[listing.category] || CATEGORY_META.other;
              const isAuction = listing.saleType === 'auction';
              return (
                <article
                  key={listing._id}
                  className="group rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-44 bg-gradient-to-br from-ecomate-100 to-ecomate-200 dark:from-ecomate-900 dark:to-ecomate-950 flex items-center justify-center text-6xl relative">
                    {listing.images && listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <span>{meta.emoji}</span>
                    )}
                    {isAuction && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-forest/90 text-ecomate-300 text-xs font-bold">
                        🔨 {timeLeft(listing.auctionEndsAt) || 'Auction'}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/60 dark:text-ecomate-300">
                        {meta.label}
                      </span>
                      {listing.averageRating > 0 && (
                        <span className="text-xs text-amber-500 font-semibold">★ {listing.averageRating.toFixed(1)}</span>
                      )}
                    </div>

                    <h3 className="mt-3 font-bold text-gray-900 dark:text-white line-clamp-2">{listing.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {listing.seller?.name ? `by ${listing.seller.name}` : 'Seller'}{listing.location ? ` · ${listing.location}` : ''}
                      {listing.weightKg ? ` · ${listing.weightKg}kg` : ''}
                    </p>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          {isAuction ? (listing.currentBid > 0 ? 'Current bid' : 'Starting price') : 'Price'}
                        </p>
                        <p className="text-lg font-extrabold text-ecomate-700 dark:text-ecomate-400">
                          {formatNaira(isAuction && listing.currentBid > 0 ? listing.currentBid : listing.price)}
                        </p>
                      </div>
                      {isAuction && listing.bids?.length > 0 && (
                        <span className="text-xs text-gray-400">{listing.bids.length} bid{listing.bids.length > 1 ? 's' : ''}</span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {isAuction ? (
                        <button
                          onClick={() => openBidModal(listing)}
                          disabled={actionBusy}
                          className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                          Place Bid
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(listing)}
                          disabled={actionBusy || listing.available < 1}
                          className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                          {listing.available < 1 ? 'Sold Out' : 'Buy Now'}
                        </button>
                      )}
                      <Link
                        to={`/gallery/${listing._id}`}
                        className="px-4 py-2.5 rounded-xl border border-ecomate-300 dark:border-gray-600 text-sm font-semibold text-ecomate-700 dark:text-ecomate-400 hover:bg-ecomate-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid modal */}
      {bidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setBidTarget(null)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bid on "{bidTarget.title}"</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Current bid: {formatNaira(bidTarget.currentBid)} · Minimum next bid:{' '}
              {formatNaira(bidTarget.currentBid > 0 ? Math.ceil(bidTarget.currentBid * 1.05) : bidTarget.price)}
            </p>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30 outline-none"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleBid}
                disabled={actionBusy}
                className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold"
              >
                {actionBusy ? 'Placing…' : 'Confirm Bid'}
              </button>
              <button
                onClick={() => setBidTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
