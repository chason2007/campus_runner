import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set initial axios default header if token exists in localStorage
const initialToken = localStorage.getItem('token');
if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Configure axios to always send token if available
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
        setLoading(false); // Token is now initialized
    }, [token]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            setToken(res.data.token);
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/signup`, { name, email, password });
            setToken(res.data.token);
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/auth/me`);
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
