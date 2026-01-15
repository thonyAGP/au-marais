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

// Convert lat/lng to SVG coordinates (Mercator-like projection)
const toSvgCoords = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  // Mercator-like Y projection for better proportions
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (width * mercN) / (2 * Math.PI);
  return { x, y: Math.max(20, Math.min(height - 20, y)) };
};

export default function MapOptionC({ visitors }: Props) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const svgWidth = 900;
  const svgHeight = 450;
  const paris = toSvgCoords(48.8566, 2.3522, svgWidth, svgHeight);

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0a0f1a] to-[#0f172a] relative overflow-hidden">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
        <defs>
          {/* Gradient for ocean */}
          <linearGradient id="oceanGradientC" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="50%" stopColor="#0f1f3a" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>

          {/* Glow effect */}
          <filter id="glowC" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Land gradient */}
          <linearGradient id="landGradientC" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a3f5f" />
            <stop offset="100%" stopColor="#1a2f4f" />
          </linearGradient>
        </defs>

        {/* Ocean background */}
        <rect width={svgWidth} height={svgHeight} fill="url(#oceanGradientC)" />

        {/* Detailed continents SVG paths */}
        <g fill="url(#landGradientC)" stroke="#3d5a80" strokeWidth="0.5">
          {/* North America */}
          <path d="M50,120 L80,90 L120,80 L160,75 L200,85 L230,100 L250,90 L270,95 L280,110 L270,130 L260,150 L240,165 L220,175 L200,185 L180,195 L160,200 L140,210 L120,205 L100,195 L90,180 L70,165 L60,145 L50,130 Z" />
          {/* Greenland */}
          <path d="M280,50 L320,45 L340,55 L350,75 L340,95 L310,100 L290,90 L280,70 Z" />
          {/* Central America */}
          <path d="M140,210 L160,215 L180,230 L175,250 L160,260 L145,255 L135,240 L130,225 Z" />
          {/* South America */}
          <path d="M175,260 L210,250 L240,260 L260,290 L270,330 L260,370 L240,400 L210,420 L180,410 L160,380 L155,340 L160,300 L170,280 Z" />
          {/* Europe */}
          <path d="M400,80 L440,70 L480,75 L510,90 L520,110 L510,130 L490,145 L460,150 L430,145 L410,135 L395,120 L390,100 Z" />
          {/* UK & Ireland */}
          <path d="M375,95 L395,90 L400,105 L390,115 L375,110 Z" />
          <path d="M365,100 L375,98 L378,108 L370,112 Z" />
          {/* Scandinavia */}
          <path d="M440,50 L470,40 L500,50 L510,70 L495,85 L465,80 L450,65 Z" />
          {/* Africa */}
          <path d="M420,155 L480,150 L530,170 L550,210 L560,260 L550,310 L530,360 L490,390 L450,385 L420,360 L400,310 L395,260 L400,210 L410,175 Z" />
          {/* Middle East */}
          <path d="M520,130 L570,125 L600,145 L610,175 L590,200 L550,210 L530,195 L520,165 L515,145 Z" />
          {/* Russia/Asia */}
          <path d="M510,50 L600,35 L700,40 L780,55 L820,80 L830,110 L810,140 L760,160 L700,170 L640,165 L590,150 L550,130 L520,100 L510,70 Z" />
          {/* India */}
          <path d="M610,175 L650,170 L680,190 L690,230 L670,270 L640,280 L610,260 L600,220 Z" />
          {/* Southeast Asia */}
          <path d="M700,180 L750,175 L780,200 L770,240 L740,260 L710,250 L690,220 Z" />
          {/* China/East Asia */}
          <path d="M680,100 L750,95 L800,110 L820,140 L800,170 L760,180 L720,175 L680,160 L660,130 Z" />
          {/* Japan */}
          <path d="M820,110 L840,105 L850,125 L845,145 L830,150 L820,135 Z" />
          {/* Australia */}
          <path d="M720,300 L800,290 L840,310 L850,350 L830,390 L780,410 L730,400 L700,370 L700,330 Z" />
          {/* New Zealand */}
          <path d="M870,380 L885,375 L890,395 L880,410 L870,400 Z" />
          <path d="M865,410 L875,408 L878,420 L870,425 Z" />
          {/* Indonesia */}
          <path d="M700,260 L760,255 L800,270 L790,290 L750,295 L710,285 Z" />
        </g>

        {/* Subtle latitude lines */}
        <g stroke="#ffffff" strokeWidth="0.3" opacity="0.08">
          {[0, 60, 120, 180, 240, 300, 360, 420].map((y) => (
            <line key={`lat-${y}`} x1={0} y1={y} x2={svgWidth} y2={y} />
          ))}
        </g>

        {/* Connection lines with curves */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => {
            const dest = toSvgCoords(visitor.lat, visitor.lng, svgWidth, svgHeight);
            const isHovered = hoveredCity === visitor.city;
            // Control point for curve
            const midX = (paris.x + dest.x) / 2;
            const midY = Math.min(paris.y, dest.y) - 40;

            return (
              <path
                key={`line-${visitor.city}`}
                d={`M ${paris.x} ${paris.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`}
                fill="none"
                stroke={isHovered ? '#D4AF37' : '#4a7c9b'}
                strokeWidth={isHovered ? 2.5 : 1}
                opacity={isHovered ? 1 : 0.5}
                className="transition-all duration-300"
              />
            );
          })}

        {/* Paris home marker with glow */}
        <g filter="url(#glowC)">
          <circle cx={paris.x} cy={paris.y} r={12} fill="#D4AF37" className="animate-pulse" />
        </g>
        <text
          x={paris.x}
          y={paris.y - 20}
          fill="#D4AF37"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          style={{ textShadow: '0 0 10px rgba(212,175,55,0.8)' }}
        >
          AU MARAIS
        </text>

        {/* Visitor markers */}
        {visitors
          .filter((v) => !v.isHome)
          .map((visitor) => {
            const pos = toSvgCoords(visitor.lat, visitor.lng, svgWidth, svgHeight);
            const isHovered = hoveredCity === visitor.city;
            const radius = Math.max(6, visitor.count * 2 + 4);

            return (
              <g key={visitor.city}>
                {isHovered && (
                  <circle cx={pos.x} cy={pos.y} r={radius + 4} fill="#D4AF37" opacity={0.3} />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={isHovered ? '#D4AF37' : '#5a8cae'}
                  stroke="#D4AF37"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredCity(visitor.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                />
                {visitor.count > 1 && (
                  <text x={pos.x} y={pos.y + 4} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {visitor.count}
                  </text>
                )}
                {isHovered && (
                  <text
                    x={pos.x}
                    y={pos.y - radius - 8}
                    fill="#D4AF37"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {visitor.city}
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {/* Tooltip */}
      {hoveredCity && (
        <div className="absolute bottom-4 left-4 bg-black/95 backdrop-blur-sm px-5 py-3 rounded-lg border border-[#D4AF37]/50 shadow-2xl">
          <div className="text-[#D4AF37] font-serif text-lg">{hoveredCity}</div>
          <div className="text-sm text-neutral-300">
            {visitors.find((v) => v.city === hoveredCity)?.country}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {visitors.find((v) => v.city === hoveredCity)?.count} visiteur
            {(visitors.find((v) => v.city === hoveredCity)?.count || 0) > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
