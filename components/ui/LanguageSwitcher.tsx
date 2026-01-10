'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = (params?.locale as Locale) || 'fr';

  // Remove current locale from pathname to get the base path
  const getLocalizedPath = (locale: Locale) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-light hover:text-gold transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <span className="sm:hidden">{localeFlags[currentLocale]}</span>
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
          <div className="absolute right-0 top-full mt-2 bg-white border border-stone-200 shadow-lg z-50 min-w-[160px]">
            {locales.map((locale) => (
              <Link
                key={locale}
                href={getLocalizedPath(locale)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-cream transition-colors ${
                  locale === currentLocale ? 'bg-cream text-gold' : 'text-text'
                }`}
              >
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
