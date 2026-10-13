const mongoose = require('mongoose');

/**
 * Personal Goals — private weekly recycling habits tracked on the
 * user's dashboard (EcoMate-specific).
 */
const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },
    targetType: { type: String, enum: ['weight_kg', 'items_count'], default: 'weight_kg' },
    targetValue: { type: Number, required: true, min: 1 },
    progress: { type: Number, default: 0, min: 0 },

    // ISO week the goal belongs to (private to the owner)
    weekOf: { type: Date, required: true }, // Monday of that week
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, weekOf: -1 });

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
