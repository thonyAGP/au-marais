import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import { BookingBar } from '@/components/home';
import './globals.css';

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

export const metadata: Metadata = {
  metadataBase: new URL('https://au-marais.fr'),
  title: {
    default: 'Au Marais — Votre cocon parisien',
    template: '%s | Au Marais',
  },
  description:
    'Appartement de charme au coeur du Marais, entièrement rénové dans un immeuble du 17ème siècle. Poutres apparentes, murs en pierres, métro Saint-Paul à 200m.',
  keywords: [
    'location Paris',
    'appartement Marais',
    'location courte durée Paris',
    'Airbnb Marais',
    'appartement charme Paris',
    'location vacances Paris 4',
    'hébergement Marais',
    'logement Paris centre',
  ],
  authors: [{ name: 'Au Marais' }],
  creator: 'Au Marais',
  publisher: 'Au Marais',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Au Marais — Votre cocon parisien',
    description:
      'Appartement de charme au coeur du Marais, entièrement rénové dans un immeuble du 17ème siècle.',
    url: 'https://au-marais.fr',
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
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Au Marais — Votre cocon parisien',
    description: 'Appartement de charme au coeur du Marais, Paris 4ème',
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
    canonical: 'https://au-marais.fr',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="font-sans">
        <Header />
        <main className="pt-20 pb-16 sm:pb-0">{children}</main>
        <Footer />
        <BookingBar />
      </body>
    </html>
  );
}
