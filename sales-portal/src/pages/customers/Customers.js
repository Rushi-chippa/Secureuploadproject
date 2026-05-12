import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Customers = () => {
    const { customers, addCustomer, deleteCustomer, loading } = useData();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/customers/add') {
            setShowModal(true);
        }
    }, [location]);

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', address: '' });
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await addCustomer(formData);
        if (result.success) {
            toast.success('Customer added successfully!');
            resetForm();
        } else {
            toast.error(result.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            const result = await deleteCustomer(id);
            if (result.success) {
                toast.success('Customer deleted!');
            } else {
                toast.error(result.message);
            }
        }
    };

    if (loading) return <div className="loading">Loading customers...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Customers</h1>
                    <p>Manage your customer base</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Customer
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">👤</div>
                                                <strong>{customer.name}</strong>
                                            </div>
                                        </td>
                                        <td>{customer.email || '-'}</td>
                                        <td>{customer.phone || '-'}</td>
                                        <td>{customer.address || '-'}</td>
                                        <td>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDelete(customer.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data-row">
                                        No customers found. Add your first customer!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Customer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Customer</h2>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="input-field"
                                    placeholder="Customer Name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                    placeholder="Customer Address"
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
