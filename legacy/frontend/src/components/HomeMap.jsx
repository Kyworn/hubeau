import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
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

const LocationMarker = ({ setPostalCode }) => {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [foundCity, setFoundCity] = useState(null);

    const map = useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            setLoading(true);
            setFoundCity(null);

            try {
                const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const city = feature.properties.city;
                    const postcode = feature.properties.postcode;
                    setFoundCity(`${city} (${postcode})`);
                    setPostalCode(postcode);
                } else {
                    setFoundCity("Aucune adresse trouvée ici.");
                }
            } catch (error) {
                console.error("Erreur geocoding:", error);
                setFoundCity("Erreur lors de la recherche.");
            } finally {
                setLoading(false);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>
                {loading ? "Recherche..." : foundCity}
            </Popup>
        </Marker>
    );
};

const HomeMap = ({ setPostalCode }) => {
    // Center of France
    const center = [46.603354, 1.888334];

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg z-0 relative border border-gray-200 dark:border-gray-700 mt-8">
            <MapContainer
                center={center}
                zoom={6}
                minZoom={3}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setPostalCode={setPostalCode} />
            </MapContainer>
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-2 rounded shadow z-[1000] text-xs text-gray-600 dark:text-gray-300">
                Cliquez sur la carte pour sélectionner une commune
            </div>
        </div>
    );
};

export default HomeMap;
