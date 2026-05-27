import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';

const Register = () => {
    const [step, setStep] = useState(0);
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

    // Checkout Modal and simulated payment gateway states
    const [selectedPlan, setSelectedPlan] = useState('free');
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('upi'); // 'upi' or 'card'
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    // Card inputs for realistic validation
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: '',
    });
    const [upiId, setUpiId] = useState('');

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

    const handleAdminSubmit = (e) => {
        e.preventDefault();

        if (adminData.password !== adminData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (adminData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        // Proceed to Step 3: Subscription Plan selection
        setStep(3);
    };

    // Realistic Card input formatting
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        setCardData({ ...cardData, number: formatted });
    };

    const handleCardExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) {
            setCardData({ ...cardData, expiry: `${value.slice(0, 2)}/${value.slice(2)}` });
        } else {
            setCardData({ ...cardData, expiry: value });
        }
    };

    const handleCardCvvChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        setCardData({ ...cardData, cvv: value });
    };

    // Execute standard free registration directly
    const executeRegistration = async (planType) => {
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
        formData.append('plan', planType);

        const result = await register(formData);

        if (result.success) {
            toast.success('Registration successful! Welcome to SalesPortal.');
            navigate('/dashboard');
        } else {
            toast.error(result.message || 'Registration failed');
        }
        setLoading(false);
    };

    // Simulated payment processing loader with state cycling
    const startPaymentSimulation = () => {
        setPaymentProcessing(true);
        setProcessingStatus('Securing end-to-end connection to bank gateway...');
        
        setTimeout(() => {
            setProcessingStatus('Awaiting secure bank network response code...');
        }, 1000);
        
        setTimeout(() => {
            setProcessingStatus('Payment token validated! Registering your corporate profile...');
        }, 2000);
        
        setTimeout(async () => {
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
            formData.append('plan', selectedPlan);

            const result = await register(formData);
            setLoading(false);

            if (result.success) {
                setProcessingStatus('Account created! Preparing dashboard...');
                setPaymentSuccess(true);
                setTimeout(() => {
                    setPaymentProcessing(false);
                    setPaymentSuccess(false);
                    setCheckoutModalOpen(false);
                    toast.success(selectedPlan === 'enterprise' ? 'Welcome! Enterprise account successfully activated.' : 'Welcome! Professional account successfully activated.');
                    navigate('/dashboard');
                }, 1800);
            } else {
                setPaymentProcessing(false);
                toast.error(result.message || 'Registration failed');
            }
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-3xl"></div>
            </div>
            <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full ${step === 3 ? 'max-w-4xl' : 'max-w-2xl'} relative z-10 overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-200`}>
                {/* Card Header with Controls */}
                <div className="flex justify-between items-center px-6 py-4 absolute top-0 left-0 w-full z-20">
                    {step === 0 ? (
                        <Link to="/login" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium hidden sm:inline-block">Back</span>
                        </Link>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setStep(step - 1)} 
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all flex items-center gap-2 group"
                        >
                            <div className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium hidden sm:inline-block">Back</span>
                        </button>
                    )}
                    <ThemeToggle />
                </div>

                <div className="p-8 sm:p-10 pt-20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-4 text-2xl">
                            {step === 0 ? "🚀" : "🏢"}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {step === 0 ? "Get Started" : "Create Account"}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {step === 0 ? "Join SalesPortal to streamline operations and boost sales" : "Join SalesPortal and manage your sales team"}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    {step > 0 && (
                        <div className="flex items-center justify-center mb-8">
                            <div className={`flex items-center ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm ${step >= 1 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-slate-300'}`}>1</div>
                                <span className="ml-2 font-semibold text-xs sm:text-sm">Company</span>
                            </div>
                            <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${step >= 2 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            <div className={`flex items-center ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm ${step >= 2 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-slate-300'}`}>2</div>
                                <span className="ml-2 font-semibold text-xs sm:text-sm">Account</span>
                            </div>
                            <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${step >= 3 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            <div className={`flex items-center ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm ${step >= 3 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-slate-300'}`}>3</div>
                                <span className="ml-2 font-semibold text-xs sm:text-sm">Pricing</span>
                            </div>
                        </div>
                    )}

                    {step === 0 && (
                        <div className="space-y-8 animate-fadeIn text-center">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    Choose Your Account Type
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                                    To get started, please select how you will be using SalesPortal.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                                {/* Option 1: Manager */}
                                <div
                                    onClick={() => setStep(1)}
                                    className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-all">
                                            🏢
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            Company Manager
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Register a new company workspace, invite your team, add products, and view company analytics.
                                        </p>
                                    </div>
                                    <div className="mt-6 w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 group-hover:bg-blue-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs rounded-xl shadow-sm group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                                        Create Workspace →
                                    </div>
                                </div>

                                {/* Option 2: Salesman */}
                                <div
                                    onClick={() => navigate('/register-salesman')}
                                    className="group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-all">
                                            💼
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            Sales Representative
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Join your company's existing workspace. Search your team, submit sales, and track your performance.
                                        </p>
                                    </div>
                                    <div className="mt-6 w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 group-hover:bg-indigo-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs rounded-xl shadow-sm group-hover:shadow-md group-hover:shadow-indigo-500/20 transition-all duration-300">
                                        Join Company →
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex justify-center items-center"
                            >
                                Continue to Plans →
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

                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Choose Subscription Plan</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Select the best option for your corporate size</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Free Plan Card */}
                                <div 
                                    onClick={() => setSelectedPlan('free')}
                                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        selectedPlan === 'free' 
                                            ? 'border-blue-600 bg-blue-50/30 dark:border-blue-400 dark:bg-blue-950/20 shadow-md shadow-blue-500/5' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    {selectedPlan === 'free' && (
                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            ✓
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Standard</div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Free Plan</h3>
                                        <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
                                            ₹0 <span className="text-xs font-normal text-slate-500">/ forever</span>
                                        </div>
                                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Up to 5 Salesmen
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> 20 Products
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Sales Tracking
                                            </li>
                                            <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                <span className="text-red-500 font-bold">❌</span> Advanced Analytics
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={`w-full py-2 text-center font-bold text-xs rounded-lg transition-all ${
                                        selectedPlan === 'free'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}>
                                        Select Free
                                    </div>
                                </div>

                                {/* Professional Plan Card */}
                                <div 
                                    onClick={() => setSelectedPlan('professional')}
                                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        selectedPlan === 'professional' 
                                            ? 'border-blue-600 bg-blue-50/30 dark:border-blue-400 dark:bg-blue-950/20 shadow-md shadow-blue-500/5' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm z-10">
                                        Popular
                                    </div>
                                    {selectedPlan === 'professional' && (
                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            ✓
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">Corporate</div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Professional</h3>
                                        <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
                                            ₹999 <span className="text-xs font-normal text-slate-500">/ mo</span>
                                        </div>
                                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Unlimited Salesmen
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Unlimited Products
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Advanced Dashboard
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Export Reports
                                            </li>
                                            <li className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                                                <span className="text-indigo-500 dark:text-indigo-400 font-bold">✓</span> AI Sales Predictor
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={`w-full py-2 text-center font-bold text-xs rounded-lg transition-all ${
                                        selectedPlan === 'professional'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}>
                                        Select Pro
                                    </div>
                                </div>

                                {/* Enterprise Plan Card */}
                                <div 
                                    onClick={() => setSelectedPlan('enterprise')}
                                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        selectedPlan === 'enterprise' 
                                            ? 'border-blue-600 bg-blue-50/30 dark:border-blue-400 dark:bg-blue-950/20 shadow-md shadow-blue-500/5' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm z-10">
                                        Ultimate
                                    </div>
                                    {selectedPlan === 'enterprise' && (
                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            ✓
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Enterprise</div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Enterprise</h3>
                                        <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
                                            ₹2,999 <span className="text-xs font-normal text-slate-500">/ mo</span>
                                        </div>
                                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Unlimited Salesmen & Products
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Dedicated DB Server
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> Custom branding logo
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500 font-bold">✓</span> 24/7 Priority VIP Support
                                            </li>
                                            <li className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                                                <span className="text-amber-500 dark:text-amber-400 font-bold">✓</span> AI Sales Predictor (VIP)
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={`w-full py-2 text-center font-bold text-xs rounded-lg transition-all ${
                                        selectedPlan === 'enterprise'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}>
                                        Select Enterprise
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                {selectedPlan === 'free' ? (
                                    <button
                                        type="button"
                                        onClick={() => executeRegistration('free')}
                                        disabled={loading}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : 'Confirm Free Registration'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setCheckoutModalOpen(true)}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/25 transition-all transform active:scale-[0.98] flex justify-center items-center"
                                    >
                                        Proceed to Checkout ({selectedPlan === 'enterprise' ? '₹2999/mo' : '₹999/mo'}) →
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-all"
                                >
                                    ← Back to Account Setup
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 text-center border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline ml-1">Sign in</Link>
                    </p>
                </div>
            </div>

            {/* Subscription Checkout Modal */}
            {checkoutModalOpen && (() => {
                const upiAmount = selectedPlan === 'enterprise' ? '2999' : '999';
                const upiPlanName = selectedPlan === 'enterprise' ? 'Enterprise Subscription' : 'Professional Subscription';
                const upiUrl = `upi://pay?pa=salesportal@okaxis&pn=SalesPortal Inc&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(upiPlanName)}`;
                
                return (
                    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] transition-all duration-300">
                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Secure checkout</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">SalesPortal {selectedPlan === 'enterprise' ? 'Enterprise' : 'Professional'} Tier Subscription</p>
                                </div>
                                <button 
                                    onClick={() => setCheckoutModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all flex items-center justify-center font-bold text-sm"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Order Summary banner */}
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 px-5 py-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 shrink-0">
                                <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">Monthly {selectedPlan === 'enterprise' ? 'Enterprise' : 'Professional'} Plan:</span>
                                <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">₹{selectedPlan === 'enterprise' ? '2999.00' : '999.00'} / month</span>
                            </div>

                            {/* Tab navigation */}
                            <div className="flex border-b border-slate-100 dark:border-slate-700 shrink-0">
                                <button
                                    onClick={() => setActiveTab('upi')}
                                    className={`flex-1 py-3 text-center font-bold text-xs border-b-2 transition-all flex items-center justify-center gap-2 ${
                                        activeTab === 'upi'
                                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    📱 UPI QR Scanner
                                </button>
                                <button
                                    onClick={() => setActiveTab('card')}
                                    className={`flex-1 py-3 text-center font-bold text-xs border-b-2 transition-all flex items-center justify-center gap-2 ${
                                        activeTab === 'card'
                                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    💳 Card Details
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 overflow-y-auto flex-1 space-y-4 select-none scrollbar-thin dark:scrollbar-thumb-slate-700">
                                {activeTab === 'upi' && (
                                    <div className="space-y-4 text-center">
                                        <div className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                            Scan this QR Code with **Google Pay**, **PhonePe**, or **Paytm** on your mobile to proceed.
                                        </div>
                                        
                                        {/* QR Code Container */}
                                        <div className="inline-block p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUrl)}`} 
                                                alt="UPI Subscription QR Code Scanner"
                                                className="w-36 h-36 mx-auto"
                                            />
                                        </div>

                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                            Merchant: <span className="font-bold text-slate-600 dark:text-slate-300">SalesPortal Inc</span> | UPI ID: <span className="font-bold text-slate-600 dark:text-slate-300">salesportal@okaxis</span>
                                        </div>

                                        {/* Info Alert Tip banner */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 p-3 rounded-xl text-left text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2">
                                            <span className="text-xs">💡</span>
                                            <span>
                                                <strong>Demo Option C:</strong> Scanning this with GPay opens a connection but prevents actual transaction charges. Complete the checkout simulation by clicking the verify button below!
                                            </span>
                                        </div>

                                        {/* Mock UPI ID input */}
                                        <div className="text-left">
                                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Your UPI ID (Optional)</label>
                                            <input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="username@okaxis"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-blue-500 transition-all outline-none text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={startPaymentSimulation}
                                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2 text-xs"
                                        >
                                            Verify UPI Payment & Complete
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'card' && (
                                    <form onSubmit={(e) => { e.preventDefault(); startPaymentSimulation(); }} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Cardholder Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={cardData.name}
                                                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                                placeholder="Enter name on card"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-blue-500 transition-all outline-none text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Card Number</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    value={cardData.number}
                                                    onChange={handleCardNumberChange}
                                                    placeholder="0000 0000 0000 0000"
                                                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-blue-500 transition-all outline-none text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">💳</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Expiration Date</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={cardData.expiry}
                                                    onChange={handleCardExpiryChange}
                                                    placeholder="MM/YY"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-blue-500 transition-all outline-none text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">CVV</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={cardData.cvv}
                                                    onChange={handleCardCvvChange}
                                                    placeholder="•••"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-blue-500 transition-all outline-none text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 text-xs mt-4"
                                        >
                                            Pay ₹{selectedPlan === 'enterprise' ? '2999.00' : '999.00'} & Complete Registration
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Full-Screen Payment Processing Overlay */}
            {paymentProcessing && (
                <div className="fixed inset-0 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        {!paymentSuccess ? (
                            <>
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin mb-4">
                                    <div className="w-12 h-12 rounded-full border-4 border-r-blue-400 border-t-transparent border-b-transparent border-l-transparent animate-spin reverse"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-wide">Processing Secure Transaction</h3>
                                <p className="text-slate-400 text-sm font-medium animate-fadeIn min-h-[40px] px-6">
                                    {processingStatus}
                                </p>
                                <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-progress animate-infinite" style={{ width: '40%' }}></div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 animate-scaleUp">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center mx-auto mb-4 text-emerald-500 animate-bounce">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Payment Authorized!</h3>
                                <p className="text-emerald-400 text-sm font-semibold">Your Professional Subscription is now active.</p>
                                <p className="text-slate-400 text-xs mt-1">Dispatching real invoice receipt to your inbox...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
