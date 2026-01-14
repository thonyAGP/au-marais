'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lightbox, AnimateOnScroll } from '@/components/ui';

const galleryImages = [
  { src: '/images/apartment/01-salon.jpg', alt: 'Salon lumineux, poutres XVIIe et vue sur rue' },
  { src: '/images/apartment/02-chambre.jpg', alt: 'Espace de vie ouvert avec coin bureau' },
  { src: '/images/apartment/03-cuisine.jpg', alt: 'Cuisine moderne, table 4 places et parquet chevron' },
  { src: '/images/apartment/04-salle-de-bain.jpg', alt: 'Cuisine moderne ouverte' },
  { src: '/images/apartment/05-detail-1.jpg', alt: 'Entrée avec rangements et parquet massif' },
  { src: '/images/apartment/06-detail-2.jpg', alt: 'Chambre au calme' },
  { src: '/images/apartment/07-detail-3.jpg', alt: 'Chambre avec verrière style atelier' },
  { src: '/images/apartment/08-detail-4.jpg', alt: 'Verrière industrielle et lumière naturelle' },
];

interface ApartmentGalleryProps {
  clickToEnlarge: string;
}

export const ApartmentGallery = ({ clickToEnlarge }: ApartmentGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
        {/* Main image - larger */}
        <AnimateOnScroll className="col-span-2 row-span-2">
          <button
            onClick={() => openLightbox(0)}
            className="relative h-full w-full overflow-hidden cursor-zoom-in group"
          >
            <Image
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              quality={85}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 transition-colors duration-500" />
          </button>
        </AnimateOnScroll>
        {/* Other images */}
        {galleryImages.slice(1).map((image, index) => (
          <AnimateOnScroll key={index} delay={(index + 1) * 50}>
            <button
              onClick={() => openLightbox(index + 1)}
              className="relative h-full w-full overflow-hidden cursor-zoom-in group"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={80}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 transition-colors duration-500" />
            </button>
          </AnimateOnScroll>
        ))}
      </div>
      <p className="text-center text-text-muted text-sm mt-6">{clickToEnlarge}</p>

      <Lightbox
        images={galleryImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)}
        onPrev={() => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
      />
    </>
  );
};
