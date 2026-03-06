import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, Zap } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && !formData.email.endsWith('.edu')) {
            setError('A valid campus .edu email is required.');
            setLoading(false);
            return;
        }

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await signup(formData.name, formData.email, formData.password);
        }

        if (result.success) {
            navigate('/app');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary rounded-full blur-[150px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="max-w-md w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center p-4 bg-brand-surface border border-white/10 rounded-squircle mb-6 shadow-squircle">
                        <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase mb-3">
                        Campus<span className="text-brand-accent italic">Runner</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bento-card p-10 bg-brand-surface/40 backdrop-blur-2xl border border-white/10"
                >
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 overflow-hidden"
                            >
                                <p className="text-rose-400 text-xs font-black uppercase text-center">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-4 h-5 w-5 text-slate-600 group-focus-within:text-brand-accent transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Agent Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-slate-600 outline-none focus:border-brand-accent transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Campus Terminal</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-600 group-focus-within:text-brand-accent transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="agent@university.edu"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-slate-600 outline-none focus:border-brand-accent transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Encryption Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-600 group-focus-within:text-brand-accent transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-slate-600 outline-none focus:border-brand-accent transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-squircle group mt-4 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center uppercase tracking-widest">
                                {loading ? 'Authorizing...' : (isLogin ? 'Initiate Link' : 'Register Profile')}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.5 }}
                            />
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-accent transition-colors flex items-center justify-center"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            {isLogin ? 'Switch to Network Registration' : 'Return to Secure Login'}
                        </button>
                    </div>
                </motion.div>

                <footer className="mt-12 text-center">
                </footer>
            </div>
        </div>
    );
};

export default AuthPage;
