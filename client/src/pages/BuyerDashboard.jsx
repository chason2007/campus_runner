import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { PlusCircle, Package, MapPin, DollarSign, UploadCloud, LogOut, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const BuyerDashboard = () => {
    const { user, logout } = useAuth();
    const { onEvent } = useSocket();
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        item: '', qty: 1, category: 'Food', pickupLocation: '', deliveryLocation: '', deliveryFee: ''
    });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    onEvent('order_update', () => {
        fetchMyOrders();
    });

    const fetchMyOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/my-orders');
            setOrders(res.data.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (formData.category === 'Printout' && !file) {
                alert('Please attach a file for printouts.');
                setIsSubmitting(false);
                return;
            }

            await axios.post('http://localhost:5000/api/orders', {
                items: [{ name: formData.item, qty: formData.qty }],
                category: formData.category,
                pickupLocation: formData.pickupLocation,
                deliveryLocation: formData.deliveryLocation,
                deliveryFee: Number(formData.deliveryFee)
            });
            setFormData({ item: '', qty: 1, category: 'Food', pickupLocation: '', deliveryLocation: '', deliveryFee: '' });
            setFile(null);
            fetchMyOrders();
        } catch (err) {
            console.error(err);
            alert('Error creating order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-apple-orange bg-apple-orange/10';
            case 'Accepted': return 'text-apple-blue bg-apple-blue/10';
            case 'Delivered': return 'text-apple-green bg-apple-green/10';
            default: return 'text-apple-500 bg-apple-100';
        }
    };

    return (
        <div className="min-h-screen bg-apple-50 pb-12 font-sans selection:bg-apple-blue selection:text-white">

            {/* Apple-style sticky nav */}
            <nav className="macos-glass sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-[8px] bg-apple-600 flex items-center justify-center shadow-sm">
                        <Package className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-display font-semibold text-lg text-apple-600 tracking-tight">CampusRunner</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-apple-500 hidden sm:block">Hello, {user?.name.split(' ')[0]}</span>
                    <button onClick={handleLogout} className="text-apple-400 hover:text-apple-600 transition-colors p-2">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-10 text-center sm:text-left animate-slide-up">
                    <h1 className="text-4xl md:text-5xl font-display font-semibold text-apple-600 tracking-tight mb-2">Buyer</h1>
                    <p className="text-xl text-apple-400 font-medium">Order whatever you need right now.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Create Order */}
                    <div className="lg:col-span-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="macos-card p-8 sm:p-10">

                            <h2 className="text-2xl font-display font-semibold text-apple-600 mb-8 tracking-tight">
                                New Request
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-apple-600 mb-2">Category</label>
                                    <select
                                        className="macos-input appearance-none cursor-pointer"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Stationery">Stationery</option>
                                        <option value="Printout">Printout</option>
                                    </select>
                                </div>

                                {formData.category === 'Printout' ? (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-semibold text-apple-600 mb-2">Upload File</label>
                                        <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'border-apple-blue bg-apple-blue/5' : 'border-apple-200 hover:bg-apple-50'}`}>
                                            <UploadCloud className={`h-8 w-8 mb-3 ${file ? 'text-apple-blue' : 'text-apple-400'}`} />
                                            <span className={`text-sm font-semibold ${file ? 'text-apple-blue' : 'text-apple-500'}`}>
                                                {file ? file.name : 'Select file'}
                                            </span>
                                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-apple-600 mb-2">Item</label>
                                            <input type="text" required className="macos-input" placeholder="e.g. Coffee" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold text-apple-600 mb-2">Qty</label>
                                            <input type="number" min="1" required className="macos-input text-center" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-apple-600 mb-2">Pickup</label>
                                    <input type="text" required className="macos-input" placeholder="Origin point" value={formData.pickupLocation} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-apple-600 mb-2">Dropoff</label>
                                    <input type="text" required className="macos-input" placeholder="Destination" value={formData.deliveryLocation} onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-apple-600 mb-2">Fee</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-apple-400" />
                                        </div>
                                        <input type="number" step="0.5" min="1" required className="macos-input pl-11 text-lg font-semibold" placeholder="5.00" value={formData.deliveryFee} onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })} />
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full macos-btn-primary py-4 mt-2 flex items-center justify-center group">
                                    <span>{isSubmitting ? 'Posting...' : 'Place Order'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Active Orders */}
                    <div className="lg:col-span-7 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>

                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-2xl font-display font-semibold text-apple-600 tracking-tight">
                                History
                            </h2>
                            <span className="text-sm font-medium text-apple-400">
                                {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                            </span>
                        </div>

                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="macos-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <Clock className="h-16 w-16 text-apple-200 mb-6" />
                                    <h3 className="text-2xl font-display font-medium text-apple-500 tracking-tight mb-2">No active orders</h3>
                                    <p className="text-apple-400 max-w-sm">When you place orders, they will appear here in real time.</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order._id} className="macos-card p-6 flex flex-col sm:flex-row sm:items-center justify-between">

                                        <div className="flex-1 pr-6">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-[13px] font-semibold text-apple-400">{order.category}</span>
                                            </div>

                                            <h3 className="text-xl font-display font-semibold text-apple-600 mb-4 tracking-tight">
                                                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </h3>

                                            <div className="flex flex-col sm:flex-row sm:items-center text-[15px] font-medium text-apple-500 space-y-2 sm:space-y-0 sm:space-x-6">
                                                <div>
                                                    <span className="text-apple-400 text-sm mr-2">From:</span>
                                                    {order.pickupLocation}
                                                </div>
                                                <div className="hidden sm:block text-apple-300">&rarr;</div>
                                                <div>
                                                    <span className="text-apple-400 text-sm mr-2">To:</span>
                                                    {order.deliveryLocation}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between sm:border-l border-apple-100 pt-4 sm:pt-0 sm:pl-8">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[13px] font-medium text-apple-400 mb-1">Fee</p>
                                                <p className="text-2xl font-display font-semibold text-apple-600 tracking-tight">
                                                    ${order.deliveryFee.toFixed(2)}
                                                </p>
                                            </div>

                                            {order.runnerId && (
                                                <div className="text-right mt-0 sm:mt-4">
                                                    <p className="text-[13px] font-medium text-apple-400 mb-1">Runner</p>
                                                    <p className="text-[15px] font-semibold text-apple-600">{order.runnerId.name}</p>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
