'use client';

import { Award, Star, Clock, ShieldCheck, Sparkles } from 'lucide-react';

type BadgeVariant = 'full' | 'compact' | 'minimal';

interface SuperhostBadgeProps {
  variant?: BadgeVariant;
  showExtras?: boolean;
  className?: string;
}

const stats = {
  rating: 4.97,
  reviews: 89,
  responseTime: '< 1h',
};

export const SuperhostBadge = ({
  variant = 'full',
  showExtras = false,
  className = '',
}: SuperhostBadgeProps) => {
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Award className="h-5 w-5 text-gold" />
        <span className="text-sm font-medium text-text">Superhost</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
        {/* Mini médaille */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold shadow-[0_2px_10px_rgba(212,175,55,0.4)] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center border border-yellow-300/50">
            <Award className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-gold">
            Superhost
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 text-gold fill-gold" />
            ))}
          </div>
          <span className="text-sm text-text font-medium">{stats.rating}</span>
          <span className="text-text-muted text-sm">· {stats.reviews} avis</span>
        </div>
      </div>
    );
  }

  // Full variant - Style D avec médaille C
  return (
    <div
      className={`inline-flex flex-col items-center p-8 bg-gradient-to-br from-cream via-white to-gold/10 border border-gold/30 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold" />

      {/* Médaille style C */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold via-yellow-400 to-gold shadow-[0_4px_20px_rgba(212,175,55,0.5)] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center border-2 border-yellow-300/50">
            <Award className="h-8 w-8 text-white drop-shadow-md" />
          </div>
        </div>
        {/* Ruban */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex">
          <div className="w-3 h-6 bg-gradient-to-b from-red-500 to-red-700 -rotate-12 rounded-b-sm" />
          <div className="w-3 h-6 bg-gradient-to-b from-red-500 to-red-700 rotate-12 rounded-b-sm" />
        </div>
      </div>

      <p className="text-xs tracking-[0.4em] uppercase text-gold mb-1 mt-2">Airbnb</p>
      <p className="font-serif text-2xl text-text mb-4">Superhost</p>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-3 px-6 py-3 bg-white/80 border border-gold/20">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gold fill-gold" />
          ))}
        </div>
        <span className="font-serif text-2xl text-text">{stats.rating}</span>
        <span className="text-text-muted">/ 5</span>
      </div>
      <p className="text-sm text-text-muted mb-6">{stats.reviews} avis vérifiés sur Airbnb</p>

      {/* Extras - 3 icônes style C */}
      {showExtras && (
        <div className="flex gap-6 pt-4 border-t border-gold/20">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Vérifié</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock className="h-5 w-5 text-gold" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">{stats.responseTime}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Premium</span>
          </div>
        </div>
      )}
    </div>
  );
};
