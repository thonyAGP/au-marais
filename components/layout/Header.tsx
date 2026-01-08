'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui';

const navigation = [
  { name: 'Appartement', href: '/appartement' },
  { name: 'Le Quartier', href: '/quartier' },
  { name: 'Disponibilités', href: '/disponibilites' },
  { name: 'Contact', href: '/contact' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-cream/95 backdrop-blur-md border-b border-stone-200 shadow-sm'
          : 'bg-gradient-to-b from-black/50 to-transparent'
      )}
    >
      <Container>
        <nav className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 border flex items-center justify-center transition-colors duration-500',
              isScrolled ? 'border-gold' : 'border-white/80'
            )}>
              <span className={cn(
                'font-serif text-sm transition-colors duration-500',
                isScrolled ? 'text-gold' : 'text-white'
              )}>AM</span>
            </div>
            <span className={cn(
              'font-serif text-xl md:text-2xl tracking-wide transition-colors duration-500',
              isScrolled ? 'text-text' : 'text-white'
            )}>
              Au <span className="text-gold">Marais</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'transition-colors duration-300 text-xs font-medium tracking-[0.15em] uppercase relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full',
                  isScrolled
                    ? 'text-text-light hover:text-gold'
                    : 'text-white/80 hover:text-gold'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={cn(
              'md:hidden p-2 transition-colors duration-500',
              isScrolled ? 'text-text' : 'text-white'
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-64 pb-6' : 'max-h-0'
          )}
        >
          <div className={cn(
            'flex flex-col gap-4 pt-2 border-t',
            isScrolled ? 'border-stone-200' : 'border-white/20'
          )}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'transition-colors duration-300 text-sm font-medium tracking-wider uppercase py-2',
                  isScrolled
                    ? 'text-text-light hover:text-gold'
                    : 'text-white/80 hover:text-gold'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </header>
  );
};
