
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MySales = () => {
    const { sales, products, deleteSale, loading } = useData();
    const { user } = useAuth();
    const location = useLocation();

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const monthOptions = React.useMemo(() => {
        const options = [];
        const date = new Date();
        date.setDate(1); // Set to 1st to avoid rollover issues (e.g., March 31 -> Feb 31 -> March)
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

    // Filter sales to show only the current user's sales and apply generic date filters
    let mySales = sales.filter(s => s.user_id === user.id);
    
    if (fromDate || toDate) {
        mySales = mySales.filter(s => {
            const saleDate = new Date(s.date);
            const from = fromDate ? new Date(fromDate) : new Date('1900-01-01');
            const to = toDate ? new Date(toDate) : new Date('2100-01-01');
            to.setHours(23, 59, 59, 999);
            return saleDate >= from && saleDate <= to;
        });
    } else if (selectedMonth) {
        mySales = mySales.filter(s => s.date.startsWith(selectedMonth));
    }

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
        return mySales.reduce((sum, sale) => sum + sale.amount, 0);
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    };

    const exportToCSV = () => {
        if (mySales.length === 0) return;

        const headers = ['Date', 'Product', 'Client/Trader', 'Quantity', 'Amount'];
        const rows = mySales.map(sale => [
            new Date(sale.date).toLocaleDateString(),
            getProductName(sale.product_id),
            sale.customer_name || 'N/A',
            sale.quantity,
            `₹${sale.amount}`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_sales.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (mySales.length === 0) return;

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text("My Sales Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Salesman: ${user.name}`, 14, 36);

        // Define Table Columns and Rows
        const tableColumn = ["Date", "Product", "Client/Trader", "Quantity", "Amount"];
        const tableRows = [];

        const sortedSales = [...mySales].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedSales.forEach(sale => {
            const saleData = [
                new Date(sale.date).toLocaleDateString('en-GB'),
                getProductName(sale.product_id),
                sale.customer_name || 'N/A',
                sale.quantity,
                `Rs. ${sale.amount.toLocaleString()}`
            ];
            tableRows.push(saleData);
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 139, 202] },
        });

        // Save PDF
        doc.save("my_sales.pdf");
    };

    if (loading) {
        return <div className="loading">Loading sales...</div>;
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen" style={{ overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className="flex flex-col mb-8 gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">My Sales</h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Track your personal sales performance</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                            onClick={exportToPDF}
                            disabled={mySales.length === 0}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md text-sm sm:text-base ${mySales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span>📄</span> PDF
                        </button>
                        <button
                            onClick={exportToCSV}
                            disabled={mySales.length === 0}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md text-sm sm:text-base ${mySales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span>📊</span> CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">Month:</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(''); setToDate(''); }}
                            className="flex-1 lg:flex-none px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Time</option>
                            {monthOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <div className="lg:hidden h-px w-full bg-slate-100 dark:bg-slate-700 my-1"></div>
                    
                    <div className="flex flex-col gap-3 w-full">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Custom Range:</span>
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                            <input 
                                type="date" 
                                title="From Date"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setSelectedMonth(''); }}
                                className="w-full sm:flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">-</span>
                            <input 
                                type="date" 
                                title="To Date"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setSelectedMonth(''); }}
                                className="w-full sm:flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {(fromDate || toDate || selectedMonth) && (
                        <button 
                            onClick={() => { setFromDate(''); setToDate(''); setSelectedMonth(''); }}
                            className="w-full lg:w-auto mt-2 lg:mt-0 lg:ml-auto px-4 py-2 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 w-full">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
                        💰
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">My Revenue</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{calculateTotal().toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                        📦
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">My Transactions</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{mySales.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
                        📊
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Avg. Transaction</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            ₹{mySales.length > 0 ? Math.round(calculateTotal() / mySales.length).toLocaleString() : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden w-full">
                <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-5">Date</th>
                                <th className="p-5">Product</th>
                                <th className="p-5">Client / Trader</th>
                                <th className="p-5 text-center">Quantity</th>
                                <th className="p-5 text-right">Amount</th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {mySales.length > 0 ? (
                                [...mySales].sort((a, b) => new Date(a.date) - new Date(b.date)).map((sale) => (
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
                                    <td colSpan="6" className="p-10 text-center text-slate-400 dark:text-slate-500">
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


        </div>
    );
};

export default MySales;
