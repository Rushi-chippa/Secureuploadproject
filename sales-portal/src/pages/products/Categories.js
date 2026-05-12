
import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Categories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await dataService.getCategories();
            // Backend returns list directly: [ {id, name...}, ... ]
            // Based on router.py: return db.query(Category)...
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dataService.addCategory(formData);
            toast.success("Category added successfully!");
            setShowModal(false);
            setFormData({ name: '', description: '' });
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Error adding category", error);
            toast.error(error.response?.data?.detail || "Failed to add category");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            try {
                await dataService.deleteCategory(id);
                toast.success("Category deleted successfully");
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category", error);
                toast.error(error.response?.data?.detail || "Failed to delete category");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Product Categories</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage product classifications</p>
                </div>
                {user.role === 'manager' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                    </button>
                )}
            </div>

            {/* Categories Grid */}
            {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group relative">
                            {user.role === 'manager' && (
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Category"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                                    {category.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">
                                    ID: {category.id}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                {category.description || "No description available."}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                Active
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        🗂️
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Categories Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 mb-6">
                        Create categories to organize your products efficiently.
                    </p>
                    {user.role === 'manager' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                            Add Category
                        </button>
                    )}
                </div>
            )}

            {/* Add Category Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-slate-100">Add New Category</h3>
                                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">✕</button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100"
                                            placeholder="e.g., Electronics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-slate-100"
                                            placeholder="Optional description..."
                                        />
                                    </div>
                                    <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                        >
                                            Add Category
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
