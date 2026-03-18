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

interface Order {
    _id: string;
    student: { name: string; email: string };
    title: string;
    description: string;
    status: 'pending' | 'preparing' | 'accepted' | 'picked_up' | 'delivered';
    paymentInfo?: { status: 'pending' | 'paid' | 'refunded' | 'failed' };
    createdAt: string;
    totalAmount: number;
    items?: { name: string; quantity: number; price: number }[];
}

interface Vendor {
    _id: string;
    name: string;
    menu: {
        name: string;
        description: string;
        price: number;
        isAvailable: boolean;
    }[];
}

function VendorDashboard() {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

    const fetchData = useCallback(async () => {
        try {
            const [myOrders, myVendor] = await Promise.all([
                api.orders.getMine(),
                api.vendors.getMe()
            ]);
            setOrders(Array.isArray(myOrders) ? myOrders : []);
            setVendor(myVendor);
        } catch (err) {
            console.error('Failed to fetch vendor data', err);
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
            console.log('⚡️[socket]: New order for vendor', newOrder);
            showToast('New incoming order!', 'info');
            fetchData();
        });

        return () => {
            socket.off('orderUpdate');
            socket.off('newOrder');
        };
    }, [socket, fetchData, showToast]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await api.orders.updateStatus(orderId, status);
            showToast(`Order status: ${status}`, 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleToggleAvailability = async (itemName: string, isAvailable: boolean) => {
        try {
            await api.vendors.updateMenuAvailability(itemName, isAvailable);
            showToast(`${itemName} is now ${isAvailable ? 'available' : 'out of stock'}`, 'info');
            fetchData();
        } catch (err) {
            showToast('Failed to update availability', 'error');
        }
    };

    if (loading) return (
        // ... (skeleton code same as before)
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
                    <div style={{ fontSize: '.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Vendor Portal</div>
                </div>
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('orders')}
                        className={activeTab === 'orders' ? 'active' : ''}
                        style={{ padding: '10px', color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'orders' ? 600 : 400, cursor: 'pointer' }}
                    >
                        🏪 Store Front
                    </motion.div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('menu')}
                        className={activeTab === 'menu' ? 'active' : ''}
                        style={{ padding: '10px', color: activeTab === 'menu' ? 'var(--accent)' : 'var(--text2)', fontWeight: activeTab === 'menu' ? 600 : 400, cursor: 'pointer' }}
                    >
                        📋 Menu Management
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} onClick={() => window.location.href = '/profile'} style={{ padding: '10px', color: 'var(--text2)', cursor: 'pointer' }}>⚙️ Settings</motion.div>
                </nav>
                <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '10px' }}>🚪 Log Out</button>
                </div>
            </aside>

            {/* HEADER */}
            <header className="db-header">
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>{vendor?.name || 'Vendor Admin'}</span>
                <div className="db-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <NotificationTray />
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent2)', border: '1.5px solid var(--accent3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        {user?.name?.charAt(0) || 'V'}
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="db-main">
                <div className="db-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="db-welcome-banner"
                    >
                        <div style={{ fontSize: '1rem', fontFamily: 'Bebas Neue', color: 'rgba(0,212,255,.6)' }}>{activeTab === 'orders' ? 'Business Dashboard,' : 'Inventory Management,'}</div>
                        <div className="db-welcome-name">{user?.name || 'Vendor'}</div>
                    </motion.div>

                    {activeTab === 'orders' ? (
                        <>
                            <div className="db-stats-grid">
                                <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                                    <div className="db-stat-value db-stat-accent">{orders.length}</div>
                                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Total Orders</div>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                                    <div className="db-stat-value">AED {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}</div>
                                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Total Revenue</div>
                                </motion.div>
                            </div>

                            <div className="db-card" style={{ marginBottom: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem' }}>Revenue Overview</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', padding: '0 10px' }}>
                                    {[...Array(7)].map((_, i) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() - (6 - i));
                                        const dateString = date.toLocaleDateString();
                                        const dayRevenue = orders
                                            .filter(o => new Date(o.createdAt).toLocaleDateString() === dateString && o.paymentInfo?.status === 'paid')
                                            .reduce((sum, o) => sum + o.totalAmount, 0);
                                        const maxRevenue = Math.max(...[...Array(7)].map((_, j) => {
                                            const d = new Date(); d.setDate(date.getDate() - (6 - j));
                                            return orders.filter(o => new Date(o.createdAt).toLocaleDateString() === d.toLocaleDateString()).reduce((s, o) => s + o.totalAmount, 0);
                                        }), 1);
                                        const height = (dayRevenue / maxRevenue) * 100;

                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    style={{ width: '100%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', minHeight: '2px', opacity: i === 6 ? 1 : 0.6 }}
                                                />
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="db-card">
                                <div style={{ marginBottom: '20px' }}>
                                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem' }}>Incoming Orders</span>
                                </div>
                                <div className="db-table-container">
                                    <table className="db-order-table">
                                        <thead>
                                            <tr>
                                                <th>Order</th>
                                                <th>Details</th>
                                                <th>Status</th>
                                                <th>Payment</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence mode="popLayout">
                                                {orders.length > 0 ? orders.map(order => (
                                                    <motion.tr
                                                        key={order._id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                    >
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{order.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{order.student?.name}</div>
                                                        </td>
                                                        <td>
                                                            {order.items?.map(i => (
                                                                <div key={i.name} style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{i.quantity}x {i.name}</div>
                                                            ))}
                                                            {!order.items?.length && <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{order.description}</div>}
                                                        </td>
                                                        <td>
                                                            <span className={`db-status-pill db-status-${order.status}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                                                color: order.paymentInfo?.status === 'paid' ? 'var(--accent)' : '#ff6b6b'
                                                            }}>
                                                                {order.paymentInfo?.status || 'pending'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {order.status === 'pending' && (
                                                                <MotionButton
                                                                    onClick={() => handleUpdateStatus(order._id, 'preparing')}
                                                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                                >
                                                                    Accept
                                                                </MotionButton>
                                                            )}
                                                            {order.status === 'preparing' && (
                                                                <span style={{ color: 'var(--text3)', fontSize: '0.8rem italic' }}>In Kitchen</span>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>No orders yet</td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="db-card">
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem' }}>Menu Items</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                                <AnimatePresence mode="popLayout">
                                    {vendor?.menu.map(item => (
                                        <motion.div
                                            key={item.name}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>AED {item.price}</div>
                                                </div>
                                                <div
                                                    onClick={() => handleToggleAvailability(item.name, !item.isAvailable)}
                                                    style={{
                                                        width: '40px', height: '22px', borderRadius: '100px',
                                                        background: item.isAvailable ? 'var(--accent)' : 'var(--bg3)',
                                                        cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                                                    }}
                                                >
                                                    <motion.div
                                                        animate={{ left: item.isAvailable ? '20px' : '2px' }}
                                                        style={{
                                                            width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                                                            position: 'absolute', top: '2px'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: item.isAvailable ? 'var(--accent)' : '#ff6b6b', fontWeight: 600 }}>
                                                {item.isAvailable ? 'ACTIVE' : 'OUT OF STOCK'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <DashboardMobileNav 
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab as 'orders' | 'menu')}
                items={[
                    { label: 'Store', icon: '🏪', tab: 'orders' },
                    { label: 'Menu', icon: '📋', tab: 'menu' },
                    { label: 'Settings', icon: '⚙️', path: '/profile' },
                    { label: 'Log Out', icon: '🚪', action: logout }
                ]}
            />
        </div>
    );
}

export default VendorDashboard;
