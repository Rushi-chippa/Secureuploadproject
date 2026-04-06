import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { toast } from 'react-toastify';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Auto-register Chart.js components

const SalesmanDashboard = () => {
    const { addSale, loading, fetchAllData, products } = useData(); // Fetch all data to ensure products are available
    const [stats, setStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [showModal, setShowModal] = useState(false);

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

    const getNextMonthLabel = (monthStr) => {
        if (!monthStr) return "";
        const [y, m] = monthStr.split('-');
        const date = new Date(y, parseInt(m) - 1, 1);
        date.setMonth(date.getMonth() + 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Form Data
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '', // "Trader Name"
        region: '',
        notes: ''
    });

    useEffect(() => {
        fetchAllData(); // Fetch products, salesmen, etc.
    }, [fetchAllData]);

    useEffect(() => {
        fetchDashboardStats();
    }, [selectedMonth]);

    const fetchDashboardStats = async () => {
        setIsLoadingStats(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8001/api/analytics/salesman/dashboard/?month=${selectedMonth}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                // If dashboard stats fail (e.g. 404), we can still show the dashboard with basics
                console.warn("Dashboard stats failed");
                // Initialize empty stats structure to avoid crashes if API is missing
                setStats({
                    kpi: { total_sales: 0, achieved_percent: 0, target: 0, earnings: 0, rank: '-' },
                    charts: { product_distribution: [], region_distribution: [], sales_trend: [] },
                    prediction: { predicted_next_month: 0 }
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            // toast.error("Error loading dashboard stats"); 
            // Fallback
            setStats({
                kpi: { total_sales: 0, achieved_percent: 0, target: 0, earnings: 0, rank: '-' },
                charts: { product_distribution: [], region_distribution: [], sales_trend: [] },
                prediction: { predicted_next_month: 0 }
            });
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Auto-calculate amount when product or quantity changes
    useEffect(() => {
        if (formData.productId && formData.quantity) {
            const product = products.find(p => p.id === parseInt(formData.productId));
            if (product) {
                const totalAmount = product.price * parseInt(formData.quantity);
                setFormData(prev => ({ ...prev, amount: totalAmount }));
            }
        }
    }, [formData.productId, formData.quantity, products]);

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare payload
        // Backend expects: product_id, quantity, amount, date, customer_name, region (notes)
        // AND user_id (which backend infers from token for salesmen usually, or we send it)
        // Sales.js sent 'salesmanId'. Here we are the salesman.

        const salePayload = {
            product_id: parseInt(formData.productId),
            quantity: parseInt(formData.quantity),
            amount: parseFloat(formData.amount),
            date: formData.date,
            customer_name: formData.customerName,
            region: formData.region,
            notes: formData.notes
        };

        const product = products.find(p => p.id === parseInt(formData.productId));
        if (product && parseInt(formData.quantity) > product.quantity) {
            toast.error(`Out of Stock! Only ${product.quantity} units available.`);
            return;
        }

        const result = await addSale(salePayload);
        if (result.success) {
            toast.success("Sale recorded successfully!");
            setShowModal(false);
            setFormData({
                productId: '', quantity: '', amount: '',
                date: new Date().toISOString().split('T')[0],
                customerName: '', region: '', notes: ''
            });
            // Refresh stats
            fetchDashboardStats();
        } else {
            toast.error(result.message);
        }
    };

    if (isLoadingStats) return <div className="loading">Loading Dashboard...</div>;
    if (!stats) return <div className="error">Failed to load data.</div>;

    // Chart Data Preparation
    const productChartData = {
        labels: stats.charts.product_distribution.map(d => d.name),
        datasets: [{
            data: stats.charts.product_distribution.map(d => d.value),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }]
    };

    const regionChartData = {
        labels: stats.charts.region_distribution.map(d => d.name),
        datasets: [{
            label: 'Sales by Region',
            data: stats.charts.region_distribution.map(d => d.value),
            backgroundColor: '#36A2EB',
        }]
    };

    const trendChartData = {
        labels: stats.charts.sales_trend.map(d => d.date),
        datasets: [{
            label: 'Daily Sales',
            data: stats.charts.sales_trend.map(d => d.amount),
            borderColor: '#4BC0C0',
            fill: false,
        }]
    };

    return (
        <div className="salesman-dashboard">
            <header className="page-header">
                <div>
                    <h1>Salesman Dashboard</h1>
                    <p>Welcome back! Here is your performance overview.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {monthOptions.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + Record Sale
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <h3>Total Sales</h3>
                    <div className="value">₹{stats.kpi.total_sales.toLocaleString()}</div>
                </div>
                <div className="kpi-card">
                    <h3>Target Achievement</h3>
                    <div className="value">{stats.kpi.achieved_percent}%</div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min(stats.kpi.achieved_percent, 100)}%` }}
                        ></div>
                    </div>
                    <small>Target: ₹{stats.kpi.target.toLocaleString()}</small>
                </div>
                <div className="kpi-card">
                    <h3>Commission (Est.)</h3>
                    <div className="value">₹{stats.kpi.earnings.toLocaleString()}</div>
                </div>
                <div className="kpi-card">
                    <h3>Performance Rank</h3>
                    <div className="value">#{stats.kpi.rank}</div>
                </div>
            </div>

            {/* Prediction Widget */}
            <div className="prediction-widget">
                <h3> Future Sales Forecast ({getNextMonthLabel(selectedMonth)})</h3>
                <div className="prediction-content">
                    <div className="prediction-value">
                        ₹{stats.prediction.predicted_next_month?.toLocaleString() || "N/A"}
                    </div>
                    <div className="prediction-label">Predicted next month sales</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Sales Trend</h3>
                    <div className="chart-container">
                        <Line data={trendChartData} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Product Distribution</h3>
                    <div className="chart-container">
                        <Pie data={productChartData} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Region-wise Sales</h3>
                    <div className="chart-container">
                        <Bar data={regionChartData} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Top Products</h3>
                    <div className="chart-container">
                        <Bar
                            data={{
                                labels: stats.charts.product_distribution.map(d => d.name),
                                datasets: [{
                                    label: 'Revenue',
                                    data: stats.charts.product_distribution.map(d => d.value),
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.8)',
                                        'rgba(54, 162, 235, 0.8)',
                                        'rgba(255, 206, 86, 0.8)',
                                        'rgba(75, 192, 192, 0.8)',
                                        'rgba(153, 102, 255, 0.8)',
                                        'rgba(255, 159, 64, 0.8)'
                                    ],
                                    borderRadius: 4
                                }]
                            }}
                            options={{
                                indexAxis: 'y',
                                responsive: true,
                                plugins: { legend: { display: false } },
                                scales: { x: { beginAtZero: true } }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Product Overview Section */}
            <div className="product-overview-section" style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Available Products</h2>
                <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {products && products.length > 0 ? (
                        products.map(product => (
                            <div key={product.id} className="product-card" style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(29, 24, 24, 0.06)',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>{product.name}</h3>
                                        <span style={{
                                            background: product.quantity > 10 ? '#dcfce7' : '#fee2e2',
                                            color: product.quantity > 10 ? '#166534' : '#991b1b',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        ID: #{product.id} • {product.category}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>₹{product.price}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Stock: {product.quantity}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, productId: product.id }));
                                        setShowModal(true);
                                    }}
                                    disabled={product.quantity <= 0}
                                >
                                    {product.quantity > 0 ? 'Sell This Product' : 'Out of Stock'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', color: '#64748b' }}>
                            No products available.
                        </div>
                    )}
                </div>
            </div>

            {/* Record Sale Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Record Sale</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Product</label>
                                <select name="productId" value={formData.productId} onChange={handleInput} required>
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantity (Available: {products.find(p => p.id === parseInt(formData.productId))?.quantity || 0})</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInput} required />
                                    {formData.productId && formData.quantity && products.find(p => p.id === parseInt(formData.productId))?.quantity <= (products.find(p => p.id === parseInt(formData.productId))?.low_stock_threshold || 10) && (
                                        <p style={{ color: '#f59e0b', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>⚠️ Low Stock Warning!</p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInput}
                                        required
                                        readOnly
                                        style={{ backgroundColor: '#f1f5f9' }}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trader Name</label>
                                    <input type="text" name="customerName" value={formData.customerName} onChange={handleInput} required />
                                </div>
                                <div className="form-group">
                                    <label>Area</label>
                                    <input type="text" name="region" value={formData.region} onChange={handleInput} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleInput} required />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesmanDashboard;
