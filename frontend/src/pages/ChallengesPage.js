import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { apiFetch, timeLeft, CATEGORY_META } from '../utils/marketApi';

/**
 * Environmental Challenges — browse active challenges (NGO/company
 * created), join, and submit proof (photo + weight). Progress bars show
 * each participant's climb toward the target; rewards shown per card.
 */
const ChallengesPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');
  const [submitTarget, setSubmitTarget] = useState(null); // challenge open in proof modal
  const [proof, setProof] = useState({ imageUrl: '', weightKg: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/challenges?status=${filter}`);
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const requireAuth = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleJoin = async (challenge) => {
    if (!requireAuth()) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiFetch(`/challenges/${challenge._id}/join`, { method: 'POST', token: user.token });
      setNotice({ ok: true, text: `Joined "${challenge.title}" 🎉` });
      fetchChallenges();
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!submitTarget || !requireAuth()) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiFetch(`/challenges/${submitTarget._id}/submit`, {
        method: 'POST',
        token: user.token,
        body: { imageUrl: proof.imageUrl, weightKg: Number(proof.weightKg) || 0, note: proof.note },
      });
      setNotice({ ok: true, text: 'Proof submitted for review 📸' });
      setSubmitTarget(null);
      setProof({ imageUrl: '', weightKg: '', note: '' });
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const isJoined = (challenge) =>
    user && challenge.participants?.some((p) => (p.user?._id || p.user) === user.id);

  const myProgress = (challenge) =>
    challenge.participants?.find((p) => (p.user?._id || p.user) === user?.id);

  return (
    <div className="min-h-screen bg-ecomate-50/60 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-ecomate-400 font-semibold tracking-wide uppercase text-sm">Challenges</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
            Collect. Compete. <span className="text-ecomate-400">Earn rewards.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-ecomate-100/90">
            NGOs and companies post real environmental missions — "Collect 10kg of plastic this week".
            Join, submit proof, earn badges, certificates, cash or vouchers.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['active', 'upcoming', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-ecomate-600 text-white shadow'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-ecomate-100 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
          {user && (
            <button
              onClick={() => navigate('/profile')}
              className="ml-auto px-4 py-2 rounded-full text-sm font-semibold bg-forest text-ecomate-300 hover:bg-ecomate-950 transition-colors"
            >
              My personal goals →
            </button>
          )}
        </div>

        {notice && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? 'bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/50 dark:text-ecomate-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
            {notice.text}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-200 dark:border-gray-700 p-10 text-center">
            <p className="text-4xl mb-3">🏁</p>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Challenges can't load yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {error} — the backend needs its <code className="font-mono">MONGODB_URI</code> connection.
            </p>
            <button onClick={fetchChallenges} className="mt-5 px-5 py-2.5 rounded-lg bg-ecomate-600 hover:bg-ecomate-500 text-white text-sm font-semibold">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && challenges.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center border border-dashed border-ecomate-300 dark:border-gray-700">
            <p className="text-5xl mb-4">🌍</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-200">No {filter} challenges right now</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Check back soon — new missions launch weekly.</p>
          </div>
        )}

        {/* Challenge cards */}
        {!loading && !error && challenges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const meta = CATEGORY_META[challenge.category] || CATEGORY_META.general;
              const joined = isJoined(challenge);
              const mine = myProgress(challenge);
              const pct = mine ? Math.min(Math.round((mine.progress / challenge.targetValue) * 100), 100) : 0;
              return (
                <article
                  key={challenge._id}
                  className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/60 dark:text-ecomate-300">
                        {meta.emoji} {meta.label}
                      </span>
                      {challenge.creatorOrg && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">by {challenge.creatorOrg}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-forest dark:text-ecomate-300">
                      ⏳ {timeLeft(challenge.endsAt)}
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-lg text-gray-900 dark:text-white">{challenge.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{challenge.description}</p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ecomate-700 dark:text-ecomate-400">
                      Target: {challenge.targetValue}{challenge.targetType === 'weight_kg' ? 'kg' : ' items'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      🏆 {challenge.reward?.label || challenge.reward?.type || 'Badge'}
                    </span>
                  </div>

                  {/* Progress (joined only) */}
                  {joined && mine && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Your progress</span>
                        <span>{mine.progress} / {challenge.targetValue}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-ecomate-100 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-ecomate-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      {mine.completedAt && (
                        <p className="mt-1.5 text-xs font-bold text-ecomate-600 dark:text-ecomate-400">✓ Completed!</p>
                      )}
                    </div>
                  )}

                  <p className="mt-3 text-xs text-gray-400">{challenge.participants?.length || 0} participant{(challenge.participants?.length || 0) !== 1 ? 's' : ''}</p>

                  <div className="mt-4 flex gap-2">
                    {!joined ? (
                      <button
                        onClick={() => handleJoin(challenge)}
                        disabled={busy || challenge.status !== 'active'}
                        className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold"
                      >
                        {challenge.status === 'upcoming' ? 'Opens soon' : challenge.status === 'completed' ? 'Ended' : 'Join Challenge'}
                      </button>
                    ) : !mine?.completedAt ? (
                      <button
                        onClick={() => setSubmitTarget(challenge)}
                        disabled={challenge.status !== 'active'}
                        className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold"
                      >
                        Submit Proof 📸
                      </button>
                    ) : (
                      <span className="flex-1 py-2.5 text-center rounded-xl bg-ecomate-100 dark:bg-ecomate-900/50 text-ecomate-800 dark:text-ecomate-300 text-sm font-semibold">
                        🏆 Reward earned
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof submission modal */}
      {submitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSubmitTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit proof — "{submitTarget.title}"</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Show your collected recyclables. The creator reviews each submission.</p>

            <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Photo URL</label>
            <input
              value={proof.imageUrl}
              onChange={(e) => setProof({ ...proof, imageUrl: e.target.value })}
              placeholder="https://…/photo-of-collected-waste.jpg"
              className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-ecomate-500"
            />

            {submitTarget.targetType === 'weight_kg' && (
              <>
                <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Weight collected (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={proof.weightKg}
                  onChange={(e) => setProof({ ...proof, weightKg: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-ecomate-500"
                />
              </>
            )}

            <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Note (optional)</label>
            <textarea
              value={proof.note}
              onChange={(e) => setProof({ ...proof, note: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-ecomate-500"
            />

            <div className="mt-5 flex gap-3">
              <button onClick={handleSubmitProof} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold">
                {busy ? 'Submitting…' : 'Submit Proof'}
              </button>
              <button onClick={() => setSubmitTarget(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesPage;
