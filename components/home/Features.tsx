import { Sparkles, Train, MapPin, Home } from 'lucide-react';
import { Container } from '@/components/ui';

const features = [
  {
    icon: Sparkles,
    title: 'Charme d\'époque',
    description: 'Poutres en bois apparentes et murs en pierres du 17ème siècle',
  },
  {
    icon: Train,
    title: 'Métro à 200m',
    description: 'Station Saint-Paul (ligne 1) pour accéder à tout Paris',
  },
  {
    icon: MapPin,
    title: 'Quartier historique',
    description: 'Au coeur du Marais, l\'un des quartiers les plus prisés de Paris',
  },
  {
    icon: Home,
    title: 'Entièrement rénové',
    description: 'Appartement refait à neuf avec tout le confort moderne',
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-stone-900 mb-4">
            Pourquoi choisir Au Marais ?
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Un appartement unique alliant le charme de l&apos;ancien et le confort
            moderne, idéalement situé pour découvrir Paris.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-8 rounded-lg bg-cream hover:shadow-lg transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-6">
                <feature.icon className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
