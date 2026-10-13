const Notification = require('../models/notificationModel');

/**
 * createNotification — fire-and-forget in-app notification.
 * Ported from MarketX `notifications.service.ts` pattern (typed events,
 * per-user inbox). Never throws into the caller's flow.
 */
async function createNotification(userId, type, title, body = '', data = {}) {
  try {
    if (!userId) return null;
    return await Notification.create({ user: userId, type, title, body, data });
  } catch (error) {
    console.error('notification error:', error.message);
    return null;
  }
}

module.exports = { createNotification };
