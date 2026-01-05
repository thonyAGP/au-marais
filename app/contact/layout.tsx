import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez-nous pour réserver votre séjour au Marais. Réponse rapide via WhatsApp. Questions fréquentes sur l\'appartement et les conditions.',
  openGraph: {
    title: 'Contact | Au Marais',
    description: 'Réservez votre séjour au coeur du Marais. Contact direct via WhatsApp.',
  },
  alternates: {
    canonical: 'https://au-marais.fr/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
