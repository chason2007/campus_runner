import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { MotionButton } from './MotionButton';
import { useNavigate } from 'react-router-dom';

interface JoinGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const group = await api.groupOrders.getByCode(code);
            if (group.error || group.message) throw new Error(group.message || 'Group not found');
            await api.groupOrders.join(group._id, code);
            showToast('Successfully joined group!', 'success');
            navigate(`/group/${group._id}`);
            onClose();
        } catch (err: any) {
            showToast(err.message || 'Failed to join group', 'error');
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
                        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', margin: '0 0 24px' }}>Join Group Order</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>ENTER SHARE CODE</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. ABCDEF"
                                    style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '4px' }}
                                    required
                                    maxLength={6}
                                />
                            </div>
                            <MotionButton type="submit" disabled={loading} style={{ width: '100%' }}>
                                {loading ? 'Joining...' : 'JOIN GROUP'}
                            </MotionButton>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
