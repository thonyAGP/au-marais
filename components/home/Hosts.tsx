'use client';

import Image from 'next/image';
import { Container, AnimateOnScroll } from '@/components/ui';
import { Star, MessageCircle } from 'lucide-react';

interface HostsDict {
  sectionTitle: string;
  title: string;
  description: string;
  superhost: string;
  rating: string;
  reviews: string;
  responseTime: string;
}

interface HostsProps {
  dict: HostsDict;
}

export const Hosts = ({ dict }: HostsProps) => {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <AnimateOnScroll animation="slide-right" className="relative">
            <div className="aspect-[4/5] relative overflow-hidden">
              <Image
                src="/images/hosts/family.jpg"
                alt="Soraya, Anthony et Lénaïg"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gold frame effect */}
              <div className="absolute inset-0 border border-gold/30" />
            </div>
            {/* Decorative gold corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-gold/40" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-gold/40" />
          </AnimateOnScroll>

          {/* Content */}
          <AnimateOnScroll animation="slide-left" delay={200}>
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-text mb-8">
              {dict.title}
            </h2>

            <div className="space-y-4 text-text-light leading-relaxed">
              <p>{dict.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mt-10">
              <span className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 text-sm text-text-light hover:border-gold transition-colors">
                <Star className="h-4 w-4 text-gold fill-gold" />
                {dict.superhost}
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 text-sm text-text-light hover:border-gold transition-colors">
                <Star className="h-4 w-4 text-gold fill-gold" />
                {dict.rating}: 4.97 (89 {dict.reviews})
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 text-sm text-text-light hover:border-gold transition-colors">
                <MessageCircle className="h-4 w-4 text-gold" />
                {dict.responseTime}
              </span>
            </div>
          </AnimateOnScroll>
        </div>
      </Container>
    </section>
  );
};
