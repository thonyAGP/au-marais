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

// Country codes for flag images (flagcdn.com)
export const localeCountryCodes: Record<Locale, string> = {
  fr: 'fr',
  en: 'gb',
  es: 'es',
  de: 'de',
  pt: 'br',
  zh: 'cn',
};

// Get flag image URL
export const getFlagUrl = (locale: Locale, size: number = 24) =>
  `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${localeCountryCodes[locale]}.png`;

// For hreflang tags
export const localeHrefLang: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-BR',
  zh: 'zh-CN',
};
