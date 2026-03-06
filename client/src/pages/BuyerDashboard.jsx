import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { PlusCircle, Package, MapPin, DollarSign, UploadCloud, LogOut } from 'lucide-react';

const BuyerDashboard = () => {
    const { user, logout } = useAuth();
    const { onEvent } = useSocket();
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        item: '', qty: 1, category: 'Food', pickupLocation: '', deliveryLocation: '', deliveryFee: ''
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    // Listen for socket events
    onEvent('order_update', (data) => {
        alert(`Real-Time Update: ${data.message}`);
        fetchMyOrders(); // Refresh orders to show new status
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
        try {
            // Simulate file upload logic here if category is Printout
            if (formData.category === 'Printout' && !file) {
                alert('Please attach a file for printouts.');
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
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user?.name}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Order Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <PlusCircle className="mr-2 h-5 w-5 text-indigo-500" />
                            New Delivery Request
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Food</option>
                                    <option>Stationery</option>
                                    <option>Printout</option>
                                </select>
                            </div>

                            {formData.category === 'Printout' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                                    <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <UploadCloud className="h-6 w-6 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600">{file ? file.name : 'Select file to print'}</span>
                                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                    </label>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Item</label>
                                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700">Qty</label>
                                        <input type="number" min="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" required className="block w-full pl-9 rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g. Student Union" value={formData.pickupLocation} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Delivery Location</label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" required className="block w-full pl-9 rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g. Dorm Room 302" value={formData.deliveryLocation} onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Delivery Fee ($)</label>
                                <div className="relative mt-1">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="number" step="0.5" required className="block w-full pl-9 rounded-md border-gray-300 shadow-sm p-2 border" placeholder="3.50" value={formData.deliveryFee} onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                Post Request
                            </button>
                        </form>
                    </div>
                </div>

                {/* Current Orders List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <Package className="mr-2 h-5 w-5 text-indigo-500" />
                            Your Active Orders
                        </h2>

                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>No active orders found.</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order._id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-gray-50/50">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-sm font-medium text-gray-500">{order.category}</span>
                                            </div>
                                            <h3 className="mt-2 font-semibold text-gray-900">
                                                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" /> {order.pickupLocation} &rarr; {order.deliveryLocation}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-indigo-600">${order.deliveryFee.toFixed(2)}</p>
                                            {order.runnerId && <p className="text-xs text-gray-500 mt-1">Runner: {order.runnerId.name}</p>}
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
