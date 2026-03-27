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
import { LiveMap } from '../components/LiveMap';
import { ChatDrawer } from '../components/ChatDrawer';
import './Dashboard.css';

interface Order {
    _id: string;
    vendor?: { name: string };
    student: { name: string };
    runner?: { id: string; name: string };
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
    const [activeTab, setActiveTab] = useState<'orders' | 'vendors' | 'groups'>('orders');
    const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    // Rating Modal State
    const [ratingModal, setRatingModal] = useState({
        isOpen: false,
        orderId: '',
        orderTitle: ''
    });

    const [vendors, setVendors] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [myOrders, allVendors] = await Promise.all([
                api.orders.getMine(),
                api.vendors.getAll()
            ]);
            setOrders(Array.isArray(myOrders) ? myOrders : []);
            setVendors(Array.isArray(allVendors) ? allVendors : []);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
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

    useEffect(() => {
        if (!socket) return;

        socket.on('orderUpdate', (updatedOrder: Order) => {
            console.log('⚡️[socket]: Order updated', updatedOrder);
            fetchData();
        });

        return () => {
            socket.off('orderUpdate');
        };
    }, [socket, fetchData]);

    const handlePayNow = async (orderId: string) => {
        try {
            setProcessingIds(prev => new Set(prev).add(orderId));
            const { url } = await api.orders.createCheckoutSession(orderId);
            if (url) window.location.href = url;
            else showToast('Failed to initiate payment', 'error');
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Error initiating payment', 'error');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    const handleReportIssue = async (orderId: string, reason: string) => {
        try {
            setProcessingIds(prev => new Set(prev).add(`dispute-${orderId}`));
            await api.orders.reportDispute(orderId, reason);
            showToast('Issue reported successfully. Support will investigate.', 'success');
            fetchData();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to report issue', 'error');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(`dispute-${orderId}`);
                return next;
            });
        }
    };

    if (loading) return (
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
                    <div className="text-[0.65rem] text-[var(--text3)] uppercase">Student Portal</div>
                </div>
                <nav className="flex-1 py-4 px-3 flex flex-col gap-2">
                    <motion.button 
                        type="button" 
                        whileHover={{ x: 4 }} 
                        onClick={() => setActiveTab('orders')}
                        className={`db-sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    >
                        <span>🏠</span> <span className="db-sidebar-label">Dashboard</span>
                    </motion.button>
                    <motion.button 
                        type="button" 
                        whileHover={{ x: 4 }} 
                        onClick={() => setActiveTab('vendors')}
                        className={`db-sidebar-nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
                    >
                        <span>🏪</span> <span className="db-sidebar-label">Vendors</span>
                    </motion.button>
                    <motion.button 
                        type="button" 
                        whileHover={{ x: 4 }} 
                        className="db-sidebar-nav-item"
                        style={{ cursor: 'default', opacity: 0.6 }}
                    >
                        <span>🕒</span> <span className="db-sidebar-label">History</span>
                    </motion.button>
                    <motion.button 
                        type="button" 
                        whileHover={{ x: 4 }} 
                        onClick={() => window.location.href = '/profile'} 
                        className="db-sidebar-nav-item"
                    >
                        <span>⚙️</span> <span className="db-sidebar-label">Settings</span>
                    </motion.button>
                </nav>
                <div className="p-3 border-t border-[var(--border)]">
                    <button onClick={logout} className="bg-transparent border-none text-[#ff6b6b] cursor-pointer p-2.5">🚪 Log Out</button>
                </div>
            </aside>

            {/* HEADER */}
            <header className="db-header">
                <span className="font-[Bebas_Neue] text-xl">
                    {activeTab === 'orders' ? 'Dashboard Home' : 'Campus Vendors'}
                </span>
                <div className="flex items-center gap-4">
                    <NotificationTray />
                    <div className="w-9 h-9 rounded-full bg-[var(--accent2)] border-[1.5px] border-[var(--accent3)] flex items-center justify-center text-[var(--accent)]">
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
                        <div className="text-base font-[Bebas_Neue] text-[rgba(0,212,255,.6)]">Welcome back,</div>
                        <div className="db-welcome-name mb-4">{user?.name || 'Student'}</div>
                        <div className="flex gap-2 items-center flex-wrap">
                            <MotionButton onClick={() => setIsJoinModalOpen(true)} variant="secondary" className="px-4 py-2 text-sm">Join Group</MotionButton>
                            <MotionButton onClick={() => setIsGroupModalOpen(true)} variant="secondary" className="px-4 py-2 text-sm">Start Group</MotionButton>
                            <MotionButton onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm">+ New Order</MotionButton>
                        </div>
                    </motion.div>

                        {activeTab === 'orders' && (
                            <>
                                <div className="db-stats-grid">
                                    <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                                        <div className="db-stat-value db-stat-accent text-2xl">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</div>
                                        <div className="text-[0.7rem] text-[var(--text3)] uppercase font-semibold">Active Orders</div>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                                        <div className="db-stat-value text-2xl">{orders.filter(o => o.status === 'delivered').length}</div>
                                        <div className="text-[0.7rem] text-[var(--text3)] uppercase font-semibold">Completed</div>
                                    </motion.div>
                                </div>

                                <div className="db-card mt-6" style={{ padding: '0', overflow: 'hidden' }}>
                                    <div style={{ padding: '24px 24px 12px' }}>
                                        <span className="font-[Bebas_Neue] text-xl block">Order Tracking Radar</span>
                                        <p className="text-xs text-[var(--text3)]">Real-time visualization of your active deliveries</p>
                                    </div>
                                    <LiveMap 
                                        height="300px"
                                        locations={[
                                            ...orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(o => ({
                                                lat: 25.123 + (Math.random() - 0.5) * 0.005,
                                                lng: 55.223 + (Math.random() - 0.5) * 0.005,
                                                label: o.title,
                                                type: 'student' as const
                                            })),
                                            { lat: 25.1235, lng: 55.2235, label: 'Campus Hub', type: 'vendor' as const }
                                        ]} 
                                    />
                                </div>

                                <div className="db-card mt-6">
                                    <span className="font-[Bebas_Neue] text-xl block mb-4">Live Tracking</span>
                                    <div className="flex flex-col gap-3">
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
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="font-semibold">{order.title}</div>
                                                            <div className="text-xs text-[var(--text3)]">Order ID: {order._id.slice(-6).toUpperCase()}</div>
                                                        </div>
                                                        <div className="flex gap-3 items-center">
                                                            {order.status !== 'delivered' && (
                                                                <button 
                                                                    onClick={() => setActiveChatOrder(order)}
                                                                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text)' }}
                                                                >
                                                                    💬 Chat
                                                                </button>
                                                            )}
                                                            {order.paymentInfo?.status === 'pending' && (
                                                                <MotionButton onClick={() => handlePayNow(order._id)} disabled={processingIds.has(order._id)} variant="primary" className="px-3 py-1.5 text-xs">
                                                                    {processingIds.has(order._id) ? 'REDIRECTING...' : 'PAY NOW'}
                                                                </MotionButton>
                                                            )}
                                                            {order.status === 'delivered' && !order.dispute?.isDisputed && (
                                                                <MotionButton onClick={() => handleReportIssue(order._id, 'Problem with delivery')} disabled={processingIds.has(`dispute-${order._id}`)} variant="ghost" className="px-3 py-1.5 text-xs">
                                                                    {processingIds.has(`dispute-${order._id}`) ? 'REPORTING...' : 'REPORT ISSUE'}
                                                                </MotionButton>
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
                                            <div className="text-center p-5 text-[var(--text3)]">No active orders. Time for a coffee?</div>
                                        )}
                                    </div>
                                </div>

                                <div className="db-card mt-6">
                                    <span className="font-[Bebas_Neue] text-xl block mb-4">Recent activity</span>
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
                                                                        className="px-2.5 py-1 text-[0.65rem]"
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
                            </>
                        )}

                        {activeTab === 'vendors' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="db-card mt-6"
                            >
                                <span className="font-[Bebas_Neue] text-xl block mb-6">Campus Vendors</span>
                                <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                                    {vendors.length > 0 ? vendors.map(v => (
                                        <motion.div
                                            key={v._id}
                                            whileHover={{ y: -5 }}
                                            className="db-subcard flex flex-col gap-3"
                                        >
                                            <div style={{ height: '140px', background: 'var(--bg3)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                                                {v.image ? (
                                                    <img src={v.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-[var(--text3)] text-3xl">🏪</div>
                                                )}
                                                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                                    <span className={`db-status-pill ${v.isOpen ? 'db-status-delivered' : 'db-status-pending'}`} style={{ fontSize: '0.6rem' }}>
                                                        {v.isOpen ? 'OPEN' : 'CLOSED'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">{v.name}</div>
                                                <div className="text-[0.65rem] text-[var(--accent)] uppercase font-bold mt-1">{v.category}</div>
                                                <div className="text-[0.75rem] text-[var(--text3)] mt-2 line-clamp-2">{v.description}</div>
                                            </div>
                                            <MotionButton 
                                                onClick={() => {
                                                    setIsModalOpen(true);
                                                }}
                                                variant="secondary" 
                                                className="w-full mt-2"
                                            >
                                                Order Now
                                            </MotionButton>
                                        </motion.div>
                                    )) : (
                                        <div className="text-center p-10 col-span-full">
                                            <div className="text-3xl mb-2">🏪</div>
                                            <div className="text-[var(--text3)]">No vendors available right now.</div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

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
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab as any)}
                items={[
                    { label: 'Home', icon: '🏠', tab: 'orders' },
                    { label: 'Vendors', icon: '🏪', tab: 'vendors' },
                    { label: 'Settings', icon: '⚙️', path: '/profile' },
                    { label: 'Log Out', icon: '🚪', action: logout }
                ]}
            />

            <CreateOrderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onOrderCreated={fetchData} 
            />
            <CreateGroupOrderModal 
                isOpen={isGroupModalOpen} 
                onClose={() => setIsGroupModalOpen(false)} 
                onOrderCreated={fetchData} 
            />
            <JoinGroupModal 
                isOpen={isJoinModalOpen} 
                onClose={() => setIsJoinModalOpen(false)} 
                onOrderJoined={fetchData} 
            />

            {activeChatOrder && (
                <ChatDrawer
                    isOpen={!!activeChatOrder}
                    onClose={() => setActiveChatOrder(null)}
                    orderId={activeChatOrder._id}
                    recipientName={activeChatOrder.runner?.name || 'Runner'}
                />
            )}
        </div>
    );
}

export default StudentDashboard;
