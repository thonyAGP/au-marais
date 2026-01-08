import { Metadata } from 'next';
import Link from 'next/link';
import { Container, AnimateOnScroll, AvailabilityCalendar } from '@/components/ui';
import { Calendar, MessageCircle, Home, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disponibilités | Au Marais - Location Paris',
  description: 'Consultez les disponibilités et réservez directement votre séjour dans notre appartement au cœur du Marais à Paris. Prix direct sans commission.',
};

export default function DisponibilitesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-24 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Réservation directe
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
              Disponibilités
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              Sélectionnez vos dates pour vérifier la disponibilité et obtenir
              un tarif direct sans les frais de plateforme.
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Calendar Section */}
      <section className="py-20 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Calendar */}
            <AnimateOnScroll className="lg:col-span-2">
              <AvailabilityCalendar />
            </AnimateOnScroll>

            {/* Info Sidebar */}
            <AnimateOnScroll delay={200} className="space-y-6">
              {/* Direct Booking Benefits */}
              <div className="bg-white border border-stone-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Star className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl text-text">
                    Réservation directe
                  </h3>
                </div>
                <ul className="space-y-4 text-text-light text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                    <span>Jusqu&apos;à <strong className="text-gold">20% moins cher</strong> qu&apos;Airbnb</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                    <span>Réponse rapide via WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                    <span>Contact direct avec les propriétaires</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                    <span>Flexibilité sur les conditions</span>
                  </li>
                </ul>
              </div>

              {/* Discounts */}
              <div className="bg-white border border-stone-200 p-8">
                <h3 className="font-serif text-xl text-text mb-6">
                  Réductions séjour
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-cream border border-stone-200">
                    <span className="text-text-light">7+ nuits</span>
                    <span className="text-gold font-medium">-10%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream border border-stone-200">
                    <span className="text-text-light">14+ nuits</span>
                    <span className="text-gold font-medium">-15%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream border border-stone-200">
                    <span className="text-text-light">28+ nuits</span>
                    <span className="text-gold font-medium">-20%</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white border border-gold/30 p-8">
                <h3 className="font-serif text-xl text-text mb-4">
                  Des questions ?
                </h3>
                <p className="text-text-muted text-sm mb-6">
                  N&apos;hésitez pas à nous contacter pour toute demande
                  particulière ou question sur l&apos;appartement.
                </p>
                <div className="space-y-3">
                  <a
                    href="https://wa.me/33631598400"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-medium tracking-wide uppercase transition-colors w-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 hover:border-gold/50 text-text text-sm font-medium tracking-wide uppercase transition-colors w-full"
                  >
                    Formulaire de contact
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Apartment Quick Info */}
      <section className="py-20 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center mb-12">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              L&apos;appartement
            </p>
            <h2 className="font-serif text-4xl text-text">
              En bref
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Voyageurs', value: '4 max' },
              { label: 'Chambres', value: '1' },
              { label: 'Lits', value: '2' },
              { label: 'Salle de bain', value: '1' },
            ].map((item, index) => (
              <AnimateOnScroll key={item.label} delay={index * 50}>
                <div className="text-center p-6 bg-white border border-stone-200">
                  <p className="text-3xl font-serif text-gold mb-2">{item.value}</p>
                  <p className="text-text-muted text-sm">{item.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll delay={200} className="text-center">
            <Link
              href="/appartement"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gold/30 text-gold hover:bg-gold/10 transition-all text-sm tracking-widest uppercase"
            >
              <Home className="h-4 w-4" />
              Découvrir l&apos;appartement
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Airbnb Alternative */}
      <section className="py-20 bg-cream">
        <Container size="md">
          <AnimateOnScroll className="text-center">
            <div className="bg-white border border-stone-200 p-12">
              <p className="text-text-muted text-sm mb-4">
                Vous préférez réserver via une plateforme ?
              </p>
              <a
                href="https://www.airbnb.fr/rooms/618442543008929958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-text hover:text-[#FF5A5F] transition-colors"
              >
                <svg className="h-6 w-6 text-[#FF5A5F]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.379c-.718 2.292-2.9 4.782-6.894 6.621-3.994-1.839-6.176-4.329-6.894-6.621-.598-1.91-.139-3.595 1.14-4.542 1.085-.805 2.523-.881 3.754-.281.693.339 1.286.843 1.737 1.477.196.276.372.569.527.878.155-.309.331-.602.527-.878.451-.634 1.044-1.138 1.737-1.477 1.231-.6 2.669-.524 3.754.281 1.279.947 1.738 2.632 1.14 4.542h-.528z"/>
                </svg>
                <span className="font-serif text-lg">Voir sur Airbnb</span>
              </a>
              <p className="text-text-muted text-xs mt-4">
                Note : les tarifs Airbnb incluent des frais de service
              </p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
