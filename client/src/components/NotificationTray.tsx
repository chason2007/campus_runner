import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationTray() {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const trayRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const data = await api.notifications.getAll();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            socket.on('notification', (newNotif: Notification) => {
                setNotifications(prev => [newNotif, ...prev]);
            });
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            if (socket) socket.off('notification');
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [socket]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.notifications.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.notifications.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={trayRef}>
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{ position: 'relative', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
            >
                <span style={{ fontSize: '1.1rem' }}>🔔</span>
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px', padding: '0 4px', background: '#ff6b6b', borderRadius: '10px', border: '2px solid var(--bg)', fontSize: '0.6rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, boxShadow: '0 4px 10px rgba(255,107,107,0.3)' }}
                        >
                            {unreadCount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(4px)' }}
                        className="glass"
                        style={{ position: 'absolute', top: '50px', right: '0', width: '320px', maxHeight: '480px', borderRadius: '20px', zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>Recent Activity</span>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>
                            )}
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                            <AnimatePresence mode="popLayout">
                                {notifications.length > 0 ? (
                                    notifications.map((n, i) => (
                                        <motion.div
                                            key={n._id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                            style={{
                                                padding: '12px 14px',
                                                borderRadius: '12px',
                                                marginBottom: '4px',
                                                background: n.isRead ? 'transparent' : 'rgba(0,212,255,0.06)',
                                                cursor: n.isRead ? 'default' : 'pointer',
                                                transition: 'background 0.2s',
                                                border: n.isRead ? '1px solid transparent' : '1px solid rgba(0,212,255,0.1)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: n.isRead ? 'var(--text2)' : 'var(--text)' }}>{n.title}</span>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.4 }}>{n.message}</div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
                                        All caught up!
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
