import React, { useState, useMemo } from 'react';
import './Common.css';

const Table = ({
    columns,
    data,
    searchable = true,
    searchPlaceholder = 'Search...',
    paginate = true,
    pageSize = 10,
    emptyMessage = 'No data found',
    onRowClick,
    striped = true,
    hoverable = true,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Filter data
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter((row) =>
            columns.some((col) => {
                const value = col.accessor ? row[col.accessor] : '';
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    }, [data, searchTerm, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        const sorted = [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredData, sortConfig]);

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = paginate
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : sortedData;

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="table-container">
            {/* Search Bar */}
            {searchable && (
                <div className="table-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {searchTerm && (
                        <button className="search-clear" onClick={() => setSearchTerm('')}>
                            ✕
                        </button>
                    )}
                </div>
            )}

            {/* Results Count */}
            <div className="table-info">
                <span>
                    Showing {paginatedData.length} of {sortedData.length} results
                </span>
            </div>

            {/* Table */}
            <div className="table-wrapper overflow-x-auto">
                <table className={`table ${striped ? 'table-striped' : ''} ${hoverable ? 'table-hoverable' : ''}`}>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                                    className={col.sortable !== false && col.accessor ? 'sortable' : ''}
                                    style={col.width ? { width: col.width } : {}}
                                >
                                    <div className="th-content">
                                        {col.header}
                                        {sortConfig.key === col.accessor && (
                                            <span className="sort-arrow">
                                                {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={onRowClick ? 'clickable-row' : ''}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex}>
                                            {col.render
                                                ? col.render(row, rowIndex)
                                                : row[col.accessor] || '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="empty-row">
                                    <div className="empty-state">
                                        <span className="empty-icon">📭</span>
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {paginate && totalPages > 1 && (
                <div className="table-pagination">
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(1)}
                    >
                        «
                    </button>
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                            (page) =>
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, arr) => (
                            <React.Fragment key={page}>
                                {index > 0 && arr[index - 1] !== page - 1 && (
                                    <span className="page-ellipsis">...</span>
                                )}
                                <button
                                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}

                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        ›
                    </button>
                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
};

export default Table;