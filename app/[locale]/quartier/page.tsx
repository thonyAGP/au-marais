import Image from 'next/image';
import Link from 'next/link';
import { Container, MetroStation, Map, AnimateOnScroll } from '@/components/ui';
import { MapPin, Coffee, ShoppingBag, Utensils, Clock, Landmark, BookOpen, Crown, ExternalLink } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

const metroStations = [
  {
    line: '1',
    station: 'Saint-Paul',
    distance: '200m',
    walkTime: '2 min',
    destinations: 'Châtelet, Louvre, Champs-Élysées, La Défense',
  },
  {
    line: '1',
    station: 'Hôtel de Ville',
    distance: '400m',
    walkTime: '5 min',
    destinations: 'Bastille, Nation, Vincennes',
  },
  {
    line: '7',
    station: 'Pont Marie',
    distance: '350m',
    walkTime: '4 min',
    destinations: 'Châtelet, Opéra, Gare de l\'Est',
  },
];

// Point de départ pour les itinéraires (coordonnées GPS, sans adresse exacte)
const DEPARTURE_POINT = '48.855510,2.358149';

type PlaceKey = 'placeDesVosges' | 'centrePompidou' | 'notreDame' | 'ileSaintLouis' | 'hotelDeVille' | 'rueDesRosiers';

const placesData: { key: PlaceKey; distance: string; image: string }[] = [
  {
    key: 'placeDesVosges',
    distance: '5 min',
    image: 'https://images.pexels.com/photos/34393256/pexels-photo-34393256.jpeg?w=800',
  },
  {
    key: 'centrePompidou',
    distance: '10 min',
    image: 'https://images.pexels.com/photos/8031073/pexels-photo-8031073.jpeg?w=800',
  },
  {
    key: 'notreDame',
    distance: '12 min',
    image: 'https://images.pexels.com/photos/34467409/pexels-photo-34467409.jpeg?w=800',
  },
  {
    key: 'ileSaintLouis',
    distance: '5 min',
    image: 'https://images.pexels.com/photos/13641175/pexels-photo-13641175.jpeg?w=800',
  },
  {
    key: 'hotelDeVille',
    distance: '8 min',
    image: 'https://images.pexels.com/photos/5517331/pexels-photo-5517331.jpeg?w=800',
  },
  {
    key: 'rueDesRosiers',
    distance: '4 min',
    image: 'https://images.pexels.com/photos/1850591/pexels-photo-1850591.jpeg?w=800',
  },
];

const getMapsUrl = (placeName: string) =>
  `https://www.google.com/maps/dir/${DEPARTURE_POINT}/${encodeURIComponent(placeName)},+Paris`;

const pointsOfInterestData = [
  {
    categoryKey: 'shopping' as const,
    icon: ShoppingBag,
    places: [
      { name: 'BHV Marais', distance: '5 min' },
      { name: 'Rue des Francs-Bourgeois', distance: '3 min' },
      { name: 'Village Saint-Paul', distance: '2 min' },
    ],
  },
  {
    categoryKey: 'restaurants' as const,
    icon: Coffee,
    places: [
      { name: 'L\'As du Fallafel', distance: '5 min' },
      { name: 'Chez Janou', distance: '6 min' },
      { name: 'Breizh Café', distance: '4 min' },
    ],
  },
];

export default async function QuartierPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-24 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.neighborhood.sectionTitle}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
              {dict.neighborhood.title}
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              {dict.neighborhood.subtitle}
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Histoire Section */}
      <section className="py-20 bg-white">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.neighborhood.history.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl text-text">
              {dict.neighborhood.history.title}
            </h2>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* François Miron */}
            <AnimateOnScroll className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">{dict.neighborhood.history.francoisMiron.title}</h3>
              </div>
              <p className="text-sm text-gold mb-4 font-medium">{dict.neighborhood.history.francoisMiron.period}</p>
              <div className="space-y-3 text-text-light text-sm leading-relaxed">
                <p>{dict.neighborhood.history.francoisMiron.text1}</p>
                <p>{dict.neighborhood.history.francoisMiron.text2}</p>
                <p>{dict.neighborhood.history.francoisMiron.text3}</p>
              </div>
            </AnimateOnScroll>

            {/* La Rue */}
            <AnimateOnScroll delay={100} className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">{dict.neighborhood.history.street.title}</h3>
              </div>
              <p className="text-sm text-gold mb-4 font-medium">{dict.neighborhood.history.street.period}</p>
              <div className="space-y-3 text-text-light text-sm leading-relaxed">
                <p>{dict.neighborhood.history.street.text1}</p>
                <p>{dict.neighborhood.history.street.text2}</p>
                <p>{dict.neighborhood.history.street.text3}</p>
              </div>
            </AnimateOnScroll>

            {/* Le Marais */}
            <AnimateOnScroll delay={200} className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">{dict.neighborhood.history.marais.title}</h3>
              </div>
              <p className="text-sm text-gold mb-4 font-medium">{dict.neighborhood.history.marais.period}</p>
              <div className="space-y-3 text-text-light text-sm leading-relaxed">
                <p>{dict.neighborhood.history.marais.text1}</p>
                <p>{dict.neighborhood.history.marais.text2}</p>
                <p>{dict.neighborhood.history.marais.text3}</p>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Location + Map */}
      <section className="py-20 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Address */}
            <div>
              <AnimateOnScroll>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="font-serif text-3xl text-text">
                    {dict.neighborhood.location.title}
                  </h2>
                </div>

                <div className="bg-white border border-stone-200 p-8 mb-8">
                  <p className="mb-4">
                    <strong className="text-text text-xl font-serif">{dict.neighborhood.location.address}</strong>
                    <br />
                    <span className="text-text-muted">{dict.neighborhood.location.district}</span>
                  </p>
                  <p className="text-text-muted text-sm">
                    {dict.neighborhood.location.description}
                  </p>
                </div>
              </AnimateOnScroll>

              {/* Metro Stations */}
              <AnimateOnScroll delay={200}>
                <div className="bg-white border border-stone-200 p-8">
                  <h3 className="font-serif text-xl text-text mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 border border-gold/30 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gold" />
                    </div>
                    {dict.neighborhood.location.metroAccess}
                  </h3>
                  <div className="space-y-5">
                    {metroStations.map((metro, index) => (
                      <MetroStation
                        key={index}
                        line={metro.line}
                        station={metro.station}
                        distance={metro.distance}
                        destinations={metro.destinations}
                        size="lg"
                      />
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Map */}
            <AnimateOnScroll delay={300}>
              <Map className="sticky top-24" />
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Lieux incontournables */}
      <section className="py-20 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.neighborhood.places.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl text-text">
              {dict.neighborhood.places.title}
            </h2>
            <p className="text-text-muted mt-4 max-w-xl mx-auto">
              {dict.neighborhood.places.subtitle}
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placesData.map((place, index) => {
              const placeInfo = dict.neighborhood.places.items[place.key];
              return (
                <AnimateOnScroll key={place.key} delay={index * 100}>
                  <a
                    href={getMapsUrl(placeInfo.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-white border border-stone-200 overflow-hidden hover:border-gold/50 hover:shadow-lg transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={place.image}
                        alt={placeInfo.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {/* Distance badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-text">
                        {place.distance} {dict.neighborhood.places.walkingTime}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif text-lg text-text group-hover:text-gold transition-colors">
                          {placeInfo.name}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-gold/50 group-hover:text-gold transition-colors" />
                      </div>
                      <p className="text-text-muted text-sm leading-relaxed">
                        {placeInfo.description}
                      </p>
                    </div>
                  </a>
                </AnimateOnScroll>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Points of Interest */}
      <section className="py-20 bg-white">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.neighborhood.shops.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl text-text">
              {dict.neighborhood.shops.title}
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pointsOfInterestData.map((category, index) => (
              <AnimateOnScroll key={category.categoryKey} delay={index * 100}>
                <div className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-gold" />
                    </div>
                    <h3 className="font-serif text-xl text-text">
                      {dict.neighborhood.shops.categories[category.categoryKey]}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {category.places.map((place) => (
                      <li key={place.name}>
                        <a
                          href={getMapsUrl(place.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-between items-center group hover:text-gold transition-colors"
                        >
                          <span className="text-text-light group-hover:text-gold transition-colors">{place.name}</span>
                          <span className="text-gold/80 text-sm whitespace-nowrap ml-2 flex items-center gap-1">
                            {place.distance}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* Recommendations */}
      <section className="py-20 bg-cream">
        <Container size="md">
          <AnimateOnScroll className="text-center">
            <div className="w-16 h-16 mx-auto border border-gold/30 flex items-center justify-center mb-8">
              <Utensils className="h-8 w-8 text-gold" />
            </div>
            <h2 className="font-serif text-3xl text-text mb-8">
              {dict.neighborhood.recommendations.title}
            </h2>

            <div className="bg-white border border-stone-200 p-8">
              <p className="text-text-light mb-6">
                {dict.neighborhood.recommendations.text}
              </p>
              <p className="text-text-muted text-sm italic">
                {dict.neighborhood.recommendations.subtext}
              </p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream-dark relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/10 rounded-full" />
        </div>

        <Container className="relative z-10">
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.neighborhood.cta.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl text-text mb-6">
              {dict.neighborhood.cta.title}
            </h2>
            <p className="text-text-muted mb-10 max-w-xl mx-auto">
              {dict.neighborhood.cta.description}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(196,116,90,0.25)]"
            >
              {dict.neighborhood.cta.button}
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
