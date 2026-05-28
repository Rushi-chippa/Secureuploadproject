import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { dataService } from '../../services/dataService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const Analytics = () => {
    const { getPredictions, getReportsData, sales, products } = useData();
    const [reportData, setReportData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState('all');
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const [rfmData, setRfmData] = useState([]);
    const [abcData, setAbcData] = useState({});
    const [forecastRange, setForecastRange] = useState(6); // Default to 6 months

    useEffect(() => {
        const fetchData = async () => {

            setLoading(true);
            try {
                // Calculate start and end date for the selected month to pass to `/reports` API
                const [year, m] = selectedMonth.split('-');
                const startDate = `${year}-${m}-01`;
                const endDay = new Date(year, m, 0).getDate();
                const endDate = `${year}-${m}-${endDay}`;

                // Fetch basic report data
                const reportRes = await getReportsData({ start_date: startDate, end_date: endDate });
                setReportData(reportRes.data);

                // Fetch AI Predictions & Advanced Analytics
                const [predictRes, rfmRes, abcRes] = await Promise.all([
                    getPredictions({ month: selectedMonth, product_id: selectedProduct !== 'all' ? selectedProduct : undefined }),
                    dataService.getRFMAnalysis(),
                    dataService.getABCAnalysis()
                ]);

                setPredictionData(predictRes.data);
                setRfmData(rfmRes.data);
                setAbcData(abcRes.data);

            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedMonth, selectedProduct, getReportsData, getPredictions]);

    if (loading) {
        return <div className="p-6 dark:text-slate-300">Loading analytics...</div>;
    }

    if (!reportData) {
        return <div className="p-6 dark:text-slate-300">Failed to load analytics data.</div>;
    }

    const { sales_by_salesman, sales_by_product, sales_by_month } = reportData;

    // Process Product-Specific Data if needed
    const isProductDrillDown = selectedProduct !== 'all';
    const selectedProductObj = products.find(p => p.id === parseInt(selectedProduct));

    let finalStats = {
        totalRevenue: Object.values(sales_by_salesman).reduce((sum, s) => sum + s.amount, 0),
        totalOrders: Object.values(sales_by_salesman).reduce((sum, s) => sum + s.count, 0),
        avgOrderValue: 0
    };
    finalStats.avgOrderValue = finalStats.totalOrders > 0 ? finalStats.totalRevenue / finalStats.totalOrders : 0;

    // Global Chart Data
    const salesmanChartData = {
        labels: Object.keys(sales_by_salesman),
        datasets: [{
            label: 'Sales Amount',
            data: Object.values(sales_by_salesman).map(s => s.amount),
            backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96'],
        }],
    };

    const productChartData = {
        labels: Object.keys(sales_by_product),
        datasets: [{
            label: 'Revenue by Product',
            data: Object.values(sales_by_product).map(p => p.amount),
            backgroundColor: '#1890ff',
        }],
    };

    const last6MonthsGlobal = [];
    const todayGlobal = new Date();
    for (let i = 4; i >= 0; i--) {
        const d = new Date(todayGlobal.getFullYear(), todayGlobal.getMonth() - i, 1);
        last6MonthsGlobal.push(d.toISOString().slice(0, 7));
    }

    const monthlyChartLabels = last6MonthsGlobal.map(m => new Date(m).toLocaleString('default', { month: 'short' }));
    const monthlyChartValues = last6MonthsGlobal.map(m => sales_by_month[m] || 0);

    const monthlyChartData = {
        labels: monthlyChartLabels,
        datasets: [{
            label: 'Monthly Sales',
            data: monthlyChartValues,
            borderColor: '#1890ff',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            tension: 0.4,
            fill: true,
        }],
    };

    const commonMonthlyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Revenue (₹)', font: { weight: 'bold' } }
            },
            x: {
                title: { display: true, text: 'Month', font: { weight: 'bold' } }
            }
        }
    };

    let displayMonthlyChartData = monthlyChartData;
    let displaySalesmanChartData = salesmanChartData;
    let displayProductChartData = productChartData;

    if (isProductDrillDown) {
        // Filter raw sales for this product
        const productSales = sales.filter(s => s.product_id === parseInt(selectedProduct));
        const filteredProductSales = productSales.filter(s => s.date.startsWith(selectedMonth));

        finalStats.totalRevenue = filteredProductSales.reduce((sum, s) => sum + s.amount, 0);
        finalStats.totalOrders = filteredProductSales.length;
        finalStats.avgOrderValue = finalStats.totalOrders > 0 ? finalStats.totalRevenue / finalStats.totalOrders : 0;

        // Specific Salesman chart for this product
        const smDist = filteredProductSales.reduce((acc, s) => {
            acc[s.salesman_name || 'Unknown'] = (acc[s.salesman_name || 'Unknown'] || 0) + s.amount;
            return acc;
        }, {});

        displaySalesmanChartData = {
            labels: Object.keys(smDist),
            datasets: [{
                label: 'Revenue by Salesman',
                data: Object.values(smDist),
                backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96'],
            }]
        };

        // Monthly trend for this specific product (last 6 months)
        const last6Months = [];
        const todayDrill = new Date();
        for (let i = 4; i >= 0; i--) {
            const d = new Date(todayDrill.getFullYear(), todayDrill.getMonth() - i, 1);
            last6Months.push(d.toISOString().slice(0, 7));
        }

        const productMonthlyTrend = last6Months.reduce((acc, month) => {
            const label = new Date(month).toLocaleString('default', { month: 'short' });
            acc[label] = productSales
                .filter(s => s.date.startsWith(month))
                .reduce((sum, s) => sum + s.amount, 0);
            return acc;
        }, {});

        displayMonthlyChartData = {
            labels: Object.keys(productMonthlyTrend),
            datasets: [{
                label: `Sales Trend: ${selectedProductObj?.name}`,
                data: Object.values(productMonthlyTrend),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        };
    }

    // Prediction Chart Data
    let predictionChartData = null;
    if (predictionData && predictionData.history && predictionData.forecast) {
        const historyLabels = predictionData.history.map(d => new Date(d.date).toLocaleDateString('default', { month: 'short', year: '2-digit' }));
        const filteredForecast = predictionData.forecast.slice(0, forecastRange);
        const forecastLabels = filteredForecast.map(d => new Date(d.date).toLocaleDateString('default', { month: 'short', year: '2-digit' }));

        const lastHistoryValue = predictionData.history[predictionData.history.length - 1]?.amount || 0;

        const historyCount = predictionData.history.length;
        const hasHistory = historyCount > 0;

        predictionChartData = {
            labels: [...historyLabels, ...forecastLabels],
            datasets: [
                {
                    label: 'Historical Sales',
                    data: [...predictionData.history.map(d => d.amount), ...new Array(filteredForecast.length).fill(null)],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    tension: 0.4,
                    fill: 'origin',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                },
                {
                    label: 'AI Predicted Forecast',
                    data: [
                        ...new Array(Math.max(0, hasHistory ? historyCount - 1 : 0)).fill(null),
                        ...(hasHistory ? [lastHistoryValue] : []),
                        ...filteredForecast.map(d => d.predicted_amount)
                    ],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderDash: [6, 4],
                    tension: 0.4,
                    fill: 'origin',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                }
            ]
        };

    }



    // RFM Chart Data
    const rfmSegments = rfmData.reduce((acc, curr) => {
        acc[curr.segment] = (acc[curr.segment] || 0) + 1;
        return acc;
    }, {});

    // Group customers by segment for tooltip
    const rfmDetails = rfmData.reduce((acc, curr) => {
        if (!acc[curr.segment]) acc[curr.segment] = [];
        acc[curr.segment].push(`${curr.customer_name} (₹${curr.monetary})`);
        return acc;
    }, {});

    const rfmChartData = {
        labels: Object.keys(rfmSegments),
        datasets: [{
            data: Object.values(rfmSegments),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        }]
    };

    const rfmOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const customers = rfmDetails[label] || [];
                        const topCustomers = customers.slice(0, 5); // Show top 5
                        const remaining = customers.length - 5;

                        let lines = [`${label}: ${value} Customers`];
                        topCustomers.forEach(c => lines.push(`  • ${c}`));
                        if (remaining > 0) lines.push(`  ...and ${remaining} more`);

                        return lines;
                    }
                }
            },
            legend: {
                position: 'bottom'
            }
        }
    };

    // ABC Chart Data
    // abcData is now [{product_id, name, amount, class}, ...]
    // We need to group by class
    const abcGroups = { A: [], B: [], C: [] };
    if (Array.isArray(abcData)) {
        abcData.forEach(item => {
            if (abcGroups[item.class]) {
                abcGroups[item.class].push(item);
            }
        });
    }

    const abcChartData = {
        labels: ['Class A', 'Class B', 'Class C'],
        datasets: [{
            label: 'Product Count',
            data: [abcGroups.A.length, abcGroups.B.length, abcGroups.C.length],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        }]
    };

    const abcOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label;
                        const className = label.split(' ')[1]; // "Class A" -> "A"
                        const products = abcGroups[className] || [];
                        const value = context.raw;

                        // Sort by amount desc
                        products.sort((a, b) => b.amount - a.amount);

                        const topProducts = products.slice(0, 5);
                        const remaining = products.length - 5;

                        let lines = [`${label}: ${value} Products`];
                        topProducts.forEach(p => lines.push(`  • ${p.name} (₹${p.amount})`));
                        if (remaining > 0) lines.push(`  ...and ${remaining} more`);

                        return lines;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Visual insights and AI predictions</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none min-w-[160px]"
                    >
                        <option value="all">All Products</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {monthOptions.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">💰</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{isProductDrillDown ? 'Product Revenue' : 'Total Revenue'}</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{finalStats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">📦</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{isProductDrillDown ? 'Units Sold' : 'Total Orders'}</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{finalStats.totalOrders}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-2xl">📊</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Order Value</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{finalStats.avgOrderValue.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* AI Prediction Section */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700" style={{ overflow: 'hidden' }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>🤖</span> AI Sales Forecast
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Predicted revenue for the next 6 months</p>
                    </div>
                </div>

                {/* Forecast Summary Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => setForecastRange(1)}
                        className={`text-left transition-all duration-300 transform hover:scale-[1.02] p-6 rounded-3xl border-2 shadow-sm flex flex-col justify-between h-48 ${forecastRange === 1
                            ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
                            : 'bg-white dark:bg-slate-700 border-blue-50 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-blue-200'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`p-3 rounded-2xl text-2xl ${forecastRange === 1 ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'
                                }`}>📅</span>
                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${forecastRange === 1 ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'
                                }`}>Next Month</span>
                        </div>
                        <div>
                            <p className={`text-sm font-medium mb-1 ${forecastRange === 1 ? 'text-blue-100' : 'text-slate-500'}`}>Predicted Revenue</p>
                            <p className="text-3xl font-extrabold">₹{(predictionData?.summary?.forecast_1m || 0).toLocaleString()}</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setForecastRange(3)}
                        className={`text-left transition-all duration-300 transform hover:scale-[1.02] p-6 rounded-3xl border-2 shadow-sm flex flex-col justify-between h-48 ${forecastRange === 3
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200'
                            : 'bg-white dark:bg-slate-700 border-indigo-50 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-indigo-200'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`p-3 rounded-2xl text-2xl ${forecastRange === 3 ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'
                                }`}>📈</span>
                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${forecastRange === 3 ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'
                                }`}>Next 3 Months</span>
                        </div>
                        <div>
                            <p className={`text-sm font-medium mb-1 ${forecastRange === 3 ? 'text-indigo-100' : 'text-slate-500'}`}>Predicted Revenue</p>
                            <p className="text-3xl font-extrabold">₹{(predictionData?.summary?.forecast_3m || 0).toLocaleString()}</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setForecastRange(6)}
                        className={`text-left transition-all duration-300 transform hover:scale-[1.02] p-6 rounded-3xl border-2 shadow-sm flex flex-col justify-between h-48 ${forecastRange === 6
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200'
                            : 'bg-white dark:bg-slate-700 border-emerald-50 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-emerald-200'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`p-3 rounded-2xl text-2xl ${forecastRange === 6 ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                                }`}>🚀</span>
                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${forecastRange === 6 ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500'
                                }`}>Next 6 Months</span>
                        </div>
                        <div>
                            <p className={`text-sm font-medium mb-1 ${forecastRange === 6 ? 'text-emerald-100' : 'text-slate-500'}`}>Predicted Revenue</p>
                            <p className="text-3xl font-extrabold">₹{(predictionData?.summary?.forecast_6m || 0).toLocaleString()}</p>
                        </div>
                    </button>
                </div>



                <div className="h-64 sm:h-[28rem]" style={{ overflow: 'hidden' }}>
                    {predictionChartData ? (
                        <Line
                            data={predictionChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: {
                                            usePointStyle: true,
                                            padding: 20,
                                            font: { size: 12, weight: '600' }
                                        }
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        titleColor: '#1e293b',
                                        bodyColor: '#475569',
                                        borderColor: '#e2e8f0',
                                        borderWidth: 1,
                                        padding: 12,
                                        displayColors: true,
                                        callbacks: {
                                            label: function (context) {
                                                let label = context.dataset.label || '';
                                                if (label) { label += ': '; }
                                                if (context.parsed.y !== null) {
                                                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                                                }
                                                return label;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                                        ticks: {
                                            font: { size: 11 },
                                            callback: (value) => '₹' + value.toLocaleString('en-IN')
                                        }
                                    },
                                    x: {
                                        grid: { display: false, drawBorder: false },
                                        ticks: { font: { size: 11, weight: '500' } }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Not enough data for prediction</div>
                    )}
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700" style={{ overflow: 'hidden', minWidth: 0 }}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
                        {isProductDrillDown ? 'Sales Trend (Last 6 Months)' : 'Global Sales Trend'}
                    </h3>
                    <div className="h-48 sm:h-64">
                        <Line data={displayMonthlyChartData} options={commonMonthlyOptions} />
                    </div>
                </div>
 
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700" style={{ overflow: 'hidden', minWidth: 0 }}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
                        {isProductDrillDown ? `Top Sellers for ${selectedProductObj?.name}` : 'Sales by Salesman'}
                    </h3>
                    <div className="h-48 sm:h-64">
                        <Pie
                            data={displaySalesmanChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            boxWidth: 12,
                                            padding: 15,
                                            font: { size: 11 }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
 
                {!isProductDrillDown && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 lg:col-span-2 overflow-x-auto" style={{ minWidth: 0 }}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Revenue by Product</h3>
                    <div className="h-72 sm:h-64 w-full">
                        <Bar data={displayProductChartData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: {
                                    title: { display: true, text: 'Product Name', font: { weight: 'bold' } },
                                    ticks: {
                                        maxRotation: 45,
                                        minRotation: 25,
                                        font: { size: 10 },
                                        callback: function(value) {
                                            const label = this.getLabelForValue(value);
                                            return label.length > 15 ? label.substring(0, 15) + '...' : label;
                                        }
                                    }
                                },
                                y: { 
                                    beginAtZero: true,
                                    title: { display: true, text: 'Revenue (₹)', font: { weight: 'bold' } }
                                }
                            }
                        }} />
                    </div>
                </div>
                )}

                {isProductDrillDown && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 lg:col-span-2" style={{ overflow: 'hidden', minWidth: 0 }}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Current Product Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Price</p>
                            <p className="text-xl font-bold">₹{selectedProductObj?.price?.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Current Stock</p>
                            <p className={`text-xl font-bold ${selectedProductObj?.quantity <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                                {selectedProductObj?.quantity}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Category</p>
                            <p className="text-xl font-bold">{selectedProductObj?.category}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold">Month Revenue</p>
                            <p className="text-xl font-bold text-blue-600">₹{finalStats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700" style={{ overflow: 'hidden', minWidth: 0 }}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Customer Segmentation (RFM)</h3>
                    <div className="h-48 sm:h-64">
                        <Pie data={rfmChartData} options={rfmOptions} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Champions</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Loyal</span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">At Risk</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700" style={{ overflow: 'hidden', minWidth: 0 }}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Inventory Health (ABC Analysis)</h3>
                    <div className="h-48 sm:h-64">
                        <Bar data={abcChartData} options={abcOptions} />
                    </div>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-4">
                        Class A items contribute to 80% of revenue. Keep them in stock!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
