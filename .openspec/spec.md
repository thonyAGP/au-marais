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
│   ├── disponibilites/    # Page calendrier réservation
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
- [x] Section "Vos Hôtes" avec présentation famille
- [x] Section témoignages Airbnb (4 avis)
- [x] Section "Bonnes adresses" avec restaurants et commerces locaux
- [x] Sticky booking bar (visible au scroll)
- [x] Animations CSS (fade-in-up, transitions)
- [x] Calendrier disponibilités accessible depuis booking bar
- [x] **Nouveau thème "Dark Luxury"** (fond sombre #0A0A0A, accents dorés #D4AF37)
- [x] **Hero cinématique** avec effet Ken Burns et animation lettre par lettre
- [x] Typographie premium (Cormorant Garamond serif + Montserrat sans)
- [x] Header transparent qui devient solide au scroll
- [x] Stats Bar après le Hero (note Airbnb, avis, siècle, distance métro)
- [x] Sections homepage avec thème sombre cohérent
- [x] BookingBar avec thème dark luxury

### À faire
- [x] ~~Configurer Smoobu (accountId + apartmentId depuis dashboard Smoobu)~~ ✓
- [x] ~~Ajouter vraie photo famille~~ ✓
- [x] ~~Adapter pages secondaires (appartement, quartier, contact) au thème Soft Terracotta~~ ✓
- [x] ~~Page Disponibilités avec calendrier direct~~ ✓
- [x] ~~Déploiement Vercel~~ ✓ (www.au-marais.fr)

## Décisions

| Date | Décision | Contexte |
|------|----------|----------|
| 2026-01-05 | Tailwind CSS v4 | Nouvelle syntaxe avec @theme |
| 2026-01-05 | Next.js 16 (latest) | App Router + Turbopack |
| 2026-01-08 | Design Dark Luxury | Hero cinématique (Option A) + thème sombre avec or (Option C) |
| 2026-01-08 | Polices Cormorant Garamond + Montserrat | Typographie premium pour le thème luxe |

## Changelog

- 2026-01-05 : Initialisation projet, setup complet, 4 pages créées
- 2026-01-05 : Intégration photos Airbnb, composants MetroLine (RATP), Map, Lightbox
- 2026-01-05 : Formulaire contact via WhatsApp (ouverture directe avec message pré-rempli)
- 2026-01-05 : SEO complet, favicon, sitemap, robots.txt, composant SmoobuCalendar
- 2026-01-08 : Ajout sections Hosts, Testimonials, LocalTips sur page d'accueil
- 2026-01-08 : Sticky booking bar avec animations
- 2026-01-08 : Animations CSS (fade-in-up avec delays)
- 2026-01-08 : **Refonte design "Dark Luxury"** - fond sombre, accents dorés, typographie Cormorant Garamond
- 2026-01-08 : Hero cinématique avec effet Ken Burns et animation lettre par lettre
- 2026-01-08 : Header transparent avec transition au scroll
- 2026-01-08 : Stats Bar, sections homepage adaptées au nouveau thème
- 2026-01-08 : Pages secondaires (appartement, quartier, contact) adaptées au thème dark
- 2026-01-08 : Nouvelle page /disponibilites avec calendrier de réservation directe
- 2026-01-08 : Calendrier AvailabilityCalendar adapté au thème Soft Terracotta
- 2026-01-08 : **Déploiement Vercel** - Site live sur www.au-marais.fr
