import Image from 'next/image';
import { Container, MetroStation, Map, AnimateOnScroll } from '@/components/ui';
import { MapPin, Coffee, ShoppingBag, Utensils, Clock, Landmark, BookOpen, Crown, ExternalLink } from 'lucide-react';

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

const placesToVisit = [
  {
    name: 'Place des Vosges',
    description: 'La plus ancienne place de Paris, chef-d\'œuvre d\'architecture du XVIIe siècle.',
    distance: '5 min',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    mapsUrl: 'https://maps.google.com/?q=Place+des+Vosges+Paris',
  },
  {
    name: 'Centre Pompidou',
    description: 'Musée d\'art moderne et contemporain à l\'architecture iconique.',
    distance: '10 min',
    image: 'https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?w=800&q=80',
    mapsUrl: 'https://maps.google.com/?q=Centre+Pompidou+Paris',
  },
  {
    name: 'Notre-Dame',
    description: 'Cathédrale gothique emblématique, en cours de restauration.',
    distance: '12 min',
    image: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=800&q=80',
    mapsUrl: 'https://maps.google.com/?q=Notre+Dame+Paris',
  },
  {
    name: 'Île Saint-Louis',
    description: 'Île paisible au charme intemporel, célèbre pour ses glaces Berthillon.',
    distance: '5 min',
    image: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800&q=80',
    mapsUrl: 'https://maps.google.com/?q=Ile+Saint+Louis+Paris',
  },
  {
    name: 'Hôtel de Ville',
    description: 'Mairie de Paris, bâtiment Renaissance avec sa place animée.',
    distance: '8 min',
    image: 'https://images.unsplash.com/photo-1600950207944-0d63e8edbc3f?w=800&q=80',
    mapsUrl: 'https://maps.google.com/?q=Hotel+de+Ville+Paris',
  },
  {
    name: 'Rue des Rosiers',
    description: 'Cœur du quartier juif historique, falafels et pâtisseries.',
    distance: '4 min',
    image: 'https://images.unsplash.com/photo-1551866442-64e75e911c23?w=800&q=80',
    mapsUrl: 'https://maps.google.com/?q=Rue+des+Rosiers+Paris',
  },
];

const pointsOfInterest = [
  {
    category: 'Shopping',
    icon: ShoppingBag,
    places: [
      { name: 'BHV Marais', distance: '5 min', url: 'https://maps.google.com/?q=BHV+Marais+Paris' },
      { name: 'Rue des Francs-Bourgeois', distance: '3 min', url: 'https://maps.google.com/?q=Rue+des+Francs+Bourgeois+Paris' },
      { name: 'Village Saint-Paul', distance: '2 min', url: 'https://maps.google.com/?q=Village+Saint+Paul+Paris' },
    ],
  },
  {
    category: 'Restaurants',
    icon: Coffee,
    places: [
      { name: 'L\'As du Fallafel', distance: '5 min', url: 'https://maps.google.com/?q=L+As+du+Fallafel+Paris' },
      { name: 'Chez Janou', distance: '6 min', url: 'https://maps.google.com/?q=Chez+Janou+Paris' },
      { name: 'Breizh Café', distance: '4 min', url: 'https://maps.google.com/?q=Breizh+Cafe+Marais+Paris' },
    ],
  },
];

export default function QuartierPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-24 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Le quartier
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
              Le Marais
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              L&apos;un des quartiers les plus emblématiques et vivants de Paris,
              où histoire et modernité se côtoient harmonieusement.
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Histoire Section */}
      <section className="py-20 bg-white">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Histoire
            </p>
            <h2 className="font-serif text-4xl text-text">
              Un quartier chargé d&apos;histoire
            </h2>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* François Miron */}
            <AnimateOnScroll className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">François Miron</h3>
              </div>
              <p className="text-sm text-gold mb-4 font-medium">1560 — 1609</p>
              <div className="space-y-3 text-text-light text-sm leading-relaxed">
                <p>
                  La rue qui abrite notre appartement porte le nom de <strong>François Miron</strong>,
                  <em> prévôt des marchands de Paris</em> de 1604 à 1609 — l&apos;équivalent
                  du maire de Paris sous l&apos;Ancien Régime.
                </p>
                <p>
                  Surnommé <strong>« le père du peuple »</strong> par ses contemporains,
                  il fut un proche du roi Henri IV et consacra sa fortune personnelle
                  à l&apos;embellissement de Paris.
                </p>
                <p>
                  On lui doit notamment la <strong>façade de l&apos;Hôtel de Ville</strong>,
                  la première <strong>Samaritaine</strong> (pompe à eau près du Louvre)
                  et la rénovation des aqueducs parisiens.
                </p>
              </div>
            </AnimateOnScroll>

            {/* La Rue */}
            <AnimateOnScroll delay={100} className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">La Rue</h3>
              </div>
              <p className="text-sm text-gold mb-4 font-medium">Voie romaine du IIe siècle</p>
              <div className="space-y-3 text-text-light text-sm leading-relaxed">
                <p>
                  La rue François Miron est l&apos;une des <strong>plus anciennes de Paris</strong>.
                  Elle suit le tracé d&apos;une <strong>voie romaine du IIe siècle</strong> qui
                  reliait Lutèce (Paris) à Melun et Sens.
                </p>
                <p>
                  Renommée en 1865 par Louis-Philippe en hommage au prévôt, elle abrite
                  des <strong>maisons médiévales à colombages</strong> (n°11 et 13), parmi
                  les dernières de Paris, datant du XIVe siècle.
                </p>
                <p>
                  L&apos;immeuble qui héberge notre appartement date du <strong>XVIIe siècle</strong>,
                  avec ses poutres apparentes et ses murs en pierres caractéristiques.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Le Marais */}
            <AnimateOnScroll delay={200} className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">Le Marais</h3>
              </div>
              <p className="text-sm text-gold mb-4 font-medium">Du marécage au quartier prisé</p>
              <div className="space-y-3 text-text-light text-sm leading-relaxed">
                <p>
                  Son nom vient des <strong>marécages</strong> qui occupaient cette zone
                  jusqu&apos;au XIIe siècle. Asséché par les moines, le quartier devient
                  au XVIIe siècle le lieu de résidence de la <strong>noblesse parisienne</strong>.
                </p>
                <p>
                  <strong>Épargné par les travaux haussmanniens</strong> du XIXe siècle,
                  il conserve son architecture médiévale et ses hôtels particuliers,
                  dont beaucoup sont devenus des musées.
                </p>
                <p>
                  Aujourd&apos;hui, c&apos;est un quartier <strong>vivant et cosmopolite</strong> :
                  communauté LGBTQ+, quartier juif historique, galeries d&apos;art,
                  boutiques de créateurs et vie nocturne animée.
                </p>
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
                    Notre emplacement
                  </h2>
                </div>

                <div className="bg-white border border-stone-200 p-8 mb-8">
                  <p className="mb-4">
                    <strong className="text-text text-xl font-serif">Rue François Miron</strong>
                    <br />
                    <span className="text-text-muted">75004 Paris — 4ème arrondissement</span>
                  </p>
                  <p className="text-text-muted text-sm">
                    L&apos;une des plus anciennes rues de Paris, bordée de maisons
                    médiévales et d&apos;hôtels particuliers historiques.
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
                    Accès métro
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
              À découvrir
            </p>
            <h2 className="font-serif text-4xl text-text">
              Lieux incontournables
            </h2>
            <p className="text-text-muted mt-4 max-w-xl mx-auto">
              Tous accessibles à pied depuis l&apos;appartement
            </p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placesToVisit.map((place, index) => (
              <AnimateOnScroll key={place.name} delay={index * 100}>
                <a
                  href={place.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white border border-stone-200 overflow-hidden hover:border-gold/50 hover:shadow-lg transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Distance badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-text">
                      {place.distance} à pied
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-lg text-text group-hover:text-gold transition-colors">
                        {place.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-gold/50 group-hover:text-gold transition-colors" />
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {place.description}
                    </p>
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* Points of Interest */}
      <section className="py-20 bg-white">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Pratique
            </p>
            <h2 className="font-serif text-4xl text-text">
              Commerces à proximité
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pointsOfInterest.map((category, index) => (
              <AnimateOnScroll key={category.category} delay={index * 100}>
                <div className="bg-cream border border-stone-200 p-8 hover:border-gold/50 transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-gold" />
                    </div>
                    <h3 className="font-serif text-xl text-text">
                      {category.category}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {category.places.map((place) => (
                      <li key={place.name}>
                        <a
                          href={place.url}
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
              Nos recommandations
            </h2>

            <div className="bg-white border border-stone-200 p-8">
              <p className="text-text-light mb-6">
                À votre arrivée, nous vous fournirons une liste complète de nos
                adresses préférées dans le quartier : restaurants, cafés, bars,
                boutiques...
              </p>
              <p className="text-text-muted text-sm italic">
                Des conseils de vrais Parisiens pour vivre le Marais comme un local.
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
              Réservation
            </p>
            <h2 className="font-serif text-4xl text-text mb-6">
              Prêt à découvrir le Marais ?
            </h2>
            <p className="text-text-muted mb-10 max-w-xl mx-auto">
              Réservez votre séjour et vivez Paris comme un vrai Parisien.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(196,116,90,0.25)]"
            >
              Nous contacter
            </a>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
