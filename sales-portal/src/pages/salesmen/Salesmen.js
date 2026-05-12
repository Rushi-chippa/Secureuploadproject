import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { dataService } from '../../services/dataService';

const Salesmen = () => {
    const { salesmen, sales, addSalesman, updateSalesman, deleteSalesman, updateSalesmanTarget, loading } = useData();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const monthOptions = React.useMemo(() => {
        const options = [];
        const date = new Date();
        const startYear = 2026;
        const startMonth = 0; // January
        
        while (date.getFullYear() > startYear || (date.getFullYear() === startYear && date.getMonth() >= startMonth)) {
            const val = date.toISOString().slice(0, 7);
            const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value: val, label });
            date.setMonth(date.getMonth() - 1);
        }
        return options;
    }, []);

    useEffect(() => {
        if (location.pathname === '/salesmen/add') {
            setShowModal(true);
        }
    }, [location]);

    const [consistencyScores, setConsistencyScores] = useState({});

    useEffect(() => {
        const loadScores = async () => {
            try {
                const res = await dataService.getSalesmanConsistency();
                const scoresMap = {};
                res.data.forEach(s => scoresMap[s.user_id] = s.cv);
                setConsistencyScores(scoresMap);
            } catch (err) {
                console.error("Failed to load consistency scores", err);
            }
        };
        loadScores();
    }, []);

    const [editingSalesman, setEditingSalesman] = useState(null);
    const [selectedSalesman, setSelectedSalesman] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        region: '',
        target: '',
        joinDate: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            region: '',
            target: '',
            joinDate: '',
        });
        setEditingSalesman(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const salesmanData = {
            ...formData,
            target: parseFloat(formData.target),
        };

        let result;

        if (editingSalesman) {
            result = await updateSalesman(editingSalesman.id, salesmanData);
            if (result.success) {
                await updateSalesmanTarget(editingSalesman.id, selectedMonth, salesmanData.target);
            }
        } else {
            result = await addSalesman(salesmanData);
            // The backend automatically sets the target for the current month when creating.
            // If the user selected a different month in the dropdown, let's explicitly update it.
            if (result.success && result.data && result.data.id) {
                await updateSalesmanTarget(result.data.id, selectedMonth, salesmanData.target);
            }
        }

        if (result.success) {
            toast.success(editingSalesman ? 'Salesman updated!' : 'Salesman added!');
            resetForm();
        } else {
            toast.error(result.message);
        }
    };

    const handleEdit = (salesman) => {
        setEditingSalesman(salesman);
        const isPastMonth = selectedMonth < currentMonthStr;
        const explicitTarget = salesman.monthly_targets?.find(m => m.month === selectedMonth)?.target_amount;
        const currentTarget = explicitTarget !== undefined ? explicitTarget : (isPastMonth ? salesman.target || 0 : 0);
        
        setFormData({
            name: salesman.name,
            email: salesman.email,
            phone: salesman.phone,
            region: salesman.region,
            target: currentTarget,
            joinDate: salesman.joinDate ? salesman.joinDate.split('T')[0] : '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salesman?')) {
            const result = await deleteSalesman(id);
            if (result.success) {
                toast.success('Salesman deleted!');
                if (selectedSalesman?.id === id) {
                    setSelectedSalesman(null);
                }
            } else {
                toast.error(result.message);
            }
        }
    };

    const getSalesmanStats = (salesmanId) => {
        const salesmanSales = sales.filter(s => {
            if (s.user_id !== salesmanId) return false;
            if (!s.date) return false;
            const saleMonth = new Date(s.date).toISOString().slice(0, 7);
            return saleMonth === selectedMonth;
        });
        const totalAmount = salesmanSales.reduce((sum, s) => sum + s.amount, 0);
        const count = salesmanSales.length;
        return { totalAmount, count };
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sales Team</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor your sales force performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {monthOptions.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    {user.role === 'manager' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Salesman
                        </button>
                    )}
                </div>
            </div>

            {/* Salesmen Grid */}
            {salesmen.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {salesmen.map((salesman) => {
                        const { totalAmount, count } = getSalesmanStats(salesman.id);
                        const isPastMonth = selectedMonth < currentMonthStr;
                        const explicitTarget = salesman.monthly_targets?.find(m => m.month === selectedMonth)?.target_amount;
                        const currentMonthlyTarget = explicitTarget !== undefined ? explicitTarget : (isPastMonth ? salesman.target || 0 : 0);
                        
                        const progress = currentMonthlyTarget ? (totalAmount / currentMonthlyTarget) * 100 : 0;
                        const isSelected = selectedSalesman?.id === salesman.id;

                        return (
                            <div
                                key={salesman.id}
                                onClick={() => setSelectedSalesman(salesman)}
                                className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-lg ${isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-blue-200'
                                    }`}
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold text-white shadow-inner ${['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500'][salesman.id % 4]
                                            }`}>
                                            {salesman.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-blue-600 transition-colors truncate">
                                                {salesman.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate block" title={salesman.email}>
                                                {salesman.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${salesman.region ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                        }`}>
                                        {salesman.region || 'No Region'}
                                    </span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Sales</div>
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            ₹
                                            {totalAmount.toLocaleString(undefined, {
                                                maximumFractionDigits: 0,
                                                notation: "compact"
                                            })}
                                        </div>
                                    </div>
                                    <div className="text-center border-x border-slate-200 dark:border-slate-600">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Orders</div>
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{count}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Target</div>
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            ₹
                                            {currentMonthlyTarget?.toLocaleString(undefined, {
                                                maximumFractionDigits: 0,
                                                notation: "compact"
                                            }) || '0'}
                                        </div>
                                    </div>
                                    <div className="col-span-3 border-t border-slate-200 dark:border-slate-600 mt-2 pt-2 flex justify-between items-center">
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Volatility (CV)</div>
                                        <div className={`text-xs font-bold ${consistencyScores[salesman.id] > 50 ? 'text-red-500' : 'text-green-600'}`}>
                                            {consistencyScores[salesman.id] ? `${Math.round(consistencyScores[salesman.id])}%` : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className={progress >= 100 ? "text-green-600 dark:text-green-400" : "text-slate-600 dark:text-slate-300"}>
                                            {progress >= 100 ? "Target Reached! 🎉" : "Progress"}
                                        </span>
                                        <span className="text-slate-800 dark:text-slate-100">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? "bg-green-500" : "bg-blue-600"
                                                }`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Actions (Hover only on desktop) */}
                                {/* Actions (Hover only on desktop) */}
                                {(user.role === 'manager' ||
                                    Number(user.id) === Number(salesman.id) ||
                                    user.email === salesman.email ||
                                    user.name === salesman.name
                                ) && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(salesman);
                                                }}
                                                className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm transition-colors"
                                                title="Edit Profile"
                                            >
                                                ✏️
                                            </button>
                                            {/* Only Manager can delete */}
                                            {user.role === 'manager' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(salesman.id);
                                                    }}
                                                    className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm transition-colors"
                                                    title="Delete Salesman"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        👥
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Salesmen Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 mb-6">
                        Get started by adding your first team member to track their performance.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Add Salesman
                    </button>
                </div>
            )}

            {/* Selected Stats Overview */}
            {selectedSalesman && (
                <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl max-w-sm border border-slate-800 relative">
                        <button
                            onClick={() => setSelectedSalesman(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-50 animate-pulse" />
                            {selectedSalesman.name}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                                <span className="text-slate-400">Revenue</span>
                                <span className="text-xl font-bold text-green-400">
                                    ₹{getSalesmanStats(selectedSalesman.id).totalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                                <span className="text-slate-400">Total Orders</span>
                                <span className="font-bold">{getSalesmanStats(selectedSalesman.id).count}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Avg. Order</span>
                                <span className="font-bold">
                                    ₹{getSalesmanStats(selectedSalesman.id).count > 0
                                        ? Math.round(getSalesmanStats(selectedSalesman.id).totalAmount / getSalesmanStats(selectedSalesman.id).count).toLocaleString()
                                        : 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity"
                            aria-hidden="true"
                            onClick={resetForm}
                        ></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal Panel */}
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-slate-100" id="modal-title">
                                        {editingSalesman ? 'Edit Salesman' : 'Add New Salesman'}
                                    </h3>
                                    <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-slate-100"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-slate-100"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-slate-100"
                                                placeholder="+91..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Region</label>
                                            <select
                                                value={formData.region}
                                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-slate-100"
                                            >
                                                <option value="">Select Region</option>
                                                <option value="North">North</option>
                                                <option value="South">South</option>
                                                <option value="East">East</option>
                                                <option value="West">West</option>
                                                <option value="Central">Central</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Target ({selectedMonth}) (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.target}
                                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-slate-100"
                                                placeholder="50000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Join Date</label>
                                            <input
                                                type="date"
                                                value={formData.joinDate}
                                                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                                        >
                                            {editingSalesman ? 'Update Salesman' : 'Add Salesman'}
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

export default Salesmen;
