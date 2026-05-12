import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl">🏢</span>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SalesPortal</span>
                        </Link>
                        <nav>
                            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Sign In
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white dark:bg-slate-800/50 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl shadow-gray-200/20 dark:shadow-slate-900/40">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
                    
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">1. Introduction</h2>
                            <p className="leading-relaxed">
                                Welcome to SalesPortal ("Company", "we", "our", "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">2. What Information We Collect</h2>
                            <p className="leading-relaxed mb-4">
                                We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and Services, or otherwise when you contact us.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Personal identifiers (name, email address, phone number)</li>
                                <li>Account credentials (passwords, usernames)</li>
                                <li>Payment information (credit card numbers, billing addresses)</li>
                                <li>Company information (business name, industry, size)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">3. How We Use Your Information</h2>
                            <p className="leading-relaxed mb-4">
                                We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To facilitate account creation and logon process.</li>
                                <li>To send administrative information to you.</li>
                                <li>To fulfill and manage your orders.</li>
                                <li>To deliver services to the user.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">4. Sharing Your Information</h2>
                            <p className="leading-relaxed">
                                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">5. Data Retention and Security</h2>
                            <p className="leading-relaxed">
                                We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law. We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700 text-sm text-slate-500">
                        <p>Last Updated: April 7, 2026</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
