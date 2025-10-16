import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'user',
        phone: '',
        dateOfBirth: '',
        specialization: '',
        experience: '',
        membershipType: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...submitData } = formData;
            const response = await authAPI.register(submitData);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Join FitnessHub</h2>
                <p className="auth-subtitle">Create your account</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            required
                        >
                            <option value="user">Member</option>
                            <option value="trainer">Trainer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="date"
                            name="dateOfBirth"
                            placeholder="Date of Birth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {formData.userType === 'trainer' && (
                        <>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="specialization"
                                    placeholder="Specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="number"
                                    name="experience"
                                    placeholder="Years of Experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}
                    
                    {formData.userType === 'user' && (
                        <div className="form-group">
                            <select
                                name="membershipType"
                                value={formData.membershipType}
                                onChange={handleChange}
                            >
                                <option value="">Select Membership Type</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="vip">VIP</option>
                            </select>
                        </div>
                    )}
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;