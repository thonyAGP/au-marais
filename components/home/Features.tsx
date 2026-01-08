import { Sparkles, Train, MapPin, Home } from 'lucide-react';
import { Container, AnimateOnScroll } from '@/components/ui';

const features = [
  {
    icon: Sparkles,
    title: 'Charme historique',
    description: 'Poutres du 17ème siècle et murs en pierres authentiques',
  },
  {
    icon: Train,
    title: 'Métro à 200m',
    description: 'Station Saint-Paul (ligne 1) pour explorer tout Paris',
  },
  {
    icon: MapPin,
    title: 'Le Marais',
    description: 'Au cœur du quartier le plus authentique de Paris',
  },
  {
    icon: Home,
    title: 'Confort moderne',
    description: 'Entièrement rénové avec équipements premium',
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <AnimateOnScroll className="text-center mb-16">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
            Prestations
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-text mb-6">
            Un séjour inoubliable
          </h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Un appartement unique alliant le charme de l&apos;ancien et le confort
            moderne, idéalement situé pour découvrir Paris.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <AnimateOnScroll key={feature.title} delay={index * 100}>
              <div className="text-center p-8 bg-white border border-stone-200 hover:border-gold/50 transition-all duration-500 group hover:-translate-y-2 hover:shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 border border-gold/30 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <feature.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
};
