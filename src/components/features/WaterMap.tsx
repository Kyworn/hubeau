import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// For hooks, we need to import them directly from react-leaflet but only use them in client-side components
import { useMapEvents } from 'react-leaflet';

interface LocationMarkerProps {
  onCitySelect: (postalCode: string) => void;
}

function LocationMarker({ onCitySelect }: LocationMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // @ts-ignore
  useMapEvents({
    click: async (e: any) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLoading(true);
      setCityName(null);

      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const city = feature.properties.city;
          const postcode = feature.properties.postcode;
          setCityName(`${city} (${postcode})`);
          onCitySelect(postcode);
        } else {
          setCityName("Aucune adresse trouvée.");
        }
      } catch (error) {
        setCityName("Erreur de recherche.");
      } finally {
        setLoading(false);
      }
    },
  });

  if (!position) return null;

  return (
    // @ts-ignore
    <Marker position={position}>
      {/* @ts-ignore */}
      <Popup>
        <div className="text-sm font-medium">
          {loading ? "Recherche..." : cityName}
        </div>
      </Popup>
    </Marker>
  );
}

interface WaterMapProps {
  center?: [number, number];
  zoom?: number;
  onCitySelect?: (postalCode: string) => void;
}

export function WaterMap({ center = [46.603354, 1.888334], zoom = 6, onCitySelect }: WaterMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  if (!isMounted) return <div className="h-[500px] w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-3xl" />;

  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onCitySelect && <LocationMarker onCitySelect={onCitySelect} />}
      </MapContainer>
      <div className="absolute bottom-6 left-6 z-[1000] glass px-4 py-2 rounded-full text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Cliquez sur la carte pour choisir une commune
      </div>
    </div>
  );
}
