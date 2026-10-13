import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { apiFetch, formatNaira, timeLeft, CATEGORY_META } from '../utils/marketApi';

/**
 * Art Gallery — upcycled artwork listings (type=artwork).
 * One component serves two routes:
 *   /gallery        → grid of artwork with live auctions + fixed price
 *   /gallery/:id    → detail view with bidding, reviews and seller info
 * Logic mirrors MarketplacePage but for the artwork vertical, matching
 * MarketX-frontend's marketplace/product page split.
 */

const GalleryGrid = ({ onBid, actionBusy }) => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/listings?type=artwork&page=1&limit=24');
      setArtworks(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-200 dark:border-gray-700 p-10 text-center">
        <p className="text-4xl mb-3">🖼️</p>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">The gallery doors are still closing</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Couldn't load artworks ({error}). The backend needs its database connection — set{' '}
          <code className="font-mono">MONGODB_URI</code> in the environment.
        </p>
        <button onClick={fetchArtworks} className="mt-5 px-5 py-2.5 rounded-lg bg-ecomate-600 hover:bg-ecomate-500 text-white text-sm font-semibold">
          Retry
        </button>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center border border-dashed border-ecomate-300 dark:border-gray-700">
        <p className="text-5xl mb-4">🎨</p>
        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">No artwork listed yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
          Created something out of recycled materials? List it here — fixed price or live auction with competitive bidding.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((art) => {
        const isAuction = art.saleType === 'auction';
        return (
          <article
            key={art._id}
            className="group rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-56 bg-gradient-to-br from-ecomate-200 via-ecomate-100 to-amber-50 dark:from-ecomate-900 dark:via-ecomate-950 dark:to-gray-800 flex items-center justify-center text-7xl">
              {art.images && art.images[0] ? (
                <img src={art.images[0]} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span>🖼️</span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                  {CATEGORY_META.artwork.emoji} Upcycled Art
                </span>
                {isAuction && (
                  <span className="text-xs font-bold text-ecomate-700 dark:text-ecomate-400">
                    🔨 {timeLeft(art.auctionEndsAt)}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-bold text-gray-900 dark:text-white line-clamp-2">{art.title}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {art.seller?.name ? `by ${art.seller.name}` : 'Unknown artist'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-extrabold text-ecomate-700 dark:text-ecomate-400">
                  {formatNaira(isAuction && art.currentBid > 0 ? art.currentBid : art.price)}
                </p>
                {isAuction ? (
                  <button
                    onClick={() => onBid(art)}
                    disabled={actionBusy}
                    className="px-4 py-2 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold"
                  >
                    Bid
                  </button>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/60 dark:text-ecomate-300">
                    Fixed price
                  </span>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

const GalleryDetail = ({ onBid, actionBusy }) => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [art, setArt] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listing, listingReviews] = await Promise.all([
        apiFetch(`/listings/${id}`),
        apiFetch(`/reviews/listing/${id}`).catch(() => []),
      ]);
      setArt(listing);
      setReviews(Array.isArray(listingReviews) ? listingReviews : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleBuy = async () => {
    if (!user) return navigate('/login');
    setNotice(null);
    try {
      const order = await apiFetch(`/listings/${id}/buy`, { method: 'POST', token: user.token, body: {} });
      setNotice({ ok: true, text: `Order ${order.orderNumber} created — complete payment in your profile.` });
      fetchDetail();
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    }
  };

  const handleFavorite = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await apiFetch(`/listings/${id}/favorite`, { method: 'POST', token: user.token });
      setArt((prev) => ({ ...prev, favoritesCount: res.favoritesCount }));
      setNotice({ ok: true, text: res.favorited ? 'Added to favorites ★' : 'Removed from favorites' });
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-white dark:bg-gray-800 h-96 animate-pulse" />;
  }

  if (error || !art) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-10 text-center border border-ecomate-200 dark:border-gray-700">
        <p className="text-4xl mb-3">🔍</p>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Artwork not found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error || 'This listing may have been removed.'}</p>
        <button onClick={() => navigate('/gallery')} className="mt-5 px-5 py-2.5 rounded-lg bg-ecomate-600 hover:bg-ecomate-500 text-white text-sm font-semibold">
          Back to Gallery
        </button>
      </div>
    );
  }

  const isAuction = art.saleType === 'auction';
  const isOwner = user && art.seller?._id === user.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-ecomate-200 via-ecomate-100 to-amber-50 dark:from-ecomate-900 dark:via-ecomate-950 dark:to-gray-800 flex items-center justify-center min-h-[320px] text-8xl">
        {art.images && art.images[0] ? (
          <img src={art.images[0]} alt={art.title} className="w-full h-full object-cover" />
        ) : (
          <span>🖼️</span>
        )}
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-6">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
          🎨 Upcycled Artwork · {art.condition?.replace('_', ' ')}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">{art.title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          by {art.seller?.name || 'Unknown artist'}{art.location ? ` · ${art.location}` : ''}
        </p>

        {notice && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? 'bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/50 dark:text-ecomate-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
            {notice.text}
          </div>
        )}

        <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">{art.description}</p>

        <div className="mt-6 rounded-xl bg-ecomate-50 dark:bg-ecomate-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {isAuction ? (art.currentBid > 0 ? 'Current bid' : 'Starting price') : 'Price'}
          </p>
          <p className="text-3xl font-extrabold text-ecomate-700 dark:text-ecomate-400">
            {formatNaira(isAuction && art.currentBid > 0 ? art.currentBid : art.price)}
          </p>
          {isAuction && (
            <p className="mt-1 text-sm font-semibold text-forest dark:text-ecomate-300">
              ⏳ {timeLeft(art.auctionEndsAt)} · {art.bids?.length || 0} bid{(art.bids?.length || 0) !== 1 ? 's' : ''}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{art.views} views · {art.favoritesCount} favorites</p>
        </div>

        {!isOwner && (
          <div className="mt-5 flex gap-3">
            {isAuction ? (
              <button
                onClick={() => onBid(art)}
                disabled={actionBusy}
                className="flex-1 py-3 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white font-semibold"
              >
                Place Bid
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={actionBusy || art.available < 1}
                className="flex-1 py-3 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white font-semibold"
              >
                {art.available < 1 ? 'Sold Out' : 'Buy Now'}
              </button>
            )}
            <button
              onClick={handleFavorite}
              className="px-5 py-3 rounded-xl border border-ecomate-300 dark:border-gray-600 font-semibold text-ecomate-700 dark:text-ecomate-400 hover:bg-ecomate-50 dark:hover:bg-gray-700"
            >
              ♡ {art.favoritesCount}
            </button>
          </div>
        )}

        {/* Bid history */}
        {isAuction && art.bids?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 dark:text-white">Bid history</h3>
            <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-700">
              {art.bids.slice().reverse().slice(0, 8).map((bid, i) => (
                <li key={i} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{bid.bidder?.name || 'Bidder'}</span>
                  <span className="font-semibold text-ecomate-700 dark:text-ecomate-400">{formatNaira(bid.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Reviews {art.totalReviews > 0 && <span className="text-amber-500">★ {art.averageRating.toFixed(1)}</span>}
          </h3>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {reviews.map((rev) => (
                <li key={rev._id} className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rev.reviewer?.name || 'Buyer'}</span>
                    <span className="text-amber-500 text-sm">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                  </div>
                  {rev.comment && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{rev.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const ArtGalleryPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [bidTarget, setBidTarget] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const openBid = (art) => {
    if (!user) return navigate('/login');
    const minBid = art.currentBid > 0 ? Math.ceil(art.currentBid * 1.05) : art.price;
    setBidAmount(String(minBid));
    setBidTarget(art);
  };

  const submitBid = async () => {
    if (!bidTarget) return;
    setActionBusy(true);
    try {
      await apiFetch(`/listings/${bidTarget._id}/bid`, {
        method: 'POST',
        token: user.token,
        body: { amount: Number(bidAmount) },
      });
      setBidTarget(null);
      // Refresh detail view if open
      navigate(0);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ecomate-50/60 dark:bg-gray-950">
      <section className="bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-ecomate-400 font-semibold tracking-wide uppercase text-sm">Art Gallery</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
            Upcycled art, <span className="text-ecomate-400">reimagined treasure</span>
          </h1>
          <p className="mt-3 max-w-2xl text-ecomate-100/90">
            One-of-a-kind pieces crafted from recycled materials. Buy at a fixed price or join a live
            auction with competitive bidding.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {id ? (
          <GalleryDetail onBid={openBid} actionBusy={actionBusy} />
        ) : (
          <GalleryGrid onBid={openBid} actionBusy={actionBusy} />
        )}
      </div>

      {/* Bid modal */}
      {bidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setBidTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bid on "{bidTarget.title}"</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Minimum next bid: {formatNaira(bidTarget.currentBid > 0 ? Math.ceil(bidTarget.currentBid * 1.05) : bidTarget.price)}
            </p>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30 outline-none"
            />
            <div className="mt-5 flex gap-3">
              <button onClick={submitBid} disabled={actionBusy} className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold">
                {actionBusy ? 'Placing…' : 'Confirm Bid'}
              </button>
              <button onClick={() => setBidTarget(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtGalleryPage;
