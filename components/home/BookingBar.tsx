'use client';

import { useState, useEffect } from 'react';
import { Calendar, Star } from 'lucide-react';
import Link from 'next/link';

export const BookingBar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Price info */}
          <div className="hidden sm:flex items-center gap-6">
            <div>
              <p className="text-text-muted text-xs tracking-wider uppercase">À partir de</p>
              <p className="font-serif text-2xl text-text">
                120€ <span className="text-sm font-sans text-text-muted">/ nuit</span>
              </p>
            </div>
            <div className="h-10 w-px bg-stone-200" />
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="font-medium text-text">4.97</span>
              <span className="text-text-muted text-sm">(89 avis)</span>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
            <Link
              href="/appartement#disponibilites"
              className="flex items-center gap-2 px-5 py-3 border border-stone-300 text-text hover:border-gold hover:text-gold transition-all text-sm font-medium tracking-wider"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Voir disponibilités</span>
              <span className="sm:hidden">Dispo</span>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-gold text-white hover:bg-gold-dark transition-all font-medium text-sm tracking-wider hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(201,169,98,0.3)]"
            >
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
