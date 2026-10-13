const mongoose = require('mongoose');

/**
 * Order + escrow lifecycle, ported from MarketX-backend
 * `entities/order.entity.ts` and `entities/escrow.entity.ts`.
 *
 * Flow (single-item orders for EcoMate):
 *   pending → paid (escrow held) → shipped → delivered/completed
 *   (escrow released to seller wallet)
 *   pending/paid → cancelled (escrow refunded to buyer)
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },

    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

    // Snapshot at purchase time (listing may be edited/removed later)
    itemSnapshot: {
      title: String,
      category: String,
      type: String,
      image: String,
      weightKg: Number,
    },

    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NGN' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },

    // ---- Escrow (embedded; MarketX keeps a separate table) ----
    escrow: {
      status: { type: String, enum: ['none', 'held', 'released', 'refunded'], default: 'none' },
      heldAt: { type: Date, default: null },
      releasedAt: { type: Date, default: null },
      reference: { type: String, default: null }, // payment gateway ref
    },

    shippingAddress: { type: String, default: '' },
    phone: { type: String, default: '' },
    trackingNumber: { type: String, default: null },
    notes: { type: String, default: '' },
    cancellationReason: { type: String, default: null },

    timeline: [
      {
        status: String,
        note: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
