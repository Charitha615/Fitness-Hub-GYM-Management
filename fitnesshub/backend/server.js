const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://FitnessHub:FitnessHub@fitnesshub.a0j3kzv.mongodb.net/fitnesshub';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Add these routes
app.use('/api/trainer', require('./routes/trainer'));    
app.use('/api/user', require('./routes/user'));
app.use('/api/admin/subscription-plans', require('./routes/subscriptionPlans'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'FitnessHub API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});