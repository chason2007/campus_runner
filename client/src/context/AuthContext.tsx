import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'runner' | 'vendor' | 'admin';
    campusId?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        const verifyUser = async () => {
            if (savedToken) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${savedToken}` }
                    });
                    const data = await response.json();
                    
                    if (response.ok && data.role) {
                        setUser(data);
                        setToken(savedToken);
                        localStorage.setItem('user', JSON.stringify(data));
                    } else {
                        logout();
                    }
                } catch (err) {
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                        setToken(savedToken);
                    }
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = (userData: User, userToken: string) => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
