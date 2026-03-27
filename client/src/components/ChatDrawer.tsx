import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface Message {
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Date;
}

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    recipientName: string;
}

export const ChatDrawer = ({ isOpen, onClose, orderId, recipientName }: ChatDrawerProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const { socket } = useSocket();
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket || !isOpen) return;

        // Join order-specific chat room
        socket.emit('joinOrderChat', orderId);

        const handleNewMessage = (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        };

        socket.on('chatMessage', handleNewMessage);

        return () => {
            socket.off('chatMessage', handleNewMessage);
            socket.emit('leaveOrderChat', orderId);
        };
    }, [socket, isOpen, orderId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !user) return;

        const msg: Message = {
            senderId: user.id,
            senderName: user.name,
            text: inputText,
            timestamp: new Date()
        };

        socket.emit('sendChatMessage', { orderId, message: msg });
        setMessages(prev => [...prev, msg]);
        setInputText('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000 }}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="glass"
                        style={{
                            position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '400px',
                            zIndex: 10001, display: 'flex', flexDirection: 'column',
                            borderRadius: '24px 0 0 24px', borderLeft: '1px solid var(--border)'
                        }}
                    >
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', margin: 0 }}>Chat with {recipientName}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text3)', margin: 0 }}>Order Tracking #{orderId.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>

                        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text3)', fontSize: '0.85rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                                    No messages yet. Say hi!
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} style={{ 
                                        alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        background: msg.senderId === user?.id ? 'var(--accent)' : 'var(--surface)',
                                        color: msg.senderId === user?.id ? '#000' : 'var(--text)',
                                        padding: '10px 14px',
                                        borderRadius: '16px',
                                        borderBottomRightRadius: msg.senderId === user?.id ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.senderId === user?.id ? '16px' : '4px',
                                        fontSize: '0.88rem',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {msg.text}
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                            <input
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '12px 16px', background: 'var(--bg3)', border: '1px solid var(--border2)',
                                    borderRadius: '12px', color: 'var(--text)', outline: 'none'
                                }}
                            />
                            <button type="submit" style={{ 
                                padding: '0 20px', borderRadius: '12px', border: 'none', 
                                background: 'var(--accent)', color: '#000', fontWeight: 700, cursor: 'pointer' 
                            }}>
                                Send
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
