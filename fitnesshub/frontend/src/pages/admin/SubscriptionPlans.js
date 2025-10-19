import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        features: [''],
        planType: 'basic',
        isActive: true
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getSubscriptionPlans();
            setPlans(response.data);
        } catch (error) {
            console.error('Error loading subscription plans:', error);
            alert('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({
            ...prev,
            features: newFeatures
        }));
    };

    const addFeatureField = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeatureField = (index) => {
        if (formData.features.length > 1) {
            const newFeatures = formData.features.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                features: newFeatures
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            duration: 30,
            price: 0,
            features: [''],
            planType: 'basic',
            isActive: true
        });
        setEditingPlan(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Filter out empty features
        const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
        
        if (filteredFeatures.length === 0) {
            alert('Please add at least one feature');
            return;
        }

        const submitData = {
            ...formData,
            features: filteredFeatures,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration)
        };

        try {
            if (editingPlan) {
                await adminAPI.updateSubscriptionPlan(editingPlan._id, submitData);
                alert('Subscription plan updated successfully');
            } else {
                await adminAPI.createSubscriptionPlan(submitData);
                alert('Subscription plan created successfully');
            }
            resetForm();
            loadPlans();
        } catch (error) {
            console.error('Error saving subscription plan:', error);
            alert('Failed to save subscription plan');
        }
    };

    const handleEdit = (plan) => {
        setFormData({
            name: plan.name,
            description: plan.description,
            duration: plan.duration,
            price: plan.price,
            features: plan.features.length > 0 ? plan.features : [''],
            planType: plan.planType,
            isActive: plan.isActive
        });
        setEditingPlan(plan);
        setShowForm(true);
    };

    const handleDelete = async (planId, planName) => {
        if (!window.confirm(`Are you sure you want to delete "${planName}"?`)) return;

        try {
            await adminAPI.deleteSubscriptionPlan(planId);
            alert('Subscription plan deleted successfully');
            loadPlans();
        } catch (error) {
            console.error('Error deleting subscription plan:', error);
            alert('Failed to delete subscription plan');
        }
    };

    const togglePlanStatus = async (plan) => {
        try {
            await adminAPI.updateSubscriptionPlan(plan._id, {
                isActive: !plan.isActive
            });
            alert(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
            loadPlans();
        } catch (error) {
            console.error('Error updating plan status:', error);
            alert('Failed to update plan status');
        }
    };

    const getPlanColor = (planType) => {
        const colors = {
            basic: '#27ae60',
            premium: '#f39c12',
            vip: '#e74c3c',
            custom: '#9b59b6'
        };
        return colors[planType] || '#3498db';
    };

    return (
        <div className="subscription-plans-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>Subscription Plans</h1>
                    <p>Manage pricing plans and features for your platform</p>
                </div>
                <button 
                    className="btn-create-modern"
                    onClick={() => setShowForm(true)}
                >
                    <span>+</span>
                    Create New Plan
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay-modern">
                    <div className="modal-content-modern large">
                        <div className="modal-header-modern">
                            <h2>{editingPlan ? 'Edit' : 'Create'} Subscription Plan</h2>
                            <button 
                                className="close-btn-modern"
                                onClick={resetForm}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="form-modern">
                            <div className="form-grid">
                                <div className="form-group-modern">
                                    <label>Plan Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter plan name"
                                        required
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label>Plan Type *</label>
                                    <select
                                        name="planType"
                                        value={formData.planType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                        <option value="vip">VIP</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group-modern full-width">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe this subscription plan"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-group-modern">
                                    <label>Duration (days) *</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label>Price (LKR) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section-modern">
                                <div className="section-header-modern">
                                    <h4>Plan Features *</h4>
                                    <button
                                        type="button"
                                        className="btn-add-modern"
                                        onClick={addFeatureField}
                                    >
                                        + Add Feature
                                    </button>
                                </div>
                                
                                <div className="features-list">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="feature-item-modern">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                placeholder={`Feature ${index + 1}`}
                                                required
                                            />
                                            {formData.features.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-modern"
                                                    onClick={() => removeFeatureField(index)}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group-modern checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkmark"></span>
                                    Active Plan
                                </label>
                            </div>

                            <div className="form-actions-modern">
                                <button type="submit" className="btn-primary-modern">
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                                <button type="button" className="btn-secondary-modern" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="plan-card-skeleton">
                            <div className="skeleton-header"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line medium"></div>
                                <div className="skeleton-line long"></div>
                                <div className="skeleton-line long"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="plans-grid-modern">
                    {plans.map(plan => (
                        <div 
                            key={plan._id} 
                            className="plan-card-modern"
                            style={{ '--plan-color': getPlanColor(plan.planType) }}
                        >
                            <div className="plan-header-modern">
                                <div className="plan-title">
                                    <h3>{plan.name}</h3>
                                    <span className="plan-type-badge">{plan.planType}</span>
                                </div>
                                <div className="plan-price-modern">
                                    LKR{plan.price}
                                    <span className="plan-duration">/{plan.duration} days</span>
                                </div>
                            </div>
                            
                            <p className="plan-description">{plan.description}</p>
                            
                            <div className="plan-features-modern">
                                <h4>What's included:</h4>
                                <ul>
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>
                                            <span className="feature-icon">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="plan-footer-modern">
                                <div className="plan-status">
                                    <span className={`status-badge-modern ${plan.isActive ? 'active' : 'inactive'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="plan-actions-modern">
                                    <button 
                                        className="btn-edit-modern"
                                        onClick={() => handleEdit(plan)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className={`btn-status-modern ${plan.isActive ? 'deactivate' : 'activate'}`}
                                        onClick={() => togglePlanStatus(plan)}
                                    >
                                        {plan.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                        className="btn-delete-modern"
                                        onClick={() => handleDelete(plan._id, plan.name)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {plans.length === 0 && !loading && (
                <div className="empty-state">
                    <div className="empty-icon">💰</div>
                    <h3>No Subscription Plans</h3>
                    <p>Create your first subscription plan to start monetizing your platform</p>
                    <button 
                        className="btn-primary-modern"
                        onClick={() => setShowForm(true)}
                    >
                        Create First Plan
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlans;