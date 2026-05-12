import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './UserPages.css';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div className="loading">Loading profile...</div>;

    const getInitials = (nameOrFirst, last) => {
        if (last) return `${nameOrFirst?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
        return nameOrFirst?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '';
    };

    return (
        <div className="user-page-container">
            <header className="page-header">
                <h1>My Profile</h1>
                <p>View and manage your personal information</p>
            </header>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" />
                        ) : (
                            getInitials(user.full_name || user.firstName, user.lastName)
                        )}
                    </div>
                    <div className="profile-info">
                        <h2>{user.full_name || `${user.firstName} ${user.lastName}`}</h2>
                        <span className="profile-role-badge">{user.role}</span>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <label>Email Address</label>
                        <div className="info-value">{user.email}</div>
                    </div>
                    <div className="info-item">
                        <label>Employee ID</label>
                        <div className="info-value">{user.employee_id || user.id}</div>
                    </div>
                    <div className="info-item">
                        <label>Contact Number</label>
                        <div className="info-value">{user.phone || 'Not Provided'}</div>
                    </div>
                    <div className="info-item">
                        <label>Company ID</label>
                        <div className="info-value">#{user.company_id}</div>
                    </div>
                    <div className="info-item">
                        <label>Status</label>
                        <div className="info-value" style={{ textTransform: 'capitalize' }}>
                            {user.status || 'Active'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
