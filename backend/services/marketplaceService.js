const User = require('../models/userModel');

/** Human-readable unique order number: EM-20261013-A1B2C3 */
function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `EM-${date}-${rand}`;
}

// CO₂ avoided per kg recycled vs. virgin production (Nigeria-focused estimates)
const CO2_FACTORS_KG = {
  plastic: 1.8,
  metal: 9.0,
  'e-waste': 2.1,
  glass: 0.6,
  rubber: 1.4,
  paper: 0.9,
  furniture: 1.2,
  artwork: 0.5,
  other: 1.0,
};

function co2SavedKg(category, weightKg) {
  return Number(((CO2_FACTORS_KG[category] || 1.0) * (weightKg || 0)).toFixed(2));
}

/**
 * recordImpact — increments a user's live impact stats (called on
 * completed orders and approved challenge submissions).
 */
async function recordImpact(userId, category, weightKg, items = 1) {
  try {
    if (!userId || !weightKg) return;
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'impact.itemsRecycled': items,
        'impact.totalWeightKg': weightKg,
        'impact.co2SavedKg': co2SavedKg(category, weightKg),
      },
    });
  } catch (error) {
    console.error('impact recording error:', error.message);
  }
}

module.exports = { generateOrderNumber, co2SavedKg, recordImpact };
