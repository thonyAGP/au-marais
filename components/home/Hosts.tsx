'use client';

import Image from 'next/image';
import { Container, AnimateOnScroll } from '@/components/ui';
import { Heart, MapPin, Globe } from 'lucide-react';

export const Hosts = () => {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <AnimateOnScroll animation="slide-right" className="relative">
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hosts/family.jpg"
                alt="Soraya, Anthony et Lénaïg"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold/10 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-stone-100 rounded-full -z-10" />
          </AnimateOnScroll>

          {/* Content */}
          <AnimateOnScroll animation="slide-left" delay={200}>
            <p className="text-gold font-medium mb-2 tracking-wide uppercase text-sm">
              Vos hôtes
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">
              Soraya & Anthony
            </h2>

            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                Bonjour ! Nous sommes Soraya et Anthony, et voici notre fille Lénaïg.
              </p>
              <p>
                Soraya est originaire de Madrid. Après avoir vécu au Maroc, elle s'est
                installée à Paris en 2013 où elle enseigne l'espagnol dans une école bilingue.
                Anthony, breton d'origine, est venu à Paris pour le travail... et n'est jamais reparti !
                Il travaille dans l'informatique.
              </p>
              <p>
                Nous avons acheté cet appartement en 2020 et l'avons entièrement rénové
                à notre goût, en respectant l'histoire du lieu et du quartier. L'immeuble
                date du 17ème siècle et le monument d'en face a été construit en 1656.
              </p>
              <p className="text-stone-900 font-medium">
                Nous adorons voyager et découvrir de nouvelles cultures. Si vous avez
                des recommandations de destinations, nous sommes tout ouïe !
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mt-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-sm text-stone-600">
                <Heart className="h-4 w-4 text-gold" />
                Passionnés de voyage
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-sm text-stone-600">
                <MapPin className="h-4 w-4 text-gold" />
                Parisiens depuis 2013
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-sm text-stone-600 hover:bg-gold/10 transition-colors">
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
