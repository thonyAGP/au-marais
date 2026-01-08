'use client';

import Image from 'next/image';
import { Container, AnimateOnScroll } from '@/components/ui';
import { Heart, MapPin, Globe } from 'lucide-react';

export const Hosts = () => {
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
              Vos hôtes
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-text mb-8">
              Soraya & Anthony
            </h2>

            <div className="space-y-4 text-text-light leading-relaxed">
              <p>
                Bonjour ! Nous sommes Soraya et Anthony, et voici notre fille Lénaïg.
              </p>
              <p>
                Soraya est originaire de Madrid. Après avoir vécu au Maroc, elle s&apos;est
                installée à Paris en 2013 où elle enseigne l&apos;espagnol dans une école bilingue.
                Anthony, breton d&apos;origine, est venu à Paris pour le travail... et n&apos;est jamais reparti !
                Il travaille dans l&apos;informatique.
              </p>
              <p>
                Nous avons acheté cet appartement en 2020 et l&apos;avons entièrement rénové
                à notre goût, en respectant l&apos;histoire du lieu et du quartier. L&apos;immeuble
                date du 17ème siècle et le monument d&apos;en face a été construit en 1656.
              </p>
              <p className="text-text font-medium">
                Nous adorons voyager et découvrir de nouvelles cultures. Si vous avez
                des recommandations de destinations, nous sommes tout ouïe !
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mt-10">
              <span className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 text-sm text-text-light hover:border-gold transition-colors">
                <Heart className="h-4 w-4 text-gold" />
                Passionnés de voyage
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 text-sm text-text-light hover:border-gold transition-colors">
                <MapPin className="h-4 w-4 text-gold" />
                Parisiens depuis 2013
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 text-sm text-text-light hover:border-gold transition-colors">
                <Globe className="h-4 w-4 text-gold" />
                FR · ES · EN
              </span>
            </div>
          </AnimateOnScroll>
        </div>
      </Container>
    </section>
  );
};
