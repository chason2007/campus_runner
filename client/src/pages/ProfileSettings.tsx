import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { MotionButton } from '../components/MotionButton';
import './Dashboard.css';

function ProfileSettings() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [name, setName] = useState(user?.name || '');
    const [campusId, setCampusId] = useState(user?.campusId || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.auth.updateProfile({ name, campusId });
            showToast('Profile updated successfully!', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-layout">
            <aside className="db-sidebar">
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'var(--accent)' }}>CAMPUSRUNNER</div>
                </div>
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => window.history.back()}
                        style={{ padding: '10px', color: 'var(--text2)', cursor: 'pointer' }}
                    >
                        ← Back to Dashboard
                    </motion.div>
                </nav>
            </aside>

            <main className="db-main">
                <header className="db-header">
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem' }}>Profile Settings</span>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="db-card glass-card"
                    style={{ maxWidth: '600px', margin: '0 auto', marginTop: '40px' }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em' }}>FULL NAME</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em' }}>CAMPUS ID / STUDENT NO.</label>
                            <input
                                type="text"
                                value={campusId}
                                onChange={(e) => setCampusId(e.target.value)}
                                placeholder="e.g. ST12345"
                                style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em' }}>EMAIL ADDRESS (PRIMARY)</label>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text3)', cursor: 'not-allowed', fontSize: '0.9rem' }}
                            />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text3)', fontStyle: 'italic' }}>Email cannot be changed for security reasons.</span>
                        </div>

                        <MotionButton
                            type="submit"
                            disabled={loading}
                            style={{ padding: '16px', marginTop: '10px' }}
                        >
                            {loading ? 'SAVING...' : 'SAVE CHANGES'}
                        </MotionButton>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}

export default ProfileSettings;
