import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Tag, Navigation, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Buyer' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && !formData.email.endsWith('.edu')) {
            setError('A valid .edu campus email is required');
            setLoading(false);
            return;
        }

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await signup(formData.name, formData.email, formData.password, formData.role);
        }

        if (result.success) {
            window.location.reload();
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">

            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow" />

            {/* Left Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
                <div className="max-w-md w-full glass p-10 rounded-3xl relative">

                    <div className="absolute -top-12 left-10 w-24 h-24 bg-gradient-to-br from-brand-400 to-accent-500 rounded-2xl rotate-12 blur-2xl opacity-40 animate-float" />

                    <div className="flex items-center space-x-3 mb-8 relative z-10">
                        <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-500/30 text-white">
                            <Navigation className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">CampusRunner</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                            {isLogin ? 'Welcome back' : 'Join the fleet'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isLogin ? 'Enter your details to access your account.' : 'Create an account to start ordering or earning.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl flex items-start space-x-3 animate-[fade-in_0.3s_ease-out]">
                            <div className="text-red-500 mt-0.5" >⚠️</div>
                            <p className="text-sm font-medium text-red-800 leading-tight">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Role</label>
                                    <div className="flex space-x-3">
                                        <label className={`flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'Buyer' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                            <input type="radio" name="role" value="Buyer" className="sr-only" onChange={(e) => setFormData({ ...formData, role: e.target.value })} checked={formData.role === 'Buyer'} />
                                            <Package className={`h-6 w-6 mb-2 ${formData.role === 'Buyer' ? 'text-brand-600' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-semibold ${formData.role === 'Buyer' ? 'text-brand-900' : 'text-slate-500'}`}>Buyer</span>
                                        </label>
                                        <label className={`flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'Runner' ? 'border-accent-500 bg-accent-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                            <input type="radio" name="role" value="Runner" className="sr-only" onChange={(e) => setFormData({ ...formData, role: e.target.value })} checked={formData.role === 'Runner'} />
                                            <Zap className={`h-6 w-6 mb-2 ${formData.role === 'Runner' ? 'text-accent-600' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-semibold ${formData.role === 'Runner' ? 'text-accent-900' : 'text-slate-500'}`}>Runner</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Campus Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                    placeholder="student@university.edu"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                {isLogin && <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</a>}
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden rounded-xl bg-slate-900 text-white font-semibold py-4 shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex items-center justify-center">
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-slate-500">
                        {isLogin ? "Don't have an account? " : 'Already part of the fleet? '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-brand-600 hover:text-brand-700 font-bold transition-colors"
                        >
                            {isLogin ? 'Sign up for free' : 'Sign in here'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Right Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative p-4">
                <div className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col items-center justify-center p-12 text-center isolate">

                    {/* Animated Background Mesh in Hero */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-slate-900 to-accent-900 opacity-80 z-[-1]" />
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-slow" />
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" />

                    <div className="glass-dark p-6 rounded-3xl mb-12 shadow-2xl relative border border-white/10 -rotate-3 transform hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-inner">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold leading-tight">Student Exclusive</p>
                                <p className="text-brand-200 text-sm font-medium">Verified .edu network</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-[1.1]">
                        Campus <br /><span className="text-gradient">Deliveries</span> <br />Done Right.
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md font-medium">
                        Need late night snacks or emergency printouts? Order what you need or earn cash by running deliveries.
                    </p>

                    {/* Dummy UI overlay for aesthetics */}
                    <div className="absolute bottom-12 right-12 glass-dark px-5 py-4 rounded-2xl flexItems-center border border-white/5 shadow-2xl animate-float">
                        <div className="flex items-center">
                            <div className="flex -space-x-3 mr-4">
                                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-brand-400 flex items-center justify-center text-xs font-bold text-white">JD</div>
                                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-accent-400 flex items-center justify-center text-xs font-bold text-white">AS</div>
                                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">+2k</div>
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold text-sm">Active Runners</p>
                                <p className="text-accent-300 text-xs">On campus right now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthPage;
