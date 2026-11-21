import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

export interface Pin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  sub?: string;
  to?: string;
  main?: boolean;
}

const icon = (main?: boolean) => L.divIcon({ className: '', html: `<span class="map-pin${main ? ' is-main' : ''}"></span>`, iconSize: main ? [26, 26] : [18, 18], iconAnchor: main ? [13, 13] : [9, 9] });

function Fit({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pins.length) return;
    if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 11);
    else map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 11 });
  }, [pins, map]);
  return null;
}

/** Interactive OpenStreetMap map. No API key needed. */
export default function MapView({ pins, className, height = 460 }: { pins: Pin[]; className?: string; height?: number }) {
  return (
    <div className={className} style={{ height }}>
      <MapContainer center={[24.9, 91.87]} zoom={9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} attributionControl>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Fit pins={pins} />
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon(p.main)} title={p.title}>
            <Popup>
              <strong>{p.title}</strong>
              {p.sub && <div style={{ opacity: 0.7 }}>{p.sub}</div>}
              {p.to && (
                <div style={{ marginTop: 6 }}>
                  <Link to={p.to}>Open guide</Link>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
