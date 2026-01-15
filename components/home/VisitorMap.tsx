'use client';

import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { useState, useEffect, useCallback, useRef } from 'react';

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

// Country coordinates for markers
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
};

interface GuestData {
  country: string;
  checkin: string;
}

interface ApiResponse {
  guests: GuestData[];
  countrySummary: Record<string, number>;
}

export const VisitorMap = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [illuminatedCountries, setIlluminatedCountries] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [hasAnimationStarted, setHasAnimationStarted] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const paris = { lat: 48.8566, lng: 2.3522 };

  // Fetch data from API
  useEffect(() => {
    fetch('/api/visitors')
      .then(res => res.json())
      .then((apiData: ApiResponse) => {
        setData(apiData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-start animation when map becomes visible in viewport
  useEffect(() => {
    if (!data || loading || hasAnimationStarted) return;

    const mapElement = mapContainerRef.current;
    if (!mapElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Map is now visible - start animation
          setHasAnimationStarted(true);
          observer.disconnect();
          // Small delay before starting animation
          setTimeout(() => {
            setIsPlaying(true);
          }, 300);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: '0px'
      }
    );

    observer.observe(mapElement);

    return () => observer.disconnect();
  }, [data, loading, hasAnimationStarted]);

  // Get unique countries in chronological order (for animation)
  const chronologicalCountries = data?.guests
    ? [...data.guests]
        .filter(g => g.checkin)
        .sort((a, b) => new Date(a.checkin).getTime() - new Date(b.checkin).getTime())
        .reduce((acc, guest) => {
          if (!acc.find(g => g.country === guest.country)) {
            acc.push(guest);
          }
          return acc;
        }, [] as GuestData[])
    : [];

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
    }, 600);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, chronologicalCountries]);

  // Control functions
  const handlePlay = () => {
    if (currentIndex >= chronologicalCountries.length) {
      setIlluminatedCountries(new Set());
      setCurrentIndex(0);
    }
    setIsPlaying(true);
    setShowAllConnections(false);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setIlluminatedCountries(new Set());
    setCurrentIndex(0);
    setShowAllConnections(true);
  };

  const handleShowAll = () => {
    if (data) {
      setIlluminatedCountries(new Set(Object.keys(data.countrySummary)));
      setCurrentIndex(chronologicalCountries.length);
      setIsPlaying(false);
      setShowAllConnections(true);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#111]">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-[#D4AF37]">Chargement de la carte...</div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const totalVisitors = data.guests.length;
  const totalCountries = Object.keys(data.countrySummary).length;

  // Countries to show connections for
  const visibleCountries = showAllConnections
    ? Object.keys(data.countrySummary)
    : Array.from(illuminatedCountries);

  return (
    <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#111]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Nos Visiteurs du Monde Entier
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Découvrez d&apos;où viennent nos hôtes qui ont séjourné Au Marais
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-8">
          <div className="text-center">
            <div className="text-4xl font-serif text-[#D4AF37]">{totalVisitors}</div>
            <div className="text-sm text-neutral-500 uppercase tracking-wider">Visiteurs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#D4AF37]">{totalCountries}</div>
            <div className="text-sm text-neutral-500 uppercase tracking-wider">Pays</div>
          </div>
        </div>

        {/* Map Container */}
        <div ref={mapContainerRef} className="relative rounded-xl overflow-hidden border border-neutral-700/50 mb-6 shadow-2xl bg-[#0c1929]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 130,
              center: [10, 35],
            }}
            style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
          >
            {/* Countries with illumination */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name;
                  const isIlluminated = isCountryIlluminated(geoName);

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
            {visibleCountries.map((country) => {
              const coords = countryCoords[country];
              if (!coords) return null;

              return (
                <Line
                  key={`line-${country}`}
                  from={[paris.lng, paris.lat]}
                  to={[coords.lng, coords.lat]}
                  stroke="#D4AF37"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeOpacity={0.5}
                />
              );
            })}

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

            {/* Country markers */}
            {visibleCountries.map((country) => {
              const coords = countryCoords[country];
              if (!coords) return null;

              return (
                <Marker key={`marker-${country}`} coordinates={[coords.lng, coords.lat]}>
                  <circle
                    r={6}
                    fill="#D4AF37"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Animation Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#D4AF37]/30">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="px-3 py-1.5 bg-[#D4AF37] text-black font-medium rounded text-sm hover:bg-[#e5c555] transition-colors"
                >
                  ▶ Animer
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-3 py-1.5 bg-[#D4AF37] text-black font-medium rounded text-sm hover:bg-[#e5c555] transition-colors"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-2 py-1.5 border border-[#D4AF37]/50 text-[#D4AF37] rounded text-sm hover:bg-[#D4AF37]/10 transition-colors"
              >
                ↺
              </button>
              <button
                onClick={handleShowAll}
                className="px-2 py-1.5 border border-[#D4AF37]/50 text-[#D4AF37] rounded text-sm hover:bg-[#D4AF37]/10 transition-colors"
              >
                Tout
              </button>
            </div>

            <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#D4AF37]/30">
              <span className="text-[#D4AF37] font-medium text-sm">
                {illuminatedCountries.size} / {totalCountries} pays
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
        </div>

        {/* Country list */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(data.countrySummary)
            .sort((a, b) => b[1] - a[1])
            .map(([country, count]) => (
              <div
                key={country}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  illuminatedCountries.has(country)
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50'
                    : 'bg-[#151525] border-neutral-700/50'
                }`}
                onMouseEnter={() => setHoveredCountry(country)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <span className="text-neutral-200">{country}</span>
                <span className={`font-semibold ${illuminatedCountries.has(country) ? 'text-[#D4AF37]' : 'text-[#D4AF37]/50'}`}>
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
