import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiLock, FiKey } from 'react-icons/fi';
import ThemeToggle from '../../components/common/ThemeToggle';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001'}/auth/forgot-password`, { email });
            toast.success(response.data.message);
            setStep(2);
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001'}/auth/reset-password`, {
                otp: otp,
                new_password: newPassword
            });
            toast.success("Password resetted successfully! Please login with your new password.");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.detail || 'Invalid or expired OTP.');
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
                    {step === 1 ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-4 text-2xl">
                                    🔑
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                                <p className="text-slate-500 text-sm">Enter your email address to receive a 6-digit OTP code.</p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-6">
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
                                            placeholder="Enter your registered email"
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
                                    ) : 'Send OTP Code'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl mb-4 text-2xl">
                                    🛡️
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify & Reset</h1>
                                <p className="text-slate-500 text-sm">Enter the 6-digit OTP sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> and your new password.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">OTP Code</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiKey className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                            placeholder="123456"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-gray-50 dark:bg-slate-900 text-center tracking-widest font-bold font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="text-slate-400" />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-gray-50 dark:bg-slate-900"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-green-600/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-2"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : 'Reset Password'}
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                    >
                                        Didn't receive code? Resend
                                    </button>
                                </div>
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
