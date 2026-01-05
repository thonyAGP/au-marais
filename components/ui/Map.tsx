'use client';

import { useState } from 'react';

interface MapProps {
  className?: string;
}

export const Map = ({ className }: MapProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Coordonnées approximatives de la rue François Miron, Paris 4ème
  // 48.8545, 2.3565
  const lat = 48.8545;
  const lng = 2.3565;
  const zoom = 16;

  // OpenStreetMap embed URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={className}>
      <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-stone-200">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-stone-400">Chargement de la carte...</div>
          </div>
        )}
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          style={{ minHeight: '400px' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Carte du quartier"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <p className="text-center text-stone-400 text-xs mt-2">
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-stone-600 transition-colors"
        >
          Voir sur OpenStreetMap →
        </a>
      </p>
    </div>
  );
};
