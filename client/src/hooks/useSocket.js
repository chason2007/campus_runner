import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socket;

export const useSocket = () => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socket = io(API_URL);

        socket.on('connect', () => {
            setIsConnected(true);
            if (user?._id) {
                socket.emit('join_room', user._id);
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    // Expose a helper to listen to specific events
    const onEvent = (event, callback) => {
        useEffect(() => {
            if (!socket) return;
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }, [event, callback]);
    };

    return { socket, isConnected, onEvent };
};
