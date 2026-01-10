import Link from 'next/link';
import { Container, AnimateOnScroll, SuperhostBadge } from '@/components/ui';
import { ApartmentGallery } from '@/components/apartment';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { Users, Bed, Bath, Building, Wifi, Utensils, Tv, Wind, Calendar } from 'lucide-react';

export default async function AppartementPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const apt = dict.apartment;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero - More compact */}
      <section className="pt-24 pb-8 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {apt.sectionTitle}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-text mb-4">
              {apt.title}
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto">
              {apt.subtitle}
            </p>
            {/* Compact Superhost inline */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <SuperhostBadge variant="minimal" />
              <span className="text-text-muted">•</span>
              <span className="text-sm text-text-muted">4.97★ · 89 {dict.hosts.reviews}</span>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Gallery */}
      <section className="py-12 bg-cream">
        <Container>
          <ApartmentGallery clickToEnlarge={apt.clickToEnlarge} />
        </Container>
      </section>

      {/* Details */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-16">
            {/* Description */}
            <AnimateOnScroll>
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                {apt.description.sectionTitle}
              </p>
              <h2 className="font-serif text-3xl text-text mb-8">
                {apt.description.title}
              </h2>
              <div className="space-y-4 text-text-light leading-relaxed">
                <p>{apt.description.text1}</p>
                <p>{apt.description.text2}</p>
                <p>{apt.description.text3}</p>
              </div>
            </AnimateOnScroll>

            {/* Quick Info */}
            <AnimateOnScroll delay={200}>
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                {apt.info.sectionTitle}
              </p>
              <h2 className="font-serif text-3xl text-text mb-8">
                {apt.info.title}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">{apt.info.capacity}</p>
                    <p className="text-text-muted text-sm">{apt.info.capacityLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Bed className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">{apt.info.bedroom}</p>
                    <p className="text-text-muted text-sm">{apt.info.bedroomLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Bath className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">{apt.info.bathroom}</p>
                    <p className="text-text-muted text-sm">{apt.info.bathroomLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Building className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">{apt.info.floor}</p>
                    <p className="text-text-muted text-sm">{apt.info.floorLabel}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center mb-12">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {apt.amenities.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl text-text">
              {apt.amenities.title}
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimateOnScroll className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">{apt.amenities.kitchen.title}</h3>
              </div>
              <ul className="space-y-3">
                {apt.amenities.kitchen.items.map((item: string) => (
                  <li key={item} className="text-text-muted text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100} className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">{apt.amenities.comfort.title}</h3>
              </div>
              <ul className="space-y-3">
                {apt.amenities.comfort.items.map((item: string) => (
                  <li key={item} className="text-text-muted text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200} className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">{apt.amenities.multimedia.title}</h3>
              </div>
              <ul className="space-y-3">
                {apt.amenities.multimedia.items.map((item: string) => (
                  <li key={item} className="text-text-muted text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Note */}
      <section className="py-12 bg-cream">
        <Container size="md">
          <AnimateOnScroll className="bg-white border border-stone-200 p-8">
            <h3 className="font-serif text-xl text-text mb-6">{apt.notes.title}</h3>
            <ul className="space-y-4 text-text-light">
              <li className="flex items-start gap-4">
                <Wind className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                <span>{apt.notes.items[0]}</span>
              </li>
              <li className="flex items-start gap-4">
                <Building className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                <span>{apt.notes.items[1]}</span>
              </li>
            </ul>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Calendar CTA */}
      <section className="py-16 bg-white">
        <Container size="md">
          <AnimateOnScroll className="text-center">
            <div className="w-16 h-16 mx-auto border border-gold/30 flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-gold" />
            </div>
            <h2 className="font-serif text-3xl text-text mb-4">
              {apt.calendar.title}
            </h2>
            <p className="text-text-muted mb-8 max-w-xl mx-auto">
              {apt.calendar.description}
            </p>
            <Link
              href={`/${locale}/disponibilites`}
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(196,116,90,0.25)]"
            >
              {apt.calendar.button}
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream-dark relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/10 rounded-full" />
        </div>

        <Container className="relative z-10">
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {apt.cta.sectionTitle}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-text mb-6">
              {apt.cta.title}
            </h2>
            <p className="text-text-muted mb-10 max-w-xl mx-auto">
              {apt.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(196,116,90,0.25)]"
              >
                {apt.cta.contact}
              </Link>
              <a
                href="https://www.airbnb.fr/rooms/618442543008929958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-10 py-5 border border-text/20 text-text font-medium text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300"
              >
                {apt.cta.airbnb}
              </a>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
