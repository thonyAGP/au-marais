import { Metadata } from 'next';
import { Hero, Features, GalleryPreview } from '@/components/home';

export const metadata: Metadata = {
  title: 'Au Marais — Votre cocon parisien | Location courte durée Paris 4ème',
  description:
    'Découvrez notre appartement de charme au coeur du Marais. Poutres apparentes, murs en pierres, immeuble du 17ème siècle. Métro Saint-Paul à 200m.',
  alternates: {
    canonical: 'https://au-marais.fr',
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <GalleryPreview />

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-serif text-4xl mb-6">
            Prêt à découvrir le Marais ?
          </h2>
          <p className="text-stone-300 mb-10 text-lg">
            Réservez votre séjour et vivez Paris comme un vrai Parisien, au coeur
            de l&apos;un des quartiers les plus authentiques de la capitale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-medium hover:bg-gold-dark transition-colors duration-300"
            >
              Demander une réservation
            </a>
            <a
              href="https://www.airbnb.fr/rooms/618442543008929958"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium hover:bg-white hover:text-stone-900 transition-colors duration-300"
            >
              Voir sur Airbnb
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
