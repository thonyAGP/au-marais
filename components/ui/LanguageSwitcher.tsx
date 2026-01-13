'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { locales, localeNames, getFlagUrl, type Locale } from '@/lib/i18n/config';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
}

export const LanguageSwitcher = ({ variant = 'dropdown' }: LanguageSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = (params?.locale as Locale) || 'fr';

  // Remove current locale from pathname to get the base path
  const getLocalizedPath = (locale: Locale) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Inline variant: show all flags in a grid (for mobile menu)
  if (variant === 'inline') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {locales.map((locale) => (
          <Link
            key={locale}
            href={getLocalizedPath(locale)}
            className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-md text-sm transition-colors ${
              locale === currentLocale
                ? 'bg-gold/10 border border-gold text-gold'
                : 'bg-stone-100 text-text hover:bg-stone-200'
            }`}
          >
            <img
              src={getFlagUrl(locale, 24)}
              alt={localeNames[locale]}
              className="w-6 h-[18px] object-cover rounded-sm flex-shrink-0"
            />
            <span className="text-xs font-medium">{locale.toUpperCase()}</span>
          </Link>
        ))}
      </div>
    );
  }

  // Dropdown variant (for desktop)
  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-2 text-text-light hover:text-gold transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <img src={getFlagUrl(currentLocale, 24)} alt="" className="w-6 h-[18px] object-cover rounded-sm" />
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-white border border-stone-200 shadow-lg z-50 min-w-[160px] rounded-md overflow-hidden">
            {locales.map((locale) => (
              <Link
                key={locale}
                href={getLocalizedPath(locale)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-cream transition-colors ${
                  locale === currentLocale ? 'bg-cream text-gold' : 'text-text'
                }`}
              >
                <img src={getFlagUrl(locale, 24)} alt="" className="w-6 h-[18px] object-cover rounded-sm" />
                <span>{localeNames[locale]}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
