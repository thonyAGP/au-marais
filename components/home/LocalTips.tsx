'use client';

import { Container, AnimateOnScroll } from '@/components/ui';
import { MapPin, Utensils, ShoppingBag } from 'lucide-react';

interface LocalTipsDict {
  sectionTitle: string;
  title: string;
  categories: {
    restaurants: string;
    cafes: string;
    shopping: string;
  };
}

interface LocalTipsProps {
  dict: LocalTipsDict;
}

const getTips = (dict: LocalTipsDict) => [
  {
    category: dict.categories.restaurants,
    icon: Utensils,
    items: [
      {
        name: 'King of Falafel',
        address: '26 Rue des Rosiers',
        description: 'Incontournable du quartier juif. Sandwich mixte à 10€, portions généreuses.',
        tag: 'Street food',
        price: '€',
      },
      {
        name: 'Pamela Popo',
        address: '15 Rue François Miron',
        description: 'Cadre rétro-chic, menu créatif fait maison. Bar à cocktails le soir.',
        tag: 'Rétro-chic',
        price: '€€€',
      },
      {
        name: 'Le Bourguignon du Marais',
        address: '52 Rue François Miron',
        description: 'Spécialités de Bourgogne, dont l\'incontournable boeuf bourguignon.',
        tag: 'Traditionnel',
        price: '€€',
      },
      {
        name: 'Le Gribouille',
        address: '44 Rue de Rivoli',
        description: 'Brasserie avec terrasse ombragée. Happy hour de 17h à 22h.',
        tag: 'Terrasse',
        price: '€€',
      },
    ],
  },
  {
    category: dict.categories.shopping,
    icon: ShoppingBag,
    items: [
      {
        name: 'Boulangerie (Meilleure baguette 2014)',
        address: 'À l\'angle, 50m à droite',
        description: 'Élue meilleure baguette de Paris en 2014. Un must absolu.',
        tag: 'À ne pas manquer',
        price: '€',
      },
      {
        name: 'Les Délices de Manon',
        address: 'Place Saint-Paul',
        description: 'Excellente boulangerie-pâtisserie pour varier les plaisirs.',
        tag: 'Boulangerie',
        price: '€',
      },
      {
        name: 'Vinosfera',
        address: '11 Rue François Miron',
        description: 'Caviste tenu par Igor, un vrai passionné.',
        tag: 'Caviste',
        price: '€€',
      },
      {
        name: 'Boucher Place Saint-Paul',
        address: '113 Rue Saint-Antoine',
        description: 'Viande de qualité et rôtisserie. Parfait pour un poulet rôti.',
        tag: 'Boucher',
        price: '€€',
      },
    ],
  },
];

const mustSee = [
  {
    name: 'Place des Vosges',
    distance: '600m',
    description: 'La plus ancienne place de Paris (1605).',
  },
  {
    name: 'Musée Carnavalet',
    distance: '400m',
    description: 'Histoire de Paris. Entrée gratuite !',
  },
  {
    name: 'Bords de Seine',
    distance: '400m',
    description: 'Promenade aménagée, loin de l\'agitation.',
  },
  {
    name: 'BHV Marais',
    distance: '500m',
    description: 'Le grand magasin lifestyle parisien.',
  },
];

export const LocalTips = ({ dict }: LocalTipsProps) => {
  const tips = getTips(dict);

  return (
    <section className="py-24 bg-cream">
      <Container>
        {/* Header */}
        <AnimateOnScroll className="text-center mb-16">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
            {dict.sectionTitle}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-text mb-4">
            {dict.title}
          </h2>
        </AnimateOnScroll>

        {/* Tips Grid */}
        <div className="space-y-16">
          {tips.map((section, sectionIndex) => (
            <AnimateOnScroll key={section.category} delay={sectionIndex * 150}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 border border-gold/40 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-2xl text-text">{section.category}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white border border-stone-200 p-6 hover:border-gold/50 hover:shadow-md transition-all duration-500 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-text text-lg group-hover:text-gold transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-text-muted text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1 border border-gold/40 text-gold">
                          {item.tag}
                        </span>
                        <span className="text-text-muted text-sm font-medium">
                          {item.price}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-light text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Must See - Keep universal place names */}
        <AnimateOnScroll className="mt-20" delay={300}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 border border-gold/40 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-gold" />
            </div>
            <h3 className="font-serif text-2xl text-text">★</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mustSee.map((place) => (
              <div
                key={place.name}
                className="bg-white border border-stone-200 p-6 text-center hover:border-gold/50 hover:shadow-md transition-all duration-500 group"
              >
                <span className="inline-block px-3 py-1 border border-gold/40 text-gold text-xs mb-4">
                  {place.distance}
                </span>
                <h4 className="font-medium text-text mb-2 group-hover:text-gold transition-colors">
                  {place.name}
                </h4>
                <p className="text-text-muted text-sm">{place.description}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </Container>
    </section>
  );
};
