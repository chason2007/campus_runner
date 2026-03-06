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

    onEvent('order_update', (data) => {
        // We'll rely on the visual refresh. A real app might show a toast.
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

    const getStatusTheme = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative pb-12">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-brand-900 via-brand-800 to-slate-50 overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
                <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 glass-dark p-6 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="text-left">
                        <p className="text-brand-300 font-semibold tracking-wide text-sm uppercase mb-1">Buyer Portal</p>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Hello, {user?.name.split(' ')[0]}</h1>
                        <p className="text-slate-400 mt-1">Ready to grab something on campus?</p>
                    </div>

                    <button onClick={handleLogout} className="group flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all">
                        <LogOut className="h-5 w-5 mr-2 text-slate-400 group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Create Order */}
                    <div className="lg:col-span-1">
                        <div className="glass rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />

                            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 flex items-center">
                                <div className="p-2 bg-brand-100 text-brand-600 rounded-xl mr-3">
                                    <PlusCircle className="h-6 w-6" />
                                </div>
                                New Request
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Category</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Food</option>
                                        <option>Stationery</option>
                                        <option>Printout</option>
                                    </select>
                                </div>

                                {formData.category === 'Printout' ? (
                                    <div className="space-y-1 block animate-[fade-in_0.3s_ease-out]">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Document to Print</label>
                                        <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                                            <UploadCloud className={`h-8 w-8 mb-2 ${file ? 'text-brand-500' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-medium ${file ? 'text-brand-700' : 'text-slate-500'}`}>
                                                {file ? file.name : 'Click to select file'}
                                            </span>
                                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3 animate-[fade-in_0.3s_ease-out]">
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Item Name</label>
                                            <input type="text" required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" placeholder="e.g. Latte" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                                        </div>
                                        <div className="col-span-1 space-y-1">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Qty</label>
                                            <input type="number" min="1" required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-center" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Pickup Location</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        </div>
                                        <input type="text" required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium" placeholder="Campus Cafe" value={formData.pickupLocation} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Dropoff Location</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        </div>
                                        <input type="text" required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium" placeholder="Dorm 302" value={formData.deliveryLocation} onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Delivery Fee (Runner Tip)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        </div>
                                        <input type="number" step="0.5" min="1" required className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-bold text-lg text-brand-700" placeholder="5.00" value={formData.deliveryFee} onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })} />
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center group relative overflow-hidden">
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10 flex items-center">
                                        {isSubmitting ? 'Posting...' : 'Post Request'}
                                        {!isSubmitting && <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Active Orders */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-display font-bold text-slate-800 flex items-center">
                                <Package className="mr-3 h-7 w-7 text-brand-500" />
                                Your History
                            </h2>
                            <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                                {orders.length} Total
                            </span>
                        </div>

                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="glass rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                                        <Clock className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">No active orders yet</h3>
                                    <p className="text-slate-500 max-w-sm">Create your first delivery request using the form on the left. Runners on campus will be notified instantly!</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order._id} className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group">

                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusTheme(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{order.category}</span>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                                                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </h3>

                                            <div className="flex flex-col sm:flex-row sm:items-center text-sm font-medium text-slate-500 space-y-2 sm:space-y-0 sm:space-x-6">
                                                <div className="flex items-center text-slate-600">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2">A</div>
                                                    {order.pickupLocation}
                                                </div>
                                                <div className="hidden sm:block text-slate-300">&rarr;</div>
                                                <div className="flex items-center text-slate-600">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2">B</div>
                                                    {order.deliveryLocation}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 sm:mt-0 sm:ml-6 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fee</p>
                                                <p className="text-2xl font-display font-bold text-slate-900">
                                                    ${order.deliveryFee.toFixed(2)}
                                                </p>
                                            </div>

                                            {order.runnerId && (
                                                <div className="text-right sm:text-right mt-0 sm:mt-4">
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Runner</p>
                                                    <div className="flex items-center shadow-sm bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                                                        <User className="h-4 w-4 text-brand-500 mr-2" />
                                                        <span className="text-sm font-bold text-slate-700">{order.runnerId.name}</span>
                                                    </div>
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
