import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import './UserDashboard.css';
import { generateSubscriptionPDF } from '../../utils/subscriptionPdfGenerator.js';

const UserDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('trainers');
    const [trainers, setTrainers] = useState([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [mySubscriptions, setMySubscriptions] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDietPlan, setSelectedDietPlan] = useState(null);
    const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState(null);

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
        setSelectedDietPlan(null);
        setSelectedWorkoutPlan(null);
        await loadSubscriptionPlans();
        setShowSubscriptionModal(true);
    };

    const handleConfirmSubscription = async () => {
        try {
            const subscriptionData = {
                trainerId: selectedTrainer._id,
                subscriptionPlanId: selectedPlan._id,
                dietPlanId: selectedDietPlan?._id || null,
                workoutPlanId: selectedWorkoutPlan?._id || null
            };

            await userAPI.subscribe(subscriptionData);
            alert('Subscription successful!');
            setShowSubscriptionModal(false);
            setSelectedTrainer(null);
            setSelectedPlan(null);
            setSelectedDietPlan(null);
            setSelectedWorkoutPlan(null);
            loadMySubscriptions();
        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('Failed to create subscription');
        }
    };

    const handleDownloadSubscriptionPDF = async (subscription) => {
        try {
            await generateSubscriptionPDF(subscription);
            alert('Subscription PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating subscription PDF:', error);
            alert('Failed to download subscription PDF');
        }
    };

    const handleDownloadAllSubscriptionsPDF = async () => {
        if (mySubscriptions.length === 0) {
            alert('No subscriptions available to download');
            return;
        }

        try {
            await generateSubscriptionPDF(mySubscriptions, 'All My Subscriptions');
            alert('All subscriptions PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating all subscriptions PDF:', error);
            alert('Failed to download subscriptions PDF');
        }
    };

    const filteredTrainers = trainers.filter(trainer =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateTotalPrice = () => {
        let total = selectedPlan?.price || 0;
        if (selectedDietPlan) total += selectedDietPlan.price;
        if (selectedWorkoutPlan) total += selectedWorkoutPlan.price;
        return total;
    };

    const renderTrainers = () => (
        <div className="modern-home">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Find Your Perfect Fitness Coach</h1>
                    <p>Connect with certified trainers and achieve your fitness goals</p>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search trainers by name or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="search-btn">
                            <i className="search-icon">🔍</i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="stat-card">
                    <h3>{trainers.length}+</h3>
                    <p>Certified Trainers</p>
                </div>
                <div className="stat-card">
                    <h3>100%</h3>
                    <p>Verified Professionals</p>
                </div>
                <div className="stat-card">
                    <h3>24/7</h3>
                    <p>Support Available</p>
                </div>
            </div>

            {/* Trainers Grid */}
            <div className="trainers-section">
                <h2>Available Trainers</h2>
                {loading ? (
                    <div className="loading-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="trainer-card-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line short"></div>
                                    <div className="skeleton-line medium"></div>
                                    <div className="skeleton-line long"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="trainers-grid-modern">
                        {filteredTrainers.map(trainer => (
                            <div key={trainer._id} className="trainer-card-modern">
                                <div className="trainer-avatar">
                                    {trainer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="trainer-info-modern">
                                    <h3>{trainer.name}</h3>
                                    <span className="specialization-badge">{trainer.specialization}</span>
                                    <p className="experience">⭐ {trainer.experience} years experience</p>
                                    <p className="subscribers">{trainer.subscriberCount} subscribers</p>
                                    
                                    <div className="plans-count">
                                        <div className="plan-count-item">
                                            <span>🥗</span>
                                            {trainer.dietPlans.length} Diet Plans
                                        </div>
                                        <div className="plan-count-item">
                                            <span>💪</span>
                                            {trainer.workoutPlans.length} Workout Plans
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="subscribe-btn-modern"
                                    onClick={() => handleSubscribe(trainer)}
                                >
                                    View Plans & Subscribe
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderMySubscriptions = () => (
        <div className="subscriptions-modern">
            <div className="subscriptions-header">
                <div className="header-content">
                    <h1>My Subscriptions</h1>
                    <p>Manage your active fitness plans and track your progress</p>
                </div>
                {mySubscriptions.length > 0 && (
                    <button 
                        className="btn-download-all"
                        onClick={handleDownloadAllSubscriptionsPDF}
                    >
                        📄 Download All as PDF
                    </button>
                )}
            </div>

            {mySubscriptions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No Active Subscriptions</h3>
                    <p>Start your fitness journey by subscribing to a trainer's plan</p>
                    <button 
                        className="btn-primary"
                        onClick={() => setActiveTab('trainers')}
                    >
                        Find Trainers
                    </button>
                </div>
            ) : (
                <div className="subscriptions-grid-modern">
                    {mySubscriptions.map(subscription => (
                        <div 
                            key={subscription._id} 
                            className={`subscription-card-modern ${subscription.status}`}
                        >
                            <div className="subscription-header-modern">
                                <div className="trainer-avatar-small">
                                    {subscription.trainer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="trainer-details">
                                    <h3>{subscription.trainer.name}</h3>
                                    <p>{subscription.trainer.specialization}</p>
                                </div>
                                <span className={`status-badge-modern ${subscription.status}`}>
                                    {subscription.status}
                                </span>
                            </div>
                            
                            <div className="subscription-body">
                                <div className="plan-info">
                                    <h4>{subscription.subscriptionPlan.name}</h4>
                                    <p className="plan-duration">{subscription.subscriptionPlan.duration} days</p>
                                    <p className="plan-description">{subscription.subscriptionPlan.description}</p>
                                </div>
                                
                                <div className="included-plans">
                                    {subscription.trainerDietPlans && subscription.trainerDietPlans.length > 0 && (
                                        <div className="included-plan-category">
                                            <h5>🥗 Diet Plans ({subscription.trainerDietPlans.length})</h5>
                                            {subscription.trainerDietPlans.slice(0, 2).map(plan => (
                                                <div key={plan._id} className="included-plan-item">
                                                    <span>{plan.title}</span>
                                                    <small>${plan.price} • {plan.duration} weeks</small>
                                                </div>
                                            ))}
                                            {subscription.trainerDietPlans.length > 2 && (
                                                <div className="more-plans">+{subscription.trainerDietPlans.length - 2} more</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {subscription.trainerWorkoutPlans && subscription.trainerWorkoutPlans.length > 0 && (
                                        <div className="included-plan-category">
                                            <h5>💪 Workout Plans ({subscription.trainerWorkoutPlans.length})</h5>
                                            {subscription.trainerWorkoutPlans.slice(0, 2).map(plan => (
                                                <div key={plan._id} className="included-plan-item">
                                                    <span>{plan.title}</span>
                                                    <small>${plan.price} • {plan.duration} weeks</small>
                                                </div>
                                            ))}
                                            {subscription.trainerWorkoutPlans.length > 2 && (
                                                <div className="more-plans">+{subscription.trainerWorkoutPlans.length - 2} more</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="subscription-dates">
                                    <div className="date-item">
                                        <span>Starts:</span>
                                        <strong>{new Date(subscription.startDate).toLocaleDateString()}</strong>
                                    </div>
                                    <div className="date-item">
                                        <span>Ends:</span>
                                        <strong>{new Date(subscription.endDate).toLocaleDateString()}</strong>
                                    </div>
                                </div>

                                <div className="payment-info">
                                    <div className="payment-status">
                                        <span>Payment:</span>
                                        <span className={`status-${subscription.paymentStatus}`}>
                                            {subscription.paymentStatus}
                                        </span>
                                    </div>
                                    {subscription.transactionId && (
                                        <div className="transaction-id">
                                            <span>Transaction ID:</span>
                                            <small>{subscription.transactionId}</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="subscription-footer">
                                <span className="price">${subscription.amount}</span>
                                <div className="subscription-actions">
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => setSelectedSubscription(subscription)}
                                    >
                                        View Details →
                                    </button>
                                    <button 
                                        className="download-pdf-btn"
                                        onClick={() => handleDownloadSubscriptionPDF(subscription)}
                                        title="Download as PDF"
                                    >
                                        📄
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Enhanced Subscription Detail Modal */}
            {selectedSubscription && (
                <div className="modal-overlay">
                    <div className="modal-content x-large">
                        <div className="modal-header">
                            <h2>Subscription Details</h2>
                            <div className="modal-header-actions">
                                <button 
                                    className="btn-download-pdf"
                                    onClick={() => handleDownloadSubscriptionPDF(selectedSubscription)}
                                >
                                    📄 Download PDF
                                </button>
                                <button 
                                    className="close-btn"
                                    onClick={() => setSelectedSubscription(null)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="subscription-detail">
                            {/* Trainer Information */}
                            <div className="detail-section">
                                <h3>🧑‍🏫 Trainer Information</h3>
                                <div className="trainer-info-detail">
                                    <div className="trainer-avatar-large">
                                        {selectedSubscription.trainer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="trainer-details-comprehensive">
                                        <h4>{selectedSubscription.trainer.name}</h4>
                                        <p><strong>Specialization:</strong> {selectedSubscription.trainer.specialization}</p>
                                        <p><strong>Experience:</strong> {selectedSubscription.trainer.experience} years</p>
                                        <p><strong>Email:</strong> {selectedSubscription.trainer.email}</p>
                                        <p><strong>Phone:</strong> {selectedSubscription.trainer.phone}</p>
                                        <p><strong>Status:</strong> 
                                            <span className={`status-badge-modern ${selectedSubscription.trainer.isActive ? 'active' : 'inactive'}`}>
                                                {selectedSubscription.trainer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Plan Details */}
                            <div className="detail-section">
                                <h3>📋 Subscription Plan</h3>
                                <div className="plan-detail-comprehensive">
                                    <div className="plan-header-detail">
                                        <h4>{selectedSubscription.subscriptionPlan.name}</h4>
                                        <span className="plan-type-badge">{selectedSubscription.subscriptionPlan.planType}</span>
                                    </div>
                                    <p><strong>Description:</strong> {selectedSubscription.subscriptionPlan.description}</p>
                                    <div className="plan-stats">
                                        <div className="plan-stat">
                                            <span>Duration:</span>
                                            <strong>{selectedSubscription.subscriptionPlan.duration} days</strong>
                                        </div>
                                        <div className="plan-stat">
                                            <span>Amount:</span>
                                            <strong>${selectedSubscription.amount}</strong>
                                        </div>
                                        <div className="plan-stat">
                                            <span>Status:</span>
                                            <span className={`status-badge-modern ${selectedSubscription.status}`}>
                                                {selectedSubscription.status}
                                            </span>
                                        </div>
                                        <div className="plan-stat">
                                            <span>Payment:</span>
                                            <span className={`status-${selectedSubscription.paymentStatus}`}>
                                                {selectedSubscription.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="plan-features-detail">
                                        <h5>Plan Features:</h5>
                                        <div className="features-grid">
                                            {selectedSubscription.subscriptionPlan.features.map((feature, index) => (
                                                <div key={index} className="feature-item">
                                                    ✓ {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Diet Plans Section */}
                            {selectedSubscription.trainerDietPlans && selectedSubscription.trainerDietPlans.length > 0 && (
                                <div className="detail-section">
                                    <h3>🥗 Diet Plans</h3>
                                    <div className="plans-grid-detail">
                                        {selectedSubscription.trainerDietPlans.map(plan => (
                                            <div key={plan._id} className="plan-card-detail">
                                                <div className="plan-card-header">
                                                    <h4>{plan.title}</h4>
                                                    <span className="plan-price">${plan.price}</span>
                                                </div>
                                                <p className="plan-description">{plan.description}</p>
                                                <div className="plan-meta">
                                                    <span><strong>Duration:</strong> {plan.duration} weeks</span>
                                                    <span><strong>Calories/Day:</strong> {plan.caloriesPerDay}</span>
                                                    <span><strong>Target:</strong> {plan.targetAudience}</span>
                                                </div>
                                                
                                                <div className="meals-section">
                                                    <h5>Daily Meals:</h5>
                                                    <div className="meals-grid">
                                                        {plan.meals.map((meal, index) => (
                                                            <div key={index} className="meal-item">
                                                                <span className="meal-type">{meal.mealType}</span>
                                                                <span className="meal-description">{meal.description}</span>
                                                                <span className="meal-calories">{meal.calories} cal</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Workout Plans Section */}
                            {selectedSubscription.trainerWorkoutPlans && selectedSubscription.trainerWorkoutPlans.length > 0 && (
                                <div className="detail-section">
                                    <h3>💪 Workout Plans</h3>
                                    <div className="plans-grid-detail">
                                        {selectedSubscription.trainerWorkoutPlans.map(plan => (
                                            <div key={plan._id} className="plan-card-detail">
                                                <div className="plan-card-header">
                                                    <h4>{plan.title}</h4>
                                                    <span className="plan-price">${plan.price}</span>
                                                </div>
                                                <p className="plan-description">{plan.description}</p>
                                                <div className="plan-meta">
                                                    <span><strong>Duration:</strong> {plan.duration} weeks</span>
                                                    <span><strong>Difficulty:</strong> {plan.difficulty}</span>
                                                    <span><strong>Target:</strong> {plan.targetAudience}</span>
                                                </div>
                                                
                                                <div className="exercises-section">
                                                    <h5>Exercises:</h5>
                                                    <div className="exercises-list">
                                                        {plan.exercises.map((exercise, index) => (
                                                            <div key={index} className="exercise-item">
                                                                <div className="exercise-header">
                                                                    <span className="exercise-name">{exercise.name}</span>
                                                                    <span className="exercise-sets-reps">{exercise.sets} sets × {exercise.reps} reps</span>
                                                                </div>
                                                                <p className="exercise-description">{exercise.description}</p>
                                                                <div className="exercise-meta">
                                                                    <span>Rest: {exercise.restTime}s</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subscription Timeline and Payment */}
                            <div className="detail-section">
                                <h3>📅 Subscription Timeline</h3>
                                <div className="timeline-comprehensive">
                                    <div className="timeline-item-comprehensive">
                                        <div className="timeline-date">
                                            <strong>Start Date</strong>
                                            <span>{new Date(selectedSubscription.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="timeline-date">
                                            <strong>End Date</strong>
                                            <span>{new Date(selectedSubscription.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="timeline-date">
                                            <strong>Days Remaining</strong>
                                            <span>{Math.ceil((new Date(selectedSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="payment-details">
                                    <h5>Payment Information</h5>
                                    <div className="payment-info-grid">
                                        <div className="payment-info-item">
                                            <span>Transaction ID:</span>
                                            <code>{selectedSubscription.transactionId}</code>
                                        </div>
                                        <div className="payment-info-item">
                                            <span>Payment Status:</span>
                                            <span className={`payment-status-badge ${selectedSubscription.paymentStatus}`}>
                                                {selectedSubscription.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="payment-info-item">
                                            <span>Subscription Date:</span>
                                            <span>{new Date(selectedSubscription.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions-modern">
                            <button 
                                className="btn-secondary"
                                onClick={() => setSelectedSubscription(null)}
                            >
                                Close
                            </button>
                            <button 
                                className="btn-download-pdf"
                                onClick={() => handleDownloadSubscriptionPDF(selectedSubscription)}
                            >
                                📄 Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSubscriptionModal = () => (
        <div className="modal-overlay">
            <div className="modal-content large">
                <div className="modal-header">
                    <h2>Subscribe to {selectedTrainer?.name}</h2>
                    <button 
                        className="close-btn"
                        onClick={() => {
                            setShowSubscriptionModal(false);
                            setSelectedPlan(null);
                            setSelectedTrainer(null);
                        }}
                    >
                        ×
                    </button>
                </div>
                
                <div className="subscription-flow">
                    <div className="subscription-plans-modern">
                        <h3>Choose Your Subscription Plan</h3>
                        <div className="plans-grid-modern">
                            {subscriptionPlans.map(plan => (
                                <div 
                                    key={plan._id} 
                                    className={`plan-card-modern ${selectedPlan?._id === plan._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    <div className="plan-header">
                                        <h4>{plan.name}</h4>
                                        <div className="plan-price">${plan.price}</div>
                                    </div>
                                    <p className="plan-duration">{plan.duration} days access</p>
                                    <ul className="plan-features-modern">
                                        {plan.features.map((feature, index) => (
                                            <li key={index}>✓ {feature}</li>
                                        ))}
                                    </ul>
                                    <div className="plan-selector">
                                        {selectedPlan?._id === plan._id ? 'Selected' : 'Select Plan'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedPlan && selectedTrainer && (
                        <>
                            <div className="trainer-plans-modern">
                                <h3>Add Trainer Plans (Optional)</h3>
                                <div className="plan-selection-modern">
                                    <div className="plan-option">
                                        <h4>🥗 Diet Plans</h4>
                                        <select 
                                            value={selectedDietPlan?._id || ''}
                                            onChange={(e) => {
                                                const planId = e.target.value;
                                                const plan = planId ? selectedTrainer.dietPlans.find(p => p._id === planId) : null;
                                                setSelectedDietPlan(plan);
                                            }}
                                            className="plan-select"
                                        >
                                            <option value="">No Diet Plan</option>
                                            {selectedTrainer.dietPlans.map(plan => (
                                                <option key={plan._id} value={plan._id}>
                                                    {plan.title} - ${plan.price} ({plan.duration} weeks)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="plan-option">
                                        <h4>💪 Workout Plans</h4>
                                        <select 
                                            value={selectedWorkoutPlan?._id || ''}
                                            onChange={(e) => {
                                                const planId = e.target.value;
                                                const plan = planId ? selectedTrainer.workoutPlans.find(p => p._id === planId) : null;
                                                setSelectedWorkoutPlan(plan);
                                            }}
                                            className="plan-select"
                                        >
                                            <option value="">No Workout Plan</option>
                                            {selectedTrainer.workoutPlans.map(plan => (
                                                <option key={plan._id} value={plan._id}>
                                                    {plan.title} - ${plan.price} ({plan.duration} weeks)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="order-summary-modern">
                                <h3>Order Summary</h3>
                                <div className="summary-items">
                                    <div className="summary-item">
                                        <span>Subscription Plan:</span>
                                        <span>${selectedPlan.price}</span>
                                    </div>
                                    {selectedDietPlan && (
                                        <div className="summary-item">
                                            <span>Diet Plan:</span>
                                            <span>${selectedDietPlan.price}</span>
                                        </div>
                                    )}
                                    {selectedWorkoutPlan && (
                                        <div className="summary-item">
                                            <span>Workout Plan:</span>
                                            <span>${selectedWorkoutPlan.price}</span>
                                        </div>
                                    )}
                                    <div className="summary-total">
                                        <span>Total Amount:</span>
                                        <span>${calculateTotalPrice()}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="modal-actions-modern">
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
                        <button 
                            className="btn-primary-large"
                            onClick={handleConfirmSubscription}
                            disabled={!selectedPlan}
                        >
                            Complete Subscription - ${calculateTotalPrice()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="user-container-modern">
            <nav className="user-nav-modern">
                <div className="nav-brand-modern">
                    <div className="logo">💪</div>
                    <h2>FitnessHub</h2>
                </div>
                <div className="nav-actions-modern">
                    <div className="user-welcome">
                        <span>Welcome, {currentUser?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button-modern">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="user-content-modern">
                <div className="sidebar-modern">
                    <button 
                        className={`nav-item ${activeTab === 'trainers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trainers')}
                    >
                        <span className="nav-icon">👥</span>
                        Find Trainers
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'my-subscriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-subscriptions')}
                    >
                        <span className="nav-icon">📋</span>
                        My Subscriptions
                    </button>
                </div>

                <div className="main-content-modern">
                    {loading && <div className="loading-modern">Loading...</div>}
                    
                    {activeTab === 'trainers' && renderTrainers()}
                    {activeTab === 'my-subscriptions' && renderMySubscriptions()}
                </div>
            </div>

            {showSubscriptionModal && renderSubscriptionModal()}
        </div>
    );
};

export default UserDashboard;