import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://au-marais.fr'),
  title: 'Le quartier du Marais',
  description:
    'Découvrez le Marais, l\'un des quartiers les plus emblématiques de Paris. Place des Vosges, Centre Pompidou, boutiques, restaurants. Métro Saint-Paul à 200m.',
  openGraph: {
    title: 'Le quartier du Marais | Au Marais',
    description: 'Le Marais, quartier historique et vivant de Paris. Monuments, shopping, gastronomie.',
  },
  alternates: {
    canonical: 'https://au-marais.fr/quartier',
  },
};

export default function QuartierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
