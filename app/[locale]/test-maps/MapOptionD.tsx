'use client';

import { useState } from 'react';

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

// Convert lat/lng to SVG coordinates
const toSvgCoords = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

export default function MapOptionD({ visitors }: Props) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const svgWidth = 800;
  const svgHeight = 400;
  const paris = toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight);

  return (
    <div className="w-full h-full bg-[#faf8f5] relative overflow-hidden">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
        <defs>
          <filter id="shadowD">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <linearGradient id="goldGradD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8942E" />
          </linearGradient>
        </defs>

        {/* Subtle background pattern */}
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.5" fill="#e0dcd5" />
        </pattern>
        <rect width={svgWidth} height={svgHeight} fill="url(#dots)" />

        {/* Minimal world outline - just continents as subtle shapes */}
        <g fill="#e8e4dd" stroke="none" opacity="0.6">
          {/* North America */}
          <ellipse cx="150" cy="130" rx="80" ry="60" />
          {/* South America */}
          <ellipse cx="200" cy="280" rx="45" ry="80" />
          {/* Europe */}
          <ellipse cx="430" cy="110" rx="50" ry="35" />
          {/* Africa */}
          <ellipse cx="460" cy="230" rx="55" ry="80" />
          {/* Asia */}
          <ellipse cx="620" cy="130" rx="120" ry="70" />
          {/* Australia */}
          <ellipse cx="720" cy="310" rx="50" ry="35" />
        </g>

        {/* Elegant connection lines */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => {
            const dest = toSvgCoords(visitor.lat, visitor.lng, svgWidth, svgHeight);
            const isHovered = hoveredCity === visitor.city;

            return (
              <line
                key={`line-${visitor.city}`}
                x1={paris.x}
                y1={paris.y}
                x2={dest.x}
                y2={dest.y}
                stroke={isHovered ? '#D4AF37' : '#c9a962'}
                strokeWidth={isHovered ? 2 : 1}
                opacity={isHovered ? 0.9 : 0.3}
                className="transition-all duration-300"
              />
            );
          })}

        {/* Paris home - elegant gold marker */}
        <g filter="url(#shadowD)">
          <circle cx={paris.x} cy={paris.y} r={14} fill="url(#goldGradD)" />
          <circle cx={paris.x} cy={paris.y} r={10} fill="white" />
          <circle cx={paris.x} cy={paris.y} r={6} fill="url(#goldGradD)" />
        </g>
        <text
          x={paris.x}
          y={paris.y - 22}
          fill="#1a1a1a"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="serif"
        >
          Paris
        </text>

        {/* Visitor markers - clean dots */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => {
            const pos = toSvgCoords(visitor.lat, visitor.lng, svgWidth, svgHeight);
            const isHovered = hoveredCity === visitor.city;
            const radius = Math.max(5, visitor.count * 1.5 + 4);

            return (
              <g key={visitor.city}>
                {/* Outer ring on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 6}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    opacity={0.5}
                  />
                )}
                {/* Main dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={isHovered ? '#D4AF37' : '#8B7355'}
                  stroke="white"
                  strokeWidth={2}
                  filter="url(#shadowD)"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredCity(visitor.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                />
                {/* Count label */}
                {visitor.count > 1 && (
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    fill="white"
                    fontSize="8"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {visitor.count}
                  </text>
                )}
                {/* City name on hover */}
                {isHovered && (
                  <text
                    x={pos.x}
                    y={pos.y - radius - 10}
                    fill="#1a1a1a"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                    fontFamily="serif"
                  >
                    {visitor.city}
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {/* Elegant tooltip */}
      {hoveredCity && (
        <div className="absolute bottom-4 left-4 bg-white px-5 py-3 rounded-lg shadow-lg border border-[#e0dcd5]">
          <div className="text-[#1a1a1a] font-serif text-lg">{hoveredCity}</div>
          <div className="text-sm text-[#8B7355]">
            {visitors.find((v) => v.city === hoveredCity)?.country}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-[#8B7355]">
        <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
        <span>Au Marais</span>
        <span className="w-3 h-3 rounded-full bg-[#8B7355] ml-3" />
        <span>Visiteurs</span>
      </div>
    </div>
  );
}
