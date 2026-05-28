import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user } = useAuth();
    const [company, setCompany] = useState(null);

    const { fetchAllData } = useData();

    useEffect(() => {
        const companyData = localStorage.getItem('company');

        if (companyData) {
            setCompany(JSON.parse(companyData));
        }

        // Fetch all data when layout mounts (authenticated)
        fetchAllData();

        const handleToggleSidebar = () => {
            setIsSidebarCollapsed(prev => !prev);
        };

        document.addEventListener('toggleSidebar', handleToggleSidebar);

        return () => {
            document.removeEventListener('toggleSidebar', handleToggleSidebar);
        };
    }, [fetchAllData]);

    return (
        <div className="layout">
            <Header user={user} company={company} />
            <div className="layout-body">
                <Sidebar isCollapsed={isSidebarCollapsed} />
                <main className={`layout-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    <div className="main-content">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;