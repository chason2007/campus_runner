import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { MotionButton } from '../components/MotionButton';
import { Skeleton } from '../components/Skeleton';
import './Dashboard.css';

interface Participant {
    user: { _id: string; name: string };
    items: { name: string; quantity: number; price: number }[];
    paid: boolean;
    totalAmount: number;
}

interface GroupOrder {
    _id: string;
    host: { _id: string; name: string };
    vendor: { _id: string; name: string };
    participants: Participant[];
    status: 'open' | 'locked' | 'ordered' | 'delivered' | 'cancelled';
    deliveryFee: number;
    totalAmount: number;
    shareCode: string;
}

export default function GroupOrderView() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [group, setGroup] = useState<GroupOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingItem, setAddingItem] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: 0 });
    const [participantCount, setParticipantCount] = useState(0);

    const fetchGroup = useCallback(async () => {
        try {
            if (!id) return;
            const data = await api.groupOrders.getById(id);
            setGroup(data);
        } catch (err: any) {
            showToast(err.message || 'Failed to fetch group order', 'error');
            navigate('/student');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    useEffect(() => {
        fetchGroup();
    }, [fetchGroup]);

    useEffect(() => {
        if (!socket || !id) return;
        socket.emit('joinGroup', id);
        socket.on('groupUpdate', (updatedGroup: GroupOrder) => {
            if (updatedGroup._id === id) {
                setGroup(updatedGroup);
            }
        });
        return () => {
            socket.off('groupUpdate');
        };
    }, [socket, id]);

    const handleAddItem = async () => {
        if (!group || !user) return;
        try {
            const currentParticipant = group.participants.find(p => p.user._id === user.id);
            const updatedItems = [...(currentParticipant?.items || []), { ...newItem }];
            await api.groupOrders.updateItems(group._id, updatedItems);
            showToast('Item added', 'success');
            setAddingItem(false);
            setNewItem({ name: '', quantity: 1, price: 0 });
            fetchGroup();
        } catch (err: any) {
            showToast(err.message || 'Failed to add item', 'error');
        }
    };

    // FIX #8: Notify existing participants when fee split changes (new person joined)
    useEffect(() => {
        if (!group) return;
        const newCount = group.participants.length;
        if (participantCount > 0 && newCount > participantCount) {
            const newSplit = (group.deliveryFee / newCount).toFixed(2);
            showToast(`Someone joined! Delivery split is now AED ${newSplit} each.`, 'success');
        }
        setParticipantCount(newCount);
    }, [group?.participants.length]);

    // FIX #4: Pay My Share handler
    const handlePayShare = async () => {
        if (!group || !myParticipant) return;
        try {
            const shareAmount = myParticipant.totalAmount + splitFee;
            showToast(`Redirecting to payment for AED ${shareAmount.toFixed(2)}...`, 'success');
            // TODO: Integrate with Stripe checkout for individual share amount
        } catch (err: any) {
            showToast(err.message || 'Payment failed', 'error');
        }
    };

    const handleLockOrder = async () => {
        if (!group) return;
        try {
            await api.groupOrders.lock(group._id);
            showToast('Order locked! Now participants can pay.', 'success');
            fetchGroup();
        } catch (err: any) {
            showToast(err.message || 'Failed to lock order', 'error');
        }
    };

    if (loading) return <div className="db-main"><Skeleton height="400px" borderRadius="24px" /></div>;
    if (!group) return null;

    const isHost = group.host._id === user?.id;
    const myParticipant = group.participants.find(p => p.user._id === user?.id);
    const splitFee = group.deliveryFee / group.participants.length;

    return (
        <div className="db-layout">
            <main className="db-main" style={{ marginLeft: 0, width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <header className="group-order-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(2rem, 8vw, 3rem)', lineHeight: 1 }}>GROUP ORDER</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>at {group.vendor.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Share Code</div>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: 'var(--text)' }}>{group.shareCode}</div>
                    </div>
                </header>

                <div className="responsive-grid">
                    <div className="db-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>Participants</span>
                            {group.status === 'open' && (
                                <MotionButton onClick={() => setAddingItem(true)} variant="primary" style={{ padding: '6px 16px' }}>+ Add My Items</MotionButton>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {group.participants.map(p => (
                                <div key={p.user._id} className="db-subcard" style={{ borderLeft: p.paid ? '4px solid var(--green)' : '4px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ fontWeight: 700 }}>{p.user.name} {p.user._id === group.host._id && <span style={{ fontSize: '0.6rem', background: 'var(--accent)', color: '#000', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>HOST</span>}</div>
                                        <div style={{ color: 'var(--text2)', fontWeight: 600 }}>AED {(p.totalAmount + splitFee).toFixed(2)}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>
                                        {p.items.length > 0 ? p.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'No items added yet'}
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '0.7rem', color: p.paid ? 'var(--green)' : 'var(--text3)' }}>
                                        {p.paid ? '✓ Paid' : '• Waiting for payment'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="db-card" style={{ height: 'fit-content' }}>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', display: 'block', marginBottom: '20px' }}>Order Summary</span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text3)' }}>Subtotal</span>
                                <span>AED {(group.totalAmount - group.deliveryFee).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text3)' }}>Delivery Fee</span>
                                <span>AED {group.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.1rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--accent)' }}>AED {group.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {isHost && group.status === 'open' && (
                            <MotionButton onClick={handleLockOrder} style={{ width: '100%', marginTop: '24px' }}>LOCK & REQUEST PAYMENTS</MotionButton>
                        )}

                        {group.status === 'locked' && !myParticipant?.paid && (
                            <MotionButton variant="primary" onClick={handlePayShare} style={{ width: '100%', marginTop: '24px' }}>PAY MY SHARE (AED {((myParticipant?.totalAmount || 0) + splitFee).toFixed(2)})</MotionButton>
                        )}

                        <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text3)', textAlign: 'center' }}>
                            {group.status === 'open' ? 'Order is open for new participants and items.' : 'Order is locked. Waiting for all participants to pay.'}
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {addingItem && (
                    <div className="modal-overlay" style={{ display: 'flex' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-card glass">
                            <div className="modal-header">
                                <h2 style={{ fontFamily: 'Bebas Neue' }}>Add Items</h2>
                                <button onClick={() => setAddingItem(false)} className="modal-close">×</button>
                            </div>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Item Name</label>
                                    <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Chicken Burger" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (AED)</label>
                                        <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <MotionButton onClick={handleAddItem}>SAVE TO GROUP</MotionButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
