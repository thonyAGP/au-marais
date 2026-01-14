'use client';

import { useState } from 'react';
import { Container, AnimateOnScroll } from '@/components/ui';
import { Star, Quote, Globe, ExternalLink } from 'lucide-react';

type SourceType = 'airbnb' | 'homeexchange';

interface TestimonialItem {
  name: string;
  location: string;
  date: string;
  text: string;
  originalText?: string;
  originalLang?: string;
  rating: number;
  translated: boolean;
  source?: string;
}

interface ReviewSource {
  name: string;
  rating: number;
  count: number;
  url: string;
  color: string;
}

interface TestimonialsDict {
  sectionTitle: string;
  title: string;
  subtitle?: string;
  viewAll?: string;
  translatedBy?: string;
  sources: {
    airbnb: ReviewSource;
    homeexchange: ReviewSource;
  };
  items: TestimonialItem[];
}

interface StatsDict {
  reviews: string;
}

interface TestimonialsProps {
  dict: TestimonialsDict;
  stats: StatsDict;
}

const sourceLabels = {
  airbnb: 'Airbnb',
  homeexchange: 'HomeExchange',
};

const sourceColors = {
  airbnb: 'text-[#FF5A5F]',
  homeexchange: 'text-[#00B4A2]',
};

const isValidSource = (s: string): s is SourceType => s === 'airbnb' || s === 'homeexchange';

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
  const rawSource = testimonial.source || 'airbnb';
  const source: SourceType = isValidSource(rawSource) ? rawSource : 'airbnb';

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
          <div className={`text-xs tracking-wider uppercase ${sourceColors[source]}`}>
            via {sourceLabels[source]}
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  );
};

const PlatformBadge = ({ source, reviewsLabel }: { source: ReviewSource; reviewsLabel: string }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-4 bg-white border border-stone-200 rounded-lg px-5 py-4 hover:border-gold/50 hover:shadow-md transition-all group"
  >
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(source.rating) ? 'text-gold fill-gold' : 'text-stone-200'}`}
          />
        ))}
      </div>
      <span className="text-2xl font-serif text-text mt-1">{source.rating}</span>
    </div>
    <div className="border-l border-stone-200 pl-4">
      <p className="font-medium text-text group-hover:text-gold transition-colors">
        {source.name}
      </p>
      <p className="text-text-muted text-sm">
        {source.count} {reviewsLabel}
      </p>
    </div>
    <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors ml-auto" />
  </a>
);

export const Testimonials = ({ dict, stats }: TestimonialsProps) => {
  const testimonials = dict.items || [];
  const sources = dict.sources;
  const totalReviews = (sources?.airbnb?.count || 0) + (sources?.homeexchange?.count || 0);

  return (
    <section className="py-24 bg-cream-dark relative overflow-hidden">
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
          {dict.subtitle && (
            <p className="text-text-muted max-w-2xl mx-auto">
              {dict.subtitle}
            </p>
          )}
        </AnimateOnScroll>

        {/* Platform Badges */}
        {sources && (
          <AnimateOnScroll delay={100} className="mb-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
              {sources.airbnb && (
                <PlatformBadge source={sources.airbnb} reviewsLabel={stats.reviews} />
              )}
              {sources.homeexchange && (
                <PlatformBadge source={sources.homeexchange} reviewsLabel={stats.reviews} />
              )}
            </div>
            <p className="text-center text-text-muted text-sm mt-4">
              {totalReviews}+ {stats.reviews} {dict.subtitle ? '' : 'sur 2 plateformes'}
            </p>
          </AnimateOnScroll>
        )}

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
      </Container>
    </section>
  );
};
