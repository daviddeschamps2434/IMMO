# PRD - Site Vitrine BSK Immobilier - Clotilde Martin

## Problem Statement Original
1. Landing page publicitaire Meta pour recherche de biens sur Lauzerte (82), Montcuq (46) et Montaigu-de-Quercy (82)
2. Blog optimisé SEO avec interface admin
3. Back-office d'administration avec authentification

## User Personas
- **Propriétaires vendeurs**: Personnes souhaitant vendre leur bien immobilier
- **Visiteurs blog**: Propriétaires cherchant des conseils immobiliers
- **Admin**: Clotilde Martin pour gérer le contenu du site

## Core Requirements
- Landing page avec formulaire de rappel
- Blog avec fonctionnalités SEO avancées (catégories, tags, schema.org, sitemap)
- Back-office sécurisé pour gérer tout le contenu
- Design BSK: blanc et bleu #0079e8

## What's Been Implemented (Dec 2025)

### Backend (FastAPI + MongoDB)
- [x] Authentification JWT (admin / hMX181haIwKrkOhj)
- [x] API CRUD contenu du site (/api/site/content, /api/site/sectors)
- [x] API CRUD articles blog (/api/blog/posts)
- [x] API leads avec protection auth (/api/leads)
- [x] Sitemap XML dynamique (/api/sitemap.xml)
- [x] Catégories et tags pour le blog

### Frontend (React + Tailwind + Shadcn)
- [x] Page d'accueil dynamique (contenu depuis BDD)
- [x] Blog avec liste d'articles et filtres
- [x] Page article avec SEO complet (schema.org, Open Graph)
- [x] Back-office avec authentification
- [x] Gestion SEO (meta title, meta description)
- [x] Gestion Hero (titre, sous-titre, CTA, image)
- [x] Gestion Agent (nom, téléphone, citation, photo)
- [x] Gestion Secteurs (ajout/suppression dynamique)
- [x] Gestion Footer (slogan, RSAC, copyright)
- [x] Gestion Blog (CRUD articles)
- [x] Gestion Contacts (visualisation leads)

### Credentials
- URL Admin: /admin
- Username: admin
- Password: hMX181haIwKrkOhj

## Prioritized Backlog

### P0 - Critique (Fait ✓)
- [x] Landing page fonctionnelle
- [x] Blog SEO
- [x] Back-office avec authentification

### P1 - Important (À faire)
- [ ] Export CSV des leads
- [ ] Éditeur WYSIWYG pour le blog
- [ ] Changement de mot de passe admin

### P2 - Nice to have
- [ ] Meta Pixel Facebook
- [ ] Google Analytics
- [ ] Témoignages clients
- [ ] Galerie de biens vendus

## Next Tasks
1. Ajouter Meta Pixel pour tracking des conversions publicitaires
2. Créer un éditeur visuel pour les articles (WYSIWYG)
3. Ajouter export CSV des leads
