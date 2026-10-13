const mongoose = require('mongoose');

/**
 * Order disputes — ported from MarketX-backend `dispute/disputes.entity.ts`:
 * OPEN → UNDER_REVIEW → RESOLVED, with a resolution action of either
 * REFUND_TO_BUYER or RELEASE_TO_SELLER. Completes the marketplace trust
 * loop around the escrow lifecycle.
 */
const disputeSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },

    resolution: { type: String, default: null },
    resolutionAction: {
      type: String,
      enum: ['REFUND_TO_BUYER', 'RELEASE_TO_SELLER', null],
      default: null,
    },
  },
  { timestamps: true }
);

disputeSchema.index({ order: 1 }, { unique: true });

const Dispute = mongoose.model('Dispute', disputeSchema);
module.exports = Dispute;
