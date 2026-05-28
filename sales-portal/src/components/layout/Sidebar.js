import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Layout.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed }) => {
    const { user } = useAuth();
    const [expandedItems, setExpandedItems] = useState([]);
    const location = useLocation();

    const dashboardPath = user?.role?.toLowerCase() === 'salesman' ? '/salesman-dashboard' : '/dashboard';

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: dashboardPath
        },
        {
            id: 'products',
            label: 'Products',
            icon: '📦',
            path: '/products',
            children: [
                { id: 'product-list', label: 'All Products', path: '/products/list' },
                { id: 'add-product', label: 'Add Product', path: '/products/add' },
                { id: 'categories', label: 'Categories', path: '/products/categories' }
            ].filter(item => user?.role?.toLowerCase() !== 'salesman' || item.id !== 'add-product')
        },
        {
            id: 'sales',
            label: 'Sales',
            icon: '💰',
            path: '/sales',
            children: [
                { id: 'sales-list', label: 'All Sales', path: '/sales/list' },
                { id: 'my-sales', label: 'My Sales', path: '/my-sales' },
                { id: 'add-sale', label: 'Record Sale', path: '/sales/add' },
                { id: 'sales-report', label: 'Sales Report', path: '/sales/report' }
            ].filter(item => user?.role?.toLowerCase() !== 'manager' || item.id !== 'my-sales')
        },
        {
            id: 'salesmen',
            label: 'Sales Team',
            icon: '👥',
            path: '/salesmen',
            children: [
                { id: 'salesmen-list', label: 'All Salesmen', path: '/salesmen/list' },
                { id: 'add-salesman', label: 'Add Salesman', path: '/salesmen/add' },
                { id: 'performance', label: 'Performance', path: '/salesmen/performance' },
                { id: 'leaderboard', label: 'Leaderboard', path: '/salesmen/leaderboard' }
            ].filter(item => user?.role?.toLowerCase() !== 'salesman' || item.id !== 'add-salesman')
        },
        {
            id: 'customers',
            label: 'Customers',
            icon: '👤',
            path: '/customers',
            children: [
                { id: 'customers-list', label: 'All Customers', path: '/customers/list' },
                { id: 'add-customer', label: 'Add Customer', path: '/customers/add' }
            ]
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: '📈',
            path: '/reports'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: '📉',
            path: '/analytics'
        },
        {
            id: 'ask-ai',
            label: 'Ask AI',
            icon: '🤖',
            path: '/ask-ai'
        }
    ];

    const toggleSubmenu = (itemId) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const renderMenuItem = (item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const active = isActive(item.path);

        return (
            <div key={item.id} className="menu-item-container">
                <NavLink
                    to={hasChildren ? '#' : item.path}
                    className={`menu-item ${active ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={(e) => {
                        if (hasChildren) {
                            e.preventDefault();
                            toggleSubmenu(item.id);
                        }
                    }}
                >
                    <span className="menu-icon">{item.icon}</span>
                    {!isCollapsed && (
                        <>
                            <span className="menu-label">{item.label}</span>
                            {hasChildren && (
                                <span className={`menu-arrow ${isExpanded ? 'expanded' : ''}`}>
                                    ▶
                                </span>
                            )}
                        </>
                    )}
                </NavLink>

                {!isCollapsed && hasChildren && isExpanded && (
                    <div className="submenu">
                        {item.children.map(child => (
                            <NavLink
                                key={child.id}
                                to={child.path}
                                className={`submenu-item ${isActive(child.path) ? 'active' : ''}`}
                            >
                                <span className="submenu-dot"></span>
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">MAIN MENU</span>
                    {menuItems.slice(0, 5).map(renderMenuItem)}
                </div>

                <div className="nav-section">
                    <span className="nav-section-title">INSIGHTS</span>
                    {menuItems.slice(5).map(renderMenuItem)}
                </div>

                <div className="sidebar-footer">
                    <NavLink to="/settings" className={`footer-item ${isActive('/settings') ? 'active' : ''}`}>
                        <span>⚙️</span>
                        {!isCollapsed && <span>Settings</span>}
                    </NavLink>
                    <NavLink to="/help" className={`footer-item ${isActive('/help') ? 'active' : ''}`}>
                        <span>❓</span>
                        {!isCollapsed && <span>Help & Support</span>}
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-collapse-trigger">
                <button
                    className="collapse-btn"
                    onClick={() => document.dispatchEvent(new CustomEvent('toggleSidebar'))}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <span>{isCollapsed ? '▶' : '◀'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;