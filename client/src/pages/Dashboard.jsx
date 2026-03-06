import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bike, Home, ShoppingBag, User as UserIcon, Bell } from 'lucide-react';
import BuyerDashboard from './BuyerDashboard';
import RunnerDashboard from './RunnerDashboard';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState('buyer'); // 'buyer' or 'runner'
    const [activeTab, setActiveTab] = useState('home'); // Mobile bottom nav state

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-accent selection:text-brand-dark">
            {/* Desktop Modern Header */}
            <nav className="hidden md:block border-b border-white/5 bg-brand-dark/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center space-x-12">
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-glass-glow transition-transform group-hover:scale-110">
                                <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
                            </div>
                            <span className="text-xl font-black tracking-tight uppercase">
                                Campus<span className="text-brand-accent">Runner</span>
                            </span>
                        </div>

                        {/* Desktop Role Switcher */}
                        <div className="flex bg-brand-muted p-1 rounded-full border border-white/5">
                            <button
                                onClick={() => setView('buyer')}
                                className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${view === 'buyer' ? 'bg-brand-accent text-brand-dark shadow-lime-glow' : 'text-slate-400 hover:text-white'}`}
                            >
                                Order Workspace
                            </button>
                            <button
                                onClick={() => setView('runner')}
                                className={`px-6 py-2 text-sm font-bold rounded-full transition-all flex items-center ${view === 'runner' ? 'bg-brand-accent text-brand-dark shadow-lime-glow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Bike className="w-4 h-4 mr-2" />
                                Runner Terminal
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        {/* Balance Bento Card (Small) */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 flex flex-col items-center">
                            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] mb-0.5">Balance</span>
                            <span className="text-lg font-black font-mono">${user?.balance?.toFixed(2) || '0.00'}</span>
                        </div>

                        <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-accent transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Floating Bottom Nav */}
            <div className="bottom-nav">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Home</span>
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Orders</span>
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                >
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Profile</span>
                </button>
            </div>

            {/* Main Content Area */}
            <main className="pb-32 md:pb-10 min-h-[calc(100vh-80px)]">
                {activeTab === 'home' && <BuyerDashboard />}
                {activeTab === 'orders' && <RunnerDashboard />}
                {activeTab === 'profile' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto mt-20 p-8 bento-card text-center"
                    >
                        <div className="w-24 h-24 bg-brand-primary rounded-full mx-auto mb-8 flex items-center justify-center shadow-glass-glow">
                            <UserIcon className="w-12 h-12 text-brand-accent" />
                        </div>
                        <h2 className="text-3xl font-black mb-2">{user?.name}</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Campus Authenticated</p>

                        <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/10">
                            <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">Total Credits</p>
                            <p className="text-4xl font-black font-mono">${user?.balance?.toFixed(2)}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full btn-squircle bg-rose-500 text-white shadow-none hover:bg-rose-600"
                        >
                            Terminate Session
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
