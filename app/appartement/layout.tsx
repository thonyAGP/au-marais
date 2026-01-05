import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'L\'appartement',
  description:
    'Découvrez notre appartement de charme au coeur du Marais : 4 voyageurs, 1 chambre, poutres apparentes, cuisine équipée. Note Airbnb 4.97★ (89 avis).',
  openGraph: {
    title: 'L\'appartement | Au Marais',
    description: 'Appartement de charme au coeur du Marais, Paris 4ème. 4 voyageurs, poutres apparentes.',
    images: ['/images/apartment/01-salon.jpg'],
  },
  alternates: {
    canonical: 'https://au-marais.fr/appartement',
  },
};

export default function AppartementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
