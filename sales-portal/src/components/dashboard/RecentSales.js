import React from 'react';

const RecentSales = ({ sales }) => {
    if (!sales || sales.length === 0) {
        return (
            <div className="no-data">
                <p>No recent sales</p>
            </div>
        );
    }

    return (
        <div className="recent-sales-table overflow-x-auto">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Salesman</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.id}>
                            <td>{new Date(sale.date).toLocaleDateString()}</td>
                            <td>{sale.productName || 'Product'}</td>
                            <td>{sale.salesmanName || 'Unknown'}</td>
                            <td className="amount">${sale.amount.toLocaleString()}</td>
                            <td>
                                <span className={`status-badge ${sale.status || 'completed'}`}>
                                    {sale.status || 'Completed'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentSales;