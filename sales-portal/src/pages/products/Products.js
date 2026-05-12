import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { dataService } from '../../services/dataService';

const Products = () => {
    const { user } = useAuth();
    const { products, addProduct, updateProduct, deleteProduct, loading } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const location = useLocation();
    const [abcData, setAbcData] = useState({});

    useEffect(() => {
        const fetchABC = async () => {
            try {
                const res = await dataService.getABCAnalysis();
                setAbcData(res.data);
            } catch (err) {
                console.error("Failed to fetch ABC data", err);
            }
        };
        fetchABC();
    }, []);

    useEffect(() => {
        if (location.pathname === '/products/add' && user?.role !== 'salesman') {
            setShowModal(true);
            setEditingProduct(null); // Ensure we are in add mode
        }
    }, [location, user]);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        category: '',
        description: '',
        low_stock_threshold: '10',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            quantity: '',
            category: '',
            description: '',
            low_stock_threshold: '10',
        });
        setEditingProduct(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            low_stock_threshold: parseInt(formData.low_stock_threshold || 10),
        };

        let result;

        if (editingProduct) {
            result = await updateProduct(editingProduct.id, productData);
        } else {
            result = await addProduct(productData);
        }

        if (result.success) {
            toast.success(editingProduct ? 'Product updated!' : 'Product added!');
            resetForm();
        } else {
            toast.error(result.message);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            category: product.category,
            description: product.description,
            low_stock_threshold: product.low_stock_threshold,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const result = await deleteProduct(id);
            if (result.success) {
                toast.success('Product deleted!');
            } else {
                toast.error(result.message);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    return (
        <div className="products-page">
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p>Manage your product inventory</p>
                </div>
                {user?.role !== 'salesman' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Add Product
                    </button>
                )}
            </div>

            {/* Products Table */}
            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                {user?.role !== 'salesman' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-info">
                                                <div className="product-avatar">📦</div>
                                                <div>
                                                    <strong>{product.name}</strong>
                                                    <p>{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>#{product.id}</td>
                                        <td>
                                            {product.category}
                                            {abcData[product.id] && (
                                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${abcData[product.id] === 'A' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                                                        abcData[product.id] === 'B' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
                                                            'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    Class {abcData[product.id]}
                                                </span>
                                            )}
                                        </td>
                                        <td className="price">₹{product.price.toFixed(2)}</td>
                                        <td>
                                            <span className={`quantity ${product.quantity <= (product.low_stock_threshold || 10) ? 'low' : ''}`}>
                                                {product.quantity}
                                                {product.quantity <= (product.low_stock_threshold || 10) && (
                                                    <span className="ml-1" title="Low Stock">⚠️</span>
                                                )}
                                            </span>
                                        </td>
                                        {user?.role !== 'salesman' && (
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon edit"
                                                        onClick={() => handleEdit(product)}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-icon delete"
                                                        onClick={() => handleDelete(product.id)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data-row">
                                        No products found. Add your first product!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Food">Food & Beverages</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="input-field"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Low Stock Alert Threshold *</label>
                                    <input
                                        type="number"
                                        value={formData.low_stock_threshold}
                                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                                        required
                                        className="input-field"
                                        placeholder="e.g. 10"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update' : 'Add'} Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
