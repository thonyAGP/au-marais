'use client';

import { Container } from '@/components/ui';
import { MapPin, Utensils, Coffee, Wine, Croissant, ShoppingBag } from 'lucide-react';

const tips = [
  {
    category: 'Nos restaurants préférés',
    icon: Utensils,
    items: [
      {
        name: 'King of Falafel',
        address: '26 Rue des Rosiers',
        description: 'Incontournable du quartier juif. Sandwich mixte à 10€, portions généreuses et explosion de saveurs.',
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
        description: 'Spécialités de Bourgogne, dont l\'incontournable boeuf bourguignon. Formule midi à 20€.',
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
    category: 'Pour vos courses',
    icon: ShoppingBag,
    items: [
      {
        name: 'Boulangerie (Meilleure baguette 2014)',
        address: 'À l\'angle, 50m à droite',
        description: 'Élue meilleure baguette de Paris en 2014. Un must absolu pour le petit-déjeuner.',
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
        description: 'Caviste tenu par Igor, un vrai passionné. Le bâtiment à colombage vaut le détour.',
        tag: 'Caviste',
        price: '€€',
      },
      {
        name: 'Boucher Place Saint-Paul',
        address: '113 Rue Saint-Antoine',
        description: 'Viande de qualité et rôtisserie. Parfait pour un poulet rôti dominical.',
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
    description: 'La plus ancienne place de Paris (1605). Entrée par l\'Hôtel de Sully.',
  },
  {
    name: 'Musée Carnavalet',
    distance: '400m',
    description: 'Histoire de Paris, des origines à nos jours. Entrée gratuite !',
  },
  {
    name: 'Bords de Seine',
    distance: '400m',
    description: 'Promenade aménagée, loin de l\'agitation parisienne.',
  },
  {
    name: 'BHV Marais',
    distance: '500m',
    description: 'Le grand magasin lifestyle parisien depuis 160 ans.',
  },
];

export const LocalTips = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-gold font-medium mb-2 tracking-wide uppercase text-sm">
            Nos bonnes adresses
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            Le Marais comme un local
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Nos adresses testées et approuvées pour profiter du quartier comme de vrais Parisiens.
          </p>
        </div>

        {/* Tips Grid */}
        <div className="space-y-16">
          {tips.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-8">
                <section.icon className="h-6 w-6 text-gold" />
                <h3 className="font-serif text-2xl text-stone-900">{section.category}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-stone-900 text-lg">{item.name}</h4>
                        <p className="text-stone-400 text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded-full">
                          {item.tag}
                        </span>
                        <span className="text-stone-400 text-sm font-medium">
                          {item.price}
                        </span>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Must See */}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="h-6 w-6 text-gold" />
            <h3 className="font-serif text-2xl text-stone-900">À ne pas manquer</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mustSee.map((place) => (
              <div
                key={place.name}
                className="bg-white p-6 rounded-xl shadow-sm text-center"
              >
                <span className="inline-block px-3 py-1 bg-stone-100 text-stone-500 text-xs rounded-full mb-3">
                  {place.distance}
                </span>
                <h4 className="font-medium text-stone-900 mb-2">{place.name}</h4>
                <p className="text-stone-500 text-sm">{place.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
