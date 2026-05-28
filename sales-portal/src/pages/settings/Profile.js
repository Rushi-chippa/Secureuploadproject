import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import './UserPages.css';

const Profile = () => {
    const { user, updateUser } = useAuth();

    // Fetch company name from localStorage (saved during login/register)
    const company = (() => {
        try { return JSON.parse(localStorage.getItem('company')) || {}; } catch { return {}; }
    })();

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(user?.name || user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef(null);

    if (!user) return <div className="loading">Loading profile...</div>;

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase();
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setRemoveAvatar(false);
        }
    };

    const handleRemoveAvatar = (e) => {
        e.stopPropagation(); // prevent clicking the container
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast.error("Full name cannot be empty");
            return;
        }
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('full_name', fullName.trim());
            formData.append('phone', phone.trim());
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            if (removeAvatar) {
                formData.append('remove_avatar', 'true');
            }

            const response = await authService.updateProfile(formData);
            const updatedUser = response.data.user;

            // Update AuthContext & localStorage with ALL returned fields including phone
            updateUser({
                name: updatedUser.name,
                full_name: updatedUser.name,
                phone: updatedUser.phone,
                company_id: updatedUser.company_id,
                avatar: updatedUser.avatar
            });

            // Sync local state so the view reflects the saved phone immediately
            setPhone(updatedUser.phone || '');
            setFullName(updatedUser.name || '');

            toast.success("Profile updated successfully!");
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            setRemoveAvatar(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.detail || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        setFullName(user?.name || user?.full_name || '');
        setPhone(user?.phone || '');
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(false);
        setIsEditing(false);
    };

    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';
    const displayAvatar = !removeAvatar && (avatarPreview
        || (user.avatar
            ? (user.avatar.startsWith('http') || user.avatar.startsWith('data:')
                ? user.avatar
                : `${apiBase}${user.avatar}`)
            : null));

    const displayName = user.name || user.full_name || 'User';
    const displayPhone = user.phone || '';

    return (
        <div className="user-page-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>My Profile</h1>
                    <p>View and manage your personal information</p>
                </div>
                {!isEditing && (
                    <button className="btn-primary" onClick={() => {
                        setFullName(displayName);
                        setPhone(displayPhone);
                        setIsEditing(true);
                    }}>
                        ✏️ Edit Profile
                    </button>
                )}
            </header>

            <div className="profile-card">
                <div className="profile-header">
                    {/* Avatar — click to change when editing */}
                    <div
                        className={`profile-avatar-large-container${isEditing ? ' editable' : ''}`}
                        onClick={handleAvatarClick}
                        title={isEditing ? 'Click to change profile picture' : ''}
                    >
                        <div className="profile-avatar-large">
                            {displayAvatar ? (
                                <img src={displayAvatar} alt="Profile" />
                            ) : (
                                getInitials(displayName)
                            )}
                        </div>

                        {/* Always-visible camera badge */}
                        <div className="avatar-camera-badge" title="Update profile picture">
                            📷
                        </div>

                        {/* Hover overlay — only active in edit mode via CSS */}
                        <div className="avatar-hover-overlay">
                            <span className="camera-icon-lg">📷</span>
                            <span>Change Photo</span>
                        </div>
                        
                        {/* Remove avatar button in edit mode */}
                        {isEditing && displayAvatar && (
                            <button
                                type="button"
                                className="avatar-remove-btn"
                                onClick={handleRemoveAvatar}
                                title="Remove photo"
                            >
                                ✕
                            </button>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="profile-info">
                        <h2>{displayName}</h2>
                        <span className="profile-role-badge" style={{ textTransform: 'capitalize' }}>
                            {user.role}
                        </span>
                        {company.name && (
                            <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
                                🏢 {company.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="info-grid">
                    {/* Full Name — editable */}
                    <div className="info-item">
                        <label className="form-label">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        ) : (
                            <div className="info-value">{displayName}</div>
                        )}
                    </div>

                    {/* Email — read only */}
                    <div className="info-item">
                        <label className="form-label">Email Address</label>
                        <div className="info-value">{user.email}</div>
                    </div>

                    {/* Employee ID — read only */}
                    <div className="info-item">
                        <label className="form-label">Employee ID</label>
                        <div className="info-value">{user.employee_id || user.id || '—'}</div>
                    </div>

                    {/* Contact Number — editable */}
                    <div className="info-item">
                        <label className="form-label">Contact Number</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                className="form-input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter contact number"
                            />
                        ) : (
                            <div className="info-value">{displayPhone || 'Not Provided'}</div>
                        )}
                    </div>

                    {/* Company — read only, shows name */}
                    <div className="info-item">
                        <label className="form-label">Company</label>
                        <div className="info-value">
                            {company.name || `Company #${user.company_id || 'N/A'}`}
                        </div>
                    </div>

                    {/* Status — read only */}
                    <div className="info-item">
                        <label className="form-label">Status</label>
                        <div className="info-value" style={{ textTransform: 'capitalize', color: '#16a34a', fontWeight: 600 }}>
                            ● {user.status || 'Active'}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={handleCancel} disabled={updating}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSave} disabled={updating}>
                            {updating ? "Saving..." : "💾 Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
