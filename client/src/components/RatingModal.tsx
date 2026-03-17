import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { MotionButton } from './MotionButton';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    orderTitle: string;
    onRated: () => void;
}

export default function RatingModal({ isOpen, onClose, orderId, orderTitle, onRated }: RatingModalProps) {
    const [score, setScore] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(0);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.ratings.create({ orderId, score, comment });
            showToast('Thank you for your feedback!', 'success');
            onRated();
            onClose();
        } catch (err: any) {
            showToast(err.message || 'Failed to submit rating', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="modal-card glass"
                        style={{ maxWidth: '400px' }}
                    >
                        <div className="modal-header">
                            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', margin: 0 }}>Rate Delivery</h2>
                            <button onClick={onClose} className="modal-close">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body">
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text3)', marginBottom: '8px' }}>How was your order?</div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '20px' }}>{orderTitle}</div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            whileHover={{ scale: 1.25 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setScore(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '2rem',
                                                cursor: 'pointer',
                                                color: star <= (hover || score) ? '#FFD700' : 'rgba(255,255,255,0.1)',
                                                transition: 'color 0.2s',
                                                padding: 0
                                            }}
                                        >
                                            ★
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>COMMENT (OPTIONAL)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about your experience..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        color: '#fff',
                                        minHeight: '100px',
                                        resize: 'vertical',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </div>

                            <MotionButton
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    marginTop: '12px'
                                }}
                            >
                                {loading ? 'Submitting...' : 'SUBMIT FEEDBACK'}
                            </MotionButton>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
