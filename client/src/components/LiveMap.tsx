import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons not appearing in production
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocation {
    lat: number;
    lng: number;
    label: string;
    type: 'vendor' | 'student' | 'runner';
}

interface LiveMapProps {
    locations: MapLocation[];
    height?: string;
    className?: string;
}

export const LiveMap = ({ locations, height = '400px', className }: LiveMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
            center: [25.123, 55.223], // Default campus-like coords (Dubai area)
            zoom: 16,
            zoomControl: false,
            attributionControl: false,
        });

        // Add Dark Mode Tile Layer (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
        }).addTo(mapInstance.current);

        // Add custom markers with pulsing and animations
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear existing markers
        mapInstance.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstance.current?.removeLayer(layer);
            }
        });

        // Add new markers
        locations.forEach((loc) => {
            const icon = L.divIcon({
                className: `custom-map-marker marker-${loc.type}`,
                html: `<div class="marker-pin"><div class="marker-dot"></div></div><div class="marker-label">${loc.label}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            L.marker([loc.lat, loc.lng], { icon }).addTo(mapInstance.current!);
        });

        // Fit bounds if there are locations
        if (locations.length > 0) {
            const group = L.featureGroup(locations.map(l => L.marker([l.lat, l.lng])));
            mapInstance.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    }, [locations]);

    return (
        <div 
            ref={mapRef} 
            className={`live-map-container glass ${className}`} 
            style={{ 
                height, 
                width: '100%', 
                borderRadius: '24px', 
                overflow: 'hidden',
                border: '1px solid var(--border)'
            }} 
        />
    );
};
