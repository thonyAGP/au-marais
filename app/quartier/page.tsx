import { Container, MetroStation, Map, AnimateOnScroll } from '@/components/ui';
import { MapPin, Coffee, ShoppingBag, Camera, Utensils, Clock } from 'lucide-react';

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

const pointsOfInterest = [
  {
    category: 'Monuments',
    icon: Camera,
    places: [
      { name: 'Place des Vosges', distance: '5 min à pied' },
      { name: 'Hôtel de Ville', distance: '8 min à pied' },
      { name: 'Centre Pompidou', distance: '10 min à pied' },
      { name: 'Notre-Dame', distance: '12 min à pied' },
      { name: 'Île Saint-Louis', distance: '5 min à pied' },
    ],
  },
  {
    category: 'Shopping',
    icon: ShoppingBag,
    places: [
      { name: 'BHV Marais', distance: '5 min à pied' },
      { name: 'Rue des Francs-Bourgeois', distance: '3 min à pied' },
      { name: 'Village Saint-Paul', distance: '2 min à pied' },
      { name: 'Rue de Rivoli', distance: '5 min à pied' },
    ],
  },
  {
    category: 'Restaurants & Cafés',
    icon: Coffee,
    places: [
      { name: 'Carette Place des Vosges', distance: '5 min à pied' },
      { name: 'L\'As du Fallafel', distance: '5 min à pied' },
      { name: 'Chez Janou', distance: '6 min à pied' },
      { name: 'Breizh Café', distance: '4 min à pied' },
    ],
  },
];

export default function QuartierPage() {
  return (
    <div className="min-h-screen bg-dark">
      {/* Hero */}
      <section className="py-24 bg-dark-lighter">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Le quartier
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
              Le Marais
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              L&apos;un des quartiers les plus emblématiques et vivants de Paris,
              où histoire et modernité se côtoient harmonieusement.
            </p>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Description */}
      <section className="py-20 bg-dark-card">
        <Container size="md">
          <AnimateOnScroll>
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Histoire
            </p>
            <h2 className="font-serif text-3xl text-white mb-8">
              Un quartier unique
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Le Marais est sans doute le quartier le plus authentique de Paris.
                Épargné par les grands travaux haussmanniens du 19ème siècle, il a
                conservé son architecture médiévale et ses hôtels particuliers du
                17ème siècle.
              </p>
              <p>
                Aujourd&apos;hui, c&apos;est un quartier vivant et cosmopolite, réputé pour
                ses boutiques de créateurs, ses galeries d&apos;art, ses cafés branchés
                et sa vie nocturne animée. C&apos;est aussi le coeur de la communauté
                LGBTQ+ parisienne et du quartier juif historique.
              </p>
              <p>
                Flânez dans les ruelles pavées, découvrez les cours cachées des
                hôtels particuliers, arrêtez-vous sur la magnifique Place des
                Vosges... Le Marais vous réserve des surprises à chaque coin de rue.
              </p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Location + Map */}
      <section className="py-20 bg-dark">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Address */}
            <div>
              <AnimateOnScroll>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <h2 className="font-serif text-3xl text-white">
                    Notre emplacement
                  </h2>
                </div>

                <div className="bg-dark-card border border-white/5 p-8 mb-8">
                  <p className="mb-4">
                    <strong className="text-white text-xl font-serif">Rue François Miron</strong>
                    <br />
                    <span className="text-white/50">75004 Paris — 4ème arrondissement</span>
                  </p>
                  <p className="text-white/40 text-sm">
                    L&apos;une des plus anciennes rues de Paris, bordée de maisons
                    médiévales et d&apos;hôtels particuliers historiques.
                  </p>
                </div>
              </AnimateOnScroll>

              {/* Metro Stations */}
              <AnimateOnScroll delay={200}>
                <div className="bg-dark-card border border-white/5 p-8">
                  <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-3">
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

      {/* Points of Interest */}
      <section className="py-20 bg-dark-lighter">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Explorer
            </p>
            <h2 className="font-serif text-4xl text-white">
              À proximité
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {pointsOfInterest.map((category, index) => (
              <AnimateOnScroll key={category.category} delay={index * 100}>
                <div className="bg-dark-card border border-white/5 p-8 hover:border-gold/20 transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-gold" />
                    </div>
                    <h3 className="font-serif text-xl text-white">
                      {category.category}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {category.places.map((place) => (
                      <li key={place.name} className="flex justify-between items-center">
                        <span className="text-white/70">{place.name}</span>
                        <span className="text-gold/60 text-sm whitespace-nowrap ml-2">
                          {place.distance}
                        </span>
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
      <section className="py-20 bg-dark">
        <Container size="md">
          <AnimateOnScroll className="text-center">
            <div className="w-16 h-16 mx-auto border border-gold/30 flex items-center justify-center mb-8">
              <Utensils className="h-8 w-8 text-gold" />
            </div>
            <h2 className="font-serif text-3xl text-white mb-8">
              Nos recommandations
            </h2>

            <div className="bg-dark-card border border-white/5 p-8">
              <p className="text-white/60 mb-6">
                À votre arrivée, nous vous fournirons une liste complète de nos
                adresses préférées dans le quartier : restaurants, cafés, bars,
                boutiques...
              </p>
              <p className="text-white/40 text-sm italic">
                Des conseils de vrais Parisiens pour vivre le Marais comme un local.
              </p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark-card relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/5 rounded-full" />
        </div>

        <Container className="relative z-10">
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Réservation
            </p>
            <h2 className="font-serif text-4xl text-white mb-6">
              Prêt à découvrir le Marais ?
            </h2>
            <p className="text-white/50 mb-10 max-w-xl mx-auto">
              Réservez votre séjour et vivez Paris comme un vrai Parisien.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-dark font-medium text-sm tracking-widest uppercase hover:bg-gold-light transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.25)]"
            >
              Nous contacter
            </a>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
