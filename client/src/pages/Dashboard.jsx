import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bike } from 'lucide-react';
import BuyerDashboard from './BuyerDashboard';
import RunnerDashboard from './RunnerDashboard';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState('buyer');

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Unified Top Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="layout-container">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                                <img src="/logo.png" alt="CampusRunner Logo" className="h-8 w-8 mr-2.5 object-contain" />
                                CampusRunner
                            </span>

                            {/* Role Switcher */}
                            <div className="hidden md:flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setView('buyer')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'buyer'
                                        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-900/5'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Order (Buyer)
                                </button>
                                <button
                                    onClick={() => setView('runner')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center ${view === 'runner'
                                        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-900/5'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <Bike className="w-4 h-4 mr-1.5" />
                                    Deliver (Runner)
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex flex-col items-end justify-center">
                                <span className="text-xs text-slate-500 font-medium">Earned Balance</span>
                                <span className="text-sm font-bold text-slate-900">${user?.balance?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex items-center border-l border-slate-200 pl-6 h-8 space-x-4">
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
                                <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile View Switcher */}
                <div className="md:hidden border-t border-slate-200 bg-slate-50 p-2 flex justify-center">
                    <div className="flex w-full max-w-sm space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setView('buyer')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'buyer'
                                ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-900/5'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Order
                        </button>
                        <button
                            onClick={() => setView('runner')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex justify-center items-center ${view === 'runner'
                                ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-900/5'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Bike className="w-4 h-4 mr-1.5" />
                            Deliver
                        </button>
                    </div>
                </div>
            </nav>

            {/* Render the selected workspace */}
            {view === 'buyer' ? <BuyerDashboard /> : <RunnerDashboard />}

        </div>
    );
};

export default Dashboard;
