'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Container, Lightbox } from '@/components/ui';
import { Users, Bed, Bath, Building, Wifi, Utensils, Tv, Wind, Star } from 'lucide-react';

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
      <section className="py-24 bg-stone-100">
        <Container>
          <h1 className="font-serif text-5xl text-stone-900 mb-6 text-center">
            L&apos;appartement
          </h1>
          <p className="text-stone-600 text-center max-w-2xl mx-auto text-lg">
            Un cocon chaleureux au coeur du Marais, mêlant charme historique et
            confort moderne.
          </p>
          {/* Rating */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Star className="h-5 w-5 text-gold fill-gold" />
            <span className="text-stone-900 font-medium">4.97</span>
            <span className="text-stone-500">· 89 avis sur Airbnb</span>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Main image - larger */}
            <button
              onClick={() => openLightbox(0)}
              className="col-span-2 row-span-2 relative aspect-square md:aspect-auto rounded-lg overflow-hidden cursor-zoom-in group"
            >
              <Image
                src={galleryImages[0].src}
                alt={galleryImages[0].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                quality={85}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            {/* Other images */}
            {galleryImages.slice(1).map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index + 1)}
                className="relative aspect-square rounded-lg overflow-hidden cursor-zoom-in group"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  quality={80}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </button>
            ))}
          </div>
          <p className="text-center text-stone-400 text-sm mt-4">
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
      <section className="py-16 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-16">
            {/* Description */}
            <div>
              <h2 className="font-serif text-3xl text-stone-900 mb-6">
                Bienvenue chez vous
              </h2>
              <div className="prose prose-stone">
                <p className="text-stone-600 leading-relaxed mb-4">
                  Bienvenue dans notre appartement, un petit cocon entièrement
                  refait à neuf au coeur de Paris. Niché dans un immeuble du
                  17ème siècle, il a conservé tout son charme d&apos;époque : poutres
                  en bois apparentes, murs en pierres, et cette atmosphère si
                  particulière des vieux immeubles parisiens.
                </p>
                <p className="text-stone-600 leading-relaxed mb-4">
                  Situé rue François Miron, l&apos;une des plus anciennes rues de
                  Paris, vous serez au coeur du Marais avec sa vie de quartier
                  unique. Boutiques, cafés, restaurants, galeries d&apos;art... tout
                  est accessible à pied.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  La station de métro Saint-Paul (ligne 1) est à 200 mètres et
                  dessert directement les Champs-Élysées, le Louvre, la Bastille.
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div>
              <h2 className="font-serif text-3xl text-stone-900 mb-6">
                En bref
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-cream rounded-lg">
                  <Users className="h-8 w-8 text-gold" />
                  <div>
                    <p className="text-stone-900 font-medium">4 voyageurs</p>
                    <p className="text-stone-500 text-sm">Capacité max.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-cream rounded-lg">
                  <Bed className="h-8 w-8 text-gold" />
                  <div>
                    <p className="text-stone-900 font-medium">1 chambre</p>
                    <p className="text-stone-500 text-sm">+ canapé-lit</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-cream rounded-lg">
                  <Bath className="h-8 w-8 text-gold" />
                  <div>
                    <p className="text-stone-900 font-medium">1 salle de bain</p>
                    <p className="text-stone-500 text-sm">Complète</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-cream rounded-lg">
                  <Building className="h-8 w-8 text-gold" />
                  <div>
                    <p className="text-stone-900 font-medium">2ème étage</p>
                    <p className="text-stone-500 text-sm">Sans ascenseur</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-cream">
        <Container>
          <h2 className="font-serif text-3xl text-stone-900 mb-12 text-center">
            Équipements
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Utensils className="h-6 w-6 text-gold" />
                <h3 className="font-serif text-xl text-stone-900">Cuisine</h3>
              </div>
              <ul className="space-y-3">
                {amenities.cuisine.map((item) => (
                  <li key={item} className="text-stone-600 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Wifi className="h-6 w-6 text-gold" />
                <h3 className="font-serif text-xl text-stone-900">Confort</h3>
              </div>
              <ul className="space-y-3">
                {amenities.confort.map((item) => (
                  <li key={item} className="text-stone-600 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Tv className="h-6 w-6 text-gold" />
                <h3 className="font-serif text-xl text-stone-900">Multimédia</h3>
              </div>
              <ul className="space-y-3">
                {amenities.multimedia.map((item) => (
                  <li key={item} className="text-stone-600 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Note */}
      <section className="py-16 bg-white">
        <Container size="md">
          <div className="bg-stone-100 p-8 rounded-lg">
            <h3 className="font-serif text-xl text-stone-900 mb-4">À noter</h3>
            <ul className="space-y-2 text-stone-600">
              <li className="flex items-start gap-2">
                <Wind className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <span>
                  Le couloir principal est étroit, caractéristique des immeubles
                  d&apos;époque du Marais.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Building className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <span>
                  L&apos;appartement est situé au 2ème étage sans ascenseur.
                </span>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-stone-900 text-white">
        <Container>
          <div className="text-center">
            <h2 className="font-serif text-3xl mb-6">Envie de réserver ?</h2>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto">
              Contactez-nous directement ou réservez via Airbnb pour votre séjour
              au coeur du Marais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white font-medium hover:bg-gold-dark transition-colors duration-300"
              >
                Nous contacter
              </a>
              <a
                href="https://www.airbnb.fr/rooms/618442543008929958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium hover:bg-white hover:text-stone-900 transition-colors duration-300"
              >
                Réserver sur Airbnb
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
