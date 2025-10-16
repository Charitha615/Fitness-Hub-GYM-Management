const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in weeks
        required: true
    },
    caloriesPerDay: {
        type: Number,
        required: true
    },
    meals: [{
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        calories: {
            type: Number,
            required: true
        }
    }],
    targetAudience: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);