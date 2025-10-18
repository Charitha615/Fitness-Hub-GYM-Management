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

    return (
        <div className="subscription-plans">
            <div className="plans-header">
                <h2>Subscription Plans Management</h2>
                <button 
                    className="btn-create"
                    onClick={() => setShowForm(true)}
                >
                    Create New Plan
                </button>
            </div>

            {showForm && (
                <div className="form-modal-overlay">
                    <div className="form-modal">
                        <h3>{editingPlan ? 'Edit' : 'Create'} Subscription Plan</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Plan Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
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

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
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
                                <div className="form-group">
                                    <label>Price ($) *</label>
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

                            <div className="form-group">
                                <label>Features *</label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="feature-input">
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
                                                className="btn-remove-feature"
                                                onClick={() => removeFeatureField(index)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn-add-feature"
                                    onClick={addFeatureField}
                                >
                                    Add Feature
                                </button>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    Active Plan
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-save">
                                    {editingPlan ? 'Update' : 'Create'} Plan
                                </button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading subscription plans...</div>
            ) : (
                <div className="plans-grid">
                    {plans.map(plan => (
                        <div key={plan._id} className={`plan-card ${plan.planType}`}>
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <span className={`plan-badge ${plan.planType}`}>
                                    {plan.planType}
                                </span>
                            </div>
                            
                            <div className="plan-price">
                                ${plan.price}
                                <span className="plan-duration">/{plan.duration} days</span>
                            </div>
                            
                            <p className="plan-description">{plan.description}</p>
                            
                            <div className="plan-features">
                                <h4>Features:</h4>
                                <ul>
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="plan-footer">
                                <div className="plan-status">
                                    <span className={`status ${plan.isActive ? 'active' : 'inactive'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="plan-actions">
                                    <button 
                                        className="btn-edit"
                                        onClick={() => handleEdit(plan)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className={`btn-status ${plan.isActive ? 'deactivate' : 'activate'}`}
                                        onClick={() => togglePlanStatus(plan)}
                                    >
                                        {plan.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                        className="btn-delete"
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
                <div className="no-plans">
                    <p>No subscription plans found. Create your first plan to get started.</p>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlans;