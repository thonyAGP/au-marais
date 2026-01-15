'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues with map libraries
const MapOptionA = dynamic(() => import('./MapOptionA'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionB = dynamic(() => import('./MapOptionB'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionC = dynamic(() => import('./MapOptionC'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionD = dynamic(() => import('./MapOptionD'), { ssr: false, loading: () => <MapLoader /> });

const MapLoader = () => (
  <div className="h-[400px] bg-neutral-800 animate-pulse flex items-center justify-center">
    <span className="text-neutral-500">Chargement de la carte...</span>
  </div>
);

// Sample visitor data
const visitors = [
  { city: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719, count: 1 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818, count: 1 },
  { city: 'Bussum', country: 'Netherlands', lat: 52.2741, lng: 5.1661, count: 2 },
  { city: 'Tauranga', country: 'New Zealand', lat: -37.6878, lng: 176.1651, count: 1 },
  { city: 'Tvedestrand', country: 'Norway', lat: 58.6178, lng: 8.9326, count: 1 },
  { city: 'Lake Bluff', country: 'United States', lat: 42.2836, lng: -87.8409, count: 1 },
  { city: 'Honolulu', country: 'United States', lat: 21.3069, lng: -157.8583, count: 1 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, count: 1 },
  { city: 'Coral Gables', country: 'United States', lat: 25.7215, lng: -80.2684, count: 1 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, count: 5, isHome: true },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, count: 3 },
  { city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, count: 1 },
];

export default function TestMapsPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: 'A',
      name: 'react-simple-maps',
      description: 'SVG vectoriel avec vrais contours des pays. Léger, personnalisable, idéal pour le web.',
      pros: ['Vrais contours pays', 'SVG = qualité parfaite à tout zoom', 'Très personnalisable', 'Léger (~50kb)'],
      cons: ['Pas de zoom interactif natif', 'Nécessite TopoJSON'],
      component: MapOptionA,
    },
    {
      id: 'B',
      name: 'Leaflet (OpenStreetMap)',
      description: 'Carte interactive avec tuiles. Zoom, pan, markers cliquables.',
      pros: ['Zoom interactif', 'Markers avec popups', 'Style carte familier', 'Villes visibles au zoom'],
      cons: ['Dépend de tuiles externes', 'Look "Google Maps"', 'Plus lourd'],
      component: MapOptionB,
    },
    {
      id: 'C',
      name: 'SVG World (Style Luxe)',
      description: 'Carte SVG haute qualité avec style dark/gold intégré au thème du site.',
      pros: ['Intégration parfaite au thème', 'Pas de dépendance externe', 'Très léger', 'Animations fluides'],
      cons: ['Pas de zoom natif', 'Villes limitées aux markers'],
      component: MapOptionC,
    },
    {
      id: 'D',
      name: 'Points sur fond minimaliste',
      description: 'Approche épurée avec fond de carte subtil et focus sur les connexions.',
      pros: ['Ultra léger', 'Focus sur les données', 'Élégant', 'Rapide à charger'],
      cons: ['Moins détaillé', 'Pas de zoom'],
      component: MapOptionD,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="bg-[#111] border-b border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl mb-4">Test des Cartes du Monde</h1>
          <p className="text-neutral-400 max-w-2xl">
            Compare les différentes options pour la carte des visiteurs.
            Clique sur une carte pour la voir en grand.
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {options.map((option) => (
            <div
              key={option.id}
              className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedOption === option.id
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
                  : 'border-neutral-800 hover:border-neutral-600'
              }`}
              onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
            >
              {/* Option Header */}
              <div className="p-4 border-b border-neutral-800 bg-[#0d0d0d]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center text-sm">
                    {option.id}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                    <p className="text-sm text-neutral-500">{option.description}</p>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="h-[350px] relative">
                <option.component visitors={visitors} />
              </div>

              {/* Pros/Cons */}
              <div className="p-4 border-t border-neutral-800 bg-[#0d0d0d]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">✓ Avantages</h4>
                    <ul className="space-y-1 text-neutral-400">
                      {option.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-orange-400 font-medium mb-2">✗ Inconvénients</h4>
                    <ul className="space-y-1 text-neutral-400">
                      {option.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selection Summary */}
        <div className="mt-12 p-6 bg-[#111] border border-neutral-800 rounded-xl">
          <h2 className="font-serif text-2xl mb-4">Ma Recommandation</h2>
          <p className="text-neutral-400 mb-4">
            Pour ton cas d&apos;usage (montrer les villes d&apos;origine des visiteurs avec un style luxe),
            je recommande <strong className="text-[#D4AF37]">Option A (react-simple-maps)</strong> ou
            <strong className="text-[#D4AF37]"> Option C (SVG Luxe)</strong>.
          </p>
          <p className="text-neutral-400">
            L&apos;option B (Leaflet) est bien si tu veux un zoom interactif jusqu&apos;au niveau rue,
            mais le style &quot;Google Maps&quot; s&apos;intègre moins bien au thème dark luxury du site.
          </p>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a
            href="/fr"
            className="text-[#D4AF37] hover:underline"
          >
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
