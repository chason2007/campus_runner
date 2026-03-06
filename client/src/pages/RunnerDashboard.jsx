import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { PackageOpen, MapPin, DollarSign, CheckCircle, Navigation, LogOut, Wallet, Compass, Zap, Target } from 'lucide-react';

const RunnerDashboard = () => {
    const { user, logout } = useAuth();
    const { onEvent } = useSocket();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);

    useEffect(() => {
        fetchAvailableOrders();
        fetchMyDeliveries();
    }, []);

    onEvent('new_order', () => {
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
        <div className="min-h-screen bg-apple-50 pb-12 font-sans selection:bg-apple-blue selection:text-white">

            {/* Apple-style sticky nav */}
            <nav className="macos-glass sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-[8px] bg-apple-600 flex items-center justify-center shadow-sm">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-display font-semibold text-lg text-apple-600 tracking-tight">CampusRunner<span className="text-apple-blue font-bold">.Pro</span></span>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center bg-apple-100 px-3 py-1.5 rounded-full">
                        <Wallet className="h-4 w-4 text-apple-500 mr-2" />
                        <span className="font-semibold text-apple-600">${user?.balance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <button onClick={handleLogout} className="text-apple-400 hover:text-apple-600 transition-colors">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-10 text-center sm:text-left animate-slide-up">
                    <h1 className="text-4xl md:text-5xl font-display font-semibold text-apple-600 tracking-tight mb-2">Fleet</h1>
                    <p className="text-xl text-apple-400 font-medium">Accept campus deliveries and earn on your schedule.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Available Orders Section */}
                    <div className="flex flex-col h-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-2xl font-display font-semibold text-apple-600 tracking-tight">
                                Available Requests
                            </h2>
                            <span className="bg-apple-blue/10 text-apple-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {availableOrders.length} New
                            </span>
                        </div>

                        <div className="space-y-4">
                            {availableOrders.length === 0 ? (
                                <div className="macos-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                                    <Compass className="h-12 w-12 text-apple-200 mb-4" />
                                    <h3 className="text-xl font-display font-medium text-apple-500 tracking-tight mb-2">No active requests</h3>
                                    <p className="text-apple-400 max-w-sm text-sm">We'll notify you when someone nearby places an order.</p>
                                </div>
                            ) : (
                                availableOrders.map((order) => (
                                    <div key={order._id} className="macos-card p-6 flex flex-col sm:flex-row sm:items-center justify-between">

                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className="bg-apple-100 text-apple-500 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide">
                                                    {order.category}
                                                </span>
                                                <span className="text-[13px] font-medium text-apple-400">
                                                    From <span className="font-semibold text-apple-500">{order.buyerId.name}</span>
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-display font-semibold text-apple-600 mb-4 tracking-tight">
                                                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </h3>

                                            <div className="space-y-2">
                                                <div className="flex items-center text-[14px] font-medium text-apple-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-apple-blue mr-3" />
                                                    {order.pickupLocation}
                                                </div>
                                                <div className="flex items-center text-[14px] font-medium text-apple-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-apple-orange mr-3" />
                                                    {order.deliveryLocation}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 sm:mt-0 flex sm:flex-col items-center justify-between sm:border-l border-apple-100 pt-4 sm:pt-0 sm:pl-6 sm:w-36 flex-shrink-0">
                                            <div className="text-left sm:text-center w-full mb-0 sm:mb-4">
                                                <p className="text-[12px] font-medium text-apple-400 mb-1">Earn</p>
                                                <p className="text-3xl font-display font-semibold text-apple-600 tracking-tight">
                                                    ${order.deliveryFee.toFixed(2)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAccept(order._id)}
                                                className="macos-btn-primary w-auto sm:w-full text-sm font-semibold py-2.5 px-4"
                                            >
                                                Accept
                                            </button>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active Deliveries Section */}
                    <div className="flex flex-col h-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-4 px-2 mt-8 xl:mt-0">
                            <h2 className="text-2xl font-display font-semibold text-apple-600 tracking-tight">
                                Active Deliveries
                            </h2>
                        </div>

                        <div className="macos-card p-6 lg:p-8 min-h-[400px] flex flex-col">

                            <div className="space-y-4 flex-1">
                                {myDeliveries.filter(o => o.status !== 'Delivered').length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center py-10">
                                        <CheckCircle className="h-12 w-12 text-apple-200 mb-4" />
                                        <h3 className="text-xl font-display font-medium text-apple-500 tracking-tight">All caught up</h3>
                                    </div>
                                ) : (
                                    myDeliveries.filter(o => o.status !== 'Delivered').map((order) => (
                                        <div key={order._id} className="bg-apple-50 border border-apple-100 rounded-2xl p-6 relative">

                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-blue opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-apple-blue"></span>
                                                        </span>
                                                        <span className="text-[11px] font-bold tracking-wide text-apple-blue uppercase">In Progress</span>
                                                    </div>

                                                    <h3 className="text-lg font-display font-semibold text-apple-600 mb-1 tracking-tight">
                                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </h3>
                                                    <p className="text-apple-500 text-sm font-medium">
                                                        Drop off at: <span className="font-semibold text-apple-600">{order.deliveryLocation}</span>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleComplete(order._id)}
                                                    className="w-full sm:w-auto bg-apple-green hover:bg-[#2fae4e] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center justify-center active:scale-[0.98] shadow-sm"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                                    Delivered
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-apple-200/60">
                                <h3 className="text-[12px] font-bold uppercase tracking-wide text-apple-400 mb-4">Completed Today</h3>
                                <div className="space-y-2">
                                    {myDeliveries.filter(o => o.status === 'Delivered').length === 0 ? (
                                        <p className="text-sm text-apple-400 font-medium">No deliveries logged today.</p>
                                    ) : (
                                        myDeliveries.filter(o => o.status === 'Delivered').slice(0, 4).map(order => (
                                            <div key={order._id} className="flex justify-between items-center text-sm py-2 px-3 rounded-lg hover:bg-apple-50 transition-colors">
                                                <div className="flex items-center text-apple-500 font-medium truncate pr-4 text-[13px]">
                                                    <span className="truncate">{order.items[0]?.name}</span>
                                                    {order.items.length > 1 && <span className="text-apple-400 ml-1">+{order.items.length - 1}</span>}
                                                </div>
                                                <span className="font-semibold text-apple-600 flex-shrink-0 text-[13px]">+${order.deliveryFee.toFixed(2)}</span>
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
