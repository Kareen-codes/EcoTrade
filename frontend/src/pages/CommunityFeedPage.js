import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { apiFetch } from '../utils/marketApi';

/**
 * Community Feed — social posts about recycling moments, challenges and
 * listings. Like/bookmark/comments per post. The backend enforces the
 * EcoMate rule (400s on liking/saving your own post) — this page surfaces
 * that message inline.
 */
const CommunityFeedPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/feed?page=1&limit=20');
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const requireAuth = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!requireAuth() || !newPost.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const post = await apiFetch('/feed', { method: 'POST', token: user.token, body: { text: newPost } });
      setPosts((prev) => [post, ...prev]);
      setNewPost('');
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const toggleLike = async (post) => {
    if (!requireAuth()) return;
    try {
      const res = await apiFetch(`/feed/${post._id}/like`, { method: 'POST', token: user.token });
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, likeCount: res.likeCount, likedByMe: res.liked } : p)));
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    }
  };

  const toggleBookmark = async (post) => {
    if (!requireAuth()) return;
    try {
      const res = await apiFetch(`/feed/${post._id}/bookmark`, { method: 'POST', token: user.token });
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, bookmarkCount: res.bookmarkCount, bookmarkedByMe: res.bookmarked } : p)));
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    }
  };

  const addComment = async (post) => {
    const text = (commentDrafts[post._id] || '').trim();
    if (!requireAuth() || !text) return;
    try {
      const comment = await apiFetch(`/feed/${post._id}/comments`, { method: 'POST', token: user.token, body: { text } });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, comments: [...(p.comments || []), comment], commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [post._id]: '' }));
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-ecomate-50/60 dark:bg-gray-950">
      <section className="bg-forest text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-ecomate-400 font-semibold tracking-wide uppercase text-sm">Community</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
            Recycling, <span className="text-ecomate-400">shared</span>
          </h1>
          <p className="mt-3 text-ecomate-100/90">
            Share your wins, challenges and listings with a community that gets it. Like and save
            each other's posts — the one rule: no liking or saving your own.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Composer */}
        {user ? (
          <form onSubmit={handleCreatePost} className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-4 mb-6">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What did you recycle today? 🌱"
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/20 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={busy || !newPost.trim()}
                className="px-5 py-2.5 rounded-xl bg-ecomate-600 hover:bg-ecomate-500 disabled:opacity-50 text-white text-sm font-semibold"
              >
                {busy ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-5 mb-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <button onClick={() => navigate('/login')} className="font-semibold text-ecomate-700 dark:text-ecomate-400 underline">Sign in</button>{' '}
              to join the conversation.
            </p>
          </div>
        )}

        {notice && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? 'bg-ecomate-100 text-ecomate-800 dark:bg-ecomate-900/50 dark:text-ecomate-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
            {notice.text}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 h-40 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-200 dark:border-gray-700 p-10 text-center">
            <p className="text-4xl mb-3">💬</p>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Feed can't load yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button onClick={fetchPosts} className="mt-5 px-5 py-2.5 rounded-lg bg-ecomate-600 hover:bg-ecomate-500 text-white text-sm font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center border border-dashed border-ecomate-300 dark:border-gray-700">
            <p className="text-5xl mb-4">🌱</p>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-200">No posts yet — be the first!</p>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && (
          <div className="space-y-4">
            {posts.map((post) => {
              const isMine = user && (post.author?._id || post.author) === user.id;
              return (
                <article key={post._id} className="rounded-2xl bg-white dark:bg-gray-800 border border-ecomate-100 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ecomate-500 text-white flex items-center justify-center font-bold">
                      {(post.author?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {post.author?.name || 'User'}
                        {isMine && <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-line">{post.text}</p>

                  {post.images?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {post.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="rounded-xl object-cover max-h-64 w-full" />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <button
                      onClick={() => toggleLike(post)}
                      className={`flex items-center gap-1.5 font-medium transition-colors ${
                        post.likedByMe ? 'text-ecomate-600 dark:text-ecomate-400' : 'text-gray-500 hover:text-ecomate-600 dark:hover:text-ecomate-400'
                      }`}
                    >
                      {post.likedByMe ? '♥' : '♡'} {post.likeCount || 0}
                    </button>
                    <span className="flex items-center gap-1.5 text-gray-500">💬 {post.commentCount || 0}</span>
                    <button
                      onClick={() => toggleBookmark(post)}
                      className={`ml-auto flex items-center gap-1.5 font-medium transition-colors ${
                        post.bookmarkedByMe ? 'text-ecomate-600 dark:text-ecomate-400' : 'text-gray-500 hover:text-ecomate-600 dark:hover:text-ecomate-400'
                      }`}
                      title={isMine ? 'You cannot save your own post' : 'Save post'}
                    >
                      {post.bookmarkedByMe ? '🔖 Saved' : '🔖 Save'}
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments?.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                      {post.comments.map((c) => (
                        <li key={c._id || c.createdAt} className="text-sm">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{c.author?.name || 'User'}:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-400">{c.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {user && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={commentDrafts[post._id] || ''}
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addComment(post)}
                        placeholder="Write a comment…"
                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-ecomate-500"
                      />
                      <button
                        onClick={() => addComment(post)}
                        className="px-4 py-2 rounded-xl bg-ecomate-100 dark:bg-ecomate-900/60 text-ecomate-800 dark:text-ecomate-300 text-sm font-semibold hover:bg-ecomate-200 dark:hover:bg-ecomate-900"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeedPage;
