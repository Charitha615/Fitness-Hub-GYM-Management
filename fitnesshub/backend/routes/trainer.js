const express = require('express');
const DietPlan = require('../models/DietPlan');
const WorkoutPlan = require('../models/WorkoutPlan');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is a trainer
const trainerAuth = async (req, res, next) => {
    try {
        if (req.user.userType !== 'trainer') {
            return res.status(403).json({ message: 'Access denied. Trainers only.' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Diet Plan Routes
router.post('/diet-plans', auth, trainerAuth, async (req, res) => {
    try {
        const dietPlan = new DietPlan({
            ...req.body,
            trainer: req.user._id
        });

        await dietPlan.save();
        res.status(201).json({ message: 'Diet plan created successfully', dietPlan });
    } catch (error) {
        console.error('Create diet plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/diet-plans', auth, trainerAuth, async (req, res) => {
    try {
        const dietPlans = await DietPlan.find({ trainer: req.user._id })
            .sort({ createdAt: -1 });
        res.json(dietPlans);
    } catch (error) {
        console.error('Get diet plans error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/diet-plans/:id', auth, trainerAuth, async (req, res) => {
    try {
        const dietPlan = await DietPlan.findOne({
            _id: req.params.id,
            trainer: req.user._id
        });

        if (!dietPlan) {
            return res.status(404).json({ message: 'Diet plan not found' });
        }

        Object.assign(dietPlan, req.body);
        await dietPlan.save();

        res.json({ message: 'Diet plan updated successfully', dietPlan });
    } catch (error) {
        console.error('Update diet plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/diet-plans/:id', auth, trainerAuth, async (req, res) => {
    try {
        const dietPlan = await DietPlan.findOneAndDelete({
            _id: req.params.id,
            trainer: req.user._id
        });

        if (!dietPlan) {
            return res.status(404).json({ message: 'Diet plan not found' });
        }

        res.json({ message: 'Diet plan deleted successfully' });
    } catch (error) {
        console.error('Delete diet plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Workout Plan Routes
router.post('/workout-plans', auth, trainerAuth, async (req, res) => {
    try {
        const workoutPlan = new WorkoutPlan({
            ...req.body,
            trainer: req.user._id
        });

        await workoutPlan.save();
        res.status(201).json({ message: 'Workout plan created successfully', workoutPlan });
    } catch (error) {
        console.error('Create workout plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/workout-plans', auth, trainerAuth, async (req, res) => {
    try {
        const workoutPlans = await WorkoutPlan.find({ trainer: req.user._id })
            .sort({ createdAt: -1 });
        res.json(workoutPlans);
    } catch (error) {
        console.error('Get workout plans error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/workout-plans/:id', auth, trainerAuth, async (req, res) => {
    try {
        const workoutPlan = await WorkoutPlan.findOne({
            _id: req.params.id,
            trainer: req.user._id
        });

        if (!workoutPlan) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        Object.assign(workoutPlan, req.body);
        await workoutPlan.save();

        res.json({ message: 'Workout plan updated successfully', workoutPlan });
    } catch (error) {
        console.error('Update workout plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/workout-plans/:id', auth, trainerAuth, async (req, res) => {
    try {
        const workoutPlan = await WorkoutPlan.findOneAndDelete({
            _id: req.params.id,
            trainer: req.user._id
        });

        if (!workoutPlan) {
            return res.status(404).json({ message: 'Workout plan not found' });
        }

        res.json({ message: 'Workout plan deleted successfully' });
    } catch (error) {
        console.error('Delete workout plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get trainer's subscribers and statistics
router.get('/subscribers', auth, trainerAuth, async (req, res) => {
    try {
        const subscriptions = await UserSubscription.find({ 
            trainer: req.user._id,
            paymentStatus: 'completed'
        })
        .populate('user', 'name email phone')
        .populate('subscriptionPlan', 'name duration price')
        .populate('dietPlan', 'title')
        .populate('workoutPlan', 'title')
        .sort({ createdAt: -1 });

        const totalSubscribers = await UserSubscription.countDocuments({
            trainer: req.user._id,
            paymentStatus: 'completed'
        });

        const totalRevenue = await UserSubscription.aggregate([
            {
                $match: {
                    trainer: req.user._id,
                    paymentStatus: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const activeSubscribers = await UserSubscription.countDocuments({
            trainer: req.user._id,
            paymentStatus: 'completed',
            status: 'active',
            endDate: { $gte: new Date() }
        });

        res.json({
            subscriptions,
            statistics: {
                totalSubscribers,
                totalRevenue: totalRevenue[0]?.total || 0,
                activeSubscribers
            }
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get trainer profile for public view
router.get('/profile/:id', async (req, res) => {
    try {
        const trainer = await User.findOne({
            _id: req.params.id,
            userType: 'trainer',
            isApproved: true,
            isActive: true
        }).select('-password');

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        const dietPlans = await DietPlan.find({
            trainer: req.params.id,
            isActive: true
        });

        const workoutPlans = await WorkoutPlan.find({
            trainer: req.params.id,
            isActive: true
        });

        const subscriberCount = await UserSubscription.countDocuments({
            trainer: req.params.id,
            paymentStatus: 'completed'
        });

        res.json({
            trainer,
            dietPlans,
            workoutPlans,
            subscriberCount
        });
    } catch (error) {
        console.error('Get trainer profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;