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
| Vercel KV | - | Base de données réservations |
| Resend | - | Emails transactionnels |
| Stripe | 2025-12-15 | Payment Links (dépôts) |
| Smoobu API | - | Calendrier & blocage dates |

## Architecture

```
au-marais/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Routes internationalisées
│   │   ├── layout.tsx     # Layout avec SEO, Schema.org, hreflang
│   │   ├── page.tsx       # Accueil
│   │   ├── appartement/   # Page appartement
│   │   ├── quartier/      # Page quartier
│   │   ├── contact/       # Page contact
│   │   └── disponibilites/# Page calendrier
│   └── api/               # API routes
├── components/
│   ├── layout/            # Header, Footer (avec LanguageSwitcher)
│   ├── home/              # Hero, Features, GalleryPreview
│   └── ui/                # Button, Card, Container, LanguageSwitcher
├── lib/
│   ├── utils.ts           # Helper cn()
│   ├── smoobu.ts          # Client API Smoobu
│   ├── schema.ts          # Schema.org structured data
│   └── i18n/              # Internationalisation
│       ├── config.ts      # Locales (fr, en, es, de, pt, zh)
│       ├── dictionaries.ts
│       └── dictionaries/  # Fichiers JSON par langue
├── middleware.ts          # Détection automatique de langue
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
- [x] **Internationalisation (i18n)** - Support 6 langues (FR, EN, ES, DE, PT, ZH)
- [x] **Schema.org LodgingBusiness** - Données structurées pour SEO
- [x] **Hreflang tags** - SEO international
- [x] **Middleware de détection de langue** - Redirection automatique selon navigateur
- [x] **Sélecteur de langue** - Dans le header desktop et mobile
- [x] **Sitemap multilingue** - URLs par langue avec alternates
- [x] **Dictionnaires de traduction** - Fichiers JSON complets pour chaque langue
- [x] **Système de réservation complet** - Demandes avec validation admin
- [x] **API Reservations CRUD** - Endpoints pour créer, lister, modifier, supprimer
- [x] **Formulaire de réservation** - Calcul prix temps réel, soumission API
- [x] **Notifications WhatsApp admin** - Liens action rapide (approve/reject/edit)
- [x] **Pages action rapide** - /r/[id]/approve, /r/[id]/reject, /r/[id]/edit
- [x] **Stripe Payment Links** - Génération automatique pour dépôts
- [x] **Emails transactionnels Resend** - Confirmation, approbation, rejet, paiement
- [x] **Interface admin réservations** - /admin/reservations avec filtres et actions

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
| 2026-01-10 | i18n 6 langues | FR, EN, ES, DE, PT, ZH avec middleware |
| 2026-01-10 | Schema.org LodgingBusiness | SEO structured data pour rich results |
| 2026-01-12 | Système réservation Option B | Vercel KV + Resend + Stripe + WhatsApp admin |

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
- 2026-01-10 : **SEO & i18n** - Internationalisation 6 langues (FR, EN, ES, DE, PT, ZH)
- 2026-01-10 : Schema.org structured data (LodgingBusiness) pour rich snippets Google
- 2026-01-10 : Hreflang tags pour toutes les pages et langues
- 2026-01-10 : Middleware de détection automatique de langue (Accept-Language header)
- 2026-01-10 : Sélecteur de langue dans le header (desktop + mobile)
- 2026-01-10 : Sitemap multilingue avec alternates
- 2026-01-10 : **Traduction pages quartier et contact** - Toutes les 6 langues
- 2026-01-10 : Composant ContactForm extrait en client component pour état formulaire
- 2026-01-10 : Histoire du quartier (François Miron, la rue, Le Marais) traduite
- 2026-01-10 : Lieux à visiter et commerces traduits avec descriptions
- 2026-01-12 : **Fix traductions PT/ZH** - Structure localTips alignée sur FR (address, tag, price, distance)
- 2026-01-12 : **ChatAssistant amélioré** - API utilise maintenant chatbot-knowledge.json (surface 39m², équipements, FAQ)
- 2026-01-12 : **Système de réservation complet** - Option B avec validation admin via WhatsApp
- 2026-01-12 : Types Reservation, API CRUD (/api/reservations), lib/db.ts (Vercel KV)
- 2026-01-12 : lib/email.ts (Resend) - Templates confirmation, approbation, rejet, paiement
- 2026-01-12 : Pages action rapide /r/[id]/approve, /r/[id]/reject, /r/[id]/edit
- 2026-01-12 : Stripe Payment Links automatiques pour dépôts (API version 2025-12-15.clover)
- 2026-01-12 : ContactForm refactorisé - Soumission API avec calcul prix temps réel
- 2026-01-12 : Traductions formulaire réservation ajoutées aux 6 langues
- 2026-01-12 : Interface admin réservations /admin/reservations avec filtres et actions
