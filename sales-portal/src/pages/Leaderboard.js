import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await dataService.getLeaderboard({ month: selectedMonth });
                setCompanyName(response.data.company_name);
                setLeaderboardData(response.data.leaderboard);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
                let params = "";
                if (error.response) {
                    // Server responded with a status code outside 2xx
                    params = `Status: ${error.response.status} - ${error.response.data?.detail || error.message}`;
                } else if (error.request) {
                    // Request was made but no response received
                    params = "No response from server. Check if backend is running.";
                } else {
                    params = error.message;
                }
                setError(params);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedMonth]);

    const handleMonthChange = (offset) => {
        const current = new Date(selectedMonth + "-01");
        current.setMonth(current.getMonth() + offset);
        setSelectedMonth(current.toISOString().slice(0, 7));
    };

    const formatMonth = (isoMonth) => {
        const [year, month] = isoMonth.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Leaderboard...</div>;

    if (error) return (
        <div className="p-10 text-center">
            <div className="text-red-500 font-bold mb-2">Error Loading Leaderboard</div>
            <p className="text-slate-600 mb-4">{error}</p>
            <p className="text-sm text-slate-400">
                Tip: Ensure the backend server is running and you are logged in.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Retry
            </button>
        </div>
    );

    const topThree = leaderboardData.slice(0, 3);
    const rest = leaderboardData.slice(3);

    return (
        <div className="p-6 min-h-screen bg-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">🏆 Sales Leaderboard</h1>
                    <p className="text-slate-500">Top performers at <span className="font-semibold text-blue-600">{companyName}</span></p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => handleMonthChange(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">←</button>
                    <span className="font-semibold text-slate-700 w-32 text-center select-none">{formatMonth(selectedMonth)}</span>
                    <button onClick={() => handleMonthChange(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">→</button>
                </div>
            </div>

            {/* Podium Section */}
            <div className="flex justify-center items-end gap-4 mb-12 h-64">
                {/* 2nd Place */}
                {topThree[1] && (
                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-100">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-300 bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-slate-600 mb-[-20px] z-10 relative">
                            {topThree[1].avatar}
                        </div>
                        <div className="bg-gradient-to-t from-slate-200 to-slate-100 w-32 h-40 rounded-t-lg shadow-md flex flex-col items-center justify-start pt-8 pb-4 border-t-4 border-slate-300">
                            <span className="text-3xl font-bold text-slate-400 mb-2">2</span>
                            <p className="font-semibold text-slate-800">{topThree[1].name.split(' ')[0]}</p>
                            <p className="text-sm text-slate-600 font-bold">₹{topThree[1].revenue.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                        <div className="relative">
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">👑</span>
                            <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white shadow-xl flex items-center justify-center text-3xl font-bold text-yellow-600 mb-[-25px] z-20 relative">
                                {topThree[0].avatar}
                            </div>
                        </div>
                        <div className="bg-gradient-to-t from-yellow-100 to-yellow-50 w-40 h-52 rounded-t-lg shadow-xl flex flex-col items-center justify-start pt-10 pb-4 border-t-4 border-yellow-400 z-10">
                            <span className="text-4xl font-bold text-yellow-500 mb-2">1</span>
                            <p className="font-bold text-lg text-slate-800">{topThree[0].name.split(' ')[0]}</p>
                            <p className="text-base text-yellow-700 font-bold bg-yellow-200 px-3 py-1 rounded-full mt-1">
                                ₹{topThree[0].revenue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="w-20 h-20 rounded-full border-4 border-orange-300 bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-orange-600 mb-[-20px] z-10 relative">
                            {topThree[2].avatar}
                        </div>
                        <div className="bg-gradient-to-t from-orange-100 to-orange-50 w-32 h-32 rounded-t-lg shadow-md flex flex-col items-center justify-start pt-8 pb-4 border-t-4 border-orange-300">
                            <span className="text-3xl font-bold text-orange-400 mb-2">3</span>
                            <p className="font-semibold text-slate-800">{topThree[2].name.split(' ')[0]}</p>
                            <p className="text-sm text-slate-600 font-bold">₹{topThree[2].revenue.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* List for the rest */}
            {rest.length > 0 && (
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 text-slate-500 font-medium">Rank</th>
                                <th className="p-4 text-slate-500 font-medium">Salesman</th>
                                <th className="p-4 text-center text-slate-500 font-medium">Quantity</th>
                                <th className="p-4 text-right text-slate-500 font-medium">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {rest.map((salesman) => (
                                <tr key={salesman.rank} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-slate-400 font-bold">#{salesman.rank}</td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {salesman.avatar}
                                        </div>
                                        <span className="font-medium text-slate-700">{salesman.name}</span>
                                    </td>
                                    <td className="p-4 text-center text-slate-600">{salesman.quantity}</td>
                                    <td className="p-4 text-right font-bold text-slate-800">
                                        ₹{salesman.revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {leaderboardData.length === 0 && (
                <div className="text-center text-slate-400 mt-10">
                    <p>No sales data available yet.</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
