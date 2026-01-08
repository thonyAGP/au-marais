'use client';

import { Container, AnimateOnScroll } from '@/components/ui';
import { Star, Quote } from 'lucide-react';

// Placeholder reviews - à remplacer par les vrais avis Airbnb
const testimonials = [
  {
    name: 'Marie',
    date: 'Décembre 2024',
    text: 'Appartement magnifique, exactement comme sur les photos. L\'emplacement est parfait, à deux pas du métro et des meilleurs restaurants du Marais. Soraya et Anthony sont des hôtes très attentionnés.',
    rating: 5,
  },
  {
    name: 'John',
    date: 'Novembre 2024',
    text: 'A perfect little gem in the heart of Paris! The apartment has so much character with the exposed beams and stone walls. We felt like true Parisians. Will definitely come back!',
    rating: 5,
  },
  {
    name: 'Sophie',
    date: 'Octobre 2024',
    text: 'Séjour parfait pour notre anniversaire de mariage. L\'appartement est décoré avec goût, très propre, et les recommandations de restaurants étaient excellentes. Merci !',
    rating: 5,
  },
  {
    name: 'Thomas',
    date: 'Septembre 2024',
    text: 'Très bon accueil, appartement conforme à la description. Le quartier est vivant et authentique. Petit bémol : les escaliers à monter mais ça fait partie du charme parisien !',
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
      {/* Decorative quote */}
      <Quote className="absolute top-12 left-12 h-32 w-32 text-white/5" />
      <Quote className="absolute bottom-12 right-12 h-32 w-32 text-white/5 rotate-180" />

      <Container className="relative z-10">
        {/* Header */}
        <AnimateOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-2xl font-serif text-gold">4.97</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Ce que disent nos voyageurs
          </h2>
          <p className="text-stone-400">
            89 avis sur Airbnb · Super note en propreté, communication et emplacement
          </p>
        </AnimateOnScroll>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimateOnScroll key={index} delay={index * 100}>
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-stone-300 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-stone-500 text-sm">{testimonial.date}</p>
                  </div>
                  <div className="text-stone-500 text-sm">
                    via Airbnb
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.airbnb.fr/rooms/618442543008929958"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
          >
            Voir tous les avis sur Airbnb
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </Container>
    </section>
  );
};
