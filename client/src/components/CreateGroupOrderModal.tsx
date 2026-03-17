import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { MotionButton } from './MotionButton';
import { useNavigate } from 'react-router-dom';

interface Vendor {
    _id: string;
    name: string;
}

interface CreateGroupOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateGroupOrderModal({ isOpen, onClose }: CreateGroupOrderModalProps) {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorId, setVendorId] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) fetchVendors();
    }, [isOpen]);

    const fetchVendors = async () => {
        try {
            const data = await api.vendors.getAll();
            setVendors(data);
        } catch (err) {
            console.error('Failed to fetch vendors', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const group = await api.groupOrders.create(vendorId, 10); // Fixed 10 AED delivery fee for now
            showToast('Group order started!', 'success');
            navigate(`/group/${group._id}`);
            onClose();
        } catch (err: any) {
            showToast(err.message || 'Failed to start group order', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ position: 'relative', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px' }}>
                        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', margin: '0 0 24px' }}>Start Group Order</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>CHOOSE VENDOR</label>
                                <select
                                    value={vendorId}
                                    onChange={e => setVendorId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)' }}
                                    required
                                >
                                    <option value="">Select a Vendor</option>
                                    {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                </select>
                            </div>
                            <MotionButton type="submit" disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Starting...' : 'CREATE SESSION'}
                            </MotionButton>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
