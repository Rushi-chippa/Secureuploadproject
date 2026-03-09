import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

const Dashboard = () => {
    const { sales, fetchAllData, getDashboardStats } = useData();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllData();
                const [statsRes, kpiRes] = await Promise.all([
                    getDashboardStats(),
                    dataService.getExecutiveKPIs()
                ]);
                setStats({ ...statsRes.data, kpis: kpiRes.data });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchAllData, getDashboardStats]);

    if (loading) {
        return <div className="p-6">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="p-6">Failed to load dashboard data.</div>;
    }

    const { total_revenue, total_orders, avg_order_value, recent_sales } = stats;

    // --- CHART 1: Current Month Daily Trend (Line Chart) ---
    const currentMonthSales = {};
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    // Initialize all days with 0
    for (let i = 1; i <= daysInMonth; i++) {
        currentMonthSales[i] = 0;
    }

    sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        if (saleDate.getMonth() === currentMonthIndex && saleDate.getFullYear() === currentYear) {
            const day = saleDate.getDate();
            currentMonthSales[day] += sale.amount;
        }
    });

    const dailyLabels = Object.keys(currentMonthSales).map(day => `Day ${day}`);
    const dailyData = Object.values(currentMonthSales);

    const dailyChartData = {
        labels: dailyLabels,
        datasets: [
            {
                label: 'Daily Sales',
                data: dailyData,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 2,
            }
        ]
    };

    const dailyChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: `Sales Trend - ${today.toLocaleString('default', { month: 'long' })}` }
        },
        scales: {
            y: { beginAtZero: true, grid: { display: true, drawBorder: false } },
            x: { grid: { display: false } }
        }
    };

    // --- CHART 2: Monthly Forecast (Bar Chart) ---
    const salesByMonth = {};
    sales.forEach(sale => {
        const d = new Date(sale.date);
        // Key format: YYYY-MM for sorting
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        salesByMonth[key] = (salesByMonth[key] || 0) + sale.amount;
    });

    // Sort and get last 6 months
    const sortedMonthKeys = Object.keys(salesByMonth).sort();
    const recentKeys = sortedMonthKeys.slice(-6); // Last 6 months

    const monthlyLabels = recentKeys.map(key => {
        const [y, m] = key.split('-');
        return new Date(y, m - 1).toLocaleString('default', { month: 'short' });
    });
    const monthlyData = recentKeys.map(key => salesByMonth[key]);

    // Forecast Logic
    let forecastValue = 0;
    if (monthlyData.length >= 2) {
        const last = monthlyData[monthlyData.length - 1];
        const prev = monthlyData[monthlyData.length - 2];
        const growth = prev === 0 ? 0.1 : (last - prev) / prev;
        forecastValue = Math.round(last * (1 + growth));
    } else if (monthlyData.length === 1) {
        forecastValue = Math.round(monthlyData[0] * 1.1);
    }

    // Add Next Month Label
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    monthlyLabels.push(nextMonthDate.toLocaleString('default', { month: 'short' }) + ' (Forecast)');

    // Data for Bar Chart: Distinct colors for History vs Forecast
    const forecastChartData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Revenue',
                data: [...monthlyData, forecastValue],
                backgroundColor: context => {
                    return context.dataIndex === monthlyLabels.length - 1
                        ? 'rgba(16, 185, 129, 0.8)' // Green for Forecast
                        : 'rgba(59, 130, 246, 0.8)'; // Blue for History
                },
                borderRadius: 4,
            }
        ]
    };

    const forecastChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Monthly Performance & Next Month Forecast' }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">💰</div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-slate-800">₹{total_revenue.toLocaleString()}</p>
                            {stats.kpis && (
                                <p className="text-xs text-green-600 mt-1">
                                    Run Rate: ₹{stats.kpis.run_rate.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">📦</div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-800">{total_orders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">📈</div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-slate-800">₹{avg_order_value}</p>
                        </div>
                    </div>
                </div>

                {stats.kpis && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">👥</div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Salesmen</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.kpis.active_salesmen_ratio}%</p>
                                <p className="text-xs text-slate-400 mt-1">Weekly Activity</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Split Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <Line options={dailyChartOptions} data={dailyChartData} height={200} />
                </div>

                {/* Monthly Forecast */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <Bar options={forecastChartOptions} data={forecastChartData} height={200} />
                </div>
            </div>

            {/* Top Products Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <Bar
                        options={{
                            indexAxis: 'y',
                            responsive: true,
                            plugins: {
                                legend: { display: false },
                                title: { display: true, text: 'Top 5 Products by Revenue' }
                            },
                            scales: {
                                x: { beginAtZero: true }
                            }
                        }}
                        data={{
                            labels: Object.entries(sales.reduce((acc, sale) => {
                                acc[sale.product_name] = (acc[sale.product_name] || 0) + sale.amount;
                                return acc;
                            }, {}))
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([name]) => name),
                            datasets: [{
                                label: 'Revenue',
                                data: Object.entries(sales.reduce((acc, sale) => {
                                    acc[sale.product_name] = (acc[sale.product_name] || 0) + sale.amount;
                                    return acc;
                                }, {}))
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([, amount]) => amount),
                                backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)', // Blue
                                    'rgba(16, 185, 129, 0.8)', // Green
                                    'rgba(249, 115, 22, 0.8)', // Orange
                                    'rgba(139, 92, 246, 0.8)', // Purple
                                    'rgba(239, 68, 68, 0.8)',  // Red
                                ],
                                borderRadius: 4
                            }]
                        }}
                        height={100}
                    />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Sales</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Product</th>
                                <th className="px-4 py-3">Salesman</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3 rounded-r-lg">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_sales && recent_sales.length > 0 ? (
                                recent_sales.map((sale) => (
                                    <tr key={sale.id} className="border-b border-gray-50 last:border-none">
                                        <td className="px-4 py-3 font-medium text-slate-700">{sale.product}</td>
                                        <td className="px-4 py-3 text-slate-600">{sale.salesman}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">₹{sale.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-slate-500">No recent sales found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right">
                    <Link to="/sales" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View All Sales →</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;