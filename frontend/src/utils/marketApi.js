import { getApiUrl } from '../config/api';

/**
 * Thin fetch wrapper for the EcoMate marketplace APIs
 * (/api/listings, /api/orders, /api/challenges, /api/feed, /api/impact...).
 * Adds the JWT when a token is provided and normalizes error messages.
 */
export async function apiFetch(endpoint, { method = 'GET', body, token } = {}) {
  const res = await fetch(getApiUrl(endpoint), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

/** Format a number as Nigerian Naira. */
export const formatNaira = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG')}`;

/** Human-readable time left until a date ("2d 4h", "Ended"). */
export function timeLeft(dateString) {
  if (!dateString) return '';
  const diff = new Date(dateString) - new Date();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

/** Category labels + emoji used across Marketplace, Gallery and Profile. */
export const CATEGORY_META = {
  plastic: { label: 'Plastic', emoji: '🧴' },
  metal: { label: 'Metal', emoji: '🔩' },
  'e-waste': { label: 'E-Waste', emoji: '💻' },
  glass: { label: 'Glass', emoji: '🍾' },
  rubber: { label: 'Rubber', emoji: '🛞' },
  paper: { label: 'Paper', emoji: '📦' },
  furniture: { label: 'Furniture', emoji: '🪑' },
  artwork: { label: 'Artwork', emoji: '🎨' },
  general: { label: 'General', emoji: '🌍' },
  other: { label: 'Other', emoji: '♻️' },
};

const marketApi = { apiFetch, formatNaira, timeLeft, CATEGORY_META };
export default marketApi;
