import React, { useState, useEffect } from 'react';
import { useCompany } from '../../context/CompanyContext';
import { toast } from 'react-toastify';
import './UserPages.css';

const CompanySettings = () => {
    const { company, updateCompany } = useCompany();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                address: company.address || '',
                phone: company.phone || '',
                email: company.email || '',
                website: company.website || ''
            });
        }
    }, [company]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would be an API call
        updateCompany(formData);
        setIsEditing(false);
        toast.success('Company settings updated!');
    };

    if (!company) return <div className="loading">Loading company settings...</div>;

    return (
        <div className="user-page-container">
            <header className="page-header">
                <h1>Company Settings</h1>
                <p>Manage your company profile and information</p>
            </header>

            <div className="company-card">
                <div className="company-header">
                    <div className="company-logo-placeholder">
                        🏢
                    </div>
                    <div className="company-info">
                        <h2>{company.name}</h2>
                        <span className="profile-role-badge">ID: #{company.id}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="info-grid">
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            ) : (
                                <div className="info-value">{company.name}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-value">{company.address || 'N/A'}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-value">{company.phone || 'N/A'}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            ) : (
                                <div className="info-value">{company.email || 'N/A'}</div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: company.name || '',
                                            address: company.address || '',
                                            phone: company.phone || '',
                                            email: company.email || ''
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Information
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanySettings;
