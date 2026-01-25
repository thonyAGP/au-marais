'use client';

import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { useState, useEffect, useCallback } from 'react';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Country name mapping (TopoJSON uses different names)
const countryNameMap: Record<string, string[]> = {
  'United States': ['United States of America', 'USA'],
  'Netherlands': ['Netherlands'],
  'France': ['France'],
  'Spain': ['Spain'],
  'Canada': ['Canada'],
  'Israel': ['Israel'],
  'New Zealand': ['New Zealand'],
  'Norway': ['Norway'],
  'Colombia': ['Colombia'],
  'Germany': ['Germany'],
  'Italy': ['Italy'],
  'United Kingdom': ['United Kingdom'],
  'Australia': ['Australia'],
};

interface Visitor {
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  isHome?: boolean;
  checkin?: string;
}

interface Props {
  visitors: Visitor[];
}

export default function MapOptionE({ visitors }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [illuminatedCountries, setIlluminatedCountries] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllConnections, setShowAllConnections] = useState(true);

  const paris = { lat: 48.8566, lng: 2.3522 };

  // Sort visitors by checkin date
  const sortedVisitors = [...visitors]
    .filter(v => !v.isHome && v.checkin)
    .sort((a, b) => new Date(a.checkin!).getTime() - new Date(b.checkin!).getTime());

  // Get unique countries in chronological order
  const chronologicalCountries = sortedVisitors.reduce((acc, visitor) => {
    if (!acc.find(v => v.country === visitor.country)) {
      acc.push(visitor);
    }
    return acc;
  }, [] as Visitor[]);

  // Check if a country should be illuminated
  const isCountryIlluminated = useCallback((geoName: string) => {
    for (const [visitorCountry, geoNames] of Object.entries(countryNameMap)) {
      if (geoNames.includes(geoName) || geoName === visitorCountry) {
        if (illuminatedCountries.has(visitorCountry)) {
          return true;
        }
      }
    }
    return illuminatedCountries.has(geoName);
  }, [illuminatedCountries]);

  // Animation effect
  useEffect(() => {
    if (!isPlaying) return;

    if (currentIndex >= chronologicalCountries.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const country = chronologicalCountries[currentIndex].country;
      setIlluminatedCountries(prev => new Set([...prev, country]));
      setCurrentIndex(prev => prev + 1);
    }, 800); // 800ms between each country

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, chronologicalCountries]);

  // Start animation
  const handlePlay = () => {
    if (currentIndex >= chronologicalCountries.length) {
      // Reset if finished
      setIlluminatedCountries(new Set());
      setCurrentIndex(0);
    }
    setIsPlaying(true);
    setShowAllConnections(false);
  };

  // Pause animation
  const handlePause = () => {
    setIsPlaying(false);
  };

  // Reset animation
  const handleReset = () => {
    setIsPlaying(false);
    setIlluminatedCountries(new Set());
    setCurrentIndex(0);
    setShowAllConnections(true);
  };

  // Show all countries immediately
  const handleShowAll = () => {
    const allCountries = new Set(visitors.filter(v => !v.isHome).map(v => v.country));
    setIlluminatedCountries(allCountries);
    setCurrentIndex(chronologicalCountries.length);
    setIsPlaying(false);
    setShowAllConnections(true);
  };

  // Get visitors for illuminated countries only (for connections)
  const visibleVisitors = showAllConnections
    ? visitors.filter(v => !v.isHome)
    : visitors.filter(v => !v.isHome && illuminatedCountries.has(v.country));

  return (
    <div className="w-full h-full bg-[#0c1929] relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [10, 30],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Countries with illumination */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoName = geo.properties.name;
              const isIlluminated = isCountryIlluminated(geoName);
              const isHovered = hoveredCountry === geoName;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isIlluminated ? '#D4AF37' : '#1a3a5c'}
                  stroke={isIlluminated ? '#f0d78c' : '#2a4a6c'}
                  strokeWidth={isIlluminated ? 1 : 0.5}
                  style={{
                    default: {
                      outline: 'none',
                      transition: 'all 0.5s ease-in-out',
                    },
                    hover: {
                      fill: isIlluminated ? '#e5c555' : '#2a4a6c',
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => setHoveredCountry(geoName)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
              );
            })
          }
        </Geographies>

        {/* Connection lines to Paris */}
        {visibleVisitors.map((visitor) => (
          <Line
            key={`line-${visitor.city}-${visitor.country}`}
            from={[paris.lng, paris.lat]}
            to={[visitor.lng, visitor.lat]}
            stroke="#D4AF37"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeOpacity={0.6}
            style={{
              transition: 'all 0.5s ease-in-out',
            }}
          />
        ))}

        {/* Paris marker */}
        <Marker coordinates={[paris.lng, paris.lat]}>
          <circle r={10} fill="#D4AF37" className="animate-pulse" />
          <circle r={6} fill="#0c1929" />
          <circle r={4} fill="#D4AF37" />
          <text
            y={-18}
            textAnchor="middle"
            fill="#D4AF37"
            fontSize={11}
            fontWeight="bold"
          >
            AU MARAIS
          </text>
        </Marker>

        {/* City markers for visible visitors */}
        {visibleVisitors.map((visitor) => (
          <Marker
            key={`marker-${visitor.city}`}
            coordinates={[visitor.lng, visitor.lat]}
          >
            <circle
              r={6}
              fill="#D4AF37"
              stroke="#fff"
              strokeWidth={2}
              style={{ transition: 'all 0.3s' }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        {/* Animation controls */}
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#D4AF37]/30">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded hover:bg-[#e5c555] transition-colors"
            >
              ▶ {currentIndex > 0 && currentIndex < chronologicalCountries.length ? 'Continuer' : 'Animer'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded hover:bg-[#e5c555] transition-colors"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-3 py-2 border border-[#D4AF37]/50 text-[#D4AF37] rounded hover:bg-[#D4AF37]/10 transition-colors"
          >
            ↺ Reset
          </button>
          <button
            onClick={handleShowAll}
            className="px-3 py-2 border border-[#D4AF37]/50 text-[#D4AF37] rounded hover:bg-[#D4AF37]/10 transition-colors"
          >
            Tout afficher
          </button>
        </div>

        {/* Progress indicator */}
        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#D4AF37]/30">
          <span className="text-[#D4AF37] font-medium">
            {illuminatedCountries.size} / {new Set(visitors.filter(v => !v.isHome).map(v => v.country)).size} pays
          </span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCountry && (
        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#D4AF37]/40 shadow-xl">
          <div className="text-[#D4AF37] font-serif">{hoveredCountry}</div>
          {isCountryIlluminated(hoveredCountry) && (
            <div className="text-sm text-green-400">✓ Visité</div>
          )}
        </div>
      )}

      {/* Timeline indicator during animation */}
      {isPlaying && currentIndex > 0 && currentIndex <= chronologicalCountries.length && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#D4AF37]/40">
          <div className="text-sm text-neutral-400">Dernier séjour</div>
          <div className="text-[#D4AF37] font-serif">
            {chronologicalCountries[currentIndex - 1]?.country}
          </div>
          <div className="text-xs text-neutral-500">
            {chronologicalCountries[currentIndex - 1]?.checkin}
          </div>
        </div>
      )}
    </div>
  );
}
