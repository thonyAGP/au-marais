import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface HeroDict {
  subtitle: string;
  title: string;
  description: string;
  cta: string;
  availability: string;
}

interface NavDict {
  book: string;
}

interface CommonDict {
  explore?: string;
}

interface HeroProps {
  dict: HeroDict;
  nav: NavDict;
  common: CommonDict;
  locale: string;
}

export const Hero = ({ dict, nav, common, locale }: HeroProps) => {
  const letters = ['A', 'u', '\u00A0', 'M', 'a', 'r', 'a', 'i', 's'];

  return (
    <section className="relative h-screen overflow-hidden flex items-center justify-center">
      {/* Background Image with Ken Burns effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src="/images/apartment/01-salon.jpg"
            alt="Salon de l'appartement Au Marais avec poutres apparentes"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
        </div>

        {/* Warm brown overlay for readability */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Subtle pattern */}
        <div className="absolute inset-0 pattern-overlay-light opacity-50" />
      </div>

      {/* Gold decorative line */}
      <div className="absolute left-8 md:left-16 top-[30%] bottom-[30%] w-px gold-line-vertical hidden md:block" />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl px-6">
        {/* Animated title letter by letter */}
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-normal tracking-wider mb-6 overflow-hidden">
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`animate-letter-slide letter-delay-${index + 1}`}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase text-gold mb-8 animate-fade-in opacity-0 delay-800">
          {dict.subtitle}
        </p>

        {/* Description */}
        <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in opacity-0 delay-1000">
          {dict.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0 delay-1200">
          <Link href={`/${locale}/appartement`}>
            <Button
              size="lg"
              className="bg-gold text-white hover:bg-gold-dark px-10 py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(201,169,98,0.3)]"
            >
              {dict.cta}
            </Button>
          </Link>
          <Link href={`/${locale}/disponibilites`}>
            <Button
              variant="outline"
              size="lg"
              className="border-white/50 text-white hover:bg-white hover:text-text px-10 py-4 text-sm tracking-widest uppercase font-medium"
            >
              {nav.book}
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in opacity-0 delay-1500">
        <span className="text-white/70 text-xs tracking-[0.2em] uppercase">{common.explore || 'Explore'}</span>
        <div className="w-px h-16 gold-line-vertical animate-scroll-pulse" />
      </div>
    </section>
  );
};
