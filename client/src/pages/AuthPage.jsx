import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation, ArrowRight, ShieldCheck, Box, Zap, ChevronRight } from 'lucide-react';

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
            setError('A valid .edu campus email is required.');
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
        <div className="min-h-screen w-full flex bg-apple-50 relative overflow-hidden text-apple-600 font-sans">

            {/* Hyper-minimal background blur */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-apple-blue/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen items-center justify-center p-6 lg:p-12 z-10">

                {/* Left Side: Brand & Hero */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center pr-0 lg:pr-20 mb-12 lg:mb-0 animate-fade-in text-center lg:text-left">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-apple-100 text-apple-500 mb-8 mx-auto lg:mx-0 w-max shadow-sm border border-apple-100/50">
                        <ShieldCheck className="h-4 w-4 mr-2 text-apple-blue" />
                        <span className="text-xs font-semibold tracking-wide">University Exclusive Network</span>
                    </div>

                    <h1 className="text-6xl lg:text-[5.5rem] font-display font-semibold text-apple-600 leading-[1.05] tracking-tight mb-6">
                        Campus. <br className="hidden lg:block" />
                        <span className="text-apple-blue">Delivered.</span>
                    </h1>

                    <p className="text-xl text-apple-400 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed mb-10">
                        The simplest way to get what you need, or earn money helping others on campus. Pro delivery. Pro earnings.
                    </p>

                    <div className="hidden lg:flex space-x-12 mt-4">
                        <div>
                            <h3 className="text-4xl font-display font-semibold text-apple-600 mb-1">Instant</h3>
                            <p className="text-sm font-medium text-apple-400">Campus Alerts</p>
                        </div>
                        <div className="w-px h-16 bg-apple-200"></div>
                        <div>
                            <h3 className="text-4xl font-display font-semibold text-apple-blue mb-1">100%</h3>
                            <p className="text-sm font-medium text-apple-400">Student Run</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Minimalist Apple-Style Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center animate-slide-up">
                    <div className="w-full max-w-[440px] macos-card p-10 lg:p-12 relative overflow-hidden">

                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 mx-auto bg-apple-blue rounded-[1.25rem] flex items-center justify-center mb-6 shadow-apple-card">
                                <Navigation className="h-8 w-8 text-white -rotate-12" />
                            </div>
                            <h2 className="text-3xl font-display font-semibold text-apple-600 mb-2 tracking-tight">
                                {isLogin ? 'Sign in' : 'Create Account'}
                            </h2>
                            <p className="text-apple-400 font-medium">
                                {isLogin ? 'Use your .edu email to continue.' : 'One account for everything.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50/80 rounded-2xl flex items-start space-x-3 border border-red-100">
                                <span className="text-red-500 font-bold mt-0.5">!</span>
                                <p className="text-sm font-medium text-red-600 leading-tight">{error}</p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="space-y-5 animate-fade-in">
                                    <div>
                                        <input
                                            type="text"
                                            required
                                            className="macos-input"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex space-x-3">
                                        <label className={`flex-1 flex flex-col items-center justify-center py-5 rounded-2xl cursor-pointer transition-all border-2 ${formData.role === 'Buyer' ? 'bg-apple-blue/5 border-apple-blue shadow-sm' : 'bg-apple-50 border-transparent hover:bg-apple-100'}`}>
                                            <input type="radio" name="role" value="Buyer" className="sr-only" onChange={(e) => setFormData({ ...formData, role: e.target.value })} checked={formData.role === 'Buyer'} />
                                            <Box className={`h-6 w-6 mb-2 ${formData.role === 'Buyer' ? 'text-apple-blue' : 'text-apple-400'}`} />
                                            <span className={`text-sm font-semibold ${formData.role === 'Buyer' ? 'text-apple-blue' : 'text-apple-500'}`}>Order</span>
                                        </label>
                                        <label className={`flex-1 flex flex-col items-center justify-center py-5 rounded-2xl cursor-pointer transition-all border-2 ${formData.role === 'Runner' ? 'bg-apple-blue/5 border-apple-blue shadow-sm' : 'bg-apple-50 border-transparent hover:bg-apple-100'}`}>
                                            <input type="radio" name="role" value="Runner" className="sr-only" onChange={(e) => setFormData({ ...formData, role: e.target.value })} checked={formData.role === 'Runner'} />
                                            <Zap className={`h-6 w-6 mb-2 ${formData.role === 'Runner' ? 'text-apple-blue' : 'text-apple-400'}`} />
                                            <span className={`text-sm font-semibold ${formData.role === 'Runner' ? 'text-apple-blue' : 'text-apple-500'}`}>Deliver</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <input
                                    type="email"
                                    required
                                    className="macos-input"
                                    placeholder="Campus Email (.edu)"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    required
                                    className="macos-input"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full macos-btn-primary text-lg py-4 flex items-center justify-center group"
                                >
                                    <span>{loading ? 'Processing...' : (isLogin ? 'Continue' : 'Sign Up')}</span>
                                    {!loading && <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform opacity-70" />}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-apple-200/60 text-center">
                            <p className="text-sm font-medium text-apple-500">
                                {isLogin ? "New to CampusRunner? " : 'Already have an Apple ID? '}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                    className="text-apple-blue hover:text-apple-blueHover transition-colors font-medium ml-1"
                                >
                                    {isLogin ? 'Create yours now.' : 'Sign in.'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;
