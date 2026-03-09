import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './Products.css';

const AddProduct = ({ onSubmit, onCancel, initialData, isEdit = false, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        customCategory: '',
        price: '',
        quantity: '',
        description: '',
    });
    const [errors, setErrors] = useState({});
    const [useCustomCategory, setUseCustomCategory] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                category: initialData.category || '',
                customCategory: '',
                price: initialData.price || '',
                quantity: initialData.quantity || '',
                description: initialData.description || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!useCustomCategory && !formData.category) newErrors.category = 'Category is required';
        if (useCustomCategory && !formData.customCategory.trim()) newErrors.customCategory = 'Category is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const productData = {
            name: formData.name.trim(),
            category: useCustomCategory ? formData.customCategory.trim() : formData.category,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            description: formData.description.trim(),
        };

        onSubmit(productData);
    };

    return (
        <form className="product-form" onSubmit={handleSubmit}>
            {/* Product Name */}
            <div className="form-group">
                <label className="form-label">
                    Product Name <span className="required">*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
                <label className="form-label">
                    Category <span className="required">*</span>
                </label>
                <div className="category-toggle">
                    <button
                        type="button"
                        className={`toggle-option ${!useCustomCategory ? 'active' : ''}`}
                        onClick={() => setUseCustomCategory(false)}
                    >
                        Select Existing
                    </button>
                    <button
                        type="button"
                        className={`toggle-option ${useCustomCategory ? 'active' : ''}`}
                        onClick={() => setUseCustomCategory(true)}
                    >
                        New Category
                    </button>
                </div>
                {!useCustomCategory ? (
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`form-input ${errors.category ? 'input-error' : ''}`}
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleChange}
                        placeholder="Enter new category name"
                        className={`form-input ${errors.customCategory ? 'input-error' : ''}`}
                    />
                )}
                {(errors.category || errors.customCategory) && (
                    <span className="error-text">{errors.category || errors.customCategory}</span>
                )}
            </div>

            {/* Price & Quantity */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">
                        Price (₹) <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`form-input ${errors.price ? 'input-error' : ''}`}
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                </div>
                <div className="form-group">
                    <label className="form-label">
                        Quantity <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                    />
                    {errors.quantity && <span className="error-text">{errors.quantity}</span>}
                </div>
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief product description..."
                    rows="3"
                    className="form-input form-textarea"
                />
            </div>

            {/* Preview */}
            {formData.name && (
                <div className="product-preview">
                    <h4>Preview</h4>
                    <div className="preview-item">
                        <span className="preview-thumb">📦</span>
                        <div>
                            <p className="preview-name">{formData.name}</p>
                            <p className="preview-meta">
                                {(useCustomCategory ? formData.customCategory : formData.category) || 'No category'} •
                                {formData.price ? ` ₹${parseFloat(formData.price).toFixed(2)}` : ' ₹0.00'} •
                                {formData.quantity ? ` ${formData.quantity} in stock` : ' 0 in stock'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="form-actions">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit" icon={isEdit ? '💾' : '➕'}>
                    {isEdit ? 'Update Product' : 'Add Product'}
                </Button>
            </div>
        </form>
    );
};

export default AddProduct;