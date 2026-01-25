'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues with map libraries
const MapOptionA = dynamic(() => import('./MapOptionA'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionB = dynamic(() => import('./MapOptionB'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionC = dynamic(() => import('./MapOptionC'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionD = dynamic(() => import('./MapOptionD'), { ssr: false, loading: () => <MapLoader /> });
const MapOptionE = dynamic(() => import('./MapOptionE'), { ssr: false, loading: () => <MapLoader /> });

const MapLoader = () => (
  <div className="h-[400px] bg-neutral-800 animate-pulse flex items-center justify-center">
    <span className="text-neutral-500">Chargement de la carte...</span>
  </div>
);

// Visitor data with checkin dates for animation
const visitors = [
  { city: 'Bussum', country: 'Netherlands', lat: 52.2741, lng: 5.1661, count: 1, checkin: '2024-11-08' },
  { city: 'Paris (Julien)', country: 'France', lat: 48.85, lng: 2.35, count: 1, checkin: '2024-11-19' },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, count: 1, checkin: '2025-01-10' },
  { city: 'Paris (Anais)', country: 'France', lat: 48.86, lng: 2.36, count: 1, checkin: '2025-03-28' },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, count: 1, checkin: '2025-04-09' },
  { city: 'Paris (Stephanie)', country: 'France', lat: 48.87, lng: 2.34, count: 1, checkin: '2025-05-23' },
  { city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, count: 1, checkin: '2025-11-01' },
  { city: 'Honolulu', country: 'United States', lat: 21.3069, lng: -157.8583, count: 1, checkin: '2025-11-10' },
  { city: 'Paris (Nadia)', country: 'France', lat: 48.84, lng: 2.37, count: 1, checkin: '2025-11-14' },
  { city: 'Paris (Lee)', country: 'France', lat: 48.88, lng: 2.33, count: 1, checkin: '2025-12-05' },
  { city: 'Lake Bluff', country: 'United States', lat: 42.2836, lng: -87.8409, count: 1, checkin: '2025-12-16' },
  { city: 'Shannon (US)', country: 'United States', lat: 38.9072, lng: -77.0369, count: 1, checkin: '2026-02-10' },
  { city: 'Alba (Spain)', country: 'Spain', lat: 41.3851, lng: 2.1734, count: 1, checkin: '2026-02-20' },
  { city: 'Coral Gables', country: 'United States', lat: 25.7215, lng: -80.2684, count: 1, checkin: '2026-03-06' },
  { city: 'Lake Bluff 2', country: 'United States', lat: 42.2836, lng: -87.8409, count: 1, checkin: '2026-03-21' },
  { city: 'Félix (Spain)', country: 'Spain', lat: 39.4699, lng: -0.3763, count: 1, checkin: '2026-03-28' },
  { city: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719, count: 1, checkin: '2026-05-12' },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818, count: 1, checkin: '2026-05-16' },
  { city: 'Bussum 2', country: 'Netherlands', lat: 52.2741, lng: 5.1661, count: 1, checkin: '2026-05-20' },
  { city: 'Tauranga', country: 'New Zealand', lat: -37.6878, lng: 176.1651, count: 1, checkin: '2026-05-24' },
  { city: 'Tvedestrand', country: 'Norway', lat: 58.6178, lng: 8.9326, count: 1, checkin: '2026-05-28' },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, count: 5, isHome: true },
];

export default function TestMapsPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: 'E',
      name: '⭐ Pays illuminés + Animation',
      description: 'Combine les vrais contours (Option A) avec les pays qui s\'illuminent au passage des visiteurs.',
      pros: ['Pays colorés en doré', 'Animation temporelle', 'Vrais contours', 'Effet "monde qui s\'illumine"'],
      cons: ['Pas de zoom natif'],
      component: MapOptionE,
      recommended: true,
    },
    {
      id: 'A',
      name: 'react-simple-maps',
      description: 'SVG vectoriel avec vrais contours des pays. Léger, personnalisable, idéal pour le web.',
      pros: ['Vrais contours pays', 'SVG = qualité parfaite', 'Très personnalisable', 'Léger (~50kb)'],
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
      cons: ['Pas de zoom natif', 'Continents simplifiés'],
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
            L&apos;option E est la nouvelle avec animation temporelle des pays illuminés.
          </p>
        </div>
      </div>

      {/* Featured Option E - Full Width */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#111] border-2 border-[#D4AF37] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#D4AF37] text-black font-bold rounded text-sm">
                RECOMMANDÉ
              </span>
              <div>
                <h3 className="font-semibold text-xl text-[#D4AF37]">Option E - Pays illuminés + Animation temporelle</h3>
                <p className="text-sm text-neutral-400">
                  Les pays s&apos;illuminent en doré au passage des visiteurs. Clique sur &quot;Animer&quot; pour voir l&apos;effet chronologique.
                </p>
              </div>
            </div>
          </div>
          <div className="h-[500px]">
            <MapOptionE visitors={visitors} />
          </div>
        </div>
      </div>

      {/* Other Options Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="font-serif text-2xl mb-6 text-neutral-400">Autres options</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {options.filter(o => o.id !== 'E').map((option) => (
            <div
              key={option.id}
              className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 ${
                selectedOption === option.id
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
                  : 'border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {/* Option Header */}
              <div className="p-3 border-b border-neutral-800 bg-[#0d0d0d]">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-neutral-700 text-white font-bold flex items-center justify-center text-sm">
                    {option.id}
                  </span>
                  <div>
                    <h3 className="font-semibold">{option.name}</h3>
                    <p className="text-xs text-neutral-500">{option.description}</p>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="h-[280px] relative">
                <option.component visitors={visitors} />
              </div>

              {/* Pros/Cons - Compact */}
              <div className="p-3 border-t border-neutral-800 bg-[#0d0d0d] text-xs">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-green-400">✓</span>
                    <span className="text-neutral-500 ml-1">{option.pros.slice(0, 2).join(' • ')}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-orange-400">✗</span>
                    <span className="text-neutral-500 ml-1">{option.cons[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
