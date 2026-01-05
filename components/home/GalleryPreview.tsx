import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Button } from '@/components/ui';

const previewImages = [
  { src: '/images/apartment/01-salon.jpg', alt: 'Salon avec poutres apparentes' },
  { src: '/images/apartment/02-chambre.jpg', alt: 'Chambre cosy' },
  { src: '/images/apartment/03-cuisine.jpg', alt: 'Cuisine équipée' },
  { src: '/images/apartment/04-salle-de-bain.jpg', alt: 'Salle de bain' },
];

export const GalleryPreview = () => {
  return (
    <section className="py-24 bg-cream">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-stone-900 mb-4">
            Découvrez l&apos;appartement
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Un intérieur chaleureux qui a conservé tout son caractère d&apos;époque.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {previewImages.map((image, index) => (
            <Link
              key={index}
              href="/appartement"
              className="aspect-square relative rounded-lg overflow-hidden group"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/appartement">
            <Button variant="outline" className="group">
              Voir toutes les photos
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};
