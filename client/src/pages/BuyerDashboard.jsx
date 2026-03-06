import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { FileText, ShoppingBag, Send } from 'lucide-react';

const BuyerDashboard = () => {
    const { user, refreshUser } = useAuth();
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
        refreshUser();
    });

    const fetchMyOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/my-requests');
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

            const submitData = new FormData();
            submitData.append('items', JSON.stringify([{
                name: formData.category === 'Printout' ? `Printout: ${file.name}` : formData.item,
                qty: formData.qty
            }]));
            submitData.append('category', formData.category);
            submitData.append('pickupLocation', formData.pickupLocation);
            submitData.append('deliveryLocation', formData.deliveryLocation);
            submitData.append('deliveryFee', formData.deliveryFee);

            if (file) {
                submitData.append('file', file);
            }

            await axios.post('http://localhost:5000/api/orders', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData({ item: '', qty: 1, category: 'Food', pickupLocation: '', deliveryLocation: '', deliveryFee: '' });
            setFile(null);
            fetchMyOrders();
            refreshUser();
        } catch (err) {
            console.error(err);
            alert('Error creating order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="animate-fade-in w-full">

            <div className="layout-container py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Column: Create Order Panel */}
                    <div className="w-full md:w-1/3">
                        <div className="saas-card">
                            <div className="px-6 py-5 border-b border-slate-200">
                                <h3 className="text-base font-semibold text-slate-900 flex items-center">
                                    <ShoppingBag className="h-5 w-5 text-brand-600 mr-2" />
                                    New Internal Request
                                </h3>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Item Category</label>
                                        <select
                                            className="saas-input"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Food">Food / Beverage</option>
                                            <option value="Stationery">Office & Stationery</option>
                                            <option value="Printout">Document Printout</option>
                                        </select>
                                    </div>

                                    {formData.category === 'Printout' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Document Upload</label>
                                            <div className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 hover:bg-slate-50 transition-colors">
                                                <div className="text-center">
                                                    <FileText className="mx-auto h-8 w-8 text-slate-300" />
                                                    <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-brand-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 hover:text-brand-500">
                                                            <span>Upload a file</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">{file ? file.name : 'PDF, DOCX up to 10MB'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                                                <input type="text" required className="saas-input" placeholder="Macchiato" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Qty</label>
                                                <input type="number" min="1" required className="saas-input" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
                                        <input type="text" required className="saas-input" placeholder="Building Alpha" value={formData.pickupLocation} onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Destination</label>
                                        <input type="text" required className="saas-input" placeholder="Room 402" value={formData.deliveryLocation} onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Runner Compensation (USD)</label>
                                        <div className="relative mt-1 rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-slate-500 sm:text-sm">$</span>
                                            </div>
                                            <input type="number" step="0.5" min="1" required className="saas-input pl-7" placeholder="0.00" value={formData.deliveryFee} onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button type="submit" disabled={isSubmitting} className="w-full saas-button">
                                            {isSubmitting ? 'Processing...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Ledger */}
                    <div className="w-full md:w-2/3">
                        <div className="saas-card overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-200 bg-white sm:flex sm:items-center sm:justify-between">
                                <h3 className="text-base font-semibold leading-6 text-slate-900">Request Ledger</h3>
                                <div className="mt-3 sm:ml-4 sm:mt-0">
                                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                        {orders.length} Records
                                    </span>
                                </div>
                            </div>

                            <ul role="list" className="divide-y divide-slate-100 bg-white">
                                {orders.length === 0 ? (
                                    <li className="p-10 text-center text-slate-500 text-sm">
                                        No active requests found in the ledger.
                                    </li>
                                ) : (
                                    orders.map((order) => (
                                        <li key={order._id} className="saas-list-item flex items-center justify-between">

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center mb-1">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </p>
                                                    <span className={`ml-3 saas-badge border ${getStatusBadge(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                                        {order.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-slate-500 gap-4 mt-1">
                                                    <p className="flex items-center">
                                                        <span className="text-slate-400 mr-1.5 font-medium">From:</span> {order.pickupLocation}
                                                    </p>
                                                    <p className="flex items-center">
                                                        <span className="text-slate-400 mr-1.5 font-medium">To:</span> {order.deliveryLocation}
                                                    </p>
                                                </div>
                                                {order.runnerId && (
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Assigned Runner: <span className="font-medium text-slate-700">{order.runnerId.name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end flex-shrink-0 ml-6">
                                                <p className="text-sm text-slate-500 mb-1">Fee</p>
                                                <p className="text-lg font-semibold text-slate-900">
                                                    ${order.deliveryFee.toFixed(2)}
                                                </p>
                                            </div>

                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
