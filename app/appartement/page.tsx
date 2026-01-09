'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Lightbox, AnimateOnScroll, SuperhostBadge } from '@/components/ui';
import { Users, Bed, Bath, Building, Wifi, Utensils, Tv, Wind, Calendar } from 'lucide-react';

const galleryImages = [
  { src: '/images/apartment/01-salon.jpg', alt: 'Salon avec poutres apparentes' },
  { src: '/images/apartment/02-chambre.jpg', alt: 'Chambre cosy' },
  { src: '/images/apartment/03-cuisine.jpg', alt: 'Cuisine équipée' },
  { src: '/images/apartment/04-salle-de-bain.jpg', alt: 'Salle de bain' },
  { src: '/images/apartment/05-detail-1.jpg', alt: 'Détail de l\'appartement' },
  { src: '/images/apartment/06-detail-2.jpg', alt: 'Vue de l\'appartement' },
  { src: '/images/apartment/07-detail-3.jpg', alt: 'Ambiance de l\'appartement' },
  { src: '/images/apartment/08-detail-4.jpg', alt: 'Charme parisien' },
];

const amenities = {
  cuisine: [
    'Plaques de cuisson',
    'Réfrigérateur',
    'Micro-ondes',
    'Cafetière',
    'Bouilloire',
    'Ustensiles de cuisine',
  ],
  confort: [
    'WiFi haut débit',
    'Chauffage',
    'Linge de lit',
    'Serviettes',
    'Fer à repasser',
    'Sèche-cheveux',
  ],
  multimedia: ['Télévision'],
};

export default function AppartementPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-24 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Votre séjour
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
              L&apos;appartement
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              Un cocon chaleureux au coeur du Marais, mêlant charme historique et
              confort moderne.
            </p>
            {/* Superhost Badge */}
            <div className="mt-10">
              <SuperhostBadge variant="full" showExtras />
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-cream">
        <Container>
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
          <p className="text-center text-text-muted text-sm mt-6">
            Cliquez sur une photo pour l&apos;agrandir
          </p>
        </Container>
      </section>

      {/* Lightbox */}
      <Lightbox
        images={galleryImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {/* Details */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-16">
            {/* Description */}
            <AnimateOnScroll>
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                Description
              </p>
              <h2 className="font-serif text-3xl text-text mb-8">
                Bienvenue chez vous
              </h2>
              <div className="space-y-4 text-text-light leading-relaxed">
                <p>
                  Bienvenue dans notre appartement, un petit cocon entièrement
                  refait à neuf au coeur de Paris. Niché dans un immeuble du
                  17ème siècle, il a conservé tout son charme d&apos;époque : poutres
                  en bois apparentes, murs en pierres, et cette atmosphère si
                  particulière des vieux immeubles parisiens.
                </p>
                <p>
                  Situé rue François Miron, l&apos;une des plus anciennes rues de
                  Paris, vous serez au coeur du Marais avec sa vie de quartier
                  unique. Boutiques, cafés, restaurants, galeries d&apos;art... tout
                  est accessible à pied.
                </p>
                <p>
                  La station de métro Saint-Paul (ligne 1) est à 200 mètres et
                  dessert directement les Champs-Élysées, le Louvre, la Bastille.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Quick Info */}
            <AnimateOnScroll delay={200}>
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
                Informations
              </p>
              <h2 className="font-serif text-3xl text-text mb-8">
                En bref
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">4 voyageurs</p>
                    <p className="text-text-muted text-sm">Capacité max.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Bed className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">1 chambre</p>
                    <p className="text-text-muted text-sm">+ canapé-lit</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Bath className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">1 salle de bain</p>
                    <p className="text-text-muted text-sm">Complète</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-cream border border-stone-200 hover:border-gold/50 transition-colors">
                  <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                    <Building className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-text font-medium">2ème étage</p>
                    <p className="text-text-muted text-sm">Sans ascenseur</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Amenities */}
      <section className="py-20 bg-cream-dark">
        <Container>
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Confort
            </p>
            <h2 className="font-serif text-4xl text-text">
              Équipements
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimateOnScroll className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">Cuisine</h3>
              </div>
              <ul className="space-y-3">
                {amenities.cuisine.map((item) => (
                  <li key={item} className="text-text-muted text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100} className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">Confort</h3>
              </div>
              <ul className="space-y-3">
                {amenities.confort.map((item) => (
                  <li key={item} className="text-text-muted text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200} className="bg-white border border-stone-200 p-8 hover:border-gold/50 hover:shadow-md transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-serif text-xl text-text">Multimédia</h3>
              </div>
              <ul className="space-y-3">
                {amenities.multimedia.map((item) => (
                  <li key={item} className="text-text-muted text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* Note */}
      <section className="py-16 bg-cream">
        <Container size="md">
          <AnimateOnScroll className="bg-white border border-stone-200 p-8">
            <h3 className="font-serif text-xl text-text mb-6">À noter</h3>
            <ul className="space-y-4 text-text-light">
              <li className="flex items-start gap-4">
                <Wind className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                <span>
                  Le couloir principal est étroit, caractéristique des immeubles
                  d&apos;époque du Marais.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <Building className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                <span>
                  L&apos;appartement est situé au 2ème étage sans ascenseur.
                </span>
              </li>
            </ul>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* Calendar CTA */}
      <section className="py-20 bg-white">
        <Container size="md">
          <AnimateOnScroll className="text-center">
            <div className="w-20 h-20 mx-auto border border-gold/30 flex items-center justify-center mb-8">
              <Calendar className="h-10 w-10 text-gold" />
            </div>
            <h2 className="font-serif text-4xl text-text mb-4">
              Vérifier les disponibilités
            </h2>
            <p className="text-text-muted mb-10 max-w-xl mx-auto">
              Consultez notre calendrier pour voir les dates disponibles et planifier votre séjour.
            </p>
            <Link
              href="/disponibilites"
              className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(196,116,90,0.25)]"
            >
              Voir le calendrier
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream-dark relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/10 rounded-full" />
        </div>

        <Container className="relative z-10">
          <AnimateOnScroll className="text-center">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
              Réservation
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-text mb-6">
              Envie de réserver ?
            </h2>
            <p className="text-text-muted mb-10 max-w-xl mx-auto">
              Contactez-nous directement ou réservez via Airbnb pour votre séjour
              au coeur du Marais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-10 py-5 bg-gold text-white font-medium text-sm tracking-widest uppercase hover:bg-gold-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(196,116,90,0.25)]"
              >
                Nous contacter
              </a>
              <a
                href="https://www.airbnb.fr/rooms/618442543008929958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-10 py-5 border border-text/20 text-text font-medium text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300"
              >
                Réserver sur Airbnb
              </a>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>
    </div>
  );
}
