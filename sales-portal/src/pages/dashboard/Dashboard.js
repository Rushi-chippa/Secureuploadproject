import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const Dashboard = () => {
    const { sales, fetchAllData, getDashboardStats } = useData();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const monthOptions = React.useMemo(() => {
        const options = [];
        const date = new Date();
        date.setDate(1); // Prevent month rollover (e.g. May 31 - 1 month = May 1, not April 31)
        const startYear = 2026;
        const startMonth = 0;
        while (date.getFullYear() > startYear || (date.getFullYear() === startYear && date.getMonth() >= startMonth)) {
            const val = date.toISOString().slice(0, 7);
            const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value: val, label });
            date.setMonth(date.getMonth() - 1);
        }
        return options;
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchAllData();
                const [statsRes, kpiRes] = await Promise.all([
                    getDashboardStats({ month: selectedMonth }),
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
    }, [fetchAllData, getDashboardStats, selectedMonth]);

    if (loading) return <div className="p-6 dark:text-slate-300">Loading dashboard...</div>;
    if (!stats) return <div className="p-6 dark:text-slate-300">Failed to load dashboard data.</div>;

    const { total_revenue, total_orders, avg_order_value, recent_sales, total_company_target, achieved_percent } = stats;

    const currentMonthSales = {};
    const [selectedYear, selectedMonthIndexString] = selectedMonth.split('-');
    const currentYear = parseInt(selectedYear, 10);
    const currentMonthIndex = parseInt(selectedMonthIndexString, 10) - 1;
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) { currentMonthSales[i] = 0; }

    const filteredLocalSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonthIndex && saleDate.getFullYear() === currentYear;
    });
    filteredLocalSales.forEach(sale => { const d = new Date(sale.date); currentMonthSales[d.getDate()] += sale.amount; });

    const dailyLabels = Object.keys(currentMonthSales).map(day => `Day ${day}`);
    const dailyData = Object.values(currentMonthSales);
    const dailyChartData = { labels: dailyLabels, datasets: [{ label: 'Daily Sales', data: dailyData, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true, pointRadius: 2 }] };
    const dailyChartOptions = { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
            legend: { display: false }, 
            title: { display: true, text: `Sales Trend - ${new Date(currentYear, currentMonthIndex).toLocaleString('default', { month: 'long', year: 'numeric' })}` } 
        }, 
        scales: { 
            y: { 
                beginAtZero: true, 
                grid: { display: true, drawBorder: false },
                title: { display: true, text: 'Revenue (₹)', font: { size: 12, weight: 'bold' } }
            }, 
            x: { 
                grid: { display: false },
                title: { display: true, text: 'Day of Month', font: { size: 12, weight: 'bold' } }
            } 
        } 
    };

    const salesByMonth = {};
    sales.forEach(sale => { const d = new Date(sale.date); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; salesByMonth[key] = (salesByMonth[key] || 0) + sale.amount; });
    const recentKeys = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        recentKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const monthlyLabels = recentKeys.map(key => { const [y, m] = key.split('-'); return new Date(y, m - 1).toLocaleString('default', { month: 'short' }); });
    const monthlyData = recentKeys.map(key => salesByMonth[key] || 0);
    let forecastValue = 0;
    if (monthlyData.length >= 2) { const last = monthlyData[monthlyData.length - 1]; const prev = monthlyData[monthlyData.length - 2]; const growth = prev === 0 ? 0.1 : (last - prev) / prev; forecastValue = Math.round(last * (1 + growth)); } else if (monthlyData.length === 1) { forecastValue = Math.round(monthlyData[0] * 1.1); }
    const nextMonthDate = new Date(); nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    monthlyLabels.push(nextMonthDate.toLocaleString('default', { month: 'short' }) + ' (Fcst)');
    const forecastChartData = { labels: monthlyLabels, datasets: [{ label: 'Revenue', data: [...monthlyData, forecastValue], backgroundColor: context => context.dataIndex === monthlyLabels.length - 1 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(59, 130, 246, 0.8)', borderRadius: 4 }] };
    const forecastChartOptions = { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
            legend: { display: false }, 
            title: { display: true, text: 'Monthly Performance & Next Month Forecast' } 
        }, 
        scales: { 
            y: { 
                beginAtZero: true,
                title: { display: true, text: 'Revenue (₹)', font: { size: 12, weight: 'bold' } }
            },
            x: { 
                ticks: { maxRotation: 0, minRotation: 0, font: { size: 10 } },
                title: { display: true, text: 'Month', font: { size: 12, weight: 'bold' } }
            }
        } 
    };

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's your performance overview.</p>
                </div>
                <div className="w-full sm:w-auto">
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">
                        {monthOptions.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">💰</div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{total_revenue.toLocaleString()}</p>
                            {stats.kpis && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Run Rate: ₹{stats.kpis.run_rate.toLocaleString()}</p>}
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">📦</div>
                        <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</p><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total_orders}</p></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-2xl">🎯</div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Target Achievement</p>
                            <div className="flex justify-between items-end"><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{achieved_percent}%</p><p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Target: ₹{total_company_target.toLocaleString()}</p></div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden"><div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${Math.min(achieved_percent, 100)}%` }}></div></div>
                        </div>
                    </div>
                </div>
                {stats.kpis && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl">👥</div>
                            <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Salesmen</p><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.kpis.active_salesmen_ratio}%</p><p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Weekly Activity</p></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="h-48 sm:h-64">
                        <Line options={dailyChartOptions} data={dailyChartData} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="h-48 sm:h-64">
                        <Bar options={forecastChartOptions} data={forecastChartData} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="h-48 sm:h-64">
                        <Bar options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Top 5 Products by Revenue' } }, scales: { x: { beginAtZero: true } } }}
                            data={{ labels: Object.entries(filteredLocalSales.reduce((acc, sale) => { acc[sale.product_name] = (acc[sale.product_name] || 0) + sale.amount; return acc; }, {})).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name]) => name), datasets: [{ label: 'Revenue', data: Object.entries(filteredLocalSales.reduce((acc, sale) => { acc[sale.product_name] = (acc[sale.product_name] || 0) + sale.amount; return acc; }, {})).sort(([, a], [, b]) => b - a).slice(0, 5).map(([, amount]) => amount), backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(249,115,22,0.8)', 'rgba(139,92,246,0.8)', 'rgba(239,68,68,0.8)'], borderRadius: 4 }] }} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Sales</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                            <tr><th className="px-4 py-3 rounded-l-lg">Product</th><th className="px-4 py-3">Salesman</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3 rounded-r-lg">Date</th></tr>
                        </thead>
                        <tbody>
                            {recent_sales && recent_sales.length > 0 ? recent_sales.map((sale) => (
                                <tr key={sale.id} className="border-b border-gray-50 dark:border-slate-700 last:border-none">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{sale.product}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.salesman}</td>
                                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">₹{sale.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(sale.date).toLocaleDateString()}</td>
                                </tr>
                            )) : (<tr><td colSpan="4" className="text-center py-4 text-slate-500 dark:text-slate-400">No recent sales found.</td></tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right"><Link to="/sales" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">View All Sales →</Link></div>
            </div>
        </div>
    );
};

export default Dashboard;
