import { Container, MetroStation, Map } from '@/components/ui';
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
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-24 bg-stone-100">
        <Container>
          <h1 className="font-serif text-5xl text-stone-900 mb-6 text-center">
            Le Marais
          </h1>
          <p className="text-stone-600 text-center max-w-2xl mx-auto text-lg">
            L&apos;un des quartiers les plus emblématiques et vivants de Paris,
            où histoire et modernité se côtoient harmonieusement.
          </p>
        </Container>
      </section>

      {/* Description */}
      <section className="py-16 bg-white">
        <Container size="md">
          <div className="prose prose-stone max-w-none">
            <h2 className="font-serif text-3xl text-stone-900 mb-6">
              Un quartier unique
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              Le Marais est sans doute le quartier le plus authentique de Paris.
              Épargné par les grands travaux haussmanniens du 19ème siècle, il a
              conservé son architecture médiévale et ses hôtels particuliers du
              17ème siècle.
            </p>
            <p className="text-stone-600 leading-relaxed mb-4">
              Aujourd&apos;hui, c&apos;est un quartier vivant et cosmopolite, réputé pour
              ses boutiques de créateurs, ses galeries d&apos;art, ses cafés branchés
              et sa vie nocturne animée. C&apos;est aussi le coeur de la communauté
              LGBTQ+ parisienne et du quartier juif historique.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Flânez dans les ruelles pavées, découvrez les cours cachées des
              hôtels particuliers, arrêtez-vous sur la magnifique Place des
              Vosges... Le Marais vous réserve des surprises à chaque coin de rue.
            </p>
          </div>
        </Container>
      </section>

      {/* Location + Map */}
      <section className="py-16 bg-cream">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Address */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="h-8 w-8 text-gold" />
                <h2 className="font-serif text-3xl text-stone-900">
                  Notre emplacement
                </h2>
              </div>

              <div className="bg-white p-8 rounded-lg mb-8">
                <p className="text-stone-600 mb-4">
                  <strong className="text-stone-900 text-xl font-serif">Rue François Miron</strong>
                  <br />
                  75004 Paris — 4ème arrondissement
                </p>
                <p className="text-stone-500 text-sm">
                  L&apos;une des plus anciennes rues de Paris, bordée de maisons
                  médiévales et d&apos;hôtels particuliers historiques.
                </p>
              </div>

              {/* Metro Stations */}
              <div className="bg-white p-8 rounded-lg">
                <h3 className="font-serif text-xl text-stone-900 mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold" />
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
            </div>

            {/* Map */}
            <div>
              <Map className="sticky top-24" />
            </div>
          </div>
        </Container>
      </section>

      {/* Points of Interest */}
      <section className="py-16 bg-white">
        <Container>
          <h2 className="font-serif text-3xl text-stone-900 mb-12 text-center">
            À proximité
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {pointsOfInterest.map((category) => (
              <div key={category.category} className="bg-cream p-8 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl text-stone-900">
                    {category.category}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {category.places.map((place) => (
                    <li key={place.name} className="flex justify-between items-center">
                      <span className="text-stone-700">{place.name}</span>
                      <span className="text-stone-400 text-sm whitespace-nowrap ml-2">
                        {place.distance}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Recommendations */}
      <section className="py-16 bg-cream">
        <Container size="md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Utensils className="h-8 w-8 text-gold" />
            <h2 className="font-serif text-3xl text-stone-900">
              Nos recommandations
            </h2>
          </div>

          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-stone-600 mb-6">
              À votre arrivée, nous vous fournirons une liste complète de nos
              adresses préférées dans le quartier : restaurants, cafés, bars,
              boutiques...
            </p>
            <p className="text-stone-500 text-sm italic">
              Des conseils de vrais Parisiens pour vivre le Marais comme un local.
            </p>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-stone-900 text-white">
        <Container>
          <div className="text-center">
            <h2 className="font-serif text-3xl mb-6">
              Prêt à découvrir le Marais ?
            </h2>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto">
              Réservez votre séjour et vivez Paris comme un vrai Parisien.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-medium hover:bg-gold-dark transition-colors duration-300"
            >
              Nous contacter
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
