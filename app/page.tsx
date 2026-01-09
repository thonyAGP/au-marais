import { Metadata } from 'next';
import { Hero, Features, GalleryPreview, Hosts, Testimonials, LocalTips } from '@/components/home';
import { Container, AnimateOnScroll, SuperhostBadge } from '@/components/ui';

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

      {/* Stats Bar */}
      <section className="bg-white border-y border-stone-200">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Superhost Badge */}
            <div className="py-6 flex items-center justify-center border-r border-stone-200 col-span-2 md:col-span-1">
              <SuperhostBadge variant="compact" />
            </div>
            {/* Other stats */}
            {[
              { value: '89', label: 'Avis 5 étoiles' },
              { value: 'XVIIe', label: 'Siècle' },
              { value: '200m', label: 'Du métro' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`py-8 text-center ${index < 2 ? 'border-r border-stone-200' : ''}`}
              >
                <div className="font-serif text-4xl text-gold mb-1">{stat.value}</div>
                <div className="text-xs tracking-[0.2em] uppercase text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Features />
      <GalleryPreview />
      <Hosts />
      <Testimonials />
      <LocalTips />

      {/* CTA Section */}
      <section className="py-32 bg-cream-dark relative overflow-hidden">
        {/* Decorative gold elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/20 rounded-full" />
        </div>

        <AnimateOnScroll className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-6">
            Réservation
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-text mb-8">
            Prêt à découvrir le Marais ?
          </h2>
          <p className="text-text-light mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
            Réservez votre séjour et vivez Paris comme un vrai Parisien, au cœur
            de l&apos;un des quartiers les plus authentiques de la capitale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(201,169,98,0.25)]"
            >
              Demander une réservation
            </a>
            <a
              href="https://www.airbnb.fr/rooms/618442543008929958"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-5 border border-text/20 text-text font-medium text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300 hover:-translate-y-1"
            >
              Voir sur Airbnb
            </a>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
