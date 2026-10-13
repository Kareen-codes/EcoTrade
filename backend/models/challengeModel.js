const mongoose = require('mongoose');

/**
 * Environmental Challenges — EcoMate-specific (NGOs / companies create,
 * users join, track progress, submit proof; rewards: badge, certificate,
 * cash, voucher).
 */
const challengeSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creatorOrg: { type: String, default: '' }, // "Lagos Recyclers Coalition", etc.

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    category: {
      type: String,
      enum: ['plastic', 'metal', 'e-waste', 'glass', 'rubber', 'paper', 'general'],
      default: 'general',
    },

    // e.g. "Collect 10kg of plastic this week"
    targetType: { type: String, enum: ['weight_kg', 'items_count'], default: 'weight_kg' },
    targetValue: { type: Number, required: true, min: 1 },

    reward: {
      type: { type: String, enum: ['badge', 'certificate', 'cash', 'voucher'], default: 'badge' },
      label: { type: String, default: '' }, // e.g. "Gold Recycler Certificate"
      amount: { type: Number, default: 0 }, // ₦ for cash rewards
    },

    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },

    coverImage: { type: String, default: '' },

    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 }, // kg or items toward target
        completedAt: { type: Date, default: null },
        rewarded: { type: Boolean, default: false },
        // Proof submissions: photo of collected waste + weight
        submissions: [
          {
            imageUrl: { type: String, default: '' },
            weightKg: { type: Number, default: 0 },
            note: { type: String, default: '' },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            submittedAt: { type: Date, default: Date.now },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

challengeSchema.index({ status: 1, endsAt: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;
