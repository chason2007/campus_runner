import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { NotificationTray } from '../components/NotificationTray';
import { Skeleton, SkeletonCircle } from '../components/Skeleton';
import { MotionButton } from '../components/MotionButton';
import { useToast } from '../context/ToastContext';
import { DashboardMobileNav } from '../components/DashboardMobileNav';
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
    const [users, setUsers] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'users' | 'vendors'>('stats');
    const [adminResponse, setAdminResponse] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [allOrders, systemStats, allUsers, allVendors] = await Promise.all([
                api.admin.getOrders(),
                api.admin.getStats(),
                api.admin.getUsers(),
                api.admin.getVendorsAdmin()
            ]);
            setOrders(Array.isArray(allOrders) ? allOrders : []);
            setStats(systemStats);
            setUsers(Array.isArray(allUsers) ? allUsers : []);
            setVendors(Array.isArray(allVendors) ? allVendors : []);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
            showToast('Failed to sync dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

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

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.admin.updateUserStatus(userId, !currentStatus);
            showToast(`User ${!currentStatus ? 'activated' : 'suspended'}`, 'info');
            fetchData();
        } catch (err) {
            showToast('Failed to update user status', 'error');
        }
    };

    const handleApproveUser = async (userId: string) => {
        try {
            await api.admin.approveUser(userId);
            showToast('User approved successfully', 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to approve user', 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('PERMANENTLY delete this user? This cannot be undone.')) return;
        try {
            await api.admin.deleteUser(userId);
            showToast('User deleted', 'success');
            fetchData();
        } catch (err) {
            showToast('Delete failed', 'error');
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
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'stats' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'stats' ? 600 : 400, display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <span>📊</span> <span className="db-sidebar-label">Analytics</span>
                    </motion.div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('orders')}
                        className={activeTab === 'orders' ? 'active' : ''}
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'orders' ? 600 : 400, display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <span>📦</span> <span className="db-sidebar-label">All Orders</span>
                    </motion.div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('users')}
                        className={activeTab === 'users' ? 'active' : ''}
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'users' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'users' ? 600 : 400, display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <span>👥</span> <span className="db-sidebar-label">Users</span>
                    </motion.div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('vendors')}
                        className={activeTab === 'vendors' ? 'active' : ''}
                        style={{ padding: '10px', cursor: 'pointer', color: activeTab === 'vendors' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'vendors' ? 600 : 400, display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <span>🏪</span> <span className="db-sidebar-label">Vendors</span>
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
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>{activeTab.toUpperCase()}</span>
                <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <NotificationTray />
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent2)', border: '1.5px solid var(--accent3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                </div>
            </header>

            <main className="db-main">
                <div className="db-content">
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

                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="db-card"
                            >
                                <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search orders..." 
                                        className="db-input" 
                                        style={{ flex: 1 }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="db-table-container">
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
                                                    .filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()))
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
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="db-card"
                            >
                                <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search users..." 
                                        className="db-input" 
                                        style={{ flex: 1 }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="db-table-container">
                                    <table className="db-order-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence mode="popLayout">
                                                {users
                                                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map(u => (
                                                        <motion.tr key={u._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                            <td>{u.name}</td>
                                                            <td>{u.email}</td>
                                                            <td><span style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                {!u.isApproved ? (
                                                                    <span className="db-status-pill db-status-progress">Pending</span>
                                                                ) : (
                                                                    <span className={`db-status-pill ${u.isActive ? 'db-status-delivered' : 'db-status-pending'}`}>
                                                                        {u.isActive ? 'Active' : 'Suspended'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    {!u.isApproved && (
                                                                        <button 
                                                                            onClick={() => handleApproveUser(u._id)}
                                                                            style={{ padding: '4px 8px', fontSize: '0.65rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                        >
                                                                            APPROVE
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                                                        style={{ padding: '4px 8px', fontSize: '0.65rem', background: u.isActive ? '#ff6666' : '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                                    >
                                                                        {u.isActive ? 'SUSPEND' : 'ACTIVATE'}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteUser(u._id)}
                                                                        style={{ padding: '4px 8px', fontSize: '0.65rem', background: 'transparent', color: '#ff6666', border: '1px solid #ff6666', borderRadius: '4px', cursor: 'pointer' }}
                                                                    >
                                                                        DELETE
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'vendors' && (
                            <motion.div
                                key="vendors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="db-card"
                            >
                                <div className="db-table-container">
                                    <table className="db-order-table">
                                        <thead>
                                            <tr>
                                                <th>Vendor</th>
                                                <th>Category</th>
                                                <th>Owner</th>
                                                <th>Location</th>
                                                <th>Account Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence mode="popLayout">
                                                {vendors.map(v => (
                                                    <motion.tr key={v._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{v.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{v.isOpen ? 'Open' : 'Closed'}</div>
                                                        </td>
                                                        <td>{v.category}</td>
                                                        <td>
                                                            <div>{v.owner?.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{v.owner?.email}</div>
                                                        </td>
                                                        <td>{v.location}</td>
                                                        <td>
                                                            <span className={`db-status-pill ${v.owner?.isActive ? 'db-status-delivered' : 'db-status-pending'}`}>
                                                                {v.owner?.isActive ? 'Active' : 'Suspended'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                onClick={() => handleToggleUserStatus(v.owner?._id, v.owner?.isActive)}
                                                                style={{ padding: '4px 8px', fontSize: '0.65rem', background: v.owner?.isActive ? '#ff6666' : '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                {v.owner?.isActive ? 'SUSPEND OWNER' : 'ACTIVATE OWNER'}
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <DashboardMobileNav 
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab as any)}
                items={[
                    { label: 'Stats', icon: '📊', tab: 'stats' },
                    { label: 'Orders', icon: '📦', tab: 'orders' },
                    { label: 'Users', icon: '👥', tab: 'users' },
                    { label: 'Vendors', icon: '🏪', tab: 'vendors' },
                    { label: 'Log Out', icon: '🚪', action: logout }
                ]}
            />
        </div>
    );
}

export default AdminDashboard;
