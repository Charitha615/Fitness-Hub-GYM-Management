const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
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
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    exercises: [{
        name: {
            type: String,
            required: true
        },
        sets: {
            type: Number,
            required: true
        },
        reps: {
            type: Number,
            required: true
        },
        restTime: {
            type: Number, // in seconds
            required: true
        },
        description: {
            type: String
        }
    }],
    targetAudience: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
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

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);