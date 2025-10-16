const express = require('express');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Create subscription plan
router.post('/', adminAuth, async (req, res) => {
    try {
        const subscriptionPlan = new SubscriptionPlan({
            ...req.body,
            createdBy: req.user._id
        });

        await subscriptionPlan.save();
        res.status(201).json({ message: 'Subscription plan created successfully', subscriptionPlan });
    } catch (error) {
        console.error('Create subscription plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all subscription plans
router.get('/', adminAuth, async (req, res) => {
    try {
        const subscriptionPlans = await SubscriptionPlan.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(subscriptionPlans);
    } catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update subscription plan
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);

        if (!subscriptionPlan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        Object.assign(subscriptionPlan, req.body);
        await subscriptionPlan.save();

        res.json({ message: 'Subscription plan updated successfully', subscriptionPlan });
    } catch (error) {
        console.error('Update subscription plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete subscription plan
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const subscriptionPlan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

        if (!subscriptionPlan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        res.json({ message: 'Subscription plan deleted successfully' });
    } catch (error) {
        console.error('Delete subscription plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;