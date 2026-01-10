'use client';

import { Container, AnimateOnScroll } from '@/components/ui';
import { Utensils, ShoppingBag, Star } from 'lucide-react';

interface LocalTipItem {
  name: string;
  type?: string;
  tag?: string;
  distance?: string;
  description: string;
  address?: string;
  price?: string;
}

interface LocalTipsDict {
  sectionTitle: string;
  title: string;
  categories: {
    restaurants: string;
    cafes: string;
    shopping: string;
  };
  restaurants?: LocalTipItem[];
  shops?: LocalTipItem[];
  mustSee?: LocalTipItem[];
  mustSeeTitle?: string;
}

interface LocalTipsProps {
  dict: LocalTipsDict;
}

export const LocalTips = ({ dict }: LocalTipsProps) => {
  const restaurants = dict.restaurants || [];
  const shops = dict.shops || [];
  const mustSee = dict.mustSee || [];

  const sections = [
    {
      category: dict.categories.restaurants,
      icon: Utensils,
      items: restaurants,
    },
    {
      category: dict.categories.shopping,
      icon: ShoppingBag,
      items: shops,
    },
  ];

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
          {sections.map((section, sectionIndex) => (
            <AnimateOnScroll key={section.category} delay={sectionIndex * 150}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 border border-gold/40 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-2xl text-text">{section.category}</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1 border border-gold/40 text-gold">
                          {item.type || item.tag}
                        </span>
                        {item.price && (
                          <span className="text-text-muted text-sm font-medium">
                            {item.price}
                          </span>
                        )}
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

        {/* Must See */}
        {mustSee.length > 0 && (
          <AnimateOnScroll className="mt-20" delay={300}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 border border-gold/40 flex items-center justify-center">
                <Star className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-serif text-2xl text-text">
                {dict.mustSeeTitle || '★'}
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mustSee.map((place) => (
                <div
                  key={place.name}
                  className="bg-white border border-stone-200 p-6 hover:border-gold/50 hover:shadow-md transition-all duration-500 group"
                >
                  <span className="inline-block px-3 py-1 border border-gold/40 text-gold text-xs mb-4">
                    {place.type || place.tag || place.distance}
                  </span>
                  <h4 className="font-medium text-text mb-2 group-hover:text-gold transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-text-muted text-sm">{place.description}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        )}
      </Container>
    </section>
  );
};
