import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login: authLogin, user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // On mount, clear any stale token from a deleted/non-admin session
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.role !== 'admin') {
                    logout();
                }
            } catch {
                logout();
            }
        }
    }, []);

    // Already logged in as admin — redirect cleanly via component
    if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            const data = await api.auth.login(email, password);
            if (data.user.role !== 'admin') {
                showToast('Access denied. This gateway is for admins only.', 'error');
                // Clear the token since this non-admin shouldn't be using this gateway
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return;
            }
            authLogin(data.user, data.token);
            showToast(`Welcome, ${data.user.name.split(' ')[0]} 👑`, 'success');
            navigate('/admin');
        } catch (err: any) {
            showToast(err.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#080808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Instrument Sans', sans-serif",
        }}>
            {/* Background grid */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', maxWidth: '420px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    borderRadius: '24px',
                    padding: '40px 36px',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.05)',
                }}
            >
                {/* Icon + Title */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'rgba(0,212,255,0.1)', border: '1.5px solid rgba(0,212,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', margin: '0 auto 16px',
                    }}>👑</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', letterSpacing: '0.04em' }}>
                        ADMIN GATEWAY
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        Restricted Access — Authorized Personnel Only
                    </div>
                </div>

                {/* Warning badge */}
                <div style={{
                    background: 'rgba(255,159,0,0.08)', border: '1px solid rgba(255,159,0,0.2)',
                    borderRadius: '10px', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '0.75rem', color: 'rgba(255,159,0,0.9)',
                    marginBottom: '28px',
                }}>
                    <span>⚠️</span>
                    <span>This page is monitored. Unauthorized access attempts are logged.</span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@campusrunner.edu"
                            required
                            style={{
                                width: '100%', padding: '13px 16px', boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: '#fff', fontSize: '0.9rem',
                                outline: 'none', fontFamily: "'Instrument Sans', sans-serif",
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                                style={{
                                    width: '100%', padding: '13px 44px 13px 16px', boxSizing: 'border-box',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', color: '#fff', fontSize: '0.9rem',
                                    outline: 'none', fontFamily: "'Instrument Sans', sans-serif",
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                style={{
                                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer', padding: 0, fontSize: '16px',
                                }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        style={{
                            width: '100%', padding: '14px',
                            background: loading ? 'rgba(0,212,255,0.3)' : 'var(--accent, #00d4ff)',
                            color: '#000', border: 'none', borderRadius: '12px',
                            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '4px',
                            transition: 'background 0.2s',
                        }}
                    >
                        {loading ? 'AUTHENTICATING...' : 'ACCESS CONTROL PANEL'}
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <a href="/" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                        ← Back to Campus Runner
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
