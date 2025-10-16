import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import './UserDashboard.css';

const UserDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('trainers');
    const [trainers, setTrainers] = useState([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [mySubscriptions, setMySubscriptions] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'trainers') {
            loadTrainers();
        } else if (activeTab === 'my-subscriptions') {
            loadMySubscriptions();
        }
    }, [activeTab]);

    const loadTrainers = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getTrainers();
            setTrainers(response.data);
        } catch (error) {
            console.error('Error loading trainers:', error);
            alert('Failed to load trainers');
        } finally {
            setLoading(false);
        }
    };

    const loadMySubscriptions = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getMySubscriptions();
            setMySubscriptions(response.data);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            alert('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptionPlans = async () => {
        try {
            const response = await userAPI.getSubscriptionPlans();
            setSubscriptionPlans(response.data);
        } catch (error) {
            console.error('Error loading subscription plans:', error);
            alert('Failed to load subscription plans');
        }
    };

    const handleSubscribe = async (trainer) => {
        setSelectedTrainer(trainer);
        await loadSubscriptionPlans();
        setShowSubscriptionModal(true);
    };

    const handleConfirmSubscription = async (subscriptionPlan, dietPlan = null, workoutPlan = null) => {
        try {
            const subscriptionData = {
                trainerId: selectedTrainer._id,
                subscriptionPlanId: subscriptionPlan._id,
                dietPlanId: dietPlan?._id || null,
                workoutPlanId: workoutPlan?._id || null
            };

            const response = await userAPI.subscribe(subscriptionData);
            alert('Subscription successful!');
            setShowSubscriptionModal(false);
            setSelectedTrainer(null);
            setSelectedPlan(null);
            loadMySubscriptions();
        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('Failed to create subscription');
        }
    };

    const renderTrainers = () => (
        <div className="trainers-listing">
            <h2>Available Trainers</h2>
            <div className="trainers-grid">
                {trainers.map(trainer => (
                    <div key={trainer._id} className="trainer-card">
                        <div className="trainer-header">
                            <h3>{trainer.name}</h3>
                            <span className="specialization">{trainer.specialization}</span>
                        </div>
                        
                        <div className="trainer-info">
                            <p><strong>Experience:</strong> {trainer.experience} years</p>
                            <p><strong>Email:</strong> {trainer.email}</p>
                            <p><strong>Phone:</strong> {trainer.phone || 'N/A'}</p>
                            <p><strong>Subscribers:</strong> {trainer.subscriberCount}</p>
                        </div>

                        <div className="plans-preview">
                            <h4>Available Plans</h4>
                            
                            <div className="diet-plans">
                                <h5>Diet Plans ({trainer.dietPlans.length})</h5>
                                {trainer.dietPlans.slice(0, 2).map(plan => (
                                    <div key={plan._id} className="plan-preview">
                                        <strong>{plan.title}</strong>
                                        <span>${plan.price} • {plan.duration} weeks</span>
                                    </div>
                                ))}
                            </div>

                            <div className="workout-plans">
                                <h5>Workout Plans ({trainer.workoutPlans.length})</h5>
                                {trainer.workoutPlans.slice(0, 2).map(plan => (
                                    <div key={plan._id} className="plan-preview">
                                        <strong>{plan.title}</strong>
                                        <span>${plan.price} • {plan.duration} weeks</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            className="btn-subscribe"
                            onClick={() => handleSubscribe(trainer)}
                        >
                            Subscribe Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMySubscriptions = () => (
        <div className="my-subscriptions">
            <h2>My Subscriptions</h2>
            {mySubscriptions.length === 0 ? (
                <p>You don't have any active subscriptions.</p>
            ) : (
                <div className="subscriptions-grid">
                    {mySubscriptions.map(subscription => (
                        <div key={subscription._id} className="subscription-card">
                            <div className="subscription-header">
                                <h3>Trainer: {subscription.trainer.name}</h3>
                                <span className={`status-badge ${subscription.status}`}>
                                    {subscription.status}
                                </span>
                            </div>
                            
                            <div className="subscription-details">
                                <p><strong>Plan:</strong> {subscription.subscriptionPlan.name}</p>
                                <p><strong>Duration:</strong> {subscription.subscriptionPlan.duration} days</p>
                                <p><strong>Amount:</strong> ${subscription.amount}</p>
                                <p><strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}</p>
                                <p><strong>End Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
                                
                                {subscription.dietPlan && (
                                    <p><strong>Diet Plan:</strong> {subscription.dietPlan.title}</p>
                                )}
                                
                                {subscription.workoutPlan && (
                                    <p><strong>Workout Plan:</strong> {subscription.workoutPlan.title}</p>
                                )}
                            </div>

                            <div className="plan-features">
                                <h4>Plan Features:</h4>
                                <ul>
                                    {subscription.subscriptionPlan.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSubscriptionModal = () => (
        <div className="modal-overlay">
            <div className="modal-content large">
                <h3>Subscribe to {selectedTrainer?.name}</h3>
                
                <div className="subscription-plans">
                    <h4>Choose a Subscription Plan</h4>
                    <div className="plans-grid">
                        {subscriptionPlans.map(plan => (
                            <div 
                                key={plan._id} 
                                className={`plan-card ${selectedPlan?._id === plan._id ? 'selected' : ''}`}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                <h5>{plan.name}</h5>
                                <p className="plan-price">${plan.price}</p>
                                <p className="plan-duration">{plan.duration} days</p>
                                <ul className="plan-features">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedPlan && selectedTrainer && (
                    <div className="trainer-plans">
                        <h4>Select Trainer Plans (Optional)</h4>
                        
                        <div className="plan-selection">
                            <div className="diet-plan-selection">
                                <h5>Diet Plan</h5>
                                <select onChange={(e) => {
                                    const planId = e.target.value;
                                    const plan = planId ? selectedTrainer.dietPlans.find(p => p._id === planId) : null;
                                    // Handle diet plan selection
                                }}>
                                    <option value="">No Diet Plan</option>
                                    {selectedTrainer.dietPlans.map(plan => (
                                        <option key={plan._id} value={plan._id}>
                                            {plan.title} - ${plan.price}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="workout-plan-selection">
                                <h5>Workout Plan</h5>
                                <select onChange={(e) => {
                                    const planId = e.target.value;
                                    const plan = planId ? selectedTrainer.workoutPlans.find(p => p._id === planId) : null;
                                    // Handle workout plan selection
                                }}>
                                    <option value="">No Workout Plan</option>
                                    {selectedTrainer.workoutPlans.map(plan => (
                                        <option key={plan._id} value={plan._id}>
                                            {plan.title} - ${plan.price}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="subscription-summary">
                    <h4>Order Summary</h4>
                    <div className="summary-details">
                        <p>Subscription Plan: {selectedPlan?.name} - ${selectedPlan?.price}</p>
                        <p>Total Amount: ${selectedPlan?.price}</p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button 
                        className="btn-primary"
                        onClick={() => handleConfirmSubscription(selectedPlan)}
                        disabled={!selectedPlan}
                    >
                        Confirm Subscription
                    </button>
                    <button 
                        className="btn-secondary"
                        onClick={() => {
                            setShowSubscriptionModal(false);
                            setSelectedPlan(null);
                            setSelectedTrainer(null);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="user-container">
            <nav className="user-nav">
                <div className="nav-brand">
                    <h2>FitnessHub Member</h2>
                </div>
                <div className="nav-actions">
                    <span>Welcome, {currentUser?.name}</span>
                    <button onClick={logout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="user-content">
                <div className="sidebar">
                    <button 
                        className={activeTab === 'trainers' ? 'active' : ''}
                        onClick={() => setActiveTab('trainers')}
                    >
                        Find Trainers
                    </button>
                    <button 
                        className={activeTab === 'my-subscriptions' ? 'active' : ''}
                        onClick={() => setActiveTab('my-subscriptions')}
                    >
                        My Subscriptions
                    </button>
                </div>

                <div className="main-content">
                    {loading && <div className="loading">Loading...</div>}
                    
                    {activeTab === 'trainers' && renderTrainers()}
                    {activeTab === 'my-subscriptions' && renderMySubscriptions()}
                </div>
            </div>

            {showSubscriptionModal && renderSubscriptionModal()}
        </div>
    );
};

export default UserDashboard;