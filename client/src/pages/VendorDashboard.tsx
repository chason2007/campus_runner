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
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

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
            if (err instanceof Error && (err.message.includes('Unauthorized') || err.message.includes('token'))) {
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

    // Adaptive Branding Effect
    useEffect(() => {
        if (vendor) {
            // For now, we'll derive a color from the vendor name if they don't have a 'brandColor' yet
            // This ensures a "wow" effect even before database updates
            const getBrandColor = (name: string) => {
                let hash = 0;
                for (let i = 0; i < name.length; i++) {
                    hash = name.charCodeAt(i) + ((hash << 5) - hash);
                }
                const h = Math.abs(hash) % 360;
                return `hsl(${h}, 70%, 55%)`; // Saturated but legible
            };

            const color = getBrandColor(vendor.name);
            document.documentElement.style.setProperty('--accent-current', color);
            
            // Clean up: reset to default
            return () => {
                document.documentElement.style.setProperty('--accent-current', 'var(--accent)');
            };
        }
    }, [vendor]);

    useEffect(() => {
        if (!socket) return;

        socket.on('orderUpdate', (updatedOrder: Order) => {
            console.log('⚡️[socket]: Order updated', updatedOrder);
            fetchData();
        });

        socket.on('newOrder', (newOrder: Order) => {
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
            setProcessingIds(prev => new Set(prev).add(orderId));
            await api.orders.updateStatus(orderId, status);
            showToast(`Order status: ${status}`, 'success');
            fetchData();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    const handleToggleAvailability = async (itemName: string, isAvailable: boolean) => {
        try {
            setProcessingIds(prev => new Set(prev).add(itemName));
            await api.vendors.updateMenuAvailability(itemName, isAvailable);
            showToast(`${itemName} is now ${isAvailable ? 'available' : 'out of stock'}`, 'info');
            fetchData();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to update availability', 'error');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(itemName);
                return next;
            });
        }
    };

    if (loading) return (
        // ... (skeleton code same as before)
        <div className="db-layout">
            <aside className="db-sidebar">
                <div className="py-6 px-5 border-b border-[var(--border)]">
                    <Skeleton width="120px" height="24px" />
                </div>
                <div className="py-4 px-3 flex flex-col gap-3">
                    <Skeleton height="32px" borderRadius="8px" />
                    <Skeleton height="32px" borderRadius="8px" />
                    <Skeleton height="32px" borderRadius="8px" />
                </div>
            </aside>
            <header className="db-header">
                <Skeleton width="120px" height="24px" />
                <div className="flex items-center gap-4">
                    <SkeletonCircle width="24px" height="24px" />
                    <SkeletonCircle width="36px" height="36px" />
                </div>
            </header>
            <main className="db-main">
                <div className="p-6">
                    <div className="db-stats-grid mb-6">
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
                <div className="py-6 px-5 border-b border-[var(--border)]">
                    <div className="font-[Bebas_Neue] text-2xl text-[var(--accent)]">CAMPUSRUNNER</div>
                    <div className="text-[0.65rem] text-[var(--text3)] uppercase">Vendor Portal</div>
                </div>
                <nav className="flex-1 py-4 px-3">
                    <motion.button
                        type="button"
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('orders')}
                        className={`w-full bg-transparent border-none p-2.5 cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'active text-[var(--accent)] font-semibold' : 'text-[var(--text2)] font-normal'}`}
                    >
                        <span>🏪</span> <span className="db-sidebar-label">Store Front</span>
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('menu')}
                        className={`w-full bg-transparent border-none p-2.5 cursor-pointer flex items-center gap-3 transition-colors ${activeTab === 'menu' ? 'active text-[var(--accent)] font-semibold' : 'text-[var(--text2)] font-normal'}`}
                    >
                        <span>📋</span> <span className="db-sidebar-label">Menu Management</span>
                    </motion.button>
                    <motion.button type="button" whileHover={{ x: 4 }} onClick={() => window.location.href = '/profile'} className="w-full bg-transparent border-none p-2.5 text-[var(--text2)] cursor-pointer flex items-center gap-3">
                        <span>⚙️</span> <span className="db-sidebar-label">Settings</span>
                    </motion.button>
                </nav>
                <div className="p-3 border-t border-[var(--border)]">
                    <button onClick={logout} className="bg-transparent border-none text-[#ff6b6b] cursor-pointer p-2.5">🚪 Log Out</button>
                </div>
            </aside>

            {/* HEADER */}
            <header className="db-header">
                <span className="font-[Bebas_Neue] text-xl">{vendor?.name || 'Vendor Admin'}</span>
                <div className="flex items-center gap-4">
                    <NotificationTray />
                    <div className="w-9 h-9 rounded-full bg-[var(--accent2)] border-[1.5px] border-[var(--accent3)] flex items-center justify-center text-[var(--accent)]">
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
                        <div className="text-base font-[Bebas_Neue] text-[rgba(0,212,255,.6)]">{activeTab === 'orders' ? 'Business Dashboard,' : 'Inventory Management,'}</div>
                        <div className="db-welcome-name">{user?.name || 'Vendor'}</div>
                    </motion.div>

                    {activeTab === 'orders' ? (
                        <>
                            <div className="db-stats-grid">
                                <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                                    <div className="db-stat-value db-stat-accent">{orders.length}</div>
                                    <div className="text-xs text-[var(--text3)]">Total Orders</div>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                                    <div className="db-stat-value">AED {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}</div>
                                    <div className="text-xs text-[var(--text3)]">Total Revenue</div>
                                </motion.div>
                            </div>

                            <div className="db-card mb-6">
                                <div className="mb-4">
                                    <span className="font-[Bebas_Neue] text-xl">Revenue Overview</span>
                                </div>
                                <div className="flex items-end gap-2 h-[100px] px-2">
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
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className={`w-full bg-[var(--accent)] rounded-t min-h-[2px] ${i === 6 ? 'opacity-100' : 'opacity-60'}`}
                                                />
                                                <div className="text-[0.6rem] text-[var(--text3)] uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="db-card">
                                <div className="mb-5">
                                    <span className="font-[Bebas_Neue] text-xl">Incoming Orders</span>
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
                                                            <div className="font-semibold">{order.title}</div>
                                                            <div className="text-xs text-[var(--text3)]">{order.student?.name}</div>
                                                        </td>
                                                        <td>
                                                            {order.items?.map(i => (
                                                                <div key={i.name} className="text-xs text-[var(--text2)]">{i.quantity}x {i.name}</div>
                                                            ))}
                                                            {!order.items?.length && <div className="text-xs text-[var(--text3)]">{order.description}</div>}
                                                        </td>
                                                        <td>
                                                            <span className={`db-status-pill db-status-${order.status}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`text-[0.7rem] font-bold uppercase ${order.paymentInfo?.status === 'paid' ? 'text-[var(--accent)]' : 'text-[#ff6b6b]'}`}>
                                                                {order.paymentInfo?.status || 'pending'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {order.status === 'pending' && (
                                                                <MotionButton
                                                                    onClick={() => handleUpdateStatus(order._id, 'preparing')}
                                                                    disabled={processingIds.has(order._id)}
                                                                    className="px-3 py-1.5 text-xs"
                                                                >
                                                                    {processingIds.has(order._id) ? 'Accepting...' : 'Accept'}
                                                                </MotionButton>
                                                            )}
                                                            {order.status === 'preparing' && (
                                                                <span className="text-[var(--text3)] text-xs italic">In Kitchen</span>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="text-center p-5 text-[var(--text3)]">No orders yet</td>
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
                            <div className="mb-5">
                                <span className="font-[Bebas_Neue] text-xl">Menu Items</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {vendor?.menu.map(item => (
                                        <motion.div
                                            key={item.name}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col gap-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold">{item.name}</div>
                                                    <div className="text-sm text-[var(--text3)]">AED {item.price}</div>
                                                </div>
                                                {/* FIX A11Y Loophole: Make this a button */}
                                                <button
                                                    onClick={() => handleToggleAvailability(item.name, !item.isAvailable)}
                                                    disabled={processingIds.has(item.name)}
                                                    className={`w-10 h-5.5 rounded-full relative transition-all duration-300 ${processingIds.has(item.name) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${item.isAvailable ? 'bg-[var(--accent)]' : 'bg-[var(--bg3)]'} border-none`}
                                                    aria-label={`Toggle availability for ${item.name}`}
                                                >
                                                    <motion.div
                                                        animate={{ left: item.isAvailable ? '20px' : '2px' }}
                                                        className="w-4.5 h-4.5 rounded-full bg-white absolute top-0.5"
                                                    />
                                                </button>
                                            </div>
                                            <div className={`text-xs font-semibold ${item.isAvailable ? 'text-[var(--accent)]' : 'text-[#ff6b6b]'}`}>
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
