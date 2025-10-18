import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trainerAPI } from '../../services/api';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dietPlans, setDietPlans] = useState([]);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showDietForm, setShowDietForm] = useState(false);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const [dietForm, setDietForm] = useState({
        title: '',
        description: '',
        duration: 4,
        caloriesPerDay: 2000,
        targetAudience: 'weight_loss',
        price: 0,
        meals: []
    });

    const [workoutForm, setWorkoutForm] = useState({
        title: '',
        description: '',
        duration: 4,
        difficulty: 'beginner',
        targetAudience: 'weight_loss',
        price: 0,
        exercises: []
    });

    useEffect(() => {
        loadInitialData();
    }, [activeTab]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const [dietRes, workoutRes, subscribersRes] = await Promise.all([
                    trainerAPI.getDietPlans(),
                    trainerAPI.getWorkoutPlans(),
                    trainerAPI.getSubscribers()
                ]);
                setDietPlans(dietRes.data);
                setWorkoutPlans(workoutRes.data);
                setSubscribers(subscribersRes.data.subscriptions);
                setStatistics(subscribersRes.data.statistics);
            } else if (activeTab === 'diet-plans') {
                const response = await trainerAPI.getDietPlans();
                setDietPlans(response.data);
            } else if (activeTab === 'workout-plans') {
                const response = await trainerAPI.getWorkoutPlans();
                setWorkoutPlans(response.data);
            } else if (activeTab === 'subscribers') {
                const response = await trainerAPI.getSubscribers();
                setSubscribers(response.data.subscriptions);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleCreateDietPlan = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await trainerAPI.updateDietPlan(editingPlan._id, dietForm);
                alert('Diet plan updated successfully');
            } else {
                await trainerAPI.createDietPlan(dietForm);
                alert('Diet plan created successfully');
            }
            setShowDietForm(false);
            setEditingPlan(null);
            resetDietForm();
            loadInitialData();
        } catch (error) {
            console.error('Error creating diet plan:', error);
            alert('Failed to create diet plan');
        }
    };

    const handleCreateWorkoutPlan = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await trainerAPI.updateWorkoutPlan(editingPlan._id, workoutForm);
                alert('Workout plan updated successfully');
            } else {
                await trainerAPI.createWorkoutPlan(workoutForm);
                alert('Workout plan created successfully');
            }
            setShowWorkoutForm(false);
            setEditingPlan(null);
            resetWorkoutForm();
            loadInitialData();
        } catch (error) {
            console.error('Error creating workout plan:', error);
            alert('Failed to create workout plan');
        }
    };

    const handleEditDietPlan = (plan) => {
        setDietForm({
            title: plan.title,
            description: plan.description,
            duration: plan.duration,
            caloriesPerDay: plan.caloriesPerDay,
            targetAudience: plan.targetAudience,
            price: plan.price,
            meals: plan.meals
        });
        setEditingPlan(plan);
        setShowDietForm(true);
    };

    const handleEditWorkoutPlan = (plan) => {
        setWorkoutForm({
            title: plan.title,
            description: plan.description,
            duration: plan.duration,
            difficulty: plan.difficulty,
            targetAudience: plan.targetAudience,
            price: plan.price,
            exercises: plan.exercises
        });
        setEditingPlan(plan);
        setShowWorkoutForm(true);
    };

    const handleDeleteDietPlan = async (id) => {
        if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
        
        try {
            await trainerAPI.deleteDietPlan(id);
            alert('Diet plan deleted successfully');
            loadInitialData();
        } catch (error) {
            console.error('Error deleting diet plan:', error);
            alert('Failed to delete diet plan');
        }
    };

    const handleDeleteWorkoutPlan = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workout plan?')) return;
        
        try {
            await trainerAPI.deleteWorkoutPlan(id);
            alert('Workout plan deleted successfully');
            loadInitialData();
        } catch (error) {
            console.error('Error deleting workout plan:', error);
            alert('Failed to delete workout plan');
        }
    };

    const resetDietForm = () => {
        setDietForm({
            title: '',
            description: '',
            duration: 4,
            caloriesPerDay: 2000,
            targetAudience: 'weight_loss',
            price: 0,
            meals: []
        });
    };

    const resetWorkoutForm = () => {
        setWorkoutForm({
            title: '',
            description: '',
            duration: 4,
            difficulty: 'beginner',
            targetAudience: 'weight_loss',
            price: 0,
            exercises: []
        });
    };

    const addMeal = () => {
        setDietForm({
            ...dietForm,
            meals: [...dietForm.meals, { mealType: 'breakfast', description: '', calories: 0 }]
        });
    };

    const addExercise = () => {
        setWorkoutForm({
            ...workoutForm,
            exercises: [...workoutForm.exercises, { name: '', sets: 3, reps: 10, restTime: 60, description: '' }]
        });
    };

    const removeMeal = (index) => {
        const updatedMeals = dietForm.meals.filter((_, i) => i !== index);
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    const removeExercise = (index) => {
        const updatedExercises = workoutForm.exercises.filter((_, i) => i !== index);
        setWorkoutForm({ ...workoutForm, exercises: updatedExercises });
    };

    const updateMeal = (index, field, value) => {
        const updatedMeals = [...dietForm.meals];
        updatedMeals[index][field] = value;
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    const updateExercise = (index, field, value) => {
        const updatedExercises = [...workoutForm.exercises];
        updatedExercises[index][field] = value;
        setWorkoutForm({ ...workoutForm, exercises: updatedExercises });
    };

    const renderDashboard = () => (
        <div className="trainer-dashboard-modern">
            <div className="dashboard-header">
                <h1>Trainer Dashboard</h1>
                <p>Welcome back, {currentUser?.name}! Here's your overview.</p>
            </div>

            {statistics && (
                <div className="stats-grid-modern">
                    <div className="stat-card-modern primary">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total Subscribers</h3>
                            <p className="stat-number">{statistics.totalSubscribers}</p>
                        </div>
                    </div>
                    <div className="stat-card-modern success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Active Subscribers</h3>
                            <p className="stat-number">{statistics.activeSubscribers}</p>
                        </div>
                    </div>
                    <div className="stat-card-modern warning">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Total Revenue</h3>
                            <p className="stat-number">Rs.{statistics.totalRevenue}</p>
                        </div>
                    </div>
                    <div className="stat-card-modern info">
                        <div className="stat-icon">🥗</div>
                        <div className="stat-content">
                            <h3>Diet Plans</h3>
                            <p className="stat-number">{dietPlans.length}</p>
                        </div>
                    </div>
                    <div className="stat-card-modern danger">
                        <div className="stat-icon">💪</div>
                        <div className="stat-content">
                            <h3>Workout Plans</h3>
                            <p className="stat-number">{workoutPlans.length}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <button 
                        className="action-card"
                        onClick={() => {
                            setActiveTab('diet-plans');
                            setEditingPlan(null);
                            resetDietForm();
                            setShowDietForm(true);
                        }}
                    >
                        <span className="action-icon">🥗</span>
                        <span>Create Diet Plan</span>
                    </button>
                    <button 
                        className="action-card"
                        onClick={() => {
                            setActiveTab('workout-plans');
                            setEditingPlan(null);
                            resetWorkoutForm();
                            setShowWorkoutForm(true);
                        }}
                    >
                        <span className="action-icon">💪</span>
                        <span>Create Workout Plan</span>
                    </button>
                    <button 
                        className="action-card"
                        onClick={() => setActiveTab('subscribers')}
                    >
                        <span className="action-icon">👥</span>
                        <span>View Subscribers</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDietPlans = () => (
        <div className="plans-management-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>Diet Plans</h1>
                    <p>Manage your nutrition plans and meal programs</p>
                </div>
                <button 
                    className="btn-create-modern"
                    onClick={() => {
                        setEditingPlan(null);
                        resetDietForm();
                        setShowDietForm(true);
                    }}
                >
                    <span>+</span>
                    Create Diet Plan
                </button>
            </div>

            {loading ? (
                <div className="loading-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="plan-card-skeleton">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line medium"></div>
                                <div className="skeleton-line long"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : dietPlans.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🥗</div>
                    <h3>No Diet Plans Yet</h3>
                    <p>Create your first diet plan to help clients achieve their nutrition goals</p>
                    <button 
                        className="btn-primary-modern"
                        onClick={() => {
                            setEditingPlan(null);
                            resetDietForm();
                            setShowDietForm(true);
                        }}
                    >
                        Create Your First Plan
                    </button>
                </div>
            ) : (
                <div className="plans-grid-modern">
                    {dietPlans.map(plan => (
                        <div key={plan._id} className="plan-card-modern">
                            <div className="plan-header-modern">
                                <h3>{plan.title}</h3>
                                <span className={`status-badge-modern ${plan.isActive ? 'active' : 'inactive'}`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="plan-description">{plan.description}</p>
                            <div className="plan-stats">
                                <div className="plan-stat">
                                    <span className="stat-label">Duration</span>
                                    <span className="stat-value">{plan.duration} weeks</span>
                                </div>
                                <div className="plan-stat">
                                    <span className="stat-label">Calories</span>
                                    <span className="stat-value">{plan.caloriesPerDay}/day</span>
                                </div>
                                <div className="plan-stat">
                                    <span className="stat-label">Target</span>
                                    <span className="stat-value">{plan.targetAudience.replace('_', ' ')}</span>
                                </div>
                                <div className="plan-stat">
                                    <span className="stat-label">Price</span>
                                    <span className="stat-value price">${plan.price}</span>
                                </div>
                            </div>
                            <div className="plan-footer">
                                <div className="meals-count">
                                    <span>🍽️ {plan.meals.length} meals</span>
                                </div>
                                <div className="plan-actions-modern">
                                    <button 
                                        className="btn-edit-modern"
                                        onClick={() => handleEditDietPlan(plan)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete-modern"
                                        onClick={() => handleDeleteDietPlan(plan._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderWorkoutPlans = () => (
        <div className="plans-management-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>Workout Plans</h1>
                    <p>Manage your exercise programs and training routines</p>
                </div>
                <button 
                    className="btn-create-modern"
                    onClick={() => {
                        setEditingPlan(null);
                        resetWorkoutForm();
                        setShowWorkoutForm(true);
                    }}
                >
                    <span>+</span>
                    Create Workout Plan
                </button>
            </div>

            {loading ? (
                <div className="loading-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="plan-card-skeleton">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line medium"></div>
                                <div className="skeleton-line long"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : workoutPlans.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💪</div>
                    <h3>No Workout Plans Yet</h3>
                    <p>Create your first workout plan to help clients achieve their fitness goals</p>
                    <button 
                        className="btn-primary-modern"
                        onClick={() => {
                            setEditingPlan(null);
                            resetWorkoutForm();
                            setShowWorkoutForm(true);
                        }}
                    >
                        Create Your First Plan
                    </button>
                </div>
            ) : (
                <div className="plans-grid-modern">
                    {workoutPlans.map(plan => (
                        <div key={plan._id} className="plan-card-modern">
                            <div className="plan-header-modern">
                                <h3>{plan.title}</h3>
                                <span className={`status-badge-modern ${plan.isActive ? 'active' : 'inactive'}`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="plan-description">{plan.description}</p>
                            <div className="plan-stats">
                                <div className="plan-stat">
                                    <span className="stat-label">Duration</span>
                                    <span className="stat-value">{plan.duration} weeks</span>
                                </div>
                                <div className="plan-stat">
                                    <span className="stat-label">Difficulty</span>
                                    <span className="stat-value">{plan.difficulty}</span>
                                </div>
                                <div className="plan-stat">
                                    <span className="stat-label">Target</span>
                                    <span className="stat-value">{plan.targetAudience.replace('_', ' ')}</span>
                                </div>
                                <div className="plan-stat">
                                    <span className="stat-label">Price</span>
                                    <span className="stat-value price">${plan.price}</span>
                                </div>
                            </div>
                            <div className="plan-footer">
                                <div className="exercises-count">
                                    <span>🏋️ {plan.exercises.length} exercises</span>
                                </div>
                                <div className="plan-actions-modern">
                                    <button 
                                        className="btn-edit-modern"
                                        onClick={() => handleEditWorkoutPlan(plan)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete-modern"
                                        onClick={() => handleDeleteWorkoutPlan(plan._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSubscribers = () => (
        <div className="subscribers-management-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>My Subscribers</h1>
                    <p>Manage and view all your client subscriptions</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-table">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="table-row-skeleton">
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                        </div>
                    ))}
                </div>
            ) : subscribers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No Subscribers Yet</h3>
                    <p>When clients subscribe to your plans, they will appear here</p>
                </div>
            ) : (
                <div className="table-container-modern">
                    <table className="subscribers-table-modern">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Subscription Plan</th>
                                <th>Diet Plan</th>
                                <th>Workout Plan</th>
                                <th>Amount</th>
                                <th>Period</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map(sub => (
                                <tr key={sub._id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {sub.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-details">
                                                <strong>{sub.user.name}</strong>
                                                <small>{sub.user.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="plan-info">
                                            <strong>{sub.subscriptionPlan.name}</strong>
                                            <small>{sub.subscriptionPlan.duration} days</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`plan-badge ${sub.dietPlan ? 'has-plan' : 'no-plan'}`}>
                                            {sub.dietPlan?.title || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`plan-badge ${sub.workoutPlan ? 'has-plan' : 'no-plan'}`}>
                                            {sub.workoutPlan?.title || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="amount">${sub.amount}</td>
                                    <td>
                                        <div className="date-info">
                                            <small>Start: {new Date(sub.startDate).toLocaleDateString()}</small>
                                            <small>End: {new Date(sub.endDate).toLocaleDateString()}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge-modern ${sub.status}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderDietForm = () => (
        <div className="modal-overlay-modern">
            <div className="modal-content-modern large">
                <div className="modal-header-modern">
                    <h2>{editingPlan ? 'Edit Diet Plan' : 'Create Diet Plan'}</h2>
                    <button 
                        className="close-btn-modern"
                        onClick={() => setShowDietForm(false)}
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleCreateDietPlan} className="form-modern">
                    <div className="form-grid">
                        <div className="form-group-modern">
                            <label>Plan Title</label>
                            <input
                                type="text"
                                value={dietForm.title}
                                onChange={(e) => setDietForm({...dietForm, title: e.target.value})}
                                placeholder="Enter plan title"
                                required
                            />
                        </div>

                        <div className="form-group-modern full-width">
                            <label>Description</label>
                            <textarea
                                value={dietForm.description}
                                onChange={(e) => setDietForm({...dietForm, description: e.target.value})}
                                placeholder="Describe this diet plan"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label>Duration (weeks)</label>
                            <input
                                type="number"
                                value={dietForm.duration}
                                onChange={(e) => setDietForm({...dietForm, duration: parseInt(e.target.value)})}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label>Calories per Day</label>
                            <input
                                type="number"
                                value={dietForm.caloriesPerDay}
                                onChange={(e) => setDietForm({...dietForm, caloriesPerDay: parseInt(e.target.value)})}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label>Target Audience</label>
                            <select
                                value={dietForm.targetAudience}
                                onChange={(e) => setDietForm({...dietForm, targetAudience: e.target.value})}
                                required
                            >
                                <option value="weight_loss">Weight Loss</option>
                                <option value="muscle_gain">Muscle Gain</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="athletic_performance">Athletic Performance</option>
                            </select>
                        </div>

                        <div className="form-group-modern">
                            <label>Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={dietForm.price}
                                onChange={(e) => setDietForm({...dietForm, price: parseFloat(e.target.value)})}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section-modern">
                        <div className="section-header-modern">
                            <h4>Daily Meals</h4>
                            <button type="button" onClick={addMeal} className="btn-add-modern">
                                + Add Meal
                            </button>
                        </div>
                        
                        <div className="meals-list">
                            {dietForm.meals.map((meal, index) => (
                                <div key={index} className="meal-item-modern">
                                    <select
                                        value={meal.mealType}
                                        onChange={(e) => updateMeal(index, 'mealType', e.target.value)}
                                        className="meal-type"
                                    >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snacks">Snacks</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Meal description"
                                        value={meal.description}
                                        onChange={(e) => updateMeal(index, 'description', e.target.value)}
                                        className="meal-description"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Calories"
                                        value={meal.calories}
                                        onChange={(e) => updateMeal(index, 'calories', parseInt(e.target.value))}
                                        className="meal-calories"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removeMeal(index)}
                                        className="btn-remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions-modern">
                        <button type="submit" className="btn-primary-modern">
                            {editingPlan ? 'Update Diet Plan' : 'Create Diet Plan'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary-modern"
                            onClick={() => setShowDietForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderWorkoutForm = () => (
        <div className="modal-overlay-modern">
            <div className="modal-content-modern large">
                <div className="modal-header-modern">
                    <h2>{editingPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>
                    <button 
                        className="close-btn-modern"
                        onClick={() => setShowWorkoutForm(false)}
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleCreateWorkoutPlan} className="form-modern">
                    <div className="form-grid">
                        <div className="form-group-modern">
                            <label>Plan Title</label>
                            <input
                                type="text"
                                value={workoutForm.title}
                                onChange={(e) => setWorkoutForm({...workoutForm, title: e.target.value})}
                                placeholder="Enter plan title"
                                required
                            />
                        </div>

                        <div className="form-group-modern full-width">
                            <label>Description</label>
                            <textarea
                                value={workoutForm.description}
                                onChange={(e) => setWorkoutForm({...workoutForm, description: e.target.value})}
                                placeholder="Describe this workout plan"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label>Duration (weeks)</label>
                            <input
                                type="number"
                                value={workoutForm.duration}
                                onChange={(e) => setWorkoutForm({...workoutForm, duration: parseInt(e.target.value)})}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group-modern">
                            <label>Difficulty</label>
                            <select
                                value={workoutForm.difficulty}
                                onChange={(e) => setWorkoutForm({...workoutForm, difficulty: e.target.value})}
                                required
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="form-group-modern">
                            <label>Target Audience</label>
                            <select
                                value={workoutForm.targetAudience}
                                onChange={(e) => setWorkoutForm({...workoutForm, targetAudience: e.target.value})}
                                required
                            >
                                <option value="weight_loss">Weight Loss</option>
                                <option value="muscle_gain">Muscle Gain</option>
                                <option value="endurance">Endurance</option>
                                <option value="flexibility">Flexibility</option>
                                <option value="general_fitness">General Fitness</option>
                            </select>
                        </div>

                        <div className="form-group-modern">
                            <label>Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={workoutForm.price}
                                onChange={(e) => setWorkoutForm({...workoutForm, price: parseFloat(e.target.value)})}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section-modern">
                        <div className="section-header-modern">
                            <h4>Exercises</h4>
                            <button type="button" onClick={addExercise} className="btn-add-modern">
                                + Add Exercise
                            </button>
                        </div>
                        
                        <div className="exercises-list">
                            {workoutForm.exercises.map((exercise, index) => (
                                <div key={index} className="exercise-item-modern">
                                    <input
                                        type="text"
                                        placeholder="Exercise name"
                                        value={exercise.name}
                                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                        className="exercise-name"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Sets"
                                        value={exercise.sets}
                                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                                        className="exercise-sets"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Reps"
                                        value={exercise.reps}
                                        onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                                        className="exercise-reps"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Rest (sec)"
                                        value={exercise.restTime}
                                        onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value))}
                                        className="exercise-rest"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={exercise.description}
                                        onChange={(e) => updateExercise(index, 'description', e.target.value)}
                                        className="exercise-description"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removeExercise(index)}
                                        className="btn-remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions-modern">
                        <button type="submit" className="btn-primary-modern">
                            {editingPlan ? 'Update Workout Plan' : 'Create Workout Plan'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary-modern"
                            onClick={() => setShowWorkoutForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="trainer-container-modern">
            <nav className="trainer-nav-modern">
                <div className="nav-brand-modern">
                    <div className="logo">💪</div>
                    <h2>FitnessHub Trainer</h2>
                </div>
                <div className="nav-actions-modern">
                    <div className="user-info">
                        <span>Welcome, {currentUser?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button-modern">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="trainer-content-modern">
                <div className="sidebar-modern">
                    <button 
                        className={`nav-item-modern ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </button>
                    <button 
                        className={`nav-item-modern ${activeTab === 'diet-plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('diet-plans')}
                    >
                        <span className="nav-icon">🥗</span>
                        Diet Plans
                    </button>
                    <button 
                        className={`nav-item-modern ${activeTab === 'workout-plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('workout-plans')}
                    >
                        <span className="nav-icon">💪</span>
                        Workout Plans
                    </button>
                    <button 
                        className={`nav-item-modern ${activeTab === 'subscribers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subscribers')}
                    >
                        <span className="nav-icon">👥</span>
                        Subscribers
                    </button>
                </div>

                <div className="main-content-modern">
                    {loading && <div className="loading-modern">Loading...</div>}
                    
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'diet-plans' && renderDietPlans()}
                    {activeTab === 'workout-plans' && renderWorkoutPlans()}
                    {activeTab === 'subscribers' && renderSubscribers()}
                </div>
            </div>

            {showDietForm && renderDietForm()}
            {showWorkoutForm && renderWorkoutForm()}
        </div>
    );
};

export default TrainerDashboard;