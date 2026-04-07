import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const Contact = () => {
    const form = useRef();
    const [sending, setSending] = useState(false);
    const location = useLocation();
    const isHelpPage = location.pathname === '/help';

    const sendEmail = (e) => {
        e.preventDefault();

        // SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY from Home.js
        const SERVICE_ID = 'service_l0bgvja';
        const TEMPLATE_ID = 'template_zu5wfbf';
        const PUBLIC_KEY = 'LEk-8fA73hYOhy2u7';

        setSending(true);

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then((result) => {
                console.log(result.text);
                setSending(false);
                alert("Message Sent Successfully!");
                e.target.reset();
            }, (error) => {
                console.log(error.text);
                setSending(false);
                alert("Failed to send message: " + JSON.stringify(error));
            });
    };

    return (
        <div className={`${isHelpPage ? '' : 'min-h-screen bg-white dark:bg-slate-900'} font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
            {/* Header - Only show if not on /help page (internal) */}
            {!isHelpPage && (
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
            )}

            <main className={`${isHelpPage ? 'py-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'}`}>
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Get in Touch</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Have questions about our pricing, features, or need a custom solution? Our team is here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800/30">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                        ✉️
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Email Us</h4>
                                        <p className="text-slate-600 dark:text-slate-400">endHugnernow24@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                        📞
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Call Us</h4>
                                        <p className="text-slate-600 dark:text-slate-400">+91 9564598789</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                        📍
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Visit Us</h4>
                                        <p className="text-slate-600 dark:text-slate-400">14/76 Malakpet, Hyderabad, Telangana 500036</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-bold mb-4">Support Hours</h3>
                            <div className="space-y-2 text-slate-400">
                                <div className="flex justify-between">
                                    <span>Monday - Friday:</span>
                                    <span>9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday:</span>
                                    <span>10:00 AM - 2:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday:</span>
                                    <span>Closed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-2xl shadow-gray-200/50 dark:shadow-slate-950/50">
                        <form className="space-y-6" ref={form} onSubmit={sendEmail}>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                    <input type="text" name="name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="John" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="john@company.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                                <textarea name="message" rows="5" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all ${sending ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}`}
                            >
                                {sending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending Message...
                                    </span>
                                ) : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
