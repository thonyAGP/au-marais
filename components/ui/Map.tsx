'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Monument {
  id: string;
  name: string;
  type: 'home' | 'landmark' | 'museum' | 'restaurant' | 'shopping' | 'metro';
  lat: number;
  lng: number;
  description?: string;
  walkTime?: string;
}

// Coordonnées exactes du 33 rue François Miron, Paris 75004 (via OpenStreetMap Nominatim)
const APARTMENT_COORDS = { lat: 48.8555544, lng: 2.3581927 };

const monuments: Monument[] = [
  // L'appartement - 33 rue François Miron
  {
    id: 'home',
    name: 'Au Marais',
    type: 'home',
    lat: APARTMENT_COORDS.lat,
    lng: APARTMENT_COORDS.lng,
    description: 'Votre location',
  },
  // Monuments
  {
    id: 'place-vosges',
    name: 'Place des Vosges',
    type: 'landmark',
    lat: 48.8555,
    lng: 2.3656,
    description: 'La plus ancienne place de Paris',
    walkTime: '5 min',
  },
  {
    id: 'hotel-ville',
    name: 'Hôtel de Ville',
    type: 'landmark',
    lat: 48.8566,
    lng: 2.3522,
    description: 'Mairie de Paris',
    walkTime: '8 min',
  },
  {
    id: 'notre-dame',
    name: 'Notre-Dame',
    type: 'landmark',
    lat: 48.8530,
    lng: 2.3499,
    description: 'Cathédrale emblématique',
    walkTime: '12 min',
  },
  {
    id: 'pompidou',
    name: 'Centre Pompidou',
    type: 'museum',
    lat: 48.8607,
    lng: 2.3522,
    description: 'Art moderne et contemporain',
    walkTime: '10 min',
  },
  {
    id: 'ile-saint-louis',
    name: 'Île Saint-Louis',
    type: 'landmark',
    lat: 48.8514,
    lng: 2.3568,
    description: 'Île pittoresque de la Seine',
    walkTime: '5 min',
  },
  {
    id: 'musee-picasso',
    name: 'Musée Picasso',
    type: 'museum',
    lat: 48.8598,
    lng: 2.3624,
    description: 'Collection Picasso',
    walkTime: '8 min',
  },
  {
    id: 'musee-carnavalet',
    name: 'Musée Carnavalet',
    type: 'museum',
    lat: 48.8576,
    lng: 2.3622,
    description: 'Histoire de Paris',
    walkTime: '6 min',
  },
  // Shopping
  {
    id: 'bhv',
    name: 'BHV Marais',
    type: 'shopping',
    lat: 48.8571,
    lng: 2.3543,
    description: 'Grand magasin',
    walkTime: '5 min',
  },
  {
    id: 'village-st-paul',
    name: 'Village Saint-Paul',
    type: 'shopping',
    lat: 48.8534,
    lng: 2.3600,
    description: 'Antiquaires et galeries',
    walkTime: '2 min',
  },
  // Métro
  {
    id: 'metro-st-paul',
    name: 'Saint-Paul (M1)',
    type: 'metro',
    lat: 48.8552,
    lng: 2.3608,
    description: 'Ligne 1',
    walkTime: '2 min',
  },
  {
    id: 'metro-pont-marie',
    name: 'Pont Marie (M7)',
    type: 'metro',
    lat: 48.8533,
    lng: 2.3573,
    description: 'Ligne 7',
    walkTime: '4 min',
  },
];

const markerIcons: Record<Monument['type'], { emoji: string; color: string; size: string }> = {
  home: { emoji: '🏠', color: 'bg-gold', size: 'w-10 h-10' },
  landmark: { emoji: '🏛️', color: 'bg-amber-100', size: 'w-8 h-8' },
  museum: { emoji: '🎨', color: 'bg-purple-100', size: 'w-8 h-8' },
  restaurant: { emoji: '🍽️', color: 'bg-orange-100', size: 'w-7 h-7' },
  shopping: { emoji: '🛍️', color: 'bg-pink-100', size: 'w-7 h-7' },
  metro: { emoji: '🚇', color: 'bg-blue-100', size: 'w-6 h-6' },
};

interface MapboxMapProps {
  className?: string;
}

export const MapboxMap = ({ className }: MapboxMapProps) => {
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);
  const [viewState, setViewState] = useState({
    longitude: APARTMENT_COORDS.lng,
    latitude: APARTMENT_COORDS.lat,
    zoom: 14,
  });

  const handleMarkerClick = useCallback((monument: Monument) => {
    setSelectedMonument(monument);
  }, []);

  return (
    <div className={className}>
      <div className="relative w-full h-full min-h-[450px] rounded-lg overflow-hidden border border-stone-200 shadow-lg">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%', minHeight: '450px' }}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />

          {monuments.map((monument) => {
            const { emoji, color, size } = markerIcons[monument.type];
            return (
              <Marker
                key={monument.id}
                longitude={monument.lng}
                latitude={monument.lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(monument);
                }}
              >
                <div
                  className={`${size} ${color} rounded-full flex items-center justify-center cursor-pointer shadow-md border-2 border-white hover:scale-110 transition-transform ${
                    monument.type === 'home' ? 'ring-2 ring-gold ring-offset-2 animate-pulse' : ''
                  }`}
                  title={monument.name}
                >
                  <span className={monument.type === 'home' ? 'text-lg' : 'text-sm'}>
                    {emoji}
                  </span>
                </div>
              </Marker>
            );
          })}

          {selectedMonument && (
            <Popup
              longitude={selectedMonument.lng}
              latitude={selectedMonument.lat}
              anchor="bottom"
              onClose={() => setSelectedMonument(null)}
              closeButton={true}
              closeOnClick={false}
              className="mapbox-popup"
            >
              <div className="p-1">
                <h3 className="font-serif text-base text-text font-semibold">
                  {selectedMonument.name}
                </h3>
                {selectedMonument.description && (
                  <p className="text-text-muted text-xs mt-1">
                    {selectedMonument.description}
                  </p>
                )}
                {selectedMonument.walkTime && (
                  <p className="text-gold text-xs font-medium mt-1">
                    🚶 {selectedMonument.walkTime} à pied
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 bg-gold rounded-full flex items-center justify-center text-[10px]">🏠</span>
          Appartement
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-[10px]">🏛️</span>
          Monuments
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px]">🎨</span>
          Musées
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-[10px]">🛍️</span>
          Shopping
        </span>
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">🚇</span>
          Métro
        </span>
      </div>
    </div>
  );
};

// Keep the old component name for backward compatibility
export { MapboxMap as Map };
