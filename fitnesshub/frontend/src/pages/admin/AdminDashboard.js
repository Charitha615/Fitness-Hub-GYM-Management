import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [pendingTrainers, setPendingTrainers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'pending-trainers') {
            loadPendingTrainers();
        } else if (activeTab === 'reports') {
            loadStatistics();
        }
    }, [activeTab]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const loadPendingTrainers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getPendingTrainers();
            setPendingTrainers(response.data);
        } catch (error) {
            console.error('Error loading pending trainers:', error);
            alert('Failed to load pending trainers');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getStatistics();
            setStatistics(response.data);
        } catch (error) {
            console.error('Error loading statistics:', error);
            alert('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveTrainer = async (trainerId) => {
        if (!window.confirm('Are you sure you want to approve this trainer?')) return;

        try {
            await adminAPI.approveTrainer(trainerId);
            alert('Trainer approved successfully');
            loadPendingTrainers();
            loadStatistics();
        } catch (error) {
            console.error('Error approving trainer:', error);
            alert('Failed to approve trainer');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;

        try {
            await adminAPI.deleteUser(userId);
            alert('User deleted successfully');
            loadUsers();
            loadStatistics();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            await adminAPI.updateUser(userId, updates);
            alert('User updated successfully');
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const renderDashboard = () => (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            {statistics && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p className="stat-number">{statistics.totalUsers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Trainers</h3>
                        <p className="stat-number">{statistics.totalTrainers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Approved Trainers</h3>
                        <p className="stat-number">{statistics.approvedTrainers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending Trainers</h3>
                        <p className="stat-number">{statistics.pendingTrainers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Users</h3>
                        <p className="stat-number">{statistics.activeUsers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Inactive Users</h3>
                        <p className="stat-number">{statistics.inactiveUsers}</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderUsers = () => (
        <div className="users-management">
            <h2>User Management</h2>
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge ${user.userType}`}>
                                        {user.userType}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {user.userType === 'trainer' && (
                                        <span className={`status-badge ${user.isApproved ? 'approved' : 'pending'}`}>
                                            {user.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="actions">
                                    <button 
                                        className="btn-view"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        View
                                    </button>
                                    <button 
                                        className="btn-edit"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                        disabled={user._id === currentUser.id}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPendingTrainers = () => (
        <div className="pending-trainers">
            <h2>Pending Trainer Applications</h2>
            {pendingTrainers.length === 0 ? (
                <p>No pending trainer applications</p>
            ) : (
                <div className="trainers-grid">
                    {pendingTrainers.map(trainer => (
                        <div key={trainer._id} className="trainer-card">
                            <h3>{trainer.name}</h3>
                            <p><strong>Email:</strong> {trainer.email}</p>
                            <p><strong>Phone:</strong> {trainer.phone || 'N/A'}</p>
                            <p><strong>Specialization:</strong> {trainer.specialization || 'N/A'}</p>
                            <p><strong>Experience:</strong> {trainer.experience || 0} years</p>
                            <p><strong>Applied:</strong> {new Date(trainer.createdAt).toLocaleDateString()}</p>
                            <div className="trainer-actions">
                                <button 
                                    className="btn-approve"
                                    onClick={() => handleApproveTrainer(trainer._id)}
                                >
                                    Approve
                                </button>
                                <button 
                                    className="btn-view"
                                    onClick={() => setSelectedUser(trainer)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderReports = () => (
        <div className="reports">
            <h2>Reports & Analytics</h2>
            {statistics && (
                <div className="reports-content">
                    <div className="chart-container">
                        <h3>User Statistics</h3>
                        <div className="chart">
                            <div className="chart-bar" style={{height: `${(statistics.totalUsers / 100) * 100}%`}}>
                                <span>Total Users: {statistics.totalUsers}</span>
                            </div>
                            <div className="chart-bar" style={{height: `${(statistics.totalTrainers / 100) * 100}%`}}>
                                <span>Total Trainers: {statistics.totalTrainers}</span>
                            </div>
                            <div className="chart-bar" style={{height: `${(statistics.pendingTrainers / 10) * 100}%`}}>
                                <span>Pending: {statistics.pendingTrainers}</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-export" onClick={() => alert('Export functionality to be implemented')}>
                        Export Report
                    </button>
                </div>
            )}
        </div>
    );

    const renderUserModal = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>User Details</h3>
                {selectedUser && (
                    <div className="user-details">
                        <p><strong>Name:</strong> {selectedUser.name}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                        <p><strong>Role:</strong> {selectedUser.userType}</p>
                        <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                        {selectedUser.userType === 'trainer' && (
                            <>
                                <p><strong>Specialization:</strong> {selectedUser.specialization || 'N/A'}</p>
                                <p><strong>Experience:</strong> {selectedUser.experience || 0} years</p>
                                <p><strong>Approval:</strong> {selectedUser.isApproved ? 'Approved' : 'Pending'}</p>
                            </>
                        )}
                        {selectedUser.userType === 'user' && (
                            <p><strong>Membership:</strong> {selectedUser.membershipType || 'N/A'}</p>
                        )}
                    </div>
                )}
                <div className="modal-actions">
                    <button className="btn-close" onClick={() => setSelectedUser(null)}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-container">
            <nav className="admin-nav">
                <div className="nav-brand">
                    <h2>FitnessHub Admin</h2>
                </div>
                <div className="nav-actions">
                    <span>Welcome, {currentUser?.name}</span>
                    <button onClick={logout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="admin-content">
                <div className="sidebar">
                    <button 
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </button>
                    <button 
                        className={activeTab === 'pending-trainers' ? 'active' : ''}
                        onClick={() => setActiveTab('pending-trainers')}
                    >
                        Pending Trainers
                    </button>
                    <button 
                        className={activeTab === 'reports' ? 'active' : ''}
                        onClick={() => setActiveTab('reports')}
                    >
                        Reports
                    </button>
                </div>

                <div className="main-content">
                    {loading && <div className="loading">Loading...</div>}
                    
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'pending-trainers' && renderPendingTrainers()}
                    {activeTab === 'reports' && renderReports()}
                </div>
            </div>

            {selectedUser && renderUserModal()}
        </div>
    );
};

export default AdminDashboard;