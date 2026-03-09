import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './Layout.css';

const Header = ({ user, company }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { products, salesmen, sales } = useData();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredProducts = products?.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    const filteredSalesmen = salesmen?.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase()) || s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

    // Notifications State
    const [notifications, setNotifications] = useState([
        { id: 'welcome', title: 'Welcome to SalesPortal', message: 'Get started by setting up your profile.', time: 'Just now', icon: '👋' },
    ]);

    useEffect(() => {
        if (!sales || sales.length === 0) return;

        // Sort sales by date descending and take top 4
        const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

        const recentNotifs = sortedSales.map((sale) => {
            const salesman = salesmen?.find(s => s.id === sale.user_id);
            const salesmanName = salesman ? (salesman.name || salesman.full_name) : 'A salesman';

            const product = products?.find(p => p.id === sale.product_id);
            const productName = product ? product.name : 'a product';

            // Format time ago
            const saleDate = new Date(sale.date);
            const now = new Date();
            const diffInSecs = Math.floor((now - saleDate) / 1000);
            const diffInMins = Math.floor(diffInSecs / 60);
            const diffInHours = Math.floor(diffInMins / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            let timeStr = 'Just now';
            if (diffInDays > 0) timeStr = `${diffInDays}d ago`;
            else if (diffInHours > 0) timeStr = `${diffInHours}h ago`;
            else if (diffInMins > 0) timeStr = `${diffInMins}m ago`;
            else if (diffInSecs > 0) timeStr = `${diffInSecs}s ago`;

            return {
                id: `sale-${sale.id}`,
                title: 'New Sale!',
                message: `${salesmanName} sold ${productName} for $${sale.amount.toLocaleString()}`,
                time: timeStr,
                icon: '🎉'
            };
        });

        setNotifications([
            ...recentNotifs,
            { id: 'welcome', title: 'Welcome to SalesPortal', message: 'You have caught up with all notifications.', time: 'System', icon: '👋' }
        ]);
    }, [sales, salesmen, products]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/dashboard" className="header-logo">
                    <span className="logo-icon">🏢</span>
                    <span className="logo-text">SalesPortal</span>
                </Link>
            </div>

            <div className="header-center">
                <div className="search-container" style={{ position: 'relative' }}>
                    <span className="search-icon">🔍</span>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products, sales, salespeople..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />
                    <span className="search-shortcut">⌘K</span>

                    {isSearchFocused && searchQuery && (
                        <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 z-50 max-h-[300px] overflow-y-auto mt-2">
                            <div className="p-2">
                                {filteredProducts.length > 0 && (
                                    <div className="mb-2">
                                        <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-1">Products</div>
                                        {filteredProducts.slice(0, 5).map(p => (
                                            <div key={`p-${p.id}`} className="cursor-pointer p-2 rounded-md transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                                                onMouseDown={() => { navigate('/products'); setSearchQuery(''); setIsSearchFocused(false); }}
                                            >
                                                <div className="font-medium text-[13px] text-slate-800 dark:text-slate-200">{p.name}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.category}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {filteredSalesmen.length > 0 && (
                                    <div className="mb-2">
                                        <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-1">Salespeople</div>
                                        {filteredSalesmen.slice(0, 5).map(s => (
                                            <div key={`s-${s.id}`} className="cursor-pointer p-2 rounded-md transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                                                onMouseDown={() => { navigate('/salesmen'); setSearchQuery(''); setIsSearchFocused(false); }}
                                            >
                                                <div className="font-medium text-[13px] text-slate-800 dark:text-slate-200">{s.name || s.full_name}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {filteredProducts.length === 0 && filteredSalesmen.length === 0 && (
                                    <div className="p-4 text-center text-[13px] text-slate-500 dark:text-slate-400">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-theme-toggle mr-2">
                    <ThemeToggle />
                </div>
                <div className="header-notifications" style={{ position: 'relative' }}>
                    <button
                        className="notification-btn"
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsDropdownOpen(false); // Close profile dropdown
                        }}
                    >
                        <span>🔔</span>
                        {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                    </button>

                    {isNotificationsOpen && (
                        <div className="profile-dropdown" style={{ right: '-60px', width: '300px' }}>
                            <div className="dropdown-header">
                                <span className="font-bold text-slate-800">Notifications</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            {notifications.length > 0 ? (
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="dropdown-item" style={{ alignItems: 'start', gap: '12px' }}>
                                            <span style={{ fontSize: '16px' }}>{notif.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{notif.title}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{notif.message}</div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{notif.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No new notifications
                                </div>
                            )}
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" style={{ justifyContent: 'center', color: '#4f46e5', fontWeight: 500 }}>
                                View All
                            </button>
                        </div>
                    )}
                </div>

                <div className="header-help">
                    <button className="help-btn">
                        <span>❓</span>
                    </button>
                </div>

                <div className="header-divider"></div>

                <div className="header-profile">
                    <button
                        className="profile-btn"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="profile-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" />
                            ) : (
                                <img
                                    src={user?.role === 'manager'
                                        ? '/assets/avatars/manager.svg'
                                        : '/assets/avatars/salesman.svg'}
                                    alt="Profile"
                                />
                            )}
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">
                                {user?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User'}
                            </span>
                            <span className="profile-role" style={{ textTransform: 'capitalize' }}>
                                {user?.role || 'Admin'}
                            </span>
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="dropdown-header">
                                <div className="dropdown-company">
                                    <span className="company-icon">🏢</span>
                                    <span className="company-name">{company?.name || 'Your Company'}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span>👤</span>
                                My Profile
                            </Link>
                            <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span>⚙️</span>
                                Settings
                            </Link>
                            <Link to="/company-settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span>🏢</span>
                                Company Settings
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <span>🚪</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span>{isMobileMenuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-search">
                        <input type="text" placeholder="Search..." />
                    </div>
                    <nav className="mobile-nav">
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📊</span> Dashboard
                        </Link>
                        <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📦</span> Products
                        </Link>
                        <Link to="/sales" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>💰</span> Sales
                        </Link>
                        <Link to="/salesmen" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>👥</span> Salesmen
                        </Link>
                        <Link to="/reports" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📈</span> Reports
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;