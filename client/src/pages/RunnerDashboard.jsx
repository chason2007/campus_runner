import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import {
    Activity,
    MapPin,
    Bike,
    Zap,
    CheckCircle,
    FileText,
    Navigation,
    Clock,
    DollarSign,
    Box,
    Radar,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RunnerDashboard = () => {
    const { user, refreshUser } = useAuth();
    const { onEvent } = useSocket();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);

    useEffect(() => {
        fetchAvailableOrders();
        fetchMyDeliveries();
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchAvailableOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/orders/available`);
            setAvailableOrders(res.data.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyDeliveries = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/orders/my-deliveries`);
            setMyDeliveries(res.data.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            await axios.patch(`${API_URL}/api/orders/${orderId}/accept`);
            fetchAvailableOrders();
            fetchMyDeliveries();
            refreshUser();
            toast.success('Bounty Locked. Deploying...');
        } catch (err) {
            toast.error('Sync failed. Try another bounty.');
        }
    };

    const completeOrder = async (orderId) => {
        try {
            await axios.patch(`${API_URL}/api/orders/${orderId}/complete`);
            fetchMyDeliveries();
            refreshUser();
            toast.success('Credits Transferred. Mission Complete.');
        } catch (err) {
            toast.error('Verification failed.');
        }
    };

    const activeOrders = myDeliveries.filter(o => o.status === 'Accepted');

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
            {/* 1. Header & Stats - Bento Grid */}
            <div className="bento-grid mb-10">
                <div className="lg:col-span-4 bento-card bg-brand-primary/10 border-brand-primary/30 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent mb-2">Service Status</p>
                    <h2 className="text-3xl font-black">Runner <span className="text-brand-accent">Terminal</span></h2>
                </div>

                <div className="lg:col-span-4 bento-card flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Earned</p>
                        <h3 className="text-2xl font-black font-mono text-brand-accent">${user?.earned?.toFixed(2) || '0.00'}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-brand-accent" />
                    </div>
                </div>

                <div className="lg:col-span-4 bento-card flex items-center justify-between group cursor-pointer border-brand-accent/20">
                    <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Active Bounty</p>
                        <h3 className="text-2xl font-black">{activeOrders.length} Tasks</h3>
                    </div>
                    <div className="pulse-dot" />
                </div>
            </div>

            {/* 2. Main Terminal Content */}
            <div className="bento-grid">
                {/* Left: Active Workload */}
                <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                        <Radar className="w-4 h-4 mr-2 text-brand-accent" />
                        Current Mission
                    </h3>

                    <AnimatePresence mode="popLayout">
                        {activeOrders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bento-card border-dashed py-16 flex flex-col items-center justify-center text-slate-500"
                            >
                                <Bike className="w-10 h-10 mb-4 opacity-20" />
                                <p className="font-bold italic text-sm text-center">Terminal idle.<br />Link to a network bounty to begin.</p>
                            </motion.div>
                        ) : (
                            activeOrders.map((order) => (
                                <motion.div
                                    key={order._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bento-card border-brand-accent/30 bg-brand-accent/[0.02]"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-lg font-bold leading-tight">
                                            {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                        </h4>
                                        <span className="text-xl font-black text-brand-accent">${order.deliveryFee.toFixed(2)}</span>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mr-3 mt-0.5">
                                                <MapPin className="w-3 h-3 text-brand-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Pickup</p>
                                                <p className="text-sm font-bold text-white/80">{order.pickupLocation}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mr-3 mt-0.5">
                                                <Navigation className="w-3 h-3 text-brand-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Deliver</p>
                                                <p className="text-sm font-bold text-white/80">{order.deliveryLocation}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => completeOrder(order._id)}
                                        className="w-full btn-squircle py-3 text-sm shadow-lime-glow"
                                    >
                                        Seal Mission
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Network Feed */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                            <Box className="w-4 h-4 mr-2" />
                            Live Network Feed
                        </h3>
                        <span className="text-[10px] font-black text-brand-accent px-2 py-1 bg-brand-accent/10 rounded">
                            {availableOrders.length} DISTANT PINGS
                        </span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {availableOrders.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bento-card py-24 flex flex-col items-center justify-center text-slate-600"
                                >
                                    <Radar className="w-12 h-12 mb-4 animate-pulse opacity-30" />
                                    <p className="font-bold italic">Scanning campus network...</p>
                                </motion.div>
                            ) : (
                                availableOrders.map((order, idx) => (
                                    <motion.div
                                        key={order._id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bento-card flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                                                    {order.category}
                                                </span>
                                                <p className="font-bold truncate text-white/90">
                                                    {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                <div className="flex items-center text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 mr-2 opacity-40" />
                                                    <span className="truncate">{order.pickupLocation}</span>
                                                </div>
                                                <div className="flex items-center text-slate-500">
                                                    <Navigation className="w-3.5 h-3.5 mr-2 opacity-40" />
                                                    <span className="truncate">{order.deliveryLocation}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-brand-accent">${order.deliveryFee.toFixed(2)}</p>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Bounty</p>
                                            </div>
                                            <button
                                                onClick={() => acceptOrder(order._id)}
                                                className="px-6 py-2 bg-white/5 hover:bg-brand-accent hover:text-brand-dark rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10 hover:border-brand-accent"
                                            >
                                                Lock-in
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunnerDashboard;
