import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8001/auth/forgot-password', { email });
            toast.success(response.data.message);
            setSubmitted(true);
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-200">
                {/* Card Header with Controls */}
                <div className="flex justify-between items-center px-6 py-4 absolute top-0 left-0 w-full z-20">
                    <Link to="/login" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all">
                            <FiArrowLeft className="text-lg" />
                        </div>
                        <span className="text-sm font-medium hidden sm:inline-block">Login</span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="p-8 sm:p-10 pt-20">
                    {submitted ? (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full mb-6">
                                <FiMail className="text-3xl text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Check Your Email</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                If an account exists for <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>, 
                                you will receive a password reset link shortly.
                            </p>
                            <Link 
                                to="/login" 
                                className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-lg transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-4 text-2xl">
                                    🔑
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                                <p className="text-slate-500 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-gray-50 dark:bg-slate-900"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 text-center border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Remember your password?
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 ml-1">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
