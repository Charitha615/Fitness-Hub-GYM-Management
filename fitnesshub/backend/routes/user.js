const express = require('express');
const mongoose = require('mongoose'); // Add this import
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const DietPlan = require('../models/DietPlan');
const WorkoutPlan = require('../models/WorkoutPlan');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is a regular user
const userAuth = async (req, res, next) => {
    try {
        if (req.user.userType !== 'user') {
            return res.status(403).json({ message: 'Access denied. Users only.' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Get all approved trainers with their plans
router.get('/trainers', auth, userAuth, async (req, res) => {
    try {
        const { search, specialization } = req.query;
        
        const query = {
            userType: 'trainer',
            isApproved: true,
            isActive: true
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } }
            ];
        }

        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }

        const trainers = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        // Get plans for each trainer
        const trainersWithPlans = await Promise.all(
            trainers.map(async (trainer) => {
                const dietPlans = await DietPlan.find({
                    trainer: trainer._id,
                    isActive: true
                });

                const workoutPlans = await WorkoutPlan.find({
                    trainer: trainer._id,
                    isActive: true
                });

                const subscriberCount = await UserSubscription.countDocuments({
                    trainer: trainer._id,
                    paymentStatus: 'completed'
                });

                return {
                    ...trainer.toObject(),
                    dietPlans,
                    workoutPlans,
                    subscriberCount
                };
            })
        );

        res.json(trainersWithPlans);
    } catch (error) {
        console.error('Get trainers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subscription plans
router.get('/subscription-plans', auth, userAuth, async (req, res) => {
    try {
        const subscriptionPlans = await SubscriptionPlan.find({ isActive: true });
        res.json(subscriptionPlans);
    } catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create subscription
router.post('/subscribe', auth, userAuth, async (req, res) => {
    try {
        const { trainerId, subscriptionPlanId, dietPlanId, workoutPlanId } = req.body;

        const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
        if (!subscriptionPlan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        const trainer = await User.findOne({
            _id: trainerId,
            userType: 'trainer',
            isApproved: true
        });
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + subscriptionPlan.duration);

        const userSubscription = new UserSubscription({
            user: req.user._id,
            trainer: trainerId,
            subscriptionPlan: subscriptionPlanId,
            dietPlan: dietPlanId,
            workoutPlan: workoutPlanId,
            startDate,
            endDate,
            amount: subscriptionPlan.price,
            paymentStatus: 'completed', // In real app, integrate with payment gateway
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        });

        await userSubscription.save();

        // Populate the response
        const populatedSubscription = await UserSubscription.findById(userSubscription._id)
            .populate('trainer', 'name email specialization')
            .populate('subscriptionPlan', 'name duration features')
            .populate('dietPlan', 'title duration')
            .populate('workoutPlan', 'title duration');

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: populatedSubscription
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's active subscriptions with full details using aggregation
router.get('/my-subscriptions', auth, userAuth, async (req, res) => {
    try {
        const subscriptions = await UserSubscription.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user._id) // Use new keyword
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'trainer',
                    foreignField: '_id',
                    as: 'trainer'
                }
            },
            {
                $unwind: '$trainer'  
            },
            {
                $lookup: {
                    from: 'subscriptionplans',  
                    localField: 'subscriptionPlan',
                    foreignField: '_id',
                    as: 'subscriptionPlan'
                }
            },
            {
                $unwind: '$subscriptionPlan'
            },
            {
                $lookup: {
                    from: 'dietplans',
                    localField: 'dietPlan',
                    foreignField: '_id',
                    as: 'dietPlan'
                }
            },
            {
                $unwind: {
                    path: '$dietPlan',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'workoutplans',
                    localField: 'workoutPlan',
                    foreignField: '_id',
                    as: 'workoutPlan'
                }
            },
            {
                $unwind: {
                    path: '$workoutPlan',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'dietplans',
                    localField: 'trainer._id',
                    foreignField: 'trainer', // Changed from 'createdBy' to 'trainer'
                    as: 'trainerDietPlans'
                }
            },
            {
                $lookup: {
                    from: 'workoutplans',
                    localField: 'trainer._id',
                    foreignField: 'trainer', // Changed from 'createdBy' to 'trainer'
                    as: 'trainerWorkoutPlans'
                }
            },
            {
                $project: {
                    'trainer.password': 0,
                    'trainerDietPlans.trainer': 0,
                    'trainerWorkoutPlans.trainer': 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.json(subscriptions);
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;