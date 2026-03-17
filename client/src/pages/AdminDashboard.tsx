import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { NotificationTray } from '../components/NotificationTray';
import { Skeleton, SkeletonCircle } from '../components/Skeleton';
import { MotionButton } from '../components/MotionButton';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

interface AdminStats {
    totalOrders: number;
    totalUsers: number;
    totalVendors: number;
    totalRevenue: number;
    pendingDisputes: number;
}

function AdminDashboard() {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'disputes'>('stats');
    const [adminResponse, setAdminResponse] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [allOrders, systemStats] = await Promise.all([
                api.admin.getOrders(),
                api.admin.getStats()
            ]);
            setOrders(allOrders);
            setStats(systemStats);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!socket) return;
        socket.on('orderUpdate', fetchData);
        return () => { socket.off('orderUpdate'); };
    }, [socket, fetchData]);

    const handleRefund = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to refund this order?')) return;
        try {
            await api.admin.refundOrder(orderId, adminResponse || 'Refunded by admin');
            showToast('Order refunded successfully', 'success');
            setAdminResponse('');
            fetchData();
        } catch (err) {
            showToast('Refund failed', 'error');
        }
    };

    const handleResolve = async (orderId: string) => {
        try {
            await api.admin.resolveDispute(orderId, adminResponse || 'Resolved by admin');
            showToast('Dispute resolved', 'success');
            setAdminResponse('');
            fetchData();
        } catch (err) {
            showToast('Resolution failed', 'error');
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
                    <Skeleton width="120px" height="24px" />
                    <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <SkeletonCircle width="24px" height="24px" />
                        <SkeletonCircle width="36px" height="36px" />
                    </div>
                </header>
                <div style={{ padding: '24px' }}>
                    <div className="db-stats-grid" style={{ marginBottom: '24px' }}>
                        <Skeleton height="100px" borderRadius="16px" />
                        <Skeleton height="100px" borderRadius="16px" />
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
            <aside className="db-sidebar">
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--accent)' }}>CAMPUSRUNNER</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Admin Control</div>
                </div>
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('stats')}
                        className={activeTab === 'stats' ? 'active' : ''}
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'stats' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'stats' ? 600 : 400 }}
                    >
                        📊 Analytics
                    </motion.div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('orders')}
                        className={activeTab === 'orders' ? 'active' : ''}
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'orders' ? 600 : 400 }}
                    >
                        📦 All Orders
                    </motion.div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('disputes')}
                        className={activeTab === 'disputes' ? 'active' : ''}
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'disputes' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'disputes' ? 600 : 400 }}
                    >
                        ⚖️ Disputes {stats?.pendingDisputes ? `(${stats.pendingDisputes})` : ''}
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} onClick={() => window.location.href = '/profile'} style={{ padding: '10px', color: 'var(--text2)', cursor: 'pointer' }}>⚙️ Settings</motion.div>
                </nav>
                <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '10px' }}>🚪 Log Out</button>
                </div>
            </aside>

            <main className="db-main">
                <header className="db-header">
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>{activeTab.toUpperCase()}</span>
                    <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <NotificationTray />
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent2)', border: '1.5px solid var(--accent3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'stats' && stats && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="db-stats-grid"
                        >
                            <motion.div whileHover={{ y: -5 }} className="db-stat-card glass-card">
                                <div className="db-stat-value db-stat-accent">AED {stats.totalRevenue.toFixed(2)}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Total Platform Revenue</div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="db-stat-card glass-card">
                                <div className="db-stat-value">{stats.totalOrders}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Total Orders</div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="db-stat-card glass-card">
                                <div className="db-stat-value">{stats.totalUsers}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Registered Users</div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="db-stat-card glass-card">
                                <div className="db-stat-value" style={{ color: '#ff6b6b' }}>{stats.pendingDisputes}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Unresolved Disputes</div>
                            </motion.div>
                        </motion.div>
                    )}

                    {(activeTab === 'orders' || activeTab === 'disputes') && (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="db-card"
                        >
                            <table className="db-order-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Student</th>
                                        <th>Vendor</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Dispute</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {orders
                                            .filter(o => activeTab === 'disputes' ? o.dispute?.isDisputed && o.dispute.status === 'pending' : true)
                                            .map(order => (
                                                <motion.tr
                                                    key={order._id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td>{order.title}</td>
                                                    <td>{order.student?.name}</td>
                                                    <td>{order.vendor?.name || 'N/A'}</td>
                                                    <td><span className={`db-status-pill db-status-${order.status}`}>{order.status}</span></td>
                                                    <td>AED {order.totalAmount}</td>
                                                    <td>
                                                        {order.dispute?.isDisputed ? (
                                                            <div style={{ fontSize: '0.7rem', color: '#ff6b6b' }}>
                                                                {order.dispute.reason}
                                                                <div style={{ color: 'var(--text3)' }}>Status: {order.dispute.status}</div>
                                                            </div>
                                                        ) : 'None'}
                                                    </td>
                                                    <td>
                                                        {order.dispute?.isDisputed && order.dispute.status === 'pending' && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Admin note..."
                                                                    value={adminResponse}
                                                                    onChange={(e) => setAdminResponse(e.currentTarget.value)}
                                                                    style={{ fontSize: '0.7rem', padding: '6px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                                                                />
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <MotionButton onClick={() => handleRefund(order._id)} variant="danger" style={{ padding: '4px 8px', fontSize: '0.65rem' }}>REFUND</MotionButton>
                                                                    <MotionButton onClick={() => handleResolve(order._id)} variant="primary" style={{ padding: '4px 8px', fontSize: '0.65rem' }}>DISMISS</MotionButton>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default AdminDashboard;
