import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { RefreshCw, Send, Check, FileText, Package } from 'lucide-react';

const RunnerDashboard = () => {
    const { user, refreshUser } = useAuth();
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
            const res = await axios.get('http://localhost:5000/api/orders/my-deliveries');
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
            refreshUser();
        } catch (err) {
            console.error(err);
            alert('Error completing order.');
        }
    };

    return (
        <div className="animate-fade-in w-full">

            <div className="layout-container py-8">

                {/* Metrics Header */}
                <div className="mb-8 border-b border-slate-200 pb-5 sm:flex sm:items-center sm:justify-between">
                    <h3 className="text-2xl font-semibold leading-6 text-slate-900">Queue Overview</h3>
                    <div className="mt-3 sm:ml-4 sm:mt-0">
                        <button onClick={fetchAvailableOrders} className="saas-button-secondary">
                            <RefreshCw className="mr-2 h-4 w-4 text-slate-400" />
                            Refresh Queue
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Available Orders Section */}
                    <div className="flex flex-col h-full">
                        <div className="saas-card overflow-hidden h-full flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                                <h3 className="text-sm font-semibold text-slate-800">Available Requests</h3>
                                <span className="saas-badge bg-blue-100 text-blue-800 border border-blue-200">
                                    {availableOrders.length} Pending
                                </span>
                            </div>

                            <ul role="list" className="divide-y divide-slate-100 bg-white flex-1 overflow-y-auto">
                                {availableOrders.length === 0 ? (
                                    <li className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                                            <Send className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-900">Queue is empty</h3>
                                        <p className="mt-1 text-sm text-slate-500">Waiting for new requests from the network.</p>
                                    </li>
                                ) : (
                                    availableOrders.map((order) => (
                                        <li key={order._id} className="saas-list-item flex flex-col sm:flex-row sm:items-center justify-between">

                                            <div className="flex-1">
                                                <div className="flex items-center mb-1 outline-none">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </p>
                                                    <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        {order.category}
                                                    </span>
                                                    {order.fileUrl && (
                                                        <a
                                                            href={`http://localhost:5000${order.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-xs text-brand-600 hover:text-brand-500 underline flex items-center"
                                                        >
                                                            <Package className="h-3 w-3 mr-1" />
                                                            View PDF
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                                                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                                                        <span className="font-medium text-slate-400 mr-1.5">Origin:</span>
                                                        {order.pickupLocation}
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                                                        <span className="font-medium text-slate-400 mr-1.5">Target:</span>
                                                        {order.deliveryLocation}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-400">
                                                    Requester: {order.buyerId.name}
                                                </div>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center sm:flex-col sm:items-end flex-shrink-0">
                                                <div className="text-lg font-semibold text-slate-900 sm:mb-2 mr-4 sm:mr-0">
                                                    ${order.deliveryFee.toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={() => handleAccept(order._id)}
                                                    className="saas-button"
                                                >
                                                    Accept Task
                                                </button>
                                            </div>

                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Active Deliveries Section */}
                    <div className="flex flex-col h-full">
                        <div className="saas-card overflow-hidden h-full flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                                <h3 className="text-sm font-semibold text-slate-800">Active Workload</h3>
                            </div>

                            <ul role="list" className="divide-y divide-slate-100 bg-white flex-1 overflow-y-auto">
                                {myDeliveries.filter(o => o.status !== 'Delivered').length === 0 ? (
                                    <li className="p-12 text-center text-slate-500 text-sm flex items-center justify-center flex-col">
                                        <Check className="h-8 w-8 text-slate-300 mb-3" />
                                        All tasks completed.
                                    </li>
                                ) : (
                                    myDeliveries.filter(o => o.status !== 'Delivered').map((order) => (
                                        <li key={order._id} className="p-5 flex flex-col justify-between border-l-4 border-l-brand-500 hover:bg-slate-50 transition-colors">

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 mb-1">
                                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </p>
                                                    <p className="text-sm text-slate-600 flex items-center mb-1">
                                                        <span className="font-medium text-slate-400 mr-2">Deliver to:</span>
                                                        {order.deliveryLocation}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1 flex items-center">
                                                        Pickup from: {order.pickupLocation}
                                                        {order.fileUrl && (
                                                            <a
                                                                href={`http://localhost:5000${order.fileUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-3 text-brand-600 hover:text-brand-500 underline flex items-center"
                                                            >
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                View PDF
                                                            </a>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-semibold text-brand-600">
                                                    In Progress
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <button
                                                    onClick={() => handleComplete(order._id)}
                                                    className="w-full saas-button bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                                                >
                                                    Mark as Delivered
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                )}

                                {/* Completed Logistics */}
                                {myDeliveries.filter(o => o.status === 'Delivered').length > 0 && (
                                    <li className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recently Delivered Logs</h4>
                                        <div className="space-y-2">
                                            {myDeliveries.filter(o => o.status === 'Delivered').slice(0, 4).map(order => (
                                                <div key={order._id} className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 truncate mr-4">
                                                        {order.items[0]?.name} {order.items.length > 1 && `+${order.items.length - 1}`}
                                                    </span>
                                                    <span className="font-medium text-slate-900">+${order.deliveryFee.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunnerDashboard;
