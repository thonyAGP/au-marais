import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { BookingBar } from '@/components/home';
import { ChatAssistant } from '@/components/ui';
import { locales, localeHrefLang, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { lodgingBusinessSchema } from '@/lib/schema';
import '../globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-family-serif',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-family-sans',
  display: 'swap',
});

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const alternateLanguages: Record<string, string> = {};
  for (const loc of locales) {
    alternateLanguages[localeHrefLang[loc]] = `https://au-marais.fr/${loc}`;
  }

  return {
    metadataBase: new URL('https://au-marais.fr'),
    title: {
      default: dict.metadata.title,
      template: dict.metadata.titleTemplate,
    },
    description: dict.metadata.description,
    keywords: dict.metadata.keywords.split(', '),
    authors: [{ name: 'Au Marais' }],
    creator: 'Au Marais',
    publisher: 'Au Marais',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: dict.metadata.title,
      description: dict.metadata.description,
      url: `https://au-marais.fr/${locale}`,
      siteName: 'Au Marais',
      images: [
        {
          url: '/images/apartment/01-salon.jpg',
          width: 1200,
          height: 630,
          alt: 'Salon de l\'appartement Au Marais avec poutres apparentes',
        },
      ],
      type: 'website',
      locale: localeHrefLang[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: ['/images/apartment/01-salon.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://au-marais.fr/${locale}`,
      languages: alternateLanguages,
    },
  };
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <html lang={locale} className={`${cormorant.variable} ${montserrat.variable}`}>
      <head>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(lodgingBusinessSchema),
          }}
        />
        {/* hreflang tags */}
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={localeHrefLang[loc]}
            href={`https://au-marais.fr/${loc}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href="https://au-marais.fr/fr" />
      </head>
      <body className="font-sans">
        <Header nav={dict.nav} />
        <main className="pt-20 pb-16 sm:pb-0">{children}</main>
        <Footer dict={dict.footer} nav={dict.nav} locale={locale} />
        <BookingBar dict={dict.bookingBar} stats={dict.stats} locale={locale} />
        <ChatAssistant />
      </body>
    </html>
  );
}
