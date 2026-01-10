export const locales = ['fr', 'en', 'es', 'de', 'pt', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  pt: '🇧🇷',
  zh: '🇨🇳',
};

// For hreflang tags
export const localeHrefLang: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-BR',
  zh: 'zh-CN',
};
