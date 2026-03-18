import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import CreateOrderModal from '../components/CreateOrderModal';
import CreateGroupOrderModal from '../components/CreateGroupOrderModal';
import JoinGroupModal from '../components/JoinGroupModal';
import RatingModal from '../components/RatingModal';
import { NotificationTray } from '../components/NotificationTray';
import { Skeleton, SkeletonCircle } from '../components/Skeleton';
import { MotionButton } from '../components/MotionButton';
import { useToast } from '../context/ToastContext';
import { DashboardMobileNav } from '../components/DashboardMobileNav';
import './Dashboard.css';

interface Order {
    _id: string;
    vendor?: { name: string };
    student: { name: string };
    status: 'pending' | 'preparing' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
    paymentInfo?: { status: 'pending' | 'paid' | 'refunded' | 'failed' };
    createdAt: string;
    totalAmount: number;
    title: string;
    description: string;
    items?: { name: string; quantity: number; price: number }[];
    isRated?: boolean;
    dispute?: { isDisputed: boolean; status: string; reason: string };
}

function StudentDashboard() {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    // Rating Modal State
    const [ratingModal, setRatingModal] = useState({
        isOpen: false,
        orderId: '',
        orderTitle: ''
    });

    const fetchData = useCallback(async () => {
        try {
            const myOrders = await api.orders.getMine();
            setOrders(Array.isArray(myOrders) ? myOrders : []);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
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

        return () => {
            socket.off('orderUpdate');
        };
    }, [socket, fetchData]);

    const handlePayNow = async (orderId: string) => {
        try {
            const { url } = await api.orders.createCheckoutSession(orderId);
            if (url) window.location.href = url;
            else showToast('Failed to initiate payment', 'error');
        } catch (err) {
            showToast('Error initiating payment', 'error');
        }
    };

    const handleReportIssue = async (orderId: string, reason: string) => {
        try {
            await api.orders.reportDispute(orderId, reason);
            showToast('Issue reported successfully. Support will investigate.', 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to report issue', 'error');
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
            <header className="db-header">
                <Skeleton width="120px" height="24px" />
                <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <SkeletonCircle width="24px" height="24px" />
                    <SkeletonCircle width="36px" height="36px" />
                </div>
            </header>
            <main className="db-main">
                <div style={{ padding: '24px' }}>
                    <div className="db-stats-grid" style={{ marginBottom: '24px' }}>
                        <Skeleton height="100px" borderRadius="16px" />
                        <Skeleton height="100px" borderRadius="16px" />
                    </div>
                    <Skeleton height="300px" borderRadius="16px" />
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
                    <div style={{ fontSize: '.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Student Portal</div>
                </div>
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <motion.div whileHover={{ x: 4 }} className="active" style={{ padding: '10px', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>🏠</span> <span className="db-sidebar-label">Dashboard</span>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} style={{ padding: '10px', color: 'var(--text2)', cursor: 'default', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>🕒</span> <span className="db-sidebar-label">History</span>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} onClick={() => window.location.href = '/profile'} style={{ padding: '10px', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>⚙️</span> <span className="db-sidebar-label">Settings</span>
                    </motion.div>
                </nav>
                <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '10px' }}>🚪 Log Out</button>
                </div>
            </aside>

            {/* HEADER */}
            <header className="db-header">
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>Dashboard Home</span>
                <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <NotificationTray />
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent2)', border: '1.5px solid var(--accent3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="db-main">
                <div className="db-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="db-welcome-banner"
                    >
                        <div style={{ fontSize: '1rem', fontFamily: 'Bebas Neue', color: 'rgba(0,212,255,.6)' }}>Welcome back,</div>
                        <div className="db-welcome-name" style={{ marginBottom: '16px' }}>{user?.name || 'Student'}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <MotionButton onClick={() => setIsJoinModalOpen(true)} variant="secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Join Group</MotionButton>
                            <MotionButton onClick={() => setIsGroupModalOpen(true)} variant="secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Start Group</MotionButton>
                            <MotionButton onClick={() => setIsModalOpen(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>+ New Order</MotionButton>
                        </div>
                    </motion.div>

                    <div className="db-stats-grid">
                        <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                            <div className="db-stat-value db-stat-accent">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Active Orders</div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                            <div className="db-stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Completed Tasks</div>
                        </motion.div>
                    </div>

                    <div className="db-card" style={{ marginTop: '24px' }}>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem', display: 'block', marginBottom: '16px' }}>Live Tracking</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <AnimatePresence mode="popLayout">
                                {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(order => (
                                    <motion.div
                                        key={order._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="db-subcard"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{order.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Order ID: {order._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {order.paymentInfo?.status === 'pending' && (
                                                    <MotionButton onClick={() => handlePayNow(order._id)} variant="primary" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>PAY NOW</MotionButton>
                                                )}
                                                {order.status === 'delivered' && !order.dispute?.isDisputed && (
                                                    <MotionButton onClick={() => handleReportIssue(order._id, 'Problem with delivery')} variant="ghost" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>REPORT ISSUE</MotionButton>
                                                )}
                                                <span className={`db-status-pill db-status-${order.status}`}>{order.status}</span>
                                            </div>
                                        </div>
                                        <div className="db-progress-track">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: order.status === 'pending' ? '20%' : order.status === 'preparing' ? '40%' : order.status === 'accepted' ? '60%' : order.status === 'picked_up' ? '80%' : '100%' }}
                                                className="db-progress-bar"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>No active orders. Time for a coffee?</div>
                            )}
                        </div>
                    </div>

                    <div className="db-card" style={{ marginTop: '24px' }}>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem', display: 'block', marginBottom: '16px' }}>Recent activity</span>
                        <div className="db-table-container">
                            <table className="db-order-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Vendor</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {orders.map(order => (
                                            <motion.tr
                                                key={order._id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td>{order.title}</td>
                                                <td>{order.vendor?.name || 'Manual'}</td>
                                                <td>AED {order.totalAmount.toFixed(2)}</td>
                                                <td><span className={`db-status-pill db-status-${order.status}`}>{order.status}</span></td>
                                                <td>
                                                    {order.status === 'delivered' && !order.isRated && (
                                                        <MotionButton
                                                            onClick={() => setRatingModal({ isOpen: true, orderId: order._id, orderTitle: order.title })}
                                                            variant="secondary"
                                                            style={{ padding: '4px 10px', fontSize: '0.65rem' }}
                                                        >
                                                            RATE
                                                        </MotionButton>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <CreateOrderModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onOrderCreated={fetchData}
                    />

                    <CreateGroupOrderModal
                        isOpen={isGroupModalOpen}
                        onClose={() => setIsGroupModalOpen(false)}
                    />

                    <JoinGroupModal
                        isOpen={isJoinModalOpen}
                        onClose={() => setIsJoinModalOpen(false)}
                    />

                    <RatingModal
                        isOpen={ratingModal.isOpen}
                        onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
                        orderId={ratingModal.orderId}
                        orderTitle={ratingModal.orderTitle}
                        onRated={fetchData}
                    />
                </div>
            </main>

            <DashboardMobileNav 
                items={[
                    { label: 'Home', icon: '🏠', path: '/student' },
                    { label: 'Settings', icon: '⚙️', path: '/profile' },
                    { label: 'Log Out', icon: '🚪', action: logout }
                ]}
            />
        </div>
    );
}

export default StudentDashboard;
