const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in days
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    features: [{
        type: String,
        required: true
    }],
    planType: {
        type: String,
        enum: ['basic', 'premium', 'vip', 'custom'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);