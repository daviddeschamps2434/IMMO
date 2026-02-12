# PRD - Landing Page BSK Immobilier - Clotilde Martin

## Problem Statement Original
Publicité Meta pour une recherche de biens sur les secteurs de Lauzerte (82), Montcuq (46) et Montaigu-de-Quercy (82) avec formulaire de réponse court (formulaire de rappel avec ville).

## User Personas
- **Propriétaires vendeurs**: Personnes souhaitant vendre leur bien immobilier (maison, appartement, terrain, autre bâtiment) dans les secteurs ciblés
- **Trafic Meta Ads**: Utilisateurs provenant de publicités Facebook/Instagram, majoritairement sur mobile

## Core Requirements
- Landing page optimisée pour conversion publicitaire Meta
- Présentation de l'agent Clotilde Martin (BSK Immobilier)
- Secteurs d'intervention: Lauzerte (82110), Montcuq (46800), Montaigu-de-Quercy (82150)
- Formulaire de rappel: Nom, Email, Téléphone, Ville, Type de bien
- Design BSK: blanc et bleu #0079e8
- Stockage des leads en base de données MongoDB

## What's Been Implemented (Dec 2025)
### Backend (FastAPI)
- [x] API endpoint POST /api/leads - Création de demandes de rappel
- [x] API endpoint GET /api/leads - Récupération des leads (admin)
- [x] Validation des champs (email, longueur min/max)
- [x] Stockage MongoDB avec horodatage

### Frontend (React + Tailwind + Shadcn)
- [x] Header sticky avec logo BSK et numéro de téléphone cliquable
- [x] Hero section avec image de fond et CTA "Estimation gratuite"
- [x] Section Agent: Photo, nom, rôle, citation, bouton téléphone
- [x] Section Secteurs: 3 cartes (Lauzerte, Montcuq, Montaigu-de-Quercy)
- [x] Formulaire de lead avec tous les champs demandés
- [x] Sélecteurs dropdown pour Ville et Type de bien
- [x] Message de succès après soumission
- [x] Footer avec coordonnées
- [x] Design responsive mobile-first
- [x] Typographie: Playfair Display (titres) + Inter (corps)

## Prioritized Backlog
### P0 - Critique (Fait ✓)
- [x] Landing page fonctionnelle
- [x] Formulaire de capture leads

### P1 - Important (À faire)
- [ ] Interface admin pour visualiser les leads
- [ ] Export CSV des leads
- [ ] Notification email lors d'un nouveau lead

### P2 - Nice to have
- [ ] Intégration Google Analytics / Meta Pixel
- [ ] A/B testing sur les accroches
- [ ] Témoignages clients dynamiques

## Next Tasks
1. Créer une interface admin simple pour consulter les leads
2. Ajouter le Meta Pixel pour le tracking des conversions
3. Configurer les notifications email (optionnel)
