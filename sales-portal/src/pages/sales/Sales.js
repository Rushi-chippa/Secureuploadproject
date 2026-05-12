import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Sales = () => {
    const { sales, products, salesmen, addSale, deleteSale, loading } = useData();
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/sales/add') {
            setShowModal(true);
        }
    }, [location]);

    const [formData, setFormData] = useState({
        productId: '',
        salesmanId: '',
        quantity: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        region: '', // Added region
        notes: '',
    });

    const resetForm = () => {
        setFormData({
            productId: '',
            salesmanId: '',
            quantity: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            customerName: '',
            region: '',
            notes: '',
        });
        setShowModal(false);
    };

    // Auto-calculate amount
    useEffect(() => {
        if (formData.productId && formData.quantity) {
            const product = products.find(p => p.id === parseInt(formData.productId));
            if (product) {
                const total = (product.price * parseInt(formData.quantity)).toFixed(2);
                setFormData(prev => ({ ...prev, amount: total }));
            }
        }
    }, [formData.productId, formData.quantity, products]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const saleData = {
            product_id: parseInt(formData.productId),
            user_id: parseInt(formData.salesmanId),
            quantity: parseInt(formData.quantity),
            amount: parseFloat(formData.amount),
            date: formData.date,
            customer_name: formData.customerName,
            region: formData.region,
            notes: formData.notes
        };

        const result = await addSale(saleData);

        if (result.success) {
            toast.success('Sale recorded successfully!');
            resetForm();
        } else {
            toast.error(result.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            const result = await deleteSale(id);
            if (result.success) {
                toast.success('Sale deleted!');
            } else {
                toast.error(result.message);
            }
        }
    };

    const calculateTotal = () => {
        return sales.reduce((sum, sale) => sum + sale.amount, 0);
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    };

    const getSalesmanName = (salesmanId) => {
        const salesman = salesmen.find(s => s.id === salesmanId);
        return salesman ? salesman.name : 'Unknown';
    };

    if (loading) {
        return <div className="loading">Loading sales...</div>;
    }

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sales Transactions</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your sales history</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                    <span className="text-xl">+</span> Record New Sale
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
                        💰
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{calculateTotal().toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                        📦
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Total Transactions</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{sales.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
                        📊
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Avg. Transaction</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            ₹{sales.length > 0 ? Math.round(calculateTotal() / sales.length).toLocaleString() : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-5">Date</th>
                                <th className="p-5">Product</th>
                                <th className="p-5">Salesman</th>
                                <th className="p-5">Client / Trader</th>
                                <th className="p-5 text-center">Quantity</th>
                                <th className="p-5 text-right">Amount</th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {sales.length > 0 ? (
                                [...sales].reverse().map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                                            {new Date(sale.date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-5">
                                            <span className="text-slate-800 dark:text-slate-100 font-medium block">
                                                {getProductName(sale.product_id)}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 font-bold">
                                                    {getSalesmanName(sale.user_id).charAt(0)}
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-200">{getSalesmanName(sale.user_id)}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-600 dark:text-slate-300">
                                            {sale.customer_name || <span className="text-slate-400 dark:text-slate-500 italic">N/A</span>}
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-sm font-medium">
                                                {sale.quantity}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right font-bold text-slate-800 dark:text-slate-100">
                                            ₹{sale.amount.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-center">
                                            <button
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                onClick={() => handleDelete(sale.id)}
                                                title="Delete Record"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">📭</span>
                                            <p>No sales records found. Start recording today!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Sale Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl sticky top-0 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Record New Sale</h2>
                            <button
                                onClick={resetForm}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 transition"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product *</label>
                                    <select
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 dark:bg-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-600"
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - ₹{product.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Salesman *</label>
                                    <select
                                        value={formData.salesmanId}
                                        onChange={(e) => setFormData({ ...formData, salesmanId: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 dark:bg-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-600"
                                    >
                                        <option value="">Select Salesman</option>
                                        {salesmen.map((salesman) => (
                                            <option key={salesman.id} value={salesman.id}>
                                                {salesman.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
                                        placeholder="e.g. 100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        readOnly
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Client / Trader Name</label>
                                    <input
                                        type="text"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
                                        placeholder="e.g. Laxmi Traders"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Region / Area</label>
                                <input
                                    type="text"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
                                    placeholder="e.g. North Zone"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
                                    rows="3"
                                    placeholder="Any additional details..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                                >
                                    Record Sale
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
