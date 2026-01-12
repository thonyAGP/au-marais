'use client';

import { useState, useEffect } from 'react';
import { Calendar, Star } from 'lucide-react';
import Link from 'next/link';

interface BookingBarDict {
  price: string;
  perNight: string;
  checkAvailability: string;
  bookNow: string;
}

interface StatsDict {
  reviews: string;
}

interface BookingBarProps {
  dict: BookingBarDict;
  stats: StatsDict;
  locale: string;
}

export const BookingBar = ({ dict, stats, locale }: BookingBarProps) => {
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
              <p className="text-text-muted text-xs tracking-wider uppercase">{dict.price}</p>
              <p className="font-serif text-2xl text-text">
                120€ <span className="text-sm font-sans text-text-muted">{dict.perNight}</span>
              </p>
            </div>
            <div className="h-10 w-px bg-stone-200" />
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="font-medium text-text">4.97</span>
              <span className="text-text-muted text-sm">(89 {stats.reviews})</span>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
            <Link
              href={`/${locale}/disponibilites`}
              className="flex items-center gap-2 px-5 py-3 bg-cream border border-gold/30 text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium tracking-wider group"
            >
              <Calendar className="h-4 w-4 group-hover:animate-pulse" />
              <span>{dict.checkAvailability}</span>
            </Link>
            <Link
              href={`/${locale}/disponibilites`}
              className="px-8 py-3 bg-gold text-white hover:bg-gold-dark transition-all font-medium text-sm tracking-wider hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(201,169,98,0.3)]"
            >
              {dict.bookNow}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
