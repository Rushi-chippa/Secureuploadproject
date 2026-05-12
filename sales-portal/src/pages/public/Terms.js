import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">Terms of Service</h1>
                    
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">1. Agreement to Terms</h2>
                            <p className="leading-relaxed font-semibold">
                                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and SalesPortal ("we", "us", or "our"), concerning your access to and use of our website and services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">2. User Representations</h2>
                            <p className="leading-relaxed mb-4">
                                By using our Services, you represent and warrant that:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                                <li>You will maintain the accuracy of such information and promptly update such registration information.</li>
                                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                                <li>You are not a minor in the jurisdiction in which you reside.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">3. User Registration</h2>
                            <p className="leading-relaxed">
                                You may be required to register with our Website. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">4. Prohibited Activities</h2>
                            <p className="leading-relaxed mb-4">
                                You may not access or use the Website for any purpose other than that for which we make the Website available. The Website may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Systematically retrieve data or other content from the Website to create a collection, compilation, database, or directory without written permission from us.</li>
                                <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                                <li>Use the Website as part of any effort to compete with us or otherwise use the Website or the Content for any revenue-generating endeavor or commercial enterprise.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">5. Modifications and Interruptions</h2>
                            <p className="leading-relaxed">
                                We reserve the right to change, modify, or remove the contents of the Website at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Website. We also reserve the right to modify or discontinue all or part of the Website without notice at any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">6. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the website or services.
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

export default Terms;
