import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ data }) => {
    // Filter data to only include items with coordinates
    const validData = data.filter(item => item.latitude && item.longitude);

    if (validData.length === 0) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Aucune donnée de géolocalisation disponible.</div>;
    }

    // Group by coordinates to avoid stacking markers
    const locations = {};
    validData.forEach(item => {
        const key = `${item.latitude},${item.longitude}`;
        if (!locations[key]) {
            locations[key] = {
                lat: item.latitude,
                lng: item.longitude,
                count: 0,
                lastDate: item.date_prelevement
            };
        }
        locations[key].count++;
        if (new Date(item.date_prelevement) > new Date(locations[key].lastDate)) {
            locations[key].lastDate = item.date_prelevement;
        }
    });

    // Calculate center
    const lats = validData.map(d => d.latitude);
    const lngs = validData.map(d => d.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg z-10 relative border border-gray-200 dark:border-gray-700">
            <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {Object.values(locations).map((loc, idx) => (
                    <Marker key={idx} position={[loc.lat, loc.lng]}>
                        <Popup>
                            <div className="text-sm">
                                <strong>Point de prélèvement</strong><br />
                                {loc.count} analyses<br />
                                Dernier prélèvement: {new Date(loc.lastDate).toLocaleDateString()}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
