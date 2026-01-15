'use client';

import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { useState } from 'react';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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

export default function MapOptionA({ visitors }: Props) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const paris = { lat: 48.8566, lng: 2.3522 };

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
        {/* Countries */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1a3a5c"
                stroke="#2a4a6c"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#2a4a6c', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Connection lines to Paris */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => (
            <Line
              key={`line-${visitor.city}`}
              from={[paris.lng, paris.lat]}
              to={[visitor.lng, visitor.lat]}
              stroke={hoveredCity === visitor.city ? '#D4AF37' : '#4a6fa5'}
              strokeWidth={hoveredCity === visitor.city ? 2 : 1}
              strokeLinecap="round"
              strokeDasharray={hoveredCity === visitor.city ? '0' : '4 4'}
              strokeOpacity={hoveredCity === visitor.city ? 1 : 0.4}
            />
          ))}

        {/* Visitor markers */}
        {visitors.map((visitor) => (
          <Marker
            key={visitor.city}
            coordinates={[visitor.lng, visitor.lat]}
            onMouseEnter={() => setHoveredCity(visitor.city)}
            onMouseLeave={() => setHoveredCity(null)}
          >
            {visitor.isHome ? (
              // Paris marker
              <>
                <circle r={8} fill="#D4AF37" className="animate-pulse" />
                <text
                  y={-14}
                  textAnchor="middle"
                  fill="#D4AF37"
                  fontSize={10}
                  fontWeight="bold"
                >
                  PARIS
                </text>
              </>
            ) : (
              // Visitor markers
              <>
                <circle
                  r={Math.max(4, visitor.count * 2 + 3)}
                  fill={hoveredCity === visitor.city ? '#D4AF37' : '#6b8cae'}
                  stroke="#D4AF37"
                  strokeWidth={hoveredCity === visitor.city ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                />
                {visitor.count > 1 && (
                  <text
                    y={3}
                    textAnchor="middle"
                    fill="white"
                    fontSize={8}
                    fontWeight="bold"
                  >
                    {visitor.count}
                  </text>
                )}
              </>
            )}
          </Marker>
        ))}
      </ComposableMap>

      {/* Tooltip */}
      {hoveredCity && (
        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#D4AF37]/40 shadow-xl">
          <div className="text-[#D4AF37] font-serif">{hoveredCity}</div>
          <div className="text-sm text-neutral-300">
            {visitors.find((v) => v.city === hoveredCity)?.country}
          </div>
        </div>
      )}
    </div>
  );
}
