import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import {
    Package,
    ShoppingCart,
    Plus,
    Search,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Circle,
    Timer,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BuyerDashboard = () => {
    const { user, refreshUser } = useAuth();
    const { onEvent } = useSocket();
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        item: '', qty: 1, category: 'Food', pickupLocation: '', deliveryLocation: '', deliveryFee: ''
    });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const quickTags = [
        { icon: '☕', label: 'Coffee' },
        { icon: '📝', label: 'Printouts', category: 'Printout' },
        { icon: '🍟', label: 'Snacks' },
        { icon: '📚', label: 'Stationery' },
        { icon: '🍔', label: 'Burger' },
        { icon: '💊', label: 'Pharmacy', category: 'Pharmacy' }
    ];

    useEffect(() => {
        fetchMyOrders();
    }, []);

    onEvent('order_update', () => {
        fetchMyOrders();
        refreshUser();
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchMyOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/orders/my-requests`);
            setOrders(res.data.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('items', JSON.stringify([{
                name: formData.category === 'Printout' ? `Printout: ${file?.name || 'Doc'}` : formData.item,
                qty: formData.qty
            }]));
            submitData.append('category', formData.category);
            submitData.append('pickupLocation', formData.pickupLocation);
            submitData.append('deliveryLocation', formData.deliveryLocation);
            submitData.append('deliveryFee', formData.deliveryFee);
            if (file) submitData.append('file', file);

            await axios.post(`${API_URL}/api/orders`, submitData);
            toast.success('Logistics request beamed to network!');
            setShowModal(false);
            setFormData({ item: '', qty: 1, category: 'Food', pickupLocation: '', deliveryLocation: '', deliveryFee: '' });
            setFile(null);
            fetchMyOrders();
            refreshUser();
        } catch (err) {
            toast.error('Transmission failed. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getProgress = (status) => {
        if (status === 'Pending') return 33;
        if (status === 'Accepted') return 66;
        if (status === 'Delivered') return 100;
        return 0;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
            {/* 1. Header Area - Bento Style */}
            <div className="mb-10 bento-grid">
                <div className="lg:col-span-8 bento-card flex flex-col justify-center">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-black tracking-tighter"
                    >
                        Hey <span className="text-brand-accent">{user?.name.split(' ')[0]}</span>,<br />
                        what do you need?
                    </motion.h1>
                </div>
                <div className="lg:col-span-4 bento-card bg-brand-primary/20 border-brand-primary/30 flex items-center justify-between group cursor-pointer overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-accent mb-2">Network Status</p>
                        <h3 className="text-2xl font-bold">12 Runners <span className="text-brand-accent">Live</span></h3>
                    </div>
                    <div className="pulse-dot absolute top-6 right-6" />
                </div>
            </div>

            {/* 2. Quick Action Tags - Horizontal Scroll */}
            <div className="mb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center">
                    <Timer className="w-3.5 h-3.5 mr-2" />
                    Speed Logistics Tags
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                    {quickTags.map((tag, idx) => (
                        <motion.button
                            key={tag.label}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setFormData({ ...formData, item: tag.label, category: tag.category || 'Food' });
                                setShowModal(true);
                            }}
                            className="tag-pill"
                        >
                            <span className="mr-2">{tag.icon}</span>
                            {tag.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 3. Active Orders Section - Bento Grid Layout */}
            <div className="bento-grid">
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center mb-2">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        My Active Pings
                    </h3>

                    <AnimatePresence mode="popLayout">
                        {orders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bento-card border-dashed py-20 flex flex-col items-center justify-center text-slate-500"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <Circle className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-bold italic">Everything is quiet on campus</p>
                            </motion.div>
                        ) : (
                            orders.map((order) => (
                                <motion.div
                                    key={order._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bento-card group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded border border-brand-accent/20">
                                                    {order.category}
                                                </span>
                                                {order.runnerId && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 text-white/60 rounded flex items-center">
                                                        <CheckCircle2 className="w-2.5 h-2.5 mr-1.5 text-brand-accent" />
                                                        {order.runnerId.name}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-xl font-bold truncate">
                                                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black">${order.deliveryFee.toFixed(2)}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">Tip</p>
                                        </div>
                                    </div>

                                    {/* Progress Tracker */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                            <span className={order.status === 'Pending' ? 'text-brand-accent' : ''}>Created</span>
                                            <span className={order.status === 'Accepted' ? 'text-brand-accent' : ''}>Transit</span>
                                            <span className={order.status === 'Delivered' ? 'text-brand-accent' : ''}>Ghosted</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <motion.div
                                                className="progress-bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${getProgress(order.status)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between text-xs text-slate-400 font-bold italic">
                                        <div className="flex items-center">
                                            <MapPin className="w-3.5 h-3.5 mr-1 text-brand-accent" />
                                            {order.deliveryLocation}
                                        </div>
                                        <span>Live Tracking →</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column Bento: Network Feed Stats or Promotions */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bento-card bg-brand-accent/5 border-brand-accent/10 group cursor-pointer overflow-hidden">
                        <div className="aspect-video mb-6 bg-brand-dark/40 rounded-2xl flex items-center justify-center p-8 relative">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                            >
                                <ShoppingCart className="w-16 h-16 text-brand-accent opacity-50" />
                            </motion.div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Campus Analytics</h3>
                        <p className="text-sm text-slate-400 mb-6">Your logistics speed is 15% faster than average today.</p>
                        <button className="text-brand-accent text-xs font-black uppercase tracking-widest flex items-center">
                            View Report <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. FAB - Create New Request */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowModal(true)}
                className="fixed bottom-32 md:bottom-12 right-8 w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center shadow-lime-glow z-40"
            >
                <Plus className="w-8 h-8 text-brand-dark stroke-[3px]" />
            </motion.button>

            {/* Request Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-brand-surface w-full max-w-lg rounded-squircle p-10 border border-white/10 relative z-10"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase">New Request</h2>

                            <form onSubmit={handleCreateOrder} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">What's the mission?</label>
                                    <input
                                        type="text"
                                        placeholder="Order Details..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/5 transition-all outline-none"
                                        value={formData.item}
                                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Pickup Hub"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-accent"
                                        value={formData.pickupLocation}
                                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Drop Target"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-accent"
                                        value={formData.deliveryLocation}
                                        onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Bounty Tip ($)</label>
                                    <input
                                        type="number"
                                        placeholder="5.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-accent"
                                        value={formData.deliveryFee}
                                        onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full btn-squircle"
                                >
                                    {isSubmitting ? 'Beaming...' : 'Deploy Request'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuyerDashboard;
