import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { PackageOpen, MapPin, DollarSign, CheckCircle, Navigation, LogOut, Wallet, Compass, Zap } from 'lucide-react';

const RunnerDashboard = () => {
    const { user, logout } = useAuth();
    const { onEvent } = useSocket();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);

    useEffect(() => {
        fetchAvailableOrders();
        fetchMyDeliveries();
    }, []);

    onEvent('new_order', (newOrder) => {
        // Simple visual refresh
        fetchAvailableOrders();
    });

    const fetchAvailableOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/available');
            setAvailableOrders(res.data.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyDeliveries = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/my-orders');
            setMyDeliveries(res.data.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await axios.patch(`http://localhost:5000/api/orders/${orderId}/accept`);
            fetchAvailableOrders();
            fetchMyDeliveries();
        } catch (err) {
            console.error(err);
            alert('Error accepting order. It may have been claimed.');
        }
    };

    const handleComplete = async (orderId) => {
        try {
            await axios.patch(`http://localhost:5000/api/orders/${orderId}/complete`);
            fetchMyDeliveries();
            // User context balance update usually requires a fetch to /me in a real app
        } catch (err) {
            console.error(err);
            alert('Error completing order.');
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    }

    return (
        <div className="min-h-screen bg-slate-900 relative pb-12 font-sans overflow-hidden">
            {/* Dark Mode Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 glass-dark p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center">
                        <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-brand-400 to-accent-500 rounded-2xl items-center justify-center mr-6 shadow-lg shadow-brand-500/20">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-brand-400 font-bold tracking-widest text-xs uppercase mb-1">Runner Fleet</p>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Drive & Earn</h1>
                            <p className="text-slate-400 mt-1 max-w-sm">Tap on active requests around campus to claim them and boost your balance.</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none glass-dark border border-white/10 rounded-2xl px-6 py-4 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
                            <div className="flex items-center space-x-2 mb-1 relative z-10">
                                <Wallet className="h-4 w-4 text-emerald-400" />
                                <span className="text-xs text-slate-300 font-semibold uppercase tracking-widest">Balance</span>
                            </div>
                            <span className="text-3xl font-display font-bold text-white relative z-10">${user?.balance?.toFixed(2) || '0.00'}</span>
                        </div>
                        <button onClick={handleLogout} className="p-4 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-2xl text-slate-300 hover:text-red-400 transition-all">
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Available Orders Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center">
                                <Compass className="mr-3 h-6 w-6 text-brand-400" />
                                On the Radar
                            </h2>
                            <span className="px-3 py-1 bg-brand-500/20 border border-brand-500/30 text-brand-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                {availableOrders.length} Available
                            </span>
                        </div>

                        <div className="space-y-4">
                            {availableOrders.length === 0 ? (
                                <div className="glass-dark border border-white/5 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <PackageOpen className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Campus is quiet.</h3>
                                    <p className="text-slate-400">Rest up! Real-time alerts will pop up when new delivery requests are posted.</p>
                                </div>
                            ) : (
                                availableOrders.map((order) => (
                                    <div key={order._id} className="relative glass-dark border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between">

                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand-400 to-accent-500" />

                                        <div className="flex-1 pl-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wide rounded-md">
                                                    {order.category}
                                                </span>
                                                <span className="text-sm font-medium text-slate-500">
                                                    by <span className="text-slate-300">{order.buyerId.name}</span>
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-white leading-tight mb-4 group-hover:text-brand-300 transition-colors">
                                                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </h3>

                                            <div className="space-y-2">
                                                <div className="flex items-start text-sm font-medium">
                                                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 mt-0.5 z-10 relative">
                                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                                        <div className="absolute top-5 left-1/2 w-0.5 h-6 bg-slate-700 -translate-x-1/2" />
                                                    </div>
                                                    <span className="text-slate-300">{order.pickupLocation}</span>
                                                </div>
                                                <div className="flex items-start text-sm font-medium">
                                                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 mt-0.5 z-10">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    </div>
                                                    <span className="text-slate-300">{order.deliveryLocation}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 sm:mt-0 sm:ml-6 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6 pl-4">
                                            <div className="text-left sm:text-right mb-0 sm:mb-6">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Earn</p>
                                                <div className="flex items-center text-emerald-400">
                                                    <DollarSign className="h-5 w-5 mr-0.5" />
                                                    <span className="text-3xl font-display font-bold">{order.deliveryFee.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAccept(order._id)}
                                                className="bg-brand-500 hover:bg-brand-400 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
                                            >
                                                Accept Route
                                            </button>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active Deliveries Section */}
                    <div className="flex flex-col h-full mt-10 xl:mt-0">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center">
                                <Navigation className="mr-3 h-6 w-6 text-accent-400" />
                                Your Active Missions
                            </h2>
                        </div>

                        <div className="glass-dark border border-white/5 rounded-[2rem] p-6 lg:p-8 min-h-[400px] flex flex-col">

                            <div className="space-y-4 flex-1">
                                {myDeliveries.filter(o => o.status !== 'Delivered').length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                                        <CheckCircle className="h-12 w-12 text-slate-600 mb-4" />
                                        <p className="text-slate-400 font-medium">All tasks completed. Great job!</p>
                                    </div>
                                ) : (
                                    myDeliveries.filter(o => o.status !== 'Delivered').map((order) => (
                                        <div key={order._id} className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">

                                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl opacity-50" />

                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className="relative flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500"></span>
                                                        </span>
                                                        <span className="text-xs font-bold tracking-widest text-accent-400 uppercase">In Transit</span>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-white mb-1">
                                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </h3>
                                                    <p className="text-slate-400 text-sm font-medium mb-4">
                                                        Deliver to: <span className="text-white bg-white/5 px-2 py-0.5 rounded ml-1">{order.deliveryLocation}</span>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleComplete(order._id)}
                                                    className="w-full sm:w-auto bg-slate-900 border border-emerald-500/30 hover:bg-emerald-500 hover:border-emerald-500 text-emerald-400 hover:text-slate-900 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg flex items-center justify-center group-hover:shadow-emerald-500/20"
                                                >
                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                    Mark Done
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Completed Today</h3>
                                <div className="space-y-3">
                                    {myDeliveries.filter(o => o.status === 'Delivered').length === 0 ? (
                                        <p className="text-sm text-slate-600 font-medium">No deliveries completed yet.</p>
                                    ) : (
                                        myDeliveries.filter(o => o.status === 'Delivered').slice(0, 5).map(order => (
                                            <div key={order._id} className="flex justify-between items-center text-sm py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center text-slate-300 font-medium truncate pr-4">
                                                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
                                                    <span className="truncate">{order.items[0]?.name}</span>
                                                    {order.items.length > 1 && <span className="text-slate-500 ml-1">+{order.items.length - 1} more</span>}
                                                </div>
                                                <span className="font-bold text-emerald-400 flex-shrink-0">+${order.deliveryFee.toFixed(2)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RunnerDashboard;
