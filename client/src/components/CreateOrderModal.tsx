import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { MotionButton } from './MotionButton';

interface MenuItem {
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
}

interface Vendor {
    _id: string;
    name: string;
    category: string;
    menu: MenuItem[];
}

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated: (orderId: string) => void;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: '12px',
    color: 'var(--text)',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: "'Instrument Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const lbl: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text2)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: "'Instrument Sans', sans-serif",
    marginBottom: '6px',
    display: 'block'
};

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }: CreateOrderModalProps) {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'food' | 'printout' | 'favour'>('food');
    const [vendorId, setVendorId] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ name: string; quantity: number; price: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchVendors();
        }
    }, [isOpen]);

    const fetchVendors = async () => {
        try {
            const data = await api.vendors.getAll();
            setVendors(data);
        } catch (err) {
            console.error('Failed to fetch vendors', err);
        }
    };

    const handleVendorChange = (id: string) => {
        setVendorId(id);
        const vendor = vendors.find(v => v._id === id) || null;
        setSelectedVendor(vendor);
        setSelectedItems([]);
        if (vendor) {
            setTitle(`Order from ${vendor.name}`);
        }
    };

    const toggleItem = (item: MenuItem) => {
        const exists = selectedItems.find(i => i.name === item.name);
        if (exists) {
            setSelectedItems(selectedItems.filter(i => i.name !== item.name));
        } else {
            setSelectedItems([...selectedItems, { name: item.name, quantity: 1, price: item.price }]);
        }
    };

    const updateQuantity = (name: string, delta: number) => {
        setSelectedItems(items => items.map(i =>
            i.name === name ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
        ));
    };

    const calculateTotal = () => {
        if (type === 'food') {
            return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        return parseFloat(price) || 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const orderPrice = calculateTotal();
        const deliveryFee = 5;

        try {
            const order = await api.orders.create({
                title,
                description,
                type,
                vendor: type === 'food' ? vendorId : undefined,
                items: type === 'food' ? selectedItems : [],
                location,
                price: orderPrice,
                deliveryFee,
                totalAmount: orderPrice + deliveryFee
            });

            // Trigger Stripe Checkout
            const { url } = await api.orders.createCheckoutSession(order._id);
            if (url) {
                window.location.href = url;
            } else {
                showToast('Order created successfully!', 'success');
                onOrderCreated(order._id);
                onClose();
            }

            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
            setPrice('');
            setSelectedItems([]);
        } catch (err: any) {
            showToast(err.message || 'Failed to create order', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="glass"
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            borderRadius: '24px',
                            padding: '32px',
                            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.06)',
                        }}
                    >
                        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--text)', margin: '0 0 24px' }}>Create New Order</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={lbl}>Order Type</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['food', 'printout', 'favour'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border2)',
                                                background: type === t ? 'var(--accent)' : 'var(--surface)',
                                                color: type === t ? '#000' : 'var(--text2)',
                                                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {t.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={lbl}>Title</label>
                                <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Starbucks Latte, 5 Page Printout" required />
                            </div>

                            {type === 'food' && (
                                <>
                                    <div>
                                        <label style={lbl}>Vendor</label>
                                        <select
                                            style={inputStyle}
                                            value={vendorId}
                                            onChange={e => handleVendorChange(e.target.value)}
                                            required
                                        >
                                            <option value="">Select a Vendor</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedVendor && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border2)' }}
                                        >
                                            <label style={lbl}>Menu (Select Items)</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                                {selectedVendor.menu?.filter(m => m.isAvailable).map(item => {
                                                    const selected = selectedItems.find(i => i.name === item.name);
                                                    return (
                                                        <motion.div
                                                            key={item.name}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => toggleItem(item)}
                                                            style={{
                                                                padding: '10px', borderRadius: '12px', border: '1px solid',
                                                                borderColor: selected ? 'var(--accent)' : 'var(--border2)',
                                                                background: selected ? 'rgba(0,212,255,0.05)' : 'var(--surface)',
                                                                cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--text)' }}>{item.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{item.price} AED</div>

                                                            {selected && (
                                                                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                                                    <button type="button" onClick={() => updateQuantity(item.name, -1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer' }}>-</button>
                                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selected.quantity}</span>
                                                                    <button type="button" onClick={() => updateQuantity(item.name, 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer' }}>+</button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </>
                            )}

                            <div>
                                <label style={lbl}>Description / Special Instructions</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Add details about your order..."
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={lbl}>Delivery Location</label>
                                    <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="Building/Room" required />
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label style={lbl}>{type === 'food' ? 'Total (AED)' : 'Budget (AED)'}</label>
                                    <input
                                        style={{ ...inputStyle, cursor: type === 'food' ? 'not-allowed' : 'text' }}
                                        type="number"
                                        value={type === 'food' ? calculateTotal() : price}
                                        onChange={e => setPrice(e.target.value)}
                                        disabled={type === 'food'}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <MotionButton
                                type="submit"
                                disabled={loading || (type === 'food' && selectedItems.length === 0)}
                                style={{
                                    width: '100%', padding: '16px', marginTop: '12px'
                                }}
                            >
                                {loading ? 'Redirecting to Payment...' : 'Place Order & Pay'}
                            </MotionButton>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
