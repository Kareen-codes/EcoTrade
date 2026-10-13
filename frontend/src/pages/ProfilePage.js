import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { apiFetch, formatNaira } from '../utils/marketApi';

/**
 * Profile — account overview + Impact Dashboard + personal goals.
 * Impact stats come live from GET /api/impact/me (items recycled, total
 * weight, CO₂ saved, wallet + lifetime earnings, community rank
 * percentile, badges). Personal weekly goals managed via /api/goals.
 */
const ProfilePage = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [impact, setImpact] = useState(null);
  const [goals, setGoals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalDraft, setGoalDraft] = useState({ title: '', targetValue: '' });
  const [busy, setBusy] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [impactData, goalsData, ordersData] = await Promise.all([
        apiFetch('/impact/me', { token: user.token }),
        apiFetch('/goals', { token: user.token }).catch(() => []),
        apiFetch('/orders?role=buyer&limit=5', { token: user.token }).catch(() => ({ orders: [] })),
      ]);
      setImpact(impactData);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setOrders(ordersData.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAll();
  }, [user, navigate, fetchAll]);

  const addGoal = async (e) => {
    e.preventDefault();
    if (!goalDraft.title || !goalDraft.targetValue) return;
    setBusy(true);
    try {
      await apiFetch('/goals', {
        method: 'POST',
        token: user.token,
        body: { title: goalDraft.title, targetValue: Number(goalDraft.targetValue), targetType: 'weight_kg' },
      });
      setGoalDraft({ title: '', targetValue: '' });
      const goalsData = await apiFetch('/goals', { token: user.token });
      setGoals(Array.isArray(goalsData) ? goalsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const bumpGoal = async (goal) => {
    try {
      const updated = await apiFetch(`/goals/${goal._id}/progress`, {
        method: 'PATCH',
        token: user.token,
        body: { progress: goal.progress + 1 },
      });
      setGoals((prev) => prev.map((g) => (g._id === goal._id ? updated : g)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null;

  const stats = impact?.stats;
  const earnings = impact?.earnings;
  const community = impact?.community;

  const STAT_CARDS = [
    { label: 'Items Recycled', value: stats?.itemsRecycled ?? '—', emoji: '♻️' },
    { label: 'Total Weight', value: stats?.totalWeightKg != null ? `${stats.totalWeightKg} kg` : '—', emoji: '⚖️' },
    { label: 'CO₂ Saved', value: stats?.co2SavedKg != null ? `${stats.co2SavedKg} kg` : '—', emoji: 'carbon' },
    { label: 'Earnings', value: earnings ? formatNaira(earnings.walletBalance) : '—', emoji: '💰' },
  ];

  return (
    <div className="min-h-screen bg-ecomate-50/60 dark:bg-gray-950">
      {/* Header */}
      <section className="bg-forest text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-ecomate-500 text-white flex items-center justify-center text-3xl font-extrabold shrink-0">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user.name}</h1>
            <p className="text-ecomate-100/80 text-sm mt-1">
              {user.email}{user.state ? ` · ${user.state}` : ''}
            </p>
            {community && (
              <p className="mt-2 text-sm font-semibold text-ecomate-400">
                🏅 Top {Math.max(1, 100 - (community.rankPercentile ?? 0))}% recycler in the community
                {community.totalUsers ? ` (${community.totalUsers} members)` : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="self-start px-5 py-2.5 rounded-xl border border-ecomate-400/60 text-ecomate-300 text-sm font-semibold hover:bg-ecomate-950/60 transition-colors"
          >
            Sign out
          </button>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading / error */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 h-28 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Impact dashboard */}
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Impact Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map((card) => (
                <div key={card.label} className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    {card.emoji === 'carbon' ? (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-ecomate-500" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    ) : (
                      <span>{card.emoji}</span>
                    )}
                    {card.label}
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-ecomate-700 dark:text-ecomate-400">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Earnings detail + lifetime */}
            {earnings && (
              <div className="mt-4 rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-5 flex flex-wrap gap-6 items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Lifetime Earnings</p>
                  <p className="text-xl font-extrabold text-forest dark:text-ecomate-400">{formatNaira(earnings.lifetimeEarnings)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Completed Sales</p>
                  <p className="text-xl font-extrabold text-forest dark:text-ecomate-400">{earnings.completedSales}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="px-5 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 text-white text-sm font-semibold"
                  >
                    Sell recyclables →
                  </button>
                </div>
              </div>
            )}

            {/* Badges */}
            {impact?.badges?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3">Badges</h2>
                <div className="flex flex-wrap gap-3">
                  {impact.badges.map((badge, i) => (
                    <div key={i} className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-4 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                      🏆 {badge.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal goals */}
            <div className="mt-8">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3">Weekly Goals <span className="text-sm font-normal text-gray-400">(private)</span></h2>

              <form onSubmit={addGoal} className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-4 mb-4 flex flex-col sm:flex-row gap-3">
                <input
                  value={goalDraft.title}
                  onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })}
                  placeholder="e.g. Collect 5kg of plastic"
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-ecomate-500"
                />
                <input
                  type="number"
                  min="1"
                  value={goalDraft.targetValue}
                  onChange={(e) => setGoalDraft({ ...goalDraft, targetValue: e.target.value })}
                  placeholder="Target kg"
                  className="w-full sm:w-32 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-ecomate-500"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold"
                >
                  Add goal
                </button>
              </form>

              {goals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No goals this week yet. Set one — small habits compound.</p>
              ) : (
                <ul className="space-y-3">
                  {goals.map((goal) => {
                    const pct = Math.min(Math.round((goal.progress / goal.targetValue) * 100), 100);
                    return (
                      <li key={goal._id} className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-sm ${goal.completedAt ? 'text-ecomate-600 dark:text-ecomate-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                            {goal.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{goal.progress}/{goal.targetValue}kg</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-ecomate-100 dark:bg-gray-700 overflow-hidden">
                          <div className="h-full rounded-full bg-ecomate-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        {!goal.completedAt && (
                          <button
                            onClick={() => bumpGoal(goal)}
                            className="mt-2 text-xs font-semibold text-ecomate-700 dark:text-ecomate-400 hover:underline"
                          >
                            + Log 1kg
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Recent orders */}
            <div className="mt-8">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet — the marketplace is waiting.</p>
              ) : (
                <ul className="space-y-2">
                  {orders.map((order) => (
                    <li key={order._id} className="rounded-xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{order.itemSnapshot?.title}</p>
                        <p className="text-xs text-gray-400">{order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ecomate-700 dark:text-ecomate-400">{formatNaira(order.totalAmount)}</p>
                        <p className="text-xs capitalize text-gray-400">{order.status}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
