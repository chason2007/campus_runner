import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Leaderboard from '../components/Leaderboard';
import { NotificationTray } from '../components/NotificationTray';
import { Skeleton, SkeletonCircle } from '../components/Skeleton';
import { MotionButton } from '../components/MotionButton';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

interface Order {
    _id: string;
    vendor?: { name: string };
    student: { name: string; email?: string };
    title: string;
    description: string;
    type: 'food' | 'printout' | 'favour';
    status: 'pending' | 'preparing' | 'accepted' | 'picked_up' | 'delivered';
    paymentInfo?: { status: 'pending' | 'paid' | 'refunded' | 'failed' };
    createdAt: string;
    totalAmount: number;
    items?: { name: string; quantity: number; price: number }[];
    location: string;
}

function RunnerDashboard() {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ completedDeliveries: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [available, mine, s] = await Promise.all([
                api.orders.getAvailable(),
                api.orders.getMine(),
                api.runners.getStats()
            ]);
            setAvailableOrders(available.filter((o: any) => o.paymentInfo?.status === 'paid' || o.type !== 'food'));
            setMyOrders(mine);
            setStats(s);
        } catch (err) {
            console.error('Failed to fetch runner data', err);
            if ((err as Error).message.includes('Unauthorized') || (err as Error).message.includes('token')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    useEffect(() => {
        if (!socket) return;

        socket.on('orderUpdate', (updatedOrder: any) => {
            console.log('⚡️[socket]: Order updated', updatedOrder);
            fetchData();
        });

        socket.on('newOrder', (newOrder: any) => {
            console.log('⚡️[socket]: New order available', newOrder);
            showToast('New order available!', 'info');
            fetchData();
        });

        return () => {
            socket.off('orderUpdate');
            socket.off('newOrder');
        };
    }, [socket, fetchData, showToast]);

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await api.orders.updateStatus(orderId, 'accepted');
            showToast('Order accepted!', 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to accept order', 'error');
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await api.orders.updateStatus(orderId, status);
            showToast(`Status updated to ${status}`, 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    if (loading) return (
        <div className="db-layout">
            <aside className="db-sidebar">
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <Skeleton width="120px" height="24px" />
                </div>
                <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Skeleton height="32px" borderRadius="8px" />
                    <Skeleton height="32px" borderRadius="8px" />
                    <Skeleton height="32px" borderRadius="8px" />
                </div>
            </aside>
            <main className="db-main">
                <header className="db-header">
                    <Skeleton width="150px" height="24px" />
                    <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <SkeletonCircle width="24px" height="24px" />
                        <SkeletonCircle width="36px" height="36px" />
                    </div>
                </header>
                <div style={{ padding: '24px' }}>
                    <div className="db-stats-grid" style={{ marginBottom: '24px' }}>
                        <Skeleton height="100px" borderRadius="16px" />
                        <Skeleton height="100px" borderRadius="16px" />
                    </div>
                    <Skeleton height="400px" borderRadius="16px" />
                </div>
            </main>
        </div>
    );

    return (
        <div className="db-layout">
            {/* SIDEBAR */}
            <aside className="db-sidebar">
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--accent)' }}>CAMPUSRUNNER</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Runner Portal</div>
                </div>
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <motion.div whileHover={{ x: 4 }} className="active" style={{ padding: '10px', color: 'var(--accent)', fontWeight: 600 }}>🏃 Dashboard</motion.div>
                    <motion.div whileHover={{ x: 4 }} style={{ padding: '10px', color: 'var(--text2)', cursor: 'default' }}>📦 Active Deliveries</motion.div>
                    <motion.div whileHover={{ x: 4 }} style={{ padding: '10px', color: 'var(--text2)', cursor: 'default' }}>💰 Earnings</motion.div>
                    <motion.div whileHover={{ x: 4 }} onClick={() => window.location.href = '/profile'} style={{ padding: '10px', color: 'var(--text2)', cursor: 'pointer' }}>⚙️ Settings</motion.div>
                </nav>
                <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '10px' }}>🚪 Log Out</button>
                </div>
            </aside>

            {/* HEADER */}
            <header className="db-header">
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>Runner Dashboard</span>
                <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <NotificationTray />
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent2)', border: '1.5px solid var(--accent3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        {user?.name?.charAt(0) || 'R'}
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="db-main">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="db-welcome-banner"
                >
                    <div style={{ fontSize: '1rem', fontFamily: 'Bebas Neue', color: 'rgba(0,212,255,.6)' }}>On Duty,</div>
                    <div className="db-welcome-name">Runner {user?.name || ''}</div>
                </motion.div>

                <div className="db-stats-grid">
                    <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                        <div className="db-stat-value db-stat-accent">{availableOrders.length}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Available Tasks</div>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                        <div className="db-stat-value">{stats.completedDeliveries}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Total Deliveries</div>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                        <div className="db-stat-value">AED {stats.totalEarnings.toFixed(2)}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Total Earnings</div>
                    </motion.div>
                </div>

                <div className="db-card" style={{ marginTop: '24px' }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem', display: 'block', marginBottom: '16px' }}>Available Tasks</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        <AnimatePresence mode="popLayout">
                            {availableOrders.length > 0 ? availableOrders.map(order => (
                                <motion.div
                                    key={order._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="db-subcard"
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{order.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '12px' }}>{order.vendor?.name || 'Pick up'} → {order.location}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: 'var(--accent)', fontWeight: 700 }}>AED {order.totalAmount}</div>
                                        <MotionButton onClick={() => handleAcceptOrder(order._id)} style={{ padding: '6px 12px', fontSize: '0.7rem' }}>ACCEPT</MotionButton>
                                    </div>
                                </motion.div>
                            )) : (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '20px', color: 'var(--text3)' }}>No available orders right now.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="db-card" style={{ marginTop: '24px' }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem', display: 'block', marginBottom: '16px' }}>My Active Deliveries</span>
                    {myOrders.filter(o => o.status !== 'delivered').length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <AnimatePresence mode="popLayout">
                                {myOrders.filter(o => o.status !== 'delivered').map(order => (
                                    <motion.div
                                        key={order._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{order.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>To: {order.student.name} ({order.location})</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {order.status === 'accepted' && (
                                                <MotionButton onClick={() => handleUpdateStatus(order._id, 'picked_up')} style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                                                    PICKED UP
                                                </MotionButton>
                                            )}
                                            {order.status === 'picked_up' && (
                                                <MotionButton
                                                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                                    style={{ padding: '6px 12px', fontSize: '0.7rem', background: 'var(--green)', color: '#fff' }}
                                                >
                                                    MARK DELIVERED
                                                </MotionButton>
                                            )}
                                            <span className={`db-status-pill db-status-${order.status}`}>{order.status}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>You don't have any active deliveries.</div>
                    )}
                </div>

                <div style={{ marginTop: '24px' }}>
                    <Leaderboard />
                </div>
            </main>
        </div>
    );
}

export default RunnerDashboard;
