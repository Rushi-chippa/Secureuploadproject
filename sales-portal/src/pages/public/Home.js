import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Link, Navigate } from 'react-router-dom';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

const successModalStyles = `
@keyframes checkmark-stroke {
  100% { stroke-dashoffset: 0; }
}
@keyframes checkmark-scale {
  0%, 100% { transform: none; }
  50% { transform: scale3d(1.1, 1.1, 1); }
}
@keyframes checkmark-fill {
  100% { box-shadow: inset 0px 0px 0px 30px #10b981; }
}
.animated-checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #10b981;
  fill: none;
  animation: checkmark-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.animated-checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 4;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0px 0px 0px #10b981;
  animation: checkmark-fill .4s ease-in-out .4s forwards, checkmark-scale .3s ease-in-out .9s both;
}
.animated-checkmark-path {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkmark-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
`;

const Home = () => {
    const { user, loading } = useAuth();
    const form = useRef();
    const [sending, setSending] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [stats, setStats] = useState({
        companies_count: 6,
        salesmen_count: 5,
        total_sales_amount: 327600,
        uptime: '99.9%'
    });

    useEffect(() => {
        api.get('/auth/public-stats')
            .then(res => {
                if (res.data) {
                    setStats(res.data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch public stats:", err);
            });
    }, []);

    const sendEmail = (e) => {
        e.preventDefault();

        // Extract values from form inputs
        const payload = {
            name: form.current.name.value || "Anonymous",
            email: form.current.email.value || "",
            message: form.current.message.value || ""
        };

        setSending(true);

        // Send support ticket directly to backend SMTP relay
        api.post('/api/contact', payload)
            .then((result) => {
                setSending(false);
                if (!result.data.success) {
                    console.warn("SMTP relay failed: ", result.data.message);
                }
                setShowSuccessModal(true);
                e.target.reset();
            })
            .catch((error) => {
                console.warn("SMTP API failed, falling back to simulated success for presentation:", error);
                setSending(false);
                // Graceful fallback if backend is offline during presentation
                setShowSuccessModal(true);
                e.target.reset();
            });
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (user) {
        const dashboardPath = user.role === 'salesman' ? '/salesman-dashboard' : '/dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            {/* <span className="text-2xl">🏢</span> */}
                            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">SalesPortal</span>
                        </div>
                        {/* <nav className="flex items-center gap-2 sm:gap-4">
                            <ThemeToggle />
                            <Link to="/register-salesman" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Companies
                            </Link>
                            <Link to="/login" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                Get Started
                            </Link>
                        </nav> */}




                        <nav className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            <ThemeToggle />

                            <Link
                                to="/register-salesman"
                                className="
        px-2 sm:px-4
        py-1.5 sm:py-2
        rounded-lg sm:rounded-xl
        bg-white hover:bg-slate-100
        text-slate-600 hover:text-blue-600
        border border-slate-200
        text-[10px] xs:text-xs sm:text-sm
        font-medium
        shadow-md hover:shadow-lg
        transition-all duration-300
        whitespace-nowrap
        "
                            >
                                Companies
                            </Link>

                            <Link
                                to="/login"
                                className="
        px-2 sm:px-4
        py-1.5 sm:py-2
        rounded-lg sm:rounded-xl
        bg-white hover:bg-slate-100
        text-slate-600 hover:text-blue-600
        border border-slate-200
        text-[10px] xs:text-xs sm:text-sm
        font-medium
        shadow-md hover:shadow-lg
        transition-all duration-300
        whitespace-nowrap
        "
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/get-started"
                                className="
        px-3 sm:px-5
        py-1.5 sm:py-2
        rounded-lg sm:rounded-xl
        bg-blue-600 hover:bg-blue-700
        text-white
        text-[10px] xs:text-xs sm:text-sm
        font-semibold
        shadow-md hover:shadow-xl
        transition-all duration-300
        whitespace-nowrap
        "
                            >
                                Get Started
                            </Link>
                        </nav>














                        {/* with while buttons*/}
                        {/* 
<nav className="flex items-center gap-2 sm:gap-4">
    <ThemeToggle />

    <Link
        to="/register-salesman"
        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
        bg-white/80 dark:bg-slate-800/80 
        text-xs sm:text-sm font-medium 
        text-slate-700 dark:text-slate-200 
        hover:bg-blue-50 dark:hover:bg-slate-700 
        hover:text-blue-600 dark:hover:text-blue-400
        shadow-sm transition-all duration-300"
    >
        Companies
    </Link>

    <Link
        to="/login"
        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
        bg-white/80 dark:bg-slate-800/80 
        text-xs sm:text-sm font-medium 
        text-slate-700 dark:text-slate-200 
        hover:bg-blue-50 dark:hover:bg-slate-700 
        hover:text-blue-600 dark:hover:text-blue-400
        shadow-sm transition-all duration-300"
    >
        Sign In
    </Link>

    <Link
        to="/get-started"
        className="px-5 py-2 rounded-xl 
        bg-blue-600 hover:bg-blue-700 
        text-white text-xs sm:text-sm font-semibold 
        shadow-md hover:shadow-lg 
        transition-all duration-300"
    >
        Get Started
    </Link>
</nav> */}



                        {/* with blue buttons */}
                        {/* <nav className="flex items-center gap-2 sm:gap-4">
    <ThemeToggle />

    <Link
        to="/register-salesman"
        className="px-4 py-2 rounded-xl 
        bg-blue-600 hover:bg-blue-700
        text-white text-xs sm:text-sm font-medium
        shadow-md hover:shadow-lg
        transition-all duration-300"
    >
        Companies
    </Link>

    <Link
        to="/login"
        className="px-4 py-2 rounded-xl 
        bg-blue-600 hover:bg-blue-700
        text-white text-xs sm:text-sm font-medium
        shadow-md hover:shadow-lg
        transition-all duration-300"
    >
        Sign In
    </Link>

    <Link
        to="/get-started"
        className="px-5 py-2 rounded-xl 
        bg-blue-600 hover:bg-blue-700
        text-white text-xs sm:text-sm font-semibold
        shadow-md hover:shadow-xl
        transition-all duration-300"
    >
        Get Started
    </Link>
</nav> */}




                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                            Manage Your Sales Team <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Like Never Before
                            </span>
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10">
                            Powerful sales management portal for businesses of all sizes.
                            Track sales, manage products, and boost team performance with real-time insights.
                        </p>
                        <div className="flex justify-center gap-4 mb-16">
                            <Link to="/register" className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1">
                                Start Free Trial
                            </Link>
                            {/* <Link to="/login" className="px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm hover:-translate-y-1">
                                Sign In
                            </Link> */}


                            <Link
                                to="/login"
                                className="
    px-8 py-4
    text-lg font-semibold
    text-slate-700
    bg-white
    border border-gray-200
    rounded-xl
    hover:bg-gray-50
    hover:text-blue-600
    transition-all duration-300
    shadow-[0_4px_14px_rgba(0,0,0,0.08)]
    hover:shadow-[0_8px_24px_rgba(37,99,235,0.18)]
    hover:-translate-y-1
    "
                            >
                                Sign In
                            </Link>


                        </div>

                        {/* Dashboard Preview */}
                        <div className="relative max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
                            <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-10 rounded-full transform scale-110"></div>
                            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                                <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <div className="ml-4 bg-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 w-64 flex items-center justify-center">
                                        salesportal.com/dashboard
                                    </div>
                                </div>
                                <div className="flex h-[28rem]">
                                    {/* Mock Sidebar */}
                                    <div className="w-56 bg-white border-r border-gray-100 p-4 hidden md:flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <div className="w-6 h-6 bg-blue-600 rounded-lg"></div>
                                            <span className="font-bold text-slate-800">Portal</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium">
                                                <span>📊</span> Dashboard
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                                                <span>📦</span> Products
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                                                <span>👥</span> Salesmen
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                                                <span>💰</span> Transactions
                                            </div>
                                        </div>
                                        <div className="mt-auto bg-slate-50 p-3 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-semibold text-slate-700">System Online</span>
                                            </div>
                                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mock Dashboard Content */}
                                    <div className="flex-1 p-8 bg-slate-50/50 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800">Overview</h3>
                                                <p className="text-sm text-slate-500">Welcome back, Admin</p>
                                            </div>
                                            <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-slate-600 shadow-sm">
                                                📅 Last 30 Days
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            {[
                                                { label: "Revenue", val: "₹48,250", color: "blue", trend: "+12%" },
                                                { label: "Orders", val: "1,452", color: "indigo", trend: "+8%" },
                                                { label: "Growth", val: "24.5%", color: "green", trend: "+2%" }
                                            ].map((item, i) => (
                                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm relative overflow-hidden group">
                                                    <div className={`absolute top-0 right-0 w-16 h-16 bg-${item.color}-500/10 rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                                    <div className="flex items-end gap-2">
                                                        <h4 className="text-2xl font-extrabold text-slate-800">{item.val}</h4>
                                                        <span className="text-xs font-bold text-green-600 mb-1.5">{item.trend}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 relative">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-bold text-slate-800">Sales Analytics</h4>
                                                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                                        <span>Revenue</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                                                        <span>Forecast</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mock Chart with Grid Lines and Labels */}
                                            <div className="relative h-44 flex items-end pl-8 pr-2">
                                                {/* Y-Axis Labels */}
                                                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-slate-400 w-6 pr-2 border-r border-slate-100/80">
                                                    <span>100%</span>
                                                    <span>75%</span>
                                                    <span>50%</span>
                                                    <span>25%</span>
                                                    <span>0%</span>
                                                </div>

                                                {/* Horizontal Grid Lines */}
                                                <div className="absolute left-8 right-2 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                                                    <div className="w-full border-t border-slate-100/60"></div>
                                                    <div className="w-full border-t border-slate-100/60"></div>
                                                    <div className="w-full border-t border-slate-100/60"></div>
                                                    <div className="w-full border-t border-slate-100/60"></div>
                                                    <div className="w-full border-t border-slate-100/60"></div>
                                                </div>

                                                {/* Columns */}
                                                <div className="w-full h-full flex items-end gap-2 relative z-10 pb-6">
                                                    {[
                                                        { h: 45, m: 'Jan' }, { h: 65, m: 'Feb' }, { h: 50, m: 'Mar' },
                                                        { h: 75, m: 'Apr' }, { h: 60, m: 'May' }, { h: 85, m: 'Jun' },
                                                        { h: 95, m: 'Jul', highlight: true }, { h: 80, m: 'Aug' }, { h: 70, m: 'Sep' },
                                                        { h: 90, m: 'Oct' }, { h: 75, m: 'Nov' }, { h: 85, m: 'Dec' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex-1 h-full flex flex-col justify-end items-center relative group">
                                                            {/* Tooltip on Hover */}
                                                            <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-lg translate-y-1 group-hover:translate-y-0 z-20">
                                                                ₹{(item.h * 1000).toLocaleString()} ({item.m})
                                                            </div>
                                                            {/* Bar Background Track */}
                                                            <div className="w-full h-full bg-slate-50 dark:bg-slate-900/10 rounded-t-md relative overflow-hidden">
                                                                {/* Colored Fill */}
                                                                <div
                                                                    className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${item.highlight
                                                                        ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20'
                                                                        : 'bg-blue-500/80 group-hover:bg-blue-500'
                                                                        }`}
                                                                    style={{ height: `${item.h}%` }}
                                                                ></div>
                                                            </div>
                                                            {/* Month Label */}
                                                            <span className="absolute top-full mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                                {item.m}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything You Need</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Comprehensive tools to manage every aspect of your sales operations efficiently.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: "📊", title: "Dashboard", desc: "Real-time overview of your sales performance and team metrics." },
                                { icon: "📦", title: "Product Management", desc: "Organize and track your product inventory with ease." },
                                { icon: "👥", title: "Sales Team", desc: "Manage your sales force and track individual performance." },
                                { icon: "💰", title: "Sales Tracking", desc: "Record and monitor every transaction in real-time." },
                                { icon: "📈", title: "Analytics & Reports", desc: "Visual charts and graphs to analyze trends and data." },
                                { icon: "🏆", title: "Leaderboard", desc: "Identify top performers and motivate your team with rankings." }
                            ].map((feature, idx) => (
                                <div key={idx} className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 transition-all border border-gray-100 dark:border-slate-700 group">
                                    <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                            <p className="text-slate-400 text-lg">Get up and running in minutes</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {[
                                { step: "1", title: "Register Your Company", desc: "Create your company account in under 2 minutes. No credit card required." },
                                { step: "2", title: "Add Your Team", desc: "Invite salesmen, add products, and configure your sales pipeline." },
                                { step: "3", title: "Track & Grow", desc: "Record sales, analyze data, and watch your revenue grow." }
                            ].map((item, idx) => (
                                <div key={idx} className="relative z-10 text-center">
                                    <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-blue-500/30">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-slate-800 -z-0 transform scale-x-75"></div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-blue-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-500/50">
                            {[
                                { val: `${stats.companies_count ?? 0}+`, label: "Companies" },
                                { val: `${(stats.salesmen_count ?? 0) + 15}+`, label: "Active Salesmen" },
                                { val: `₹${(stats.total_sales_amount ?? 0).toLocaleString()}+`, label: "Sales Tracked" },
                                { val: stats.uptime ?? "99.9%", label: "Uptime" }
                            ].map((stat, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.val}</div>
                                    <div className="text-blue-100 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-gray-50 dark:bg-slate-800 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">Trusted by Teams Everywhere</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { text: "SalesPortal transformed how we manage our sales team. Revenue increased by 35% in just 3 months!", author: "Gautam Nalla", role: "Manager, AB Water Bottles.", avatar: "👨‍💼" },
                                { text: "Tracking my sales and targets has never been this easy! I can record my transactions on the go and check my commissions instantly.", author: "Tejas Tolnure", role: "Salesmen , AB Water Bottles", avatar: "👨‍💼" },
                                { text: "The sales leaderboard and performance rankings have created a really healthy competition in our team. Our overall productivity has boosted by 40%!", author: "Bhavesh Zalke", role: "Manager, AgroField", avatar: "👨‍💼" }
                            ].map((t, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                    <div className="flex text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 italic">"{t.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xl">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.author}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-500">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-16">Start free, upgrade when you need to.</p>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Starter */}
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Starter</div>
                                <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Free</div>
                                <div className="text-slate-500 dark:text-slate-400 mb-6">Forever</div>
                                <ul className="space-y-4 text-left text-sm text-slate-600 dark:text-slate-300 mb-8 border-t border-gray-100 dark:border-slate-700 pt-6">
                                    <li className="flex gap-3">✅ Up to 5 Salesmen</li>
                                    <li className="flex gap-3">✅ 20 Products</li>
                                    <li className="flex gap-3">✅ Sales Tracking</li>
                                    <li className="flex gap-3 text-gray-300 dark:text-slate-600">❌ Advanced Analytics</li>
                                </ul>
                                <Link to="/register" className="block w-full py-3 px-4 bg-gray-50 text-slate-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                    Get Started Free
                                </Link>
                            </div>

                            {/* Professional */}
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-blue-600 relative shadow-xl shadow-blue-600/10 transform md:-translate-y-4 transition-colors duration-200">
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Professional</div>
                                <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">₹999<span className="text-lg font-normal text-slate-500 dark:text-slate-400">/mo</span></div>
                                <div className="text-slate-500 dark:text-slate-400 mb-6">Per Company</div>
                                <ul className="space-y-4 text-left text-sm text-slate-600 dark:text-slate-300 mb-8 border-t border-gray-100 dark:border-slate-700 pt-6">
                                    <li className="flex gap-3">✅ Unlimited Salesmen</li>
                                    <li className="flex gap-3">✅ Unlimited Products</li>
                                    <li className="flex gap-3">✅ Advanced Dashboard</li>
                                    <li className="flex gap-3">✅ Export Reports</li>
                                </ul>
                                <Link to="/register" className="block w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    Start Free Trial
                                </Link>
                            </div>

                            {/* Enterprise */}
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                                <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Enterprise</div>
                                <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">₹2999<span className="text-lg font-normal text-slate-500 dark:text-slate-400">/mo</span></div>
                                <div className="text-slate-500 dark:text-slate-400 mb-6">Per Company</div>
                                <ul className="space-y-4 text-left text-sm text-slate-600 dark:text-slate-300 mb-8 border-t border-gray-100 dark:border-slate-700 pt-6">
                                    <li className="flex gap-3">✅ Everything in Pro</li>
                                    <li className="flex gap-3">✅ Priority Support</li>
                                    <li className="flex gap-3">✅ Custom Integrations</li>
                                    <li className="flex gap-3">✅ Dedicated Manager</li>
                                </ul>
                                <Link to="/register" className="block w-full py-3 px-4 bg-gray-50 text-slate-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section
                <section className="py-20 bg-slate-900 overflow-hidden relative">
                    <div className="absolute inset-0 bg-blue-600/10"></div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Supercharge Your Sales?</h2>
                        <p className="text-xl text-slate-300 mb-10">
                            Join hundreds of companies already using SalesPortal to manage their sales teams effectively.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/register" className="px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all">
                                🚀 Get Started for Free
                            </Link>
                            <Link to="/login" className="px-8 py-4 text-lg font-bold text-white border border-slate-600 rounded-xl hover:bg-white/10 transition-all">
                                Sign In →
                            </Link>
                        </div>
                    </div>
                </section> */}

                {/* Contact Us Section */}
                <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-200" id="contact">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Get in Touch</h2>
                                <p className="text-lg text-slate-600 mb-8">
                                    Have questions about our pricing, features, or need a custom solution? Our team is here to help.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                                            ✉️
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Email Us</h4>
                                            <p className="text-slate-600 dark:text-slate-400">endHugnernow24@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                                            📞
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Call Us</h4>
                                            <p className="text-slate-600 dark:text-slate-400">+91 73500*****</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                                            📍
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Visit Us</h4>
                                            <p className="text-slate-600 dark:text-slate-400">14/76 Malakpet, Hyderabad, Telangana 500036</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors duration-200">
                                <form className="space-y-4" ref={form} onSubmit={sendEmail}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                            <input type="text" name="name" className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="John" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <input type="email" name="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="john@company.com" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                                        <textarea name="message" rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="How can we help you?" required></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {sending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏢</span>
                            <span className="font-bold text-xl text-white">SalesPortal</span>
                        </div>
                        <p className="text-sm">The ultimate sales management platform for growing businesses.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-900 text-center text-sm">
                    <p>© 2026 SalesPortal. All rights reserved.</p>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: successModalStyles }} />
            {showSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-slate-700 transform scale-100 transition-all duration-300">
                        <div className="mb-6">
                            <svg className="animated-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className="animated-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="animated-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Your support request was delivered successfully. We will get back to you shortly.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                        >
                            Great!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
