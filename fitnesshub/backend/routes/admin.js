const express = require('express');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all users with filtering and pagination
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, userType, search } = req.query;
        
        const query = {};
        if (userType) query.userType = userType;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending trainer applications
router.get('/trainers/pending', adminAuth, async (req, res) => {
    try {
        const pendingTrainers = await User.find({
            userType: 'trainer',
            isApproved: false
        }).select('-password');

        res.json(pendingTrainers);
    } catch (error) {
        console.error('Get pending trainers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve trainer
router.put('/trainers/:id/approve', adminAuth, async (req, res) => {
    try {
        const trainer = await User.findOne({
            _id: req.params.id,
            userType: 'trainer'
        });

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        trainer.isApproved = true;
        trainer.approvedAt = new Date();
        trainer.approvedBy = req.user._id;
        await trainer.save();

        res.json({ message: 'Trainer approved successfully', trainer });
    } catch (error) {
        console.error('Approve trainer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user details
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { name, email, phone, dateOfBirth, specialization, experience, membershipType, isActive } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (specialization) user.specialization = specialization;
        if (experience) user.experience = experience;
        if (membershipType) user.membershipType = membershipType;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        const updatedUser = await User.findById(user._id).select('-password');
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user statistics for reports
router.get('/reports/statistics', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ userType: 'user' });
        const totalTrainers = await User.countDocuments({ userType: 'trainer' });
        const approvedTrainers = await User.countDocuments({ 
            userType: 'trainer', 
            isApproved: true 
        });
        const pendingTrainers = await User.countDocuments({ 
            userType: 'trainer', 
            isApproved: false 
        });
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });

        // Monthly registration statistics
        const monthlyStats = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            totalUsers,
            totalTrainers,
            approvedTrainers,
            pendingTrainers,
            activeUsers,
            inactiveUsers,
            monthlyStats
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile by ID
router.get('/users/:id/profile', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;