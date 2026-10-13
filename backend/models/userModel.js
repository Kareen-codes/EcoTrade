const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    profileImage: {
        type: String,
        default: null,
    },

    // ---- EcoMate marketplace / impact fields ----
    // Wallet balance in ₦ (escrow releases credit this on completed sales)
    walletBalance: {
        type: Number,
        default: 0,
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500,
    },
    state: {
        type: String,
        default: '', // Nigerian state
    },
    // Live impact stats (updated by orders/challenges controllers)
    impact: {
        itemsRecycled: { type: Number, default: 0 },
        totalWeightKg: { type: Number, default: 0 },
        co2SavedKg: { type: Number, default: 0 },
        rankPercentile: { type: Number, default: 0 }, // 0-100
    },
    // Badges earned from challenges
    badges: [{
        label: String,
        earnedAt: { type: Date, default: Date.now },
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', default: null },
    }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
