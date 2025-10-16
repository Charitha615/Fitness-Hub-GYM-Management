const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'fitnesshub_secret_key';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        if (user.userType === 'trainer' && !user.isApproved) {
            return res.status(401).json({ message: 'Trainer account pending approval' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {});
        
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = { auth, adminAuth };