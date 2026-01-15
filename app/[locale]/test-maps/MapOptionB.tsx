'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Visitor {
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  isHome?: boolean;
}

interface Props {
  visitors: Visitor[];
}

// Custom marker icons
const createIcon = (color: string, size: number = 10) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size * 2}px;
      height: ${size * 2}px;
      background: ${color};
      border: 2px solid #D4AF37;
      border-radius: 50%;
      box-shadow: 0 0 10px ${color}50;
    "></div>`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });

const parisIcon = L.divIcon({
  className: 'paris-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #D4AF37;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 20px #D4AF37;
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapOptionB({ visitors }: Props) {
  const [mounted, setMounted] = useState(false);
  const paris: [number, number] = [48.8566, 2.3522];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-[#1a1a2e]" />;
  }

  return (
    <div className="w-full h-full relative">
      <style jsx global>{`
        .leaflet-container {
          background: #1a1a2e;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border: 1px solid #D4AF37;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #D4AF37;
        }
        .leaflet-popup-content {
          margin: 10px 14px;
        }
      `}</style>

      <MapContainer
        center={[30, 10]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* Dark tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Connection lines */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => (
            <Polyline
              key={`line-${visitor.city}`}
              positions={[paris, [visitor.lat, visitor.lng]]}
              color="#D4AF37"
              weight={1}
              opacity={0.4}
              dashArray="5, 10"
            />
          ))}

        {/* Paris marker */}
        <Marker position={paris} icon={parisIcon}>
          <Popup>
            <div className="text-center">
              <strong className="text-[#D4AF37]">Au Marais</strong>
              <br />
              <span className="text-sm">Paris, France</span>
            </div>
          </Popup>
        </Marker>

        {/* Visitor markers */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => (
            <Marker
              key={visitor.city}
              position={[visitor.lat, visitor.lng]}
              icon={createIcon('#6b8cae', Math.max(5, visitor.count * 2 + 4))}
            >
              <Popup>
                <div className="text-center">
                  <strong className="text-[#D4AF37]">{visitor.city}</strong>
                  <br />
                  <span className="text-sm">{visitor.country}</span>
                  <br />
                  <span className="text-xs text-neutral-400">
                    {visitor.count} visiteur{visitor.count > 1 ? 's' : ''}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
