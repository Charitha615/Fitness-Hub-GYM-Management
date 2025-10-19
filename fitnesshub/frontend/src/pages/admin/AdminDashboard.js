import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import './AdminDashboard.css';
import SubscriptionPlans from './SubscriptionPlans';
import { generatePDFReport } from '../../utils/pdfGenerator';

const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [pendingTrainers, setPendingTrainers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [reportData, setReportData] = useState({
        users: [],
        trainers: [],
        admins: []
    });

    useEffect(() => {
        loadInitialData();
    }, [activeTab]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const [statsRes, usersRes] = await Promise.all([
                    adminAPI.getStatistics(),
                    adminAPI.getUsers()
                ]);
                setStatistics(statsRes.data);
                setUsers(usersRes.data.users);
                categorizeUsers(usersRes.data.users);
            } else if (activeTab === 'users') {
                const response = await adminAPI.getUsers();
                setUsers(response.data.users);
                categorizeUsers(response.data.users);
            } else if (activeTab === 'pending-trainers') {
                const response = await adminAPI.getPendingTrainers();
                setPendingTrainers(response.data);
            } else if (activeTab === 'reports') {
                const [statsRes, usersRes] = await Promise.all([
                    adminAPI.getStatistics(),
                    adminAPI.getUsers()
                ]);
                setStatistics(statsRes.data);
                setUsers(usersRes.data.users);
                categorizeUsers(usersRes.data.users);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const categorizeUsers = (users) => {
        const categorized = {
            users: users.filter(user => user.userType === 'user'),
            trainers: users.filter(user => user.userType === 'trainer'),
            admins: users.filter(user => user.userType === 'admin')
        };
        setReportData(categorized);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleApproveTrainer = async (trainerId) => {
        if (!window.confirm('Are you sure you want to approve this trainer?')) return;

        try {
            await adminAPI.approveTrainer(trainerId);
            alert('Trainer approved successfully');
            loadInitialData();
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
            loadInitialData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus, userName) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'activate' : 'deactivate';
        
        if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) return;

        try {
            await adminAPI.updateUser(userId, { isActive: newStatus });
            alert(`User ${action}d successfully`);
            loadInitialData();
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = userFilter === 'all' || 
                            (userFilter === 'trainers' && user.userType === 'trainer') ||
                            (userFilter === 'users' && user.userType === 'user') ||
                            (userFilter === 'admins' && user.userType === 'admin');
        
        return matchesSearch && matchesFilter;
    });

    const generateUserDistribution = () => {
        if (!statistics) return null;

        const total = statistics.totalUsers;
        const userCount = reportData.users.length;
        const trainerCount = reportData.trainers.length;
        const adminCount = reportData.admins.length;

        return {
            users: { count: userCount, percentage: total > 0 ? (userCount / total) * 100 : 0 },
            trainers: { count: trainerCount, percentage: total > 0 ? (trainerCount / total) * 100 : 0 },
            admins: { count: adminCount, percentage: total > 0 ? (adminCount / total) * 100 : 0 }
        };
    };

    const handleGenerateReport = async (reportType) => {
        setLoading(true);
        try {
            let data;
            let title;

            switch (reportType) {
                case 'users':
                    data = reportData.users;
                    title = 'Members Report';
                    break;
                case 'trainers':
                    data = reportData.trainers;
                    title = 'Trainers Report';
                    break;
                case 'admins':
                    data = reportData.admins;
                    title = 'Admins Report';
                    break;
                case 'all':
                    data = users;
                    title = 'Complete Users Report';
                    break;
                case 'pending-trainers':
                    data = pendingTrainers;
                    title = 'Pending Trainers Report';
                    break;
                default:
                    return;
            }

            if (data.length === 0) {
                alert(`No data available for ${title}`);
                return;
            }

            await generatePDFReport(data, title, reportType);
            alert(`${title} generated successfully!`);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="admin-dashboard-modern">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, {currentUser?.name}! Here's your platform overview.</p>
            </div>

            {statistics && (
                <div className="stats-grid-modern">
                    <div className="stat-card-modern primary">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Total Users</h3>
                            <p className="stat-number">{statistics.totalUsers}</p>
                            <p className="stat-change">+12% from last month</p>
                        </div>
                    </div>
                    <div className="stat-card-modern success">
                        <div className="stat-icon">💪</div>
                        <div className="stat-content">
                            <h3>Total Trainers</h3>
                            <p className="stat-number">{statistics.totalTrainers}</p>
                            <p className="stat-change">+8% from last month</p>
                        </div>
                    </div>
                    <div className="stat-card-modern warning">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>Pending Trainers</h3>
                            <p className="stat-number">{statistics.pendingTrainers}</p>
                            <p className="stat-change">Need attention</p>
                        </div>
                    </div>
                    <div className="stat-card-modern info">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Approved Trainers</h3>
                            <p className="stat-number">{statistics.approvedTrainers}</p>
                            <p className="stat-change">Active professionals</p>
                        </div>
                    </div>
                    <div className="stat-card-modern danger">
                        <div className="stat-icon">🔒</div>
                        <div className="stat-content">
                            <h3>Inactive Users</h3>
                            <p className="stat-number">{statistics.inactiveUsers}</p>
                            <p className="stat-change">May need follow-up</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="quick-actions-modern">
                <h2>Quick Actions</h2>
                <div className="actions-grid-modern">
                    <button 
                        className="action-card-modern"
                        onClick={() => setActiveTab('pending-trainers')}
                    >
                        <span className="action-icon">👥</span>
                        <span>Review Trainers</span>
                        <small>{statistics?.pendingTrainers || 0} pending</small>
                    </button>
                    <button 
                        className="action-card-modern"
                        onClick={() => setActiveTab('users')}
                    >
                        <span className="action-icon">👤</span>
                        <span>Manage Users</span>
                        <small>{statistics?.totalUsers || 0} total</small>
                    </button>
                    <button 
                        className="action-card-modern"
                        onClick={() => setActiveTab('subscription-plans')}
                    >
                        <span className="action-icon">💰</span>
                        <span>Subscription Plans</span>
                        <small>Manage pricing</small>
                    </button>
                    <button 
                        className="action-card-modern"
                        onClick={() => setActiveTab('reports')}
                    >
                        <span className="action-icon">📊</span>
                        <span>View Reports</span>
                        <small>Analytics</small>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="users-management-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>User Management</h1>
                    <p>Manage all users, trainers, and administrators on the platform</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    <select 
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Users</option>
                        <option value="users">Members</option>
                        <option value="trainers">Trainers</option>
                        <option value="admins">Admins</option>
                    </select>
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
            ) : (
                <div className="table-container-modern">
                    <table className="users-table-modern">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-details">
                                                <strong>{user.name}</strong>
                                                <small>{user.email}</small>
                                                {user.phone && <small>📞 {user.phone}</small>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge-modern ${user.userType}`}>
                                            {user.userType}
                                        </span>
                                        {user.userType === 'trainer' && (
                                            <div className="trainer-info">
                                                <small>🏋️ {user.specialization || 'General'}</small>
                                                <small>⭐ {user.experience || 0} yrs</small>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="status-group">
                                            <span 
                                                className={`status-badge-modern ${user.isActive ? 'active' : 'inactive'}`}
                                                onClick={() => handleToggleUserStatus(user._id, user.isActive, user.name)}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {user.userType === 'trainer' && (
                                                <span className={`status-badge-modern ${user.isApproved ? 'approved' : 'pending'}`}>
                                                    {user.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-info">
                                            <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                                            <small>{new Date(user.createdAt).toLocaleTimeString()}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-modern">
                                            <button
                                                className="btn-view-modern"
                                                onClick={() => setSelectedUser(user)}
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-toggle-modern"
                                                onClick={() => handleToggleUserStatus(user._id, user.isActive, user.name)}
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {user.isActive ? '⏸️' : '▶️'}
                                            </button>
                                            <button
                                                className="btn-delete-modern"
                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                disabled={user._id === currentUser.id}
                                                title="Delete User"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">👤</div>
                            <h3>No Users Found</h3>
                            <p>No users match your current search criteria</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderPendingTrainers = () => (
        <div className="pending-trainers-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>Pending Trainer Applications</h1>
                    <p>Review and approve trainer applications for the platform</p>
                </div>
                <div className="pending-count">
                    <span className="count-badge">{pendingTrainers.length} Pending</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="trainer-card-skeleton">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line medium"></div>
                                <div className="skeleton-line long"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : pendingTrainers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>No Pending Applications</h3>
                    <p>All trainer applications have been reviewed and processed</p>
                </div>
            ) : (
                <div className="trainers-grid-modern">
                    {pendingTrainers.map(trainer => (
                        <div key={trainer._id} className="trainer-card-modern">
                            <div className="trainer-header">
                                <div className="trainer-avatar">
                                    {trainer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="trainer-info">
                                    <h3>{trainer.name}</h3>
                                    <p>{trainer.email}</p>
                                    <div className="trainer-meta">
                                        <span>📞 {trainer.phone || 'Not provided'}</span>
                                        <span>🕐 {new Date(trainer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="trainer-details">
                                <div className="detail-item">
                                    <strong>Specialization:</strong>
                                    <span>{trainer.specialization || 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Experience:</strong>
                                    <span>{trainer.experience || 0} years</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Membership:</strong>
                                    <span>{trainer.membershipType || 'Not specified'}</span>
                                </div>
                            </div>
                            
                            <div className="trainer-actions-modern">
                                <button
                                    className="btn-approve-modern"
                                    onClick={() => handleApproveTrainer(trainer._id)}
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    className="btn-view-modern"
                                    onClick={() => setSelectedUser(trainer)}
                                >
                                    👁️ View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderReports = () => (
        <div className="reports-modern">
            <div className="section-header-modern">
                <div className="header-content">
                    <h1>Reports & Analytics</h1>
                    <p>Generate detailed reports and platform insights</p>
                </div>
            </div>

            {statistics && (
                <div className="reports-content-modern">
                    {/* Report Generation Cards */}
                    <div className="reports-grid">
                        <div className="report-card">
                            <div className="report-icon">👥</div>
                            <div className="report-info">
                                <h3>Members Report</h3>
                                <p>Generate detailed report of all platform members</p>
                                <div className="report-stats">
                                    <span className="stat">{reportData.users.length} Users</span>
                                    <span className="stat">{statistics.activeUsers} Active</span>
                                </div>
                            </div>
                            <button 
                                className="btn-generate-report"
                                onClick={() => handleGenerateReport('users')}
                                disabled={reportData.users.length === 0}
                            >
                                📄 Generate PDF
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">💪</div>
                            <div className="report-info">
                                <h3>Trainers Report</h3>
                                <p>Detailed report of all trainers and their status</p>
                                <div className="report-stats">
                                    <span className="stat">{reportData.trainers.length} Total</span>
                                    <span className="stat">{statistics.approvedTrainers} Approved</span>
                                    <span className="stat">{statistics.pendingTrainers} Pending</span>
                                </div>
                            </div>
                            <button 
                                className="btn-generate-report"
                                onClick={() => handleGenerateReport('trainers')}
                                disabled={reportData.trainers.length === 0}
                            >
                                📄 Generate PDF
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">⚡</div>
                            <div className="report-info">
                                <h3>Admins Report</h3>
                                <p>Administrator access and management report</p>
                                <div className="report-stats">
                                    <span className="stat">{reportData.admins.length} Admins</span>
                                </div>
                            </div>
                            <button 
                                className="btn-generate-report"
                                onClick={() => handleGenerateReport('admins')}
                                disabled={reportData.admins.length === 0}
                            >
                                📄 Generate PDF
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">📊</div>
                            <div className="report-info">
                                <h3>Complete Report</h3>
                                <p>Comprehensive report of all platform users</p>
                                <div className="report-stats">
                                    <span className="stat">{users.length} Total Users</span>
                                </div>
                            </div>
                            <button 
                                className="btn-generate-report"
                                onClick={() => handleGenerateReport('all')}
                                disabled={users.length === 0}
                            >
                                📄 Generate PDF
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">⏳</div>
                            <div className="report-info">
                                <h3>Pending Trainers</h3>
                                <p>Report of trainers awaiting approval</p>
                                <div className="report-stats">
                                    <span className="stat">{pendingTrainers.length} Pending</span>
                                </div>
                            </div>
                            <button 
                                className="btn-generate-report"
                                onClick={() => handleGenerateReport('pending-trainers')}
                                disabled={pendingTrainers.length === 0}
                            >
                                📄 Generate PDF
                            </button>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="analytics-section">
                        <h2>Platform Analytics</h2>
                        
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h3>User Distribution</h3>
                                <div className="distribution-chart">
                                    {generateUserDistribution() && Object.entries(generateUserDistribution()).map(([type, data]) => (
                                        <div key={type} className="distribution-item">
                                            <div className="distribution-bar">
                                                <div 
                                                    className="distribution-fill"
                                                    style={{ width: `${data.percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="distribution-label">
                                                <span className="type">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                                <span className="count">{data.count} ({data.percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Quick Stats</h3>
                                <div className="quick-stats">
                                    <div className="quick-stat">
                                        <span className="stat-value">{statistics.totalUsers}</span>
                                        <span className="stat-label">Total Users</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="stat-value">{statistics.totalTrainers}</span>
                                        <span className="stat-label">Total Trainers</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="stat-value">{statistics.approvedTrainers}</span>
                                        <span className="stat-label">Approved Trainers</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="stat-value">{statistics.pendingTrainers}</span>
                                        <span className="stat-label">Pending Trainers</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="stat-value">{statistics.activeUsers}</span>
                                        <span className="stat-label">Active Users</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="stat-value">{statistics.inactiveUsers}</span>
                                        <span className="stat-label">Inactive Users</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="platform-metrics">
                            <h3>Platform Metrics</h3>
                            <div className="metrics-cards">
                                <div className="metric-card">
                                    <div className="metric-icon">📈</div>
                                    <div className="metric-content">
                                        <span className="metric-value">94.2%</span>
                                        <span className="metric-label">User Engagement</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">✅</div>
                                    <div className="metric-content">
                                        <span className="metric-value">98.7%</span>
                                        <span className="metric-label">Approval Rate</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">🔄</div>
                                    <div className="metric-content">
                                        <span className="metric-value">99.9%</span>
                                        <span className="metric-label">Uptime</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">📱</div>
                                    <div className="metric-content">
                                        <span className="metric-value">+12.5%</span>
                                        <span className="metric-label">Growth (30d)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderUserModal = () => (
        <div className="modal-overlay-modern">
            <div className="modal-content-modern">
                <div className="modal-header-modern">
                    <h2>User Details</h2>
                    <button 
                        className="close-btn-modern"
                        onClick={() => setSelectedUser(null)}
                    >
                        ×
                    </button>
                </div>
                
                {selectedUser && (
                    <div className="user-details-modern">
                        <div className="user-header">
                            <div className="user-avatar-large">
                                {selectedUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info-main">
                                <h3>{selectedUser.name}</h3>
                                <p>{selectedUser.email}</p>
                                <div className="user-badges">
                                    <span className={`role-badge-modern ${selectedUser.userType}`}>
                                        {selectedUser.userType}
                                    </span>
                                    <span className={`status-badge-modern ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {selectedUser.userType === 'trainer' && (
                                        <span className={`status-badge-modern ${selectedUser.isApproved ? 'approved' : 'pending'}`}>
                                            {selectedUser.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="user-details-grid">
                            <div className="detail-section">
                                <h4>Contact Information</h4>
                                <div className="detail-item">
                                    <strong>Phone:</strong>
                                    <span>{selectedUser.phone || 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Member Since:</strong>
                                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            {selectedUser.userType === 'trainer' && (
                                <div className="detail-section">
                                    <h4>Trainer Information</h4>
                                    <div className="detail-item">
                                        <strong>Specialization:</strong>
                                        <span>{selectedUser.specialization || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Experience:</strong>
                                        <span>{selectedUser.experience || 0} years</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Membership Type:</strong>
                                        <span>{selectedUser.membershipType || 'Not specified'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="modal-actions-modern">
                    <button 
                        className="btn-secondary-modern"
                        onClick={() => setSelectedUser(null)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-container-modern">
            <nav className="admin-nav-modern">
                <div className="nav-brand-modern">
                    <div className="logo">⚡</div>
                    <h2>FitnessHub Admin</h2>
                </div>
                <div className="nav-actions-modern">
                    <div className="admin-info">
                        <span>Welcome, {currentUser?.name}</span>
                        <small>Administrator</small>
                    </div>
                    <button onClick={handleLogout} className="logout-button-modern">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="admin-content-modern">
                <div className="sidebar-modern">
                    <button
                        className={`nav-item-modern ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </button>
                    <button
                        className={`nav-item-modern ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <span className="nav-icon">👥</span>
                        User Management
                    </button>
                    <button
                        className={`nav-item-modern ${activeTab === 'pending-trainers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending-trainers')}    
                    >
                        <span className="nav-icon">⏳</span>
                        Pending Trainers
                        {pendingTrainers.length > 0 && (
                            <span className="nav-badge">{pendingTrainers.length}</span>
                        )}
                    </button>
                    <button
                        className={`nav-item-modern ${activeTab === 'subscription-plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subscription-plans')}
                    >
                        <span className="nav-icon">💰</span>
                        Subscription Plans
                    </button>
                    <button
                        className={`nav-item-modern ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <span className="nav-icon">📈</span>
                        Reports
                    </button>
                </div>

                <div className="main-content-modern">
                    {loading && <div className="loading-modern">Loading...</div>}
                    
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'pending-trainers' && renderPendingTrainers()}
                    {activeTab === 'reports' && renderReports()}
                    {activeTab === 'subscription-plans' && <SubscriptionPlans />}
                </div>
            </div>

            {selectedUser && renderUserModal()}
        </div>
    );
};

export default AdminDashboard;