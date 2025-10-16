import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { trainerAPI } from '../../services/api';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
    const { currentUser, logout } = useAuth();
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
        if (activeTab === 'diet-plans') {
            loadDietPlans();
        } else if (activeTab === 'workout-plans') {
            loadWorkoutPlans();
        } else if (activeTab === 'subscribers') {
            loadSubscribers();
        }
    }, [activeTab]);

    const loadDietPlans = async () => {
        setLoading(true);
        try {
            const response = await trainerAPI.getDietPlans();
            setDietPlans(response.data);
        } catch (error) {
            console.error('Error loading diet plans:', error);
            alert('Failed to load diet plans');
        } finally {
            setLoading(false);
        }
    };

    const loadWorkoutPlans = async () => {
        setLoading(true);
        try {
            const response = await trainerAPI.getWorkoutPlans();
            setWorkoutPlans(response.data);
        } catch (error) {
            console.error('Error loading workout plans:', error);
            alert('Failed to load workout plans');
        } finally {
            setLoading(false);
        }
    };

    const loadSubscribers = async () => {
        setLoading(true);
        try {
            const response = await trainerAPI.getSubscribers();
            setSubscribers(response.data.subscriptions);
            setStatistics(response.data.statistics);
        } catch (error) {
            console.error('Error loading subscribers:', error);
            alert('Failed to load subscribers');
        } finally {
            setLoading(false);
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
            loadDietPlans();
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
            loadWorkoutPlans();
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
            loadDietPlans();
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
            loadWorkoutPlans();
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
        <div className="trainer-dashboard">
            <h2>Trainer Dashboard</h2>
            {statistics && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Subscribers</h3>
                        <p className="stat-number">{statistics.totalSubscribers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Subscribers</h3>
                        <p className="stat-number">{statistics.activeSubscribers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Revenue</h3>
                        <p className="stat-number">${statistics.totalRevenue}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Diet Plans</h3>
                        <p className="stat-number">{dietPlans.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Workout Plans</h3>
                        <p className="stat-number">{workoutPlans.length}</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderDietPlans = () => (
        <div className="plans-management">
            <div className="plans-header">
                <h2>Diet Plans</h2>
                <button 
                    className="btn-create"
                    onClick={() => {
                        setEditingPlan(null);
                        resetDietForm();
                        setShowDietForm(true);
                    }}
                >
                    Create Diet Plan
                </button>
            </div>

            {dietPlans.length === 0 ? (
                <p>No diet plans created yet.</p>
            ) : (
                <div className="plans-grid">
                    {dietPlans.map(plan => (
                        <div key={plan._id} className="plan-card">
                            <h3>{plan.title}</h3>
                            <p>{plan.description}</p>
                            <div className="plan-details">
                                <span>Duration: {plan.duration} weeks</span>
                                <span>Calories: {plan.caloriesPerDay}/day</span>
                                <span>Target: {plan.targetAudience}</span>
                                <span>Price: ${plan.price}</span>
                            </div>
                            <div className="plan-actions">
                                <button 
                                    className="btn-edit"
                                    onClick={() => handleEditDietPlan(plan)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDeleteDietPlan(plan._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderWorkoutPlans = () => (
        <div className="plans-management">
            <div className="plans-header">
                <h2>Workout Plans</h2>
                <button 
                    className="btn-create"
                    onClick={() => {
                        setEditingPlan(null);
                        resetWorkoutForm();
                        setShowWorkoutForm(true);
                    }}
                >
                    Create Workout Plan
                </button>
            </div>

            {workoutPlans.length === 0 ? (
                <p>No workout plans created yet.</p>
            ) : (
                <div className="plans-grid">
                    {workoutPlans.map(plan => (
                        <div key={plan._id} className="plan-card">
                            <h3>{plan.title}</h3>
                            <p>{plan.description}</p>
                            <div className="plan-details">
                                <span>Duration: {plan.duration} weeks</span>
                                <span>Difficulty: {plan.difficulty}</span>
                                <span>Target: {plan.targetAudience}</span>
                                <span>Price: ${plan.price}</span>
                            </div>
                            <div className="plan-actions">
                                <button 
                                    className="btn-edit"
                                    onClick={() => handleEditWorkoutPlan(plan)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDeleteWorkoutPlan(plan._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSubscribers = () => (
        <div className="subscribers-management">
            <h2>My Subscribers</h2>
            {subscribers.length === 0 ? (
                <p>No subscribers yet.</p>
            ) : (
                <div className="table-container">
                    <table className="subscribers-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Subscription Plan</th>
                                <th>Diet Plan</th>
                                <th>Workout Plan</th>
                                <th>Amount</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map(sub => (
                                <tr key={sub._id}>
                                    <td>
                                        <div>
                                            <strong>{sub.user.name}</strong>
                                            <br />
                                            <small>{sub.user.email}</small>
                                        </div>
                                    </td>
                                    <td>
                                        {sub.subscriptionPlan.name}
                                        <br />
                                        <small>{sub.subscriptionPlan.duration} days</small>
                                    </td>
                                    <td>{sub.dietPlan?.title || 'N/A'}</td>
                                    <td>{sub.workoutPlan?.title || 'N/A'}</td>
                                    <td>${sub.amount}</td>
                                    <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${sub.status}`}>
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
        <div className="modal-overlay">
            <div className="modal-content large">
                <h3>{editingPlan ? 'Edit Diet Plan' : 'Create Diet Plan'}</h3>
                <form onSubmit={handleCreateDietPlan}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={dietForm.title}
                            onChange={(e) => setDietForm({...dietForm, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={dietForm.description}
                            onChange={(e) => setDietForm({...dietForm, description: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (weeks)</label>
                            <input
                                type="number"
                                value={dietForm.duration}
                                onChange={(e) => setDietForm({...dietForm, duration: parseInt(e.target.value)})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Calories per Day</label>
                            <input
                                type="number"
                                value={dietForm.caloriesPerDay}
                                onChange={(e) => setDietForm({...dietForm, caloriesPerDay: parseInt(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
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

                        <div className="form-group">
                            <label>Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={dietForm.price}
                                onChange={(e) => setDietForm({...dietForm, price: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div className="meals-section">
                        <div className="section-header">
                            <h4>Meals</h4>
                            <button type="button" onClick={addMeal} className="btn-add">
                                Add Meal
                            </button>
                        </div>
                        
                        {dietForm.meals.map((meal, index) => (
                            <div key={index} className="meal-item">
                                <select
                                    value={meal.mealType}
                                    onChange={(e) => updateMeal(index, 'mealType', e.target.value)}
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
                                />
                                <input
                                    type="number"
                                    placeholder="Calories"
                                    value={meal.calories}
                                    onChange={(e) => updateMeal(index, 'calories', parseInt(e.target.value))}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingPlan ? 'Update Diet Plan' : 'Create Diet Plan'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary"
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
        <div className="modal-overlay">
            <div className="modal-content large">
                <h3>{editingPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}</h3>
                <form onSubmit={handleCreateWorkoutPlan}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={workoutForm.title}
                            onChange={(e) => setWorkoutForm({...workoutForm, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={workoutForm.description}
                            onChange={(e) => setWorkoutForm({...workoutForm, description: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (weeks)</label>
                            <input
                                type="number"
                                value={workoutForm.duration}
                                onChange={(e) => setWorkoutForm({...workoutForm, duration: parseInt(e.target.value)})}
                                required
                            />
                        </div>

                        <div className="form-group">
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
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

                        <div className="form-group">
                            <label>Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={workoutForm.price}
                                onChange={(e) => setWorkoutForm({...workoutForm, price: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div className="exercises-section">
                        <div className="section-header">
                            <h4>Exercises</h4>
                            <button type="button" onClick={addExercise} className="btn-add">
                                Add Exercise
                            </button>
                        </div>
                        
                        {workoutForm.exercises.map((exercise, index) => (
                            <div key={index} className="exercise-item">
                                <input
                                    type="text"
                                    placeholder="Exercise name"
                                    value={exercise.name}
                                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Sets"
                                    value={exercise.sets}
                                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                                />
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={exercise.reps}
                                    onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                                />
                                <input
                                    type="number"
                                    placeholder="Rest time (seconds)"
                                    value={exercise.restTime}
                                    onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value))}
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={exercise.description}
                                    onChange={(e) => updateExercise(index, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingPlan ? 'Update Workout Plan' : 'Create Workout Plan'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary"
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
        <div className="trainer-container">
            <nav className="trainer-nav">
                <div className="nav-brand">
                    <h2>FitnessHub Trainer</h2>
                </div>
                <div className="nav-actions">
                    <span>Welcome, {currentUser?.name}</span>
                    <button onClick={logout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="trainer-content">
                <div className="sidebar">
                    <button 
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={activeTab === 'diet-plans' ? 'active' : ''}
                        onClick={() => setActiveTab('diet-plans')}
                    >
                        Diet Plans
                    </button>
                    <button 
                        className={activeTab === 'workout-plans' ? 'active' : ''}
                        onClick={() => setActiveTab('workout-plans')}
                    >
                        Workout Plans
                    </button>
                    <button 
                        className={activeTab === 'subscribers' ? 'active' : ''}
                        onClick={() => setActiveTab('subscribers')}
                    >
                        Subscribers
                    </button>
                </div>

                <div className="main-content">
                    {loading && <div className="loading">Loading...</div>}
                    
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