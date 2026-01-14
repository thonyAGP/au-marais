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
    <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#111]">
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

        {/* Map Container */}
        <div className="relative rounded-xl overflow-hidden border border-neutral-700/50 mb-8 shadow-2xl">
          {/* Background with world map image */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect fill='%23151515' width='800' height='400'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
            }}
          />

          {/* SVG Map */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="relative w-full h-auto"
            style={{ maxHeight: '450px' }}
          >
            {/* Gradient background */}
            <defs>
              <linearGradient id="mapBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#16213e" />
              </linearGradient>
              <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0c1929" />
                <stop offset="50%" stopColor="#112240" />
                <stop offset="100%" stopColor="#0c1929" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Ocean background */}
            <rect width={svgWidth} height={svgHeight} fill="url(#oceanGradient)" />

            {/* Simplified world continents */}
            <g fill="#2a3f5f" stroke="#3d5a80" strokeWidth="0.5" opacity="0.8">
              {/* North America */}
              <path d="M120,80 L180,60 L220,80 L240,100 L230,140 L200,160 L160,180 L120,170 L100,140 L90,100 Z" />
              <path d="M140,180 L180,200 L160,240 L120,220 Z" />

              {/* South America */}
              <path d="M180,220 L220,210 L240,250 L230,300 L200,340 L160,320 L150,280 L160,240 Z" />

              {/* Europe */}
              <path d="M380,70 L440,60 L460,80 L450,110 L420,130 L380,120 L370,90 Z" />

              {/* Africa */}
              <path d="M400,140 L460,130 L490,160 L500,220 L480,280 L440,300 L400,280 L380,220 L390,160 Z" />

              {/* Asia */}
              <path d="M480,50 L600,40 L700,60 L720,100 L700,140 L650,160 L580,150 L520,130 L480,100 Z" />
              <path d="M520,130 L560,160 L540,200 L500,180 L510,150 Z" />

              {/* Australia */}
              <path d="M640,260 L700,250 L720,280 L710,320 L660,330 L630,300 Z" />

              {/* Indonesia/SE Asia */}
              <path d="M600,200 L660,190 L680,210 L650,230 L610,220 Z" />
            </g>

            {/* Subtle grid lines */}
            <g stroke="#ffffff" strokeWidth="0.3" opacity="0.05">
              {[...Array(7)].map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={(i + 1) * (svgHeight / 8)}
                  x2={svgWidth}
                  y2={(i + 1) * (svgHeight / 8)}
                />
              ))}
              {[...Array(11)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={(i + 1) * (svgWidth / 12)}
                  y1={0}
                  x2={(i + 1) * (svgWidth / 12)}
                  y2={svgHeight}
                />
              ))}
            </g>

            {/* Paris marker (home) - with glow effect */}
            <g filter="url(#glow)">
              <circle
                cx={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).x}
                cy={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).y}
                r={10}
                fill="#D4AF37"
                className="animate-pulse"
              />
            </g>
            <text
              x={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).x}
              y={toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight).y - 16}
              fill="#D4AF37"
              fontSize="11"
              textAnchor="middle"
              fontWeight="bold"
              style={{ textShadow: '0 0 10px rgba(212,175,55,0.5)' }}
            >
              PARIS
            </text>

            {/* Country markers with connecting lines */}
            {Object.entries(summary).map(([country, count]) => {
              const coords = countryCoords[country];
              if (!coords) return null;

              const { x, y } = toSvgCoords(coords.lat, coords.lng, svgWidth, svgHeight);
              const parisCoords = toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight);
              const isHovered = hoveredCountry === country;

              return (
                <g key={country}>
                  {/* Connection line to Paris - curved arc */}
                  <path
                    d={`M ${parisCoords.x} ${parisCoords.y} Q ${(parisCoords.x + x) / 2} ${Math.min(parisCoords.y, y) - 30} ${x} ${y}`}
                    fill="none"
                    stroke={isHovered ? '#D4AF37' : '#4a6fa5'}
                    strokeWidth={isHovered ? 2 : 1}
                    opacity={isHovered ? 1 : 0.4}
                    className="transition-all duration-300"
                  />

                  {/* Marker with glow on hover */}
                  <g filter={isHovered ? 'url(#glow)' : undefined}>
                    <circle
                      cx={x}
                      cy={y}
                      r={Math.max(5, Math.min(count * 2 + 4, 14))}
                      fill={isHovered ? '#D4AF37' : '#6b8cae'}
                      stroke="#D4AF37"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredCountry(country)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    />
                  </g>

                  {/* Count badge */}
                  {count > 1 && (
                    <text
                      x={x}
                      y={y + 4}
                      fill="white"
                      fontSize="9"
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
            <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm px-5 py-3 rounded-lg border border-gold-400/40 shadow-xl">
              <div className="text-gold-400 font-serif text-lg">{hoveredCountry}</div>
              <div className="text-sm text-neutral-300">
                {summary[hoveredCountry]} visiteur{summary[hoveredCountry] > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Country list - Cards style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(summary)
            .sort((a, b) => b[1] - a[1])
            .map(([country, count]) => (
              <div
                key={country}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  hoveredCountry === country
                    ? 'bg-gold-400/10 border-gold-400/50 scale-105'
                    : 'bg-[#151525] border-neutral-700/50 hover:border-gold-400/30'
                }`}
                onMouseEnter={() => setHoveredCountry(country)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <span className="text-neutral-200">{country}</span>
                <span className={`font-semibold ${hoveredCountry === country ? 'text-gold-400' : 'text-gold-400/70'}`}>
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default VisitorMap;
