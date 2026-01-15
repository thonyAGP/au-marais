'use client';

import { useState, useEffect } from 'react';
import { Container, AnimateOnScroll } from '@/components/ui';
import { Star, Quote, MessageSquare, MapPin } from 'lucide-react';
import type { TestimonialPublic } from '@/types/testimonial';

interface NativeTestimonialsDict {
  sectionTitle: string;
  title: string;
  subtitle: string;
  noTestimonials: string;
  leaveReview: string;
}

interface NativeTestimonialsProps {
  dict: NativeTestimonialsDict;
  locale: string;
}

const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: TestimonialPublic;
  index: number;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <AnimateOnScroll delay={index * 100}>
      <div className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-lg transition-all duration-500 group h-full flex flex-col">
        <div className="flex items-center gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gold fill-gold" />
          ))}
          {[...Array(5 - testimonial.rating)].map((_, i) => (
            <Star key={`empty-${i}`} className="h-4 w-4 text-stone-200" />
          ))}
        </div>

        <p className="text-text-light leading-relaxed mb-4 font-light flex-grow">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-auto">
          <div>
            <p className="font-medium text-text">{testimonial.author.name}</p>
            {testimonial.author.location && (
              <p className="text-text-muted text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {testimonial.author.location}
              </p>
            )}
            <p className="text-text-muted text-xs mt-1">
              {formatDate(testimonial.publishedAt)}
            </p>
          </div>
          <div className="text-xs tracking-wider uppercase text-gold flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Témoignage vérifié
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
};

export const NativeTestimonials = ({ dict, locale }: NativeTestimonialsProps) => {
  const [testimonials, setTestimonials] = useState<TestimonialPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials?limit=6')
      .then((res) => {
        if (!res.ok) {
          // API error (e.g., 500 when Vercel KV unavailable locally)
          // Silently fail and show no testimonials
          return { testimonials: [] };
        }
        return res.json();
      })
      .then((data) => {
        setTestimonials(data.testimonials || []);
        setLoading(false);
      })
      .catch(() => {
        // Network error - silently fail
        setLoading(false);
      });
  }, []);

  // Don't render section if no testimonials
  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-cream relative overflow-hidden" data-testid="native-testimonials">
      {/* Decorative quote */}
      <Quote className="absolute top-12 left-12 h-32 w-32 text-gold/10" />
      <Quote className="absolute bottom-12 right-12 h-32 w-32 text-gold/10 rotate-180" />

      <Container className="relative z-10">
        {/* Header */}
        <AnimateOnScroll className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
            {dict.sectionTitle}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-text mb-4">
            {dict.title}
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">{dict.subtitle}</p>
        </AnimateOnScroll>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-gold">Chargement...</div>
          </div>
        )}

        {/* Testimonials Grid */}
        {!loading && testimonials.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        )}

        {/* CTA to leave a review */}
        <AnimateOnScroll delay={300} className="text-center mt-12">
          <a
            href={`/${locale}/temoignage`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white font-medium hover:bg-gold-dark transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            {dict.leaveReview}
          </a>
        </AnimateOnScroll>
      </Container>
    </section>
  );
};
