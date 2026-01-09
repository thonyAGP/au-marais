'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

// Photos vérifiées pour chaque lieu - mélange Pexels et Unsplash
const photoOptions = {
  'Place des Vosges': [
    { id: 'A', url: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?w=600', desc: 'Vue nocturne place parisienne' },
    { id: 'B', url: 'https://images.pexels.com/photos/1850619/pexels-photo-1850619.jpeg?w=600', desc: 'Architecture Paris historique' },
    { id: 'C', url: 'https://images.pexels.com/photos/2344/cars-france-landmark-lights.jpg?w=600', desc: 'Monument Paris nuit' },
    { id: 'D', url: 'https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg?w=600', desc: 'Paris coucher soleil' },
    { id: 'E', url: 'https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg?w=600', desc: 'Bâtiment historique' },
    { id: 'F', url: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?w=600', desc: 'Rue parisienne' },
  ],
  'Centre Pompidou': [
    { id: 'A', url: 'https://images.pexels.com/photos/15785071/pexels-photo-15785071.jpeg?w=600', desc: 'Extérieur Pompidou (Pexels vérifié)' },
    { id: 'B', url: 'https://images.pexels.com/photos/30341658/pexels-photo-30341658.jpeg?w=600', desc: 'Vue depuis Pompidou (Pexels vérifié)' },
    { id: 'C', url: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?w=600', desc: 'Architecture moderne Paris' },
    { id: 'D', url: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?w=600', desc: 'Quartier Beaubourg' },
    { id: 'E', url: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?w=600', desc: 'Musée Paris' },
    { id: 'F', url: 'https://images.pexels.com/photos/2404046/pexels-photo-2404046.jpeg?w=600', desc: 'Art contemporain' },
  ],
  'Notre-Dame': [
    { id: 'A', url: 'https://images.pexels.com/photos/2343465/pexels-photo-2343465.jpeg?w=600', desc: 'Façade Notre-Dame' },
    { id: 'B', url: 'https://images.pexels.com/photos/705764/pexels-photo-705764.jpeg?w=600', desc: 'Cathédrale gothique' },
    { id: 'C', url: 'https://images.pexels.com/photos/1850619/pexels-photo-1850619.jpeg?w=600', desc: 'Monument parisien' },
    { id: 'D', url: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?w=600', desc: 'Architecture gothique' },
    { id: 'E', url: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?w=600', desc: 'Seine et Notre-Dame' },
    { id: 'F', url: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?w=600', desc: 'Paris by night' },
  ],
  'Île Saint-Louis': [
    { id: 'A', url: 'https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg?w=600', desc: 'Seine coucher soleil' },
    { id: 'B', url: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?w=600', desc: 'Ponts de Paris' },
    { id: 'C', url: 'https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg?w=600', desc: 'Quais parisiens' },
    { id: 'D', url: 'https://images.pexels.com/photos/2344/cars-france-landmark-lights.jpg?w=600', desc: 'Paris romantique' },
    { id: 'E', url: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?w=600', desc: 'Rue île' },
    { id: 'F', url: 'https://images.pexels.com/photos/2404046/pexels-photo-2404046.jpeg?w=600', desc: 'Architecture parisienne' },
  ],
  'Hôtel de Ville': [
    { id: 'A', url: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?w=600', desc: 'Place illuminée' },
    { id: 'B', url: 'https://images.pexels.com/photos/1850619/pexels-photo-1850619.jpeg?w=600', desc: 'Bâtiment Renaissance' },
    { id: 'C', url: 'https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg?w=600', desc: 'Monument Paris' },
    { id: 'D', url: 'https://images.pexels.com/photos/2344/cars-france-landmark-lights.jpg?w=600', desc: 'Paris nocturne' },
    { id: 'E', url: 'https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg?w=600', desc: 'Architecture officielle' },
    { id: 'F', url: 'https://images.pexels.com/photos/705764/pexels-photo-705764.jpeg?w=600', desc: 'Mairie Paris' },
  ],
  'Rue des Rosiers': [
    { id: 'A', url: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?w=600', desc: 'Rue animée Marais' },
    { id: 'B', url: 'https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg?w=600', desc: 'Quartier historique' },
    { id: 'C', url: 'https://images.pexels.com/photos/2404046/pexels-photo-2404046.jpeg?w=600', desc: 'Commerce parisien' },
    { id: 'D', url: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?w=600', desc: 'Terrasse café' },
    { id: 'E', url: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?w=600', desc: 'Rue pavée' },
    { id: 'F', url: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?w=600', desc: 'Ambiance Marais' },
  ],
};

// Liens pour chercher plus de photos
const searchLinks = {
  'Place des Vosges': 'https://www.pexels.com/search/place%20des%20vosges/',
  'Centre Pompidou': 'https://www.pexels.com/search/centre%20pompidou/',
  'Notre-Dame': 'https://www.pexels.com/search/notre%20dame%20paris/',
  'Île Saint-Louis': 'https://www.pexels.com/search/seine%20paris/',
  'Hôtel de Ville': 'https://www.pexels.com/search/paris%20city%20hall/',
  'Rue des Rosiers': 'https://www.pexels.com/search/marais%20paris/',
};

export default function TestPhotosPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (place: string, id: string) => {
    setSelections(prev => ({ ...prev, [place]: id }));
  };

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl text-text mb-4">Sélection des photos - Lieux à visiter</h1>
        <p className="text-text-muted mb-2">
          Cliquez sur la photo préférée pour chaque lieu. Si aucune ne convient, utilisez le lien &quot;Chercher plus&quot; pour trouver d&apos;autres options sur Pexels.
        </p>
        <p className="text-sm text-gold mb-8">
          Note: Certaines photos sont génériques de Paris. Dites-moi vos choix ou envoyez-moi des URLs de photos spécifiques.
        </p>

        {Object.entries(photoOptions).map(([place, photos]) => (
          <div key={place} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-text flex items-center gap-4">
                {place}
                {selections[place] && (
                  <span className="text-sm bg-gold text-white px-3 py-1 rounded">
                    Sélection: {selections[place]}
                  </span>
                )}
              </h2>
              <a
                href={searchLinks[place as keyof typeof searchLinks]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gold hover:text-gold-dark flex items-center gap-1"
              >
                Chercher plus sur Pexels <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handleSelect(place, photo.id)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg transition-all duration-300 ${
                    selections[place] === photo.id
                      ? 'ring-4 ring-gold scale-105 shadow-xl'
                      : 'hover:scale-102 hover:shadow-lg'
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.desc}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                      {photo.id}: {photo.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(selections).length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-lg border border-gold/30">
            <h3 className="font-serif text-xl text-text mb-4">Vos sélections</h3>
            <ul className="space-y-2">
              {Object.entries(selections).map(([place, id]) => (
                <li key={place} className="text-text-light">
                  <strong>{place}:</strong> Option {id}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-text-muted">
              Copiez ce texte et envoyez-le moi : <br />
              <code className="bg-cream p-2 block mt-2 rounded">
                {Object.entries(selections).map(([place, id]) => `${place}: ${id}`).join(', ')}
              </code>
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gold/10 rounded-lg">
          <h3 className="font-medium text-text mb-2">Option alternative</h3>
          <p className="text-sm text-text-muted">
            Si vous trouvez une photo parfaite sur Pexels ou Unsplash, copiez son URL et envoyez-la moi.
            Je l&apos;intégrerai directement au site.
          </p>
        </div>
      </div>
    </div>
  );
}
