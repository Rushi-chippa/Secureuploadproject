import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';

const Register = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { register, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            const dashboardPath = user.role === 'salesman' ? '/salesman-dashboard' : '/dashboard';
            navigate(dashboardPath, { replace: true });
        }
    }, [user, navigate]);

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [companyData, setCompanyData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        phone: '',
        address: '',
    });

    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleCompanyChange = (e) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleAdminChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();
        if (!companyData.companyName || !companyData.industry) {
            toast.error('Please fill in required fields');
            return;
        }
        setStep(2);
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();

        if (adminData.password !== adminData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (adminData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('company_name', companyData.companyName);
        formData.append('industry', companyData.industry);
        if (companyData.companySize) formData.append('company_size', companyData.companySize);
        if (companyData.phone) formData.append('phone', companyData.phone);
        if (companyData.address) formData.append('address', companyData.address);
        if (logo) formData.append('logo', logo);

        formData.append('full_name', adminData.name);
        formData.append('email', adminData.email);
        formData.append('password', adminData.password);

        const result = await register(formData);

        if (result.success) {
            toast.success('Registration successful!');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-3xl"></div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-200">
                {/* Card Header with Controls */}
                <div className="flex justify-between items-center px-6 py-4 absolute top-0 left-0 w-full z-20">
                    <Link to="/" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium hidden sm:inline-block">Back</span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="p-8 sm:p-10 pt-20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-4 text-2xl">
                            🏢
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                        <p className="text-slate-500 text-sm">Join SalesPortal and manage your sales team</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>1</div>
                            <span className="ml-2 font-semibold text-sm">Company</span>
                        </div>
                        <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2</div>
                            <span className="ml-2 font-semibold text-sm">Admin</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleCompanySubmit} className="space-y-6 animate-fadeIn">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden mb-2 relative group cursor-pointer hover:border-blue-500 transition-colors">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl text-slate-400">📷</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold pointer-events-none">
                                        Upload Logo
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400">Company Logo (Optional)</span>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Name *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={companyData.companyName}
                                    onChange={handleCompanyChange}
                                    placeholder="Enter company name"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Industry *</label>
                                    <select
                                        name="industry"
                                        value={companyData.industry}
                                        onChange={handleCompanyChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="technology">Technology</option>
                                        <option value="retail">Retail</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="finance">Finance</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Size</label>
                                    <select
                                        name="companySize"
                                        value={companyData.companySize}
                                        onChange={handleCompanyChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                                    >
                                        <option value="">Select Size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="500+">500+ employees</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={companyData.phone}
                                    onChange={handleCompanyChange}
                                    placeholder="Enter phone number"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                                <textarea
                                    name="address"
                                    value={companyData.address}
                                    onChange={handleCompanyChange}
                                    placeholder="Enter company address"
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex justify-center items-center">
                                Continue →
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleAdminSubmit} className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={adminData.name}
                                    onChange={handleAdminChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={adminData.email}
                                    onChange={handleAdminChange}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={adminData.password}
                                        onChange={handleAdminChange}
                                        placeholder="Create a password"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={adminData.confirmPassword}
                                        onChange={handleAdminChange}
                                        placeholder="Confirm your password"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : 'Create Account'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-all"
                            >
                                ← Back
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 text-center border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline ml-1">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
