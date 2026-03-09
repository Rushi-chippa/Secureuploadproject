import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const { sales, fetchAllData } = useData();
    const [filterSalesman, setFilterSalesman] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const filteredSales = sales
        .filter(sale => {
            const matchSalesman = filterSalesman ? sale.salesman_name?.toLowerCase().includes(filterSalesman.toLowerCase()) : true;

            let matchDate = true;
            if (startDate || endDate) {
                const saleDate = new Date(sale.date);
                saleDate.setHours(0, 0, 0, 0);

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (saleDate < start) matchDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (saleDate > end) matchDate = false;
                }
            }

            return matchSalesman && matchDate;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const exportToCSV = () => {
        if (filteredSales.length === 0) return;

        const headers = ['ID', 'Date', 'Salesman', 'Product', 'Quantity', 'Total Amount'];
        const rows = filteredSales.map(sale => [
            sale.id,
            formatDate(sale.date),
            sale.salesman_name || 'Unknown',
            sale.product_name || 'Unknown',
            sale.quantity,
            `Rs. ${sale.amount}`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (filteredSales.length === 0) return;

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text("Sales Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);

        // Define Table Columns and Rows
        const tableColumn = ["ID", "Date", "Salesman", "Product", "Quantity", "Total Amount"];
        const tableRows = [];

        filteredSales.forEach(sale => {
            const saleData = [
                sale.id,
                formatDate(sale.date),
                sale.salesman_name || 'Unknown',
                sale.product_name || 'Unknown',
                sale.quantity,
                `Rs. ${sale.amount.toLocaleString()}`
            ];
            tableRows.push(saleData);
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 139, 202] }, // Blue header
        });

        // Save PDF
        doc.save("sales_report.pdf");
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sales Reports</h1>
                    <p className="text-slate-500">Detailed transaction history</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        disabled={filteredSales.length === 0}
                        className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 ${filteredSales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span>📄</span> PDF
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={filteredSales.length === 0}
                        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 ${filteredSales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span>📊</span> CSV
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 max-w-full overflow-x-auto">
                <input
                    type="text"
                    placeholder="Filter by Salesman..."
                    value={filterSalesman}
                    onChange={(e) => setFilterSalesman(e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium whitespace-nowrap">From:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium whitespace-nowrap">To:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm uppercase">
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Salesman</th>
                            <th className="p-4 font-semibold">Product</th>
                            <th className="p-4 font-semibold">Quantity</th>
                            <th className="p-4 font-semibold text-right">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 text-slate-400">#{sale.id}</td>
                                    <td className="p-4 text-slate-600">{formatDate(sale.date)}</td>
                                    <td className="p-4 text-slate-800 font-medium">{sale.salesman_name || 'Unknown'}</td>
                                    <td className="p-4 text-slate-600">
                                        {sale.product_name || 'Unknown'}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {sale.quantity}
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-800">
                                        ₹{sale.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-400">
                                    No records found matching filters
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;