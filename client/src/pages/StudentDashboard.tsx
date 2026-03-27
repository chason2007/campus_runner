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
                <nav className="flex-1 py-4 px-3">
                    <motion.div whileHover={{ x: 4 }} className="active p-2.5 text-[var(--accent)] font-semibold flex items-center gap-3">
                        <span>🏠</span> <span className="db-sidebar-label">Dashboard</span>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} className="p-2.5 text-[var(--text2)] cursor-default flex items-center gap-3">
                        <span>🕒</span> <span className="db-sidebar-label">History</span>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} onClick={() => window.location.href = '/profile'} className="p-2.5 text-[var(--text2)] cursor-pointer flex items-center gap-3">
                        <span>⚙️</span> <span className="db-sidebar-label">Settings</span>
                    </motion.div>
                </nav>
                <div className="p-3 border-t border-[var(--border)]">
                    <button onClick={logout} className="bg-transparent border-none text-[#ff6b6b] cursor-pointer p-2.5">🚪 Log Out</button>
                </div>
            </aside>

            {/* HEADER */}
            <header className="db-header">
                <span className="font-[Bebas_Neue] text-xl">Dashboard Home</span>
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
                        <div className="flex gap-2 flex-wrap">
                            <MotionButton onClick={() => setIsJoinModalOpen(true)} variant="secondary" className="px-4 py-2 text-sm">Join Group</MotionButton>
                            <MotionButton onClick={() => setIsGroupModalOpen(true)} variant="secondary" className="px-4 py-2 text-sm">Start Group</MotionButton>
                            <MotionButton onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm">+ New Order</MotionButton>
                        </div>
                    </motion.div>

                    <div className="db-stats-grid">
                        <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                            <div className="db-stat-value db-stat-accent">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</div>
                            <div className="text-xs text-[var(--text3)]">Active Orders</div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="db-stat-card">
                            <div className="db-stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
                            <div className="text-xs text-[var(--text3)]">Completed Tasks</div>
                        </motion.div>
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
                                                {order.paymentInfo?.status === 'pending' && (
                                                    <MotionButton onClick={() => handlePayNow(order._id)} variant="primary" className="px-3 py-1.5 text-xs">PAY NOW</MotionButton>
                                                )}
                                                {order.status === 'delivered' && !order.dispute?.isDisputed && (
                                                    <MotionButton onClick={() => handleReportIssue(order._id, 'Problem with delivery')} variant="ghost" className="px-3 py-1.5 text-xs">REPORT ISSUE</MotionButton>
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
