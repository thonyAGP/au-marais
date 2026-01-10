import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Button, AnimateOnScroll } from '@/components/ui';

const previewImages = [
  { src: '/images/apartment/01-salon.jpg', alt: 'Salon avec poutres apparentes' },
  { src: '/images/apartment/02-chambre.jpg', alt: 'Chambre cosy' },
  { src: '/images/apartment/03-cuisine.jpg', alt: 'Cuisine équipée' },
  { src: '/images/apartment/04-salle-de-bain.jpg', alt: 'Salle de bain' },
];

interface GalleryDict {
  sectionTitle: string;
  title: string;
  viewAll: string;
}

interface GalleryPreviewProps {
  dict: GalleryDict;
  locale: string;
}

export const GalleryPreview = ({ dict, locale }: GalleryPreviewProps) => {
  return (
    <section className="py-24 bg-cream-dark">
      <Container>
        <AnimateOnScroll className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              {dict.sectionTitle}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-text">
              {dict.title}
            </h2>
          </div>
          <Link
            href={`/${locale}/appartement`}
            className="hidden md:flex items-center gap-2 text-gold text-sm tracking-wider hover:gap-4 transition-all"
          >
            {dict.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </AnimateOnScroll>

        {/* Gallery Grid - Asymmetric layout */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
          <AnimateOnScroll className="col-span-2 row-span-2 relative overflow-hidden group">
            <Link href={`/${locale}/appartement`}>
              <Image
                src={previewImages[0].src}
                alt={previewImages[0].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-text/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </AnimateOnScroll>

          {previewImages.slice(1).map((image, index) => (
            <AnimateOnScroll
              key={index}
              delay={(index + 1) * 100}
              className="relative overflow-hidden group"
            >
              <Link href={`/${locale}/appartement`}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link href={`/${locale}/appartement`}>
            <Button className="bg-gold text-white hover:bg-gold-dark">
              {dict.viewAll}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};
