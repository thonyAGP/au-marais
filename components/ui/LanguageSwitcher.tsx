'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { locales, localeNames, getFlagUrl, type Locale } from '@/lib/i18n/config';

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
        className="flex items-center gap-1.5 px-2 py-2 text-text-light hover:text-gold transition-colors"
        aria-label="Change language"
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
