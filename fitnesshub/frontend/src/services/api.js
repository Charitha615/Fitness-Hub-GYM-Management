import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Your backend base URL
});

// Add token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => API.post('/auth/register', userData),
    login: (credentials) => API.post('/auth/login', credentials),
};

export const adminAPI = {
    // User Management
    getUsers: (params) => API.get('/admin/users', { params }),
    getPendingTrainers: () => API.get('/admin/trainers/pending'),
    approveTrainer: (id) => API.put(`/admin/trainers/${id}/approve`),
    updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
    getStatistics: () => API.get('/admin/reports/statistics'),
    getUserProfile: (id) => API.get(`/admin/users/${id}/profile`),

    // Subscription Plans - CORRECTED: Use API instance, not axios directly
    getSubscriptionPlans: () => API.get('/admin/subscription-plans'),
    createSubscriptionPlan: (data) => API.post('/admin/subscription-plans', data),
    updateSubscriptionPlan: (id, data) => API.put(`/admin/subscription-plans/${id}`, data),
    deleteSubscriptionPlan: (id) => API.delete(`/admin/subscription-plans/${id}`),
};

export const trainerAPI = {
    // Diet Plans
    createDietPlan: (data) => API.post('/trainer/diet-plans', data),
    getDietPlans: () => API.get('/trainer/diet-plans'),
    updateDietPlan: (id, data) => API.put(`/trainer/diet-plans/${id}`, data),
    deleteDietPlan: (id) => API.delete(`/trainer/diet-plans/${id}`),
    
    // Workout Plans
    createWorkoutPlan: (data) => API.post('/trainer/workout-plans', data),
    getWorkoutPlans: () => API.get('/trainer/workout-plans'),
    updateWorkoutPlan: (id, data) => API.put(`/trainer/workout-plans/${id}`, data),
    deleteWorkoutPlan: (id) => API.delete(`/trainer/workout-plans/${id}`),
    
    // Subscribers
    getSubscribers: () => API.get('/trainer/subscribers'),
    getTrainerProfile: (id) => API.get(`/trainer/profile/${id}`)
};

export const userAPI = {
    getTrainers: (params) => API.get('/user/trainers', { params }),
    getSubscriptionPlans: () => API.get('/user/subscription-plans'),
    subscribe: (data) => API.post('/user/subscribe', data),
    getMySubscriptions: () => API.get('/user/my-subscriptions')
};

// You don't need this separate subscriptionPlanAPI since it's already in adminAPI
// But if you want to keep it for organization, make sure it uses the same API instance:
export const subscriptionPlanAPI = {
    create: (data) => API.post('/admin/subscription-plans', data),
    getAll: () => API.get('/admin/subscription-plans'),
    update: (id, data) => API.put(`/admin/subscription-plans/${id}`, data),
    delete: (id) => API.delete(`/admin/subscription-plans/${id}`)
};

export default API;