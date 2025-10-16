import React, { useEffect } from 'react'; // Added useEffect import
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fixed: Added useEffect import above
    useEffect(() => {
        if (currentUser?.userType === 'admin') {
            navigate('/admin');
        } else if (currentUser?.userType === 'trainer') {
            navigate('/trainer');
        } else if (currentUser?.userType === 'user') {
            navigate('/user');
        }
    }, [currentUser, navigate]);

    const getUserTypeDisplay = (userType) => {
        const types = {
            admin: 'Administrator',
            trainer: 'Trainer',
            user: 'Member'
        };
        return types[userType] || userType;
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <h2>FitnessHub</h2>
                </div>
                <div className="nav-actions">
                    <span>Welcome, {currentUser?.name}</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h1>Welcome to FitnessHub Dashboard</h1>
                    <div className="user-info">
                        <p><strong>Name:</strong> {currentUser?.name}</p>
                        <p><strong>Email:</strong> {currentUser?.email}</p>
                        <p><strong>Role:</strong> {getUserTypeDisplay(currentUser?.userType)}</p>
                    </div>

                    <div className="dashboard-features">
                        <h3>Available Features</h3>
                        <div className="features-grid">
                            {currentUser?.userType === 'admin' && (
                                <>
                                    <div className="feature-card">User Management</div>
                                    <div className="feature-card">Trainer Management</div>
                                    <div className="feature-card">System Settings</div>
                                    <div className="feature-card">Reports & Analytics</div>
                                </>
                            )}
                            {currentUser?.userType === 'trainer' && (
                                <>
                                    <div className="feature-card">Member Management</div>
                                    <div className="feature-card">Workout Plans</div>
                                    <div className="feature-card">Schedule Sessions</div>
                                    <div className="feature-card">Progress Tracking</div>
                                </>
                            )}
                            {currentUser?.userType === 'user' && (
                                <>
                                    <div className="feature-card">My Workouts</div>
                                    <div className="feature-card">Book Sessions</div>
                                    <div className="feature-card">Progress Tracking</div>
                                    <div className="feature-card">Payment History</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;