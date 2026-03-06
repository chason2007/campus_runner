import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { PackageOpen, MapPin, DollarSign, CheckCircle, Navigation, LogOut } from 'lucide-react';

const RunnerDashboard = () => {
    const { user, logout } = useAuth();
    const { onEvent } = useSocket();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);

    useEffect(() => {
        fetchAvailableOrders();
        fetchMyDeliveries();
    }, []);

    // Listen for socket events
    onEvent('new_order', (newOrder) => {
        alert(`New Order Available: ${newOrder.category} for $${newOrder.deliveryFee}`);
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
            // Optionally update balance via context if user context tracks it
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Runner Dashboard</h1>
                    <p className="text-gray-500">Earn money by delivering on campus, {user?.name}</p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 flex flex-col items-center">
                        <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Your Balance</span>
                        <span className="text-xl font-bold text-indigo-700">${user?.balance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
                        <LogOut className="h-5 w-5 mr-1" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Available Orders Section */}
                <div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                            <PackageOpen className="mr-2 h-5 w-5 text-indigo-500" />
                            Available Campus Orders
                        </h2>

                        <div className="space-y-4">
                            {availableOrders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <PackageOpen className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                    <p>No orders available to claim right now.</p>
                                </div>
                            ) : (
                                availableOrders.map((order) => (
                                    <div key={order._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all bg-white relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{order.category}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                    <span className="text-xs text-gray-500">Ordered by <span className="font-medium">{order.buyerId.name}</span></span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                    {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                </h3>
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1.5 text-red-400" />
                                                        <span className="font-medium text-gray-800">Pickup:</span> &nbsp;{order.pickupLocation}
                                                    </p>
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <Navigation className="h-4 w-4 mr-1.5 text-blue-400" />
                                                        <span className="font-medium text-gray-800">Dropoff:</span> &nbsp;{order.deliveryLocation}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md mb-4 border border-green-100 flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-0.5" />
                                                    <span className="text-lg font-bold">{order.deliveryFee.toFixed(2)}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAccept(order._id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                >
                                                    Claim Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* My Deliveries Section */}
                <div>
                    <div className="bg-gray-900 rounded-2xl shadow-xl p-6 min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                            <Navigation className="mr-2 h-5 w-5 text-indigo-400" />
                            Your Active Deliveries
                        </h2>

                        <div className="space-y-4">
                            {myDeliveries.filter(o => o.status !== 'Delivered').length === 0 ? (
                                <div className="text-center py-10 text-gray-400 border border-dashed border-gray-700 rounded-xl">
                                    <CheckCircle className="h-10 w-10 mx-auto text-gray-600 mb-2" />
                                    <p>You have no active deliveries.</p>
                                </div>
                            ) : (
                                myDeliveries.filter(o => o.status !== 'Delivered').map((order) => (
                                    <div key={order._id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-medium tracking-wide">
                                                    IN PROGRESS
                                                </span>
                                                <h3 className="mt-2 text-lg font-bold text-white">
                                                    {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-2">
                                                    Deliver to: <span className="text-white font-medium">{order.deliveryLocation}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleComplete(order._id)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-lg shadow-green-500/30"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                                Mark Delivered
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="text-lg font-medium text-gray-400 mt-10 mb-4 border-b border-gray-800 pb-2">Completed Today</h3>
                        <div className="space-y-3 opacity-70">
                            {myDeliveries.filter(o => o.status === 'Delivered').slice(0, 5).map(order => (
                                <div key={order._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-800">
                                    <div className="flex items-center text-gray-300">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                        {order.items[0]?.name}
                                    </div>
                                    <span className="text-green-400">+${order.deliveryFee.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RunnerDashboard;
