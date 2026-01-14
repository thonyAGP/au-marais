'use client';

import { useEffect, useState } from 'react';

interface GuestLocation {
  name: string;
  city: string | null;
  country: string;
  checkin: string;
}

interface CountrySummary {
  [country: string]: number;
}

// Country coordinates for map markers (approximate center points)
const countryCoords: Record<string, { lat: number; lng: number }> = {
  'United States': { lat: 37.0902, lng: -95.7129 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Spain': { lat: 40.4637, lng: -3.7492 },
  'Netherlands': { lat: 52.1326, lng: 5.2913 },
  'Israel': { lat: 31.0461, lng: 34.8516 },
  'New Zealand': { lat: -40.9006, lng: 174.886 },
  'Norway': { lat: 60.472, lng: 8.4689 },
  'Colombia': { lat: 4.5709, lng: -74.2973 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'Italy': { lat: 41.8719, lng: 12.5674 },
  'United Kingdom': { lat: 55.3781, lng: -3.436 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Brazil': { lat: -14.235, lng: -51.9253 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'China': { lat: 35.8617, lng: 104.1954 },
  'Mexico': { lat: 23.6345, lng: -102.5528 },
  'Argentina': { lat: -38.4161, lng: -63.6167 },
  'Portugal': { lat: 39.3999, lng: -8.2245 },
  'Belgium': { lat: 50.5039, lng: 4.4699 },
  'Switzerland': { lat: 46.8182, lng: 8.2275 },
};

// Convert lat/lng to SVG coordinates (simple equirectangular projection)
const toSvgCoords = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

export const VisitorMap = () => {
  const [guests, setGuests] = useState<GuestLocation[]>([]);
  const [summary, setSummary] = useState<CountrySummary>({});
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/visitors')
      .then(res => res.json())
      .then(data => {
        setGuests(data.guests || []);
        setSummary(data.countrySummary || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalVisitors = guests.length;
  const totalCountries = Object.keys(summary).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gold-400">Chargement...</div>
      </div>
    );
  }

  const svgWidth = 800;
  const svgHeight = 400;

  return (
    <section className="py-20 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Nos Visiteurs du Monde Entier
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Découvrez d&apos;où viennent nos hôtes qui ont séjourné Au Marais
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-12">
          <div className="text-center">
            <div className="text-4xl font-serif text-gold-400">{totalVisitors}</div>
            <div className="text-sm text-neutral-500 uppercase tracking-wider">Visiteurs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-gold-400">{totalCountries}</div>
            <div className="text-sm text-neutral-500 uppercase tracking-wider">Pays</div>
          </div>
        </div>

        {/* Map */}
        <div className="relative bg-[#111] rounded-lg overflow-hidden border border-neutral-800 mb-8">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          >
            {/* World map background (simplified) */}
            <rect width={svgWidth} height={svgHeight} fill="#0a0a0a" />

            {/* Grid lines */}
            {[...Array(7)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={(i + 1) * (svgHeight / 8)}
                x2={svgWidth}
                y2={(i + 1) * (svgHeight / 8)}
                stroke="#222"
                strokeWidth="0.5"
              />
            ))}
            {[...Array(11)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={(i + 1) * (svgWidth / 12)}
                y1={0}
                x2={(i + 1) * (svgWidth / 12)}
                y2={svgHeight}
                stroke="#222"
                strokeWidth="0.5"
              />
            ))}

            {/* Paris marker (home) */}
            <g>
              <circle
                cx={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).x}
                cy={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).y}
                r={8}
                fill="#D4AF37"
                className="animate-pulse"
              />
              <text
                x={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).x}
                y={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).y - 12}
                fill="#D4AF37"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                PARIS
              </text>
            </g>

            {/* Country markers with connecting lines */}
            {Object.entries(summary).map(([country, count]) => {
              const coords = countryCoords[country];
              if (!coords) return null;

              const { x, y } = toSvgCoords(coords.lat, coords.lng, svgWidth, svgHeight);
              const parisCoords = toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight);
              const isHovered = hoveredCountry === country;

              return (
                <g key={country}>
                  {/* Connection line to Paris */}
                  <line
                    x1={parisCoords.x}
                    y1={parisCoords.y}
                    x2={x}
                    y2={y}
                    stroke={isHovered ? '#D4AF37' : '#333'}
                    strokeWidth={isHovered ? 1.5 : 0.5}
                    strokeDasharray={isHovered ? '0' : '4,4'}
                    opacity={isHovered ? 1 : 0.5}
                  />

                  {/* Marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(4, Math.min(count * 2 + 3, 12))}
                    fill={isHovered ? '#D4AF37' : '#8B7355'}
                    stroke="#D4AF37"
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />

                  {/* Count badge */}
                  {count > 1 && (
                    <text
                      x={x}
                      y={y + 4}
                      fill="white"
                      fontSize="8"
                      textAnchor="middle"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredCountry && (
            <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 rounded border border-gold-400/30">
              <div className="text-gold-400 font-serif">{hoveredCountry}</div>
              <div className="text-sm text-neutral-400">
                {summary[hoveredCountry]} visiteur{summary[hoveredCountry] > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Country list */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary)
            .sort((a, b) => b[1] - a[1])
            .map(([country, count]) => (
              <div
                key={country}
                className="flex items-center justify-between px-4 py-3 bg-[#111] rounded border border-neutral-800 hover:border-gold-400/30 transition-colors"
                onMouseEnter={() => setHoveredCountry(country)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <span className="text-neutral-300">{country}</span>
                <span className="text-gold-400 font-semibold">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default VisitorMap;
