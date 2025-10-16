const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = 'fitnesshub_secret_key';

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, userType, phone, dateOfBirth, specialization, experience, membershipType } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            userType: userType || 'user',
            phone,
            dateOfBirth,
            specialization,
            experience,
            membershipType
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({ message: 'Account is deactivated' });
        }

        // Check if trainer is approved
        if (user.userType === 'trainer' && !user.isApproved) {
            return res.status(400).json({ message: 'Your account is pending admin approval' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;