import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Keep for direct sales fetch if needed, or switch to dataService
import { dataService } from '../../services/dataService'; // Add dataService
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Performance = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`); // YYYY-MM

    useEffect(() => {
        const fetchPerformanceData = async () => {
            setLoading(true);
            try {
                // Calculate Start and End Date for the selected month
                const [year, month] = selectedMonth.split('-');
                const startDate = `${year}-${month}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                const endDate = `${year}-${month}-${lastDay}`;

                // Fetch Monthly Sales
                const salesResponse = await api.get('/api/sales', {
                    params: {
                        start_date: startDate,
                        end_date: endDate
                    }
                });
                setSales(salesResponse.data);

                // Fetch Leaderboard for the month
                const leaderboardResponse = await dataService.getLeaderboard({ month: selectedMonth });
                setLeaderboard(leaderboardResponse.data.leaderboard);

            } catch (error) {
                console.error("Failed to fetch performance data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [selectedMonth, user.role]);

    // Aggregations
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalTransactions = sales.length;

    // Chart Data Preparation (Daily Sales)
    const dailySales = {};
    sales.forEach(sale => {
        const dateKey = new Date(sale.date).getDate();
        dailySales[dateKey] = (dailySales[dateKey] || 0) + sale.amount;
    });

    const daysInMonth = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dataPoints = labels.map(day => dailySales[day] || 0);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Daily Sales (₹)',
                data: dataPoints,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: false, text: 'Daily Sales Performance' },
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    const handleMonthChange = (offset) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const current = new Date(year, month - 1 + offset, 1);
        setSelectedMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonth = (isoMonth) => {
        const [year, month] = isoMonth.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Performance Data...</div>;

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-slate-50 dark:bg-slate-900" style={{ overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Performance</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your progress and sales history</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <button onClick={() => handleMonthChange(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">←</button>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 w-32 text-center select-none">{formatMonth(selectedMonth)}</span>
                    <button onClick={() => handleMonthChange(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">→</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-blue-500">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-green-500">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Units Sold</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{totalQuantity}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-purple-500">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Transactions</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{totalTransactions}</p>
                </div>
            </div>

            {/* Salesman Leaderboard (Visible to everyone) */}
            {leaderboard.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">🏆 Top Performing Salesmen ({formatMonth(selectedMonth)})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {leaderboard.map((salesman, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-100">{salesman.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">₹{salesman.revenue.toLocaleString()} Revenue</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">TGT: ₹{salesman.sales_target.toLocaleString()}</p>
                                    <p className={`text-xs font-bold ${salesman.achieved_percent >= 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                        {Math.round(salesman.achieved_percent)}% Done
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Daily Sales Trend</h3>
                <div className="h-48 sm:h-64">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-slate-100 dark:border-slate-700">
                    Transactions for {formatMonth(selectedMonth)}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Salesman</th> {/* New Column */}
                                <th className="p-4">Client</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {sales.length > 0 ? (
                                [...sales].sort((a, b) => new Date(a.date) - new Date(b.date)).map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                                            {new Date(sale.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-slate-800 dark:text-slate-100 font-medium">
                                            {sale.product_name || "Product " + sale.product_id}
                                        </td>
                                        <td className="p-4 text-indigo-600 dark:text-indigo-400 font-medium">
                                            {sale.salesman_name || "Unknown"}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {sale.customer_name || 'N/A'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">
                                                {sale.quantity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-100">
                                            ₹{sale.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500">
                                        No transactions found for this month.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Performance;
