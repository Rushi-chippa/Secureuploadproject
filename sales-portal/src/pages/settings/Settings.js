import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './UserPages.css';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailDigest, setEmailDigest] = useState(false);

    return (
        <div className="user-page-container">
            <header className="page-header">
                <h1>Settings</h1>
                <p>Manage your application preferences</p>
            </header>

            <div className="settings-card">
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Dark Mode</h3>
                        <p>Switch between light and dark themes</p>
                    </div>
                    <div className="setting-control">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Notifications</h3>
                        <p>Receive alerts for new sales and updates</p>
                    </div>
                    <div className="setting-control">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notificationsEnabled}
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Email Digest</h3>
                        <p>Receive a weekly summary of your performance</p>
                    </div>
                    <div className="setting-control">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={emailDigest}
                                onChange={() => setEmailDigest(!emailDigest)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
