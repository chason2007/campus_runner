import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io('http://localhost:5000');

            newSocket.on('connect', () => {
                console.log('🔌[socket]: Connected to server');
                setIsConnected(true);

                // Join personal room
                newSocket.emit('join', `user_${user.id}`);

                // Join role-specific rooms
                if (user.role === 'runner') {
                    newSocket.emit('join', 'runners');
                }

                // If vendor, join vendor room (assuming user.id is vendor owner)
                // In a more complex setup, we might need a separate /me call to get vendorId
                if (user.role === 'vendor') {
                    newSocket.emit('join', `vendor_owner_${user.id}`);
                }
            });

            newSocket.on('disconnect', () => {
                console.log('🔌[socket]: Disconnected from server');
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
