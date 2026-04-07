import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';
import { useSocket } from '../context/SocketContext';

export function useGeolocation(orderId?: string, isRunnerActive?: boolean) {
    const { socket } = useSocket();
    const [position, setPosition] = useState<Position | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let watchId: string | null = null;

        const startTracking = async () => {
            if (!isRunnerActive || !orderId || !socket) return;
            try {
                const permissions = await Geolocation.checkPermissions();
                if (permissions.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') {
                        setError('Location permission denied');
                        return;
                    }
                }

                watchId = await Geolocation.watchPosition({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }, (pos, err) => {
                    if (err) {
                        setError(err.message);
                        return;
                    }
                    if (pos) {
                        setPosition(pos);
                        socket.emit('runner:update_location', {
                            orderId,
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                    }
                });
            } catch (err: any) {
                setError(err.message);
            }
        };

        startTracking();

        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch({ id: watchId });
            }
        };
    }, [isRunnerActive, orderId, socket]);

    return { position, error };
}
