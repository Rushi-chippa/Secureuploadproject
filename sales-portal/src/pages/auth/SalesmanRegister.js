import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';

const SalesmanRegister = () => {
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // We might need to auto-login or just redirect to login

    const [formData, setFormData] = useState({
        full_name: '',
        employee_id: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await authService.getCompanies();
                setCompanies(response.data);
            } catch (error) {
                toast.error("Failed to load companies");
            } finally {
                setLoadingCompanies(false);
            }
        };
        fetchCompanies();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompanySelect = (company) => {
        setSelectedCompany(company);
        setStep(2);
    };

    const filteredCompanies = companies.filter(company =>
        (company.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (company.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await authService.registerSalesman({
                full_name: formData.full_name,
                employee_id: formData.employee_id,
                email: formData.email,
                password: formData.password,
                company_id: selectedCompany.id
            });

            // Auto-login or redirect?
            // Let's try to auto-login using the credentials
            const loginResult = await login(formData.email, formData.password);
            if (loginResult.success) {
                toast.success("Welcome! You have successfully joined " + selectedCompany.name);
                navigate('/dashboard');
            } else {
                toast.success("Registration successful! Please login.");
                navigate('/login');
            }

        } catch (error) {
            toast.error(error.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 py-2 px-4 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm">Back</span>
            </Link>

            <div className="w-full max-w-6xl relative z-10 flex flex-col max-h-[90vh]">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4 animate-fadeIn">
                        Join Your Team
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto animate-fadeIn delay-100">
                        Find your company below to access your sales portal.
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex-1 flex flex-col">
                    <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                        {step === 1 && (
                            <div className="animate-fadeIn">
                                {/* Search Bar */}
                                <div className="max-w-2xl mx-auto mb-12 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <svg className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-14 pr-5 py-5 border-2 border-transparent bg-white dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 shadow-lg shadow-slate-200/50 dark:shadow-none text-lg transition-all"
                                        placeholder="Search for your company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {loadingCompanies ? (
                                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                                        <p className="text-slate-500 animate-pulse">Loading companies...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
                                        {filteredCompanies.length > 0 ? (
                                            filteredCompanies.map((company, index) => (
                                                <div
                                                    key={company.id}
                                                    onClick={() => handleCompanySelect(company)}
                                                    className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 cursor-pointer border border-slate-100 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 shadow-md hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                                                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-700 p-2 mb-6 shadow-lg shadow-slate-100 dark:shadow-none group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/20 transition-all duration-300 transform group-hover:scale-110 flex items-center justify-center">
                                                        {company.logo_url ? (
                                                            <img src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001'}${company.logo_url}`} alt={company.name} className="w-full h-full object-contain rounded-xl" />
                                                        ) : (
                                                            <span className="text-5xl filter grayscale group-hover:grayscale-0 transition-all">🏢</span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{company.name}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{company.industry || 'Industry not specified'}</p>

                                                    <div className="mt-auto w-full">
                                                        <span className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold text-sm group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30">
                                                            Select Company <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full flex flex-col items-center justify-center p-16 text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                <div className="text-6xl mb-4">🔍</div>
                                                <p className="text-xl font-medium text-slate-600 dark:text-slate-300">No companies found</p>
                                                <p className="text-sm">Try searching for a different name or industry</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-8 text-center">
                                    <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium">
                                        <span className="mr-2">Already have an account?</span>
                                        <span className="underline decoration-2 underline-offset-4 decoration-blue-200 hover:decoration-blue-600 transition-all">Login here</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {step === 2 && selectedCompany && (
                            <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto animate-fadeInUp">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-2 mb-4 border border-slate-100 dark:border-slate-700">
                                        {selectedCompany.logo_url ? (
                                            <img src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001'}${selectedCompany.logo_url}`} alt={selectedCompany.name} className="w-full h-full object-contain rounded-xl" />
                                        ) : (
                                            <span className="text-4xl">🏢</span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register at {selectedCompany.name}</h2>
                                    <p className="text-slate-500 text-sm mt-1">Fill in your details to request access</p>
                                </div>

                                <div className="space-y-5 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Employee ID</label>
                                            <input
                                                type="text"
                                                name="employee_id"
                                                value={formData.employee_id}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                placeholder="EMP-001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                placeholder="Jane Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            placeholder="jane@company.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none pr-10"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                >
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Confirm</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none pr-10"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 ring-4 ring-transparent hover:ring-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {loading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : "Create Account"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full py-3 px-6 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Choose Different Company
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesmanRegister;
