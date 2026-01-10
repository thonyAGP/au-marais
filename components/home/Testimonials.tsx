'use client';

import { useState } from 'react';
import { Container, AnimateOnScroll } from '@/components/ui';
import { Star, Quote, Globe } from 'lucide-react';

interface TestimonialItem {
  name: string;
  location: string;
  date: string;
  text: string;
  originalText?: string;
  originalLang?: string;
  rating: number;
  translated: boolean;
}

interface TestimonialsDict {
  sectionTitle: string;
  title: string;
  viewAll?: string;
  translatedBy?: string;
  items: TestimonialItem[];
}

interface StatsDict {
  reviews: string;
}

interface TestimonialsProps {
  dict: TestimonialsDict;
  stats: StatsDict;
}

const TestimonialCard = ({
  testimonial,
  translatedBy,
  index
}: {
  testimonial: TestimonialItem;
  translatedBy?: string;
  index: number;
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const displayText = showOriginal && testimonial.originalText
    ? testimonial.originalText
    : testimonial.text;

  return (
    <AnimateOnScroll delay={index * 100}>
      <div className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-lg transition-all duration-500 group h-full flex flex-col">
        <div className="flex items-center gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gold fill-gold" />
          ))}
        </div>
        <p className="text-text-light leading-relaxed mb-4 font-light flex-grow">
          &ldquo;{displayText}&rdquo;
        </p>

        {/* Translation indicator */}
        {testimonial.translated && testimonial.originalText && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs text-text-muted hover:text-gold transition-colors flex items-center gap-1.5 mb-6"
          >
            <Globe className="h-3 w-3" />
            {showOriginal ? (
              <span>Afficher la traduction</span>
            ) : (
              <span>{translatedBy} · Afficher l&apos;original</span>
            )}
          </button>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-auto">
          <div>
            <p className="font-medium text-text">{testimonial.name}</p>
            <p className="text-text-muted text-sm">{testimonial.location}</p>
            <p className="text-text-muted text-xs mt-1">{testimonial.date}</p>
          </div>
          <div className="text-gold/70 text-xs tracking-wider uppercase">
            via Airbnb
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
};

export const Testimonials = ({ dict, stats }: TestimonialsProps) => {
  const testimonials = dict.items || [];

  return (
    <section className="py-24 bg-cream-dark relative overflow-hidden">
      {/* Decorative quote */}
      <Quote className="absolute top-12 left-12 h-32 w-32 text-gold/10" />
      <Quote className="absolute bottom-12 right-12 h-32 w-32 text-gold/10 rotate-180" />

      <Container className="relative z-10">
        {/* Header */}
        <AnimateOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-3xl font-serif text-gold">4.97</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-text mb-4">
            {dict.title}
          </h2>
          <p className="text-text-muted text-sm tracking-wider">
            89 {stats.reviews} · Airbnb
          </p>
        </AnimateOnScroll>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              translatedBy={dict.translatedBy}
              index={index}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.airbnb.fr/rooms/618442543008929958"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors text-sm tracking-wider"
          >
            {dict.viewAll || 'Airbnb'}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </Container>
    </section>
  );
};
