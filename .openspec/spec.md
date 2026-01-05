# Au Marais - Site Web Location Courte Durée

> Site vitrine moderne pour une location courte durée dans le Marais à Paris

## Vue d'ensemble

Site web Next.js 15 pour promouvoir l'appartement "Au Marais", une location courte durée au coeur du 4ème arrondissement de Paris.

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.x | Framework React (App Router) |
| React | 19.x | UI Library |
| TypeScript | 5.x | Typage |
| Tailwind CSS | 4.x | Styling |
| Lucide React | latest | Icônes |
| date-fns | 4.x | Manipulation dates |

## Architecture

```
au-marais/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Accueil
│   ├── appartement/       # Page appartement
│   ├── quartier/          # Page quartier
│   ├── contact/           # Page contact
│   └── api/availability/  # API Smoobu
├── components/
│   ├── layout/            # Header, Footer
│   ├── home/              # Hero, Features, GalleryPreview
│   └── ui/                # Button, Card, Container
├── lib/
│   ├── utils.ts           # Helper cn()
│   └── smoobu.ts          # Client API Smoobu
└── types/                 # Types TypeScript
```

## Fonctionnalités

### Terminées
- [x] Structure projet Next.js 15
- [x] Design system (couleurs, typographie)
- [x] Composants UI (Button, Card, Container, MetroLine, Map, Lightbox)
- [x] Layout (Header + Footer avec navigation)
- [x] Page d'accueil (Hero, Features, GalleryPreview, CTA)
- [x] Page Appartement (galerie 8 photos + lightbox, équipements, note Airbnb 4.97★)
- [x] Page Quartier (POI, transports avec logos RATP, carte OpenStreetMap)
- [x] Page Contact (formulaire WhatsApp, FAQ)
- [x] API route proxy Smoobu
- [x] Photos Airbnb intégrées (8 images)
- [x] Composant MetroLine avec couleurs officielles RATP
- [x] Composant Map (OpenStreetMap embed)
- [x] Lightbox pour galerie photos (navigation clavier)
- [x] SEO complet (meta tags, Open Graph, Twitter Card)
- [x] Favicon SVG (initiales AM)
- [x] Sitemap et robots.txt dynamiques
- [x] Composant SmoobuCalendar prêt

### À faire
- [ ] Configurer Smoobu (accountId + apartmentId depuis dashboard Smoobu)
- [ ] Déploiement Vercel

## Décisions

| Date | Décision | Contexte |
|------|----------|----------|
| 2026-01-05 | Tailwind CSS v4 | Nouvelle syntaxe avec @theme |
| 2026-01-05 | Next.js 16 (latest) | App Router + Turbopack |

## Changelog

- 2026-01-05 : Initialisation projet, setup complet, 4 pages créées
- 2026-01-05 : Intégration photos Airbnb, composants MetroLine (RATP), Map, Lightbox
- 2026-01-05 : Formulaire contact via WhatsApp (ouverture directe avec message pré-rempli)
- 2026-01-05 : SEO complet, favicon, sitemap, robots.txt, composant SmoobuCalendar
