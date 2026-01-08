import { Metadata } from 'next';
import { Hero, Features, GalleryPreview, Hosts, Testimonials, LocalTips } from '@/components/home';
import { AnimateOnScroll } from '@/components/ui';

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
      <Hosts />
      <Testimonials />
      <LocalTips />

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
        </div>
        <AnimateOnScroll className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Prêt à découvrir le Marais ?
          </h2>
          <p className="text-stone-300 mb-10 text-lg max-w-2xl mx-auto">
            Réservez votre séjour et vivez Paris comme un vrai Parisien, au coeur
            de l&apos;un des quartiers les plus authentiques de la capitale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark hover:shadow-lg hover:shadow-gold/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Demander une réservation
            </a>
            <a
              href="https://www.airbnb.fr/rooms/618442543008929958"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-stone-900 transition-all duration-300 hover:-translate-y-0.5"
            >
              Voir sur Airbnb
            </a>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
