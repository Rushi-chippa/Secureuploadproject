import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from '../../context/DataContext';
import AddProduct from '../../components/products/AddProduct';

const AddProductPage = () => {
    const navigate = useNavigate();
    const { addProduct } = useData();

    const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'];

    const handleSubmit = async (productData) => {
        const result = await addProduct(productData);
        if (result.success) {
            toast.success('Product added successfully!');
            navigate('/products');
        } else {
            toast.error(result.message || 'Failed to add product');
        }
    };

    const handleCancel = () => {
        navigate('/products');
    };

    return (
        <div className="page-container" style={{ padding: '24px' }}>
            <div className="page-header">
                <h1>Add New Product</h1>
            </div>
            <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <AddProduct
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    categories={categories}
                />
            </div>
        </div>
    );
};

export default AddProductPage;
