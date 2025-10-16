const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },
    dietPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DietPlan'
    },
    workoutPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutPlan'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    transactionId: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);