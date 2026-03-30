# CLAUDE.md — CookShare

> Réseau social culinaire full-stack. Ce fichier sert de référence principale pour comprendre le projet, son état d'avancement et les conventions à respecter.

---

## Vision du projet

CookShare est une plateforme de **réseau social culinaire** dont la mission est de faciliter la **transmission authentique du savoir-faire** en cuisine. Au-delà d'une bibliothèque de recettes, elle crée des connexions humaines autour de la gastronomie : partager, découvrir et apprendre des traditions culinaires du monde entier — notamment via des **sessions de cuisine en direct**.

---

## Stack technique

| Couche | Technologie |
|---|---|
| **Backend** | Spring Boot (Java) + JWT |
| **Base de données** | PostgreSQL |
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios (instance avec intercepteur JWT) |
| **Routing** | React Router v7 |
| **Stockage médias** | Amazon S3 (ou équivalent) |

---

## Architecture frontend (`src/`)

```
src/
├── api/
│   └── axios.js                  # Instance Axios avec intercepteur JWT
├── context/
│   └── AuthContext.jsx           # Gestion JWT (login / logout / user)
├── components/
│   ├── ProtectedRoute.jsx        # Routes protégées (redirige si non authentifié)
│   ├── BottomNav.jsx             # Navigation bas de page (mobile-first)
│   ├── RecipeCard.jsx            # Carte recette réutilisable
│   └── IngredientSearch.jsx      # Recherche d'ingrédients avec création
└── pages/
    ├── AuthPage.jsx              ✅ Terminé
    ├── VerifyPage.jsx            ✅ Terminé
    ├── MainPage.jsx              ✅ Terminé
    ├── ProfilePage.jsx           ✅ Terminé
    ├── ExplorePage.jsx           ✅ Terminé
    ├── RecettePage.jsx           ✅ Terminé
    ├── CreateRecipePage.jsx      ✅ Terminé
    ├── ConfigPage.jsx            ⏳ À faire
    └── LivePage.jsx              ⏳ À faire
```

---

## Suivi des tâches

### ✅ Terminé

#### Backend
- [x] Authentification JWT (login, register, verify email)
- [x] CRUD utilisateurs (`GET / PUT / DELETE /api/utilisateurs/{id}`)
- [x] CRUD recettes (`GET / POST /api/recettes`, `GET /api/recettes/{id}`)
- [x] Upload médias recette (`POST /api/media/recette/{recetteId}`) — multipart, un fichier à la fois
- [x] Likes (`POST /api/likes/recette/{recetteId}`)
- [x] Favoris (`POST /api/favoris/recette/{recetteId}`)
- [x] Commentaires — ajout et suppression (`POST / DELETE /api/commentaires`)
- [x] Recherche ingrédients (`GET /api/ingredient/search?nom=`)
- [x] Liste des cuisines (`GET /api/cuisines`)

#### Frontend
- [x] `AuthPage.jsx` — Inscription / Connexion
- [x] `VerifyPage.jsx` — Vérification email
- [x] `MainPage.jsx` — Fil d'actualité principal
- [x] `ProfilePage.jsx` — Profil utilisateur
- [x] `ExplorePage.jsx` — Exploration / Recherche
- [x] `RecettePage.jsx` — Détail d'une recette
- [x] `CreateRecipePage.jsx` — Création / publication de recette
- [x] `AuthContext.jsx` — Contexte JWT global
- [x] `ProtectedRoute.jsx` — Protection des routes
- [x] `BottomNav.jsx` — Navigation mobile
- [x] `RecipeCard.jsx` — Composant carte recette
- [x] `IngredientSearch.jsx` — Recherche + création d'ingrédients
- [x] `api/axios.js` — Instance Axios avec intercepteur JWT

---

### ⏳ À faire

#### Frontend
- [ ] `ConfigPage.jsx` — Paramètres du compte (modifier pseudo, avatar, bio, email, mot de passe, supprimer le compte)
- [ ] `LivePage.jsx` — Page des Live Cooking Sessions (voir section Fonctionnalités Live ci-dessous)

#### Fonctionnalités manquantes (à implémenter / évaluer)
- [ ] Système de **suivi d'utilisateurs** (follow/unfollow) + fil d'actualité personnalisé
- [ ] **Brouillon automatique** lors de la création de recette
- [ ] Filtres avancés dans `ExplorePage` : temps de préparation, régime alimentaire (végétarien, vegan, sans gluten…)
- [ ] **Signalement** de contenu (recette, commentaire, profil) avec motifs prédéfinis
- [ ] Système de **sanctions automatiques** (3 avertissements → suspension temporaire)
- [ ] Interface **Administrateur** (gestion des signalements, bannissement)
- [ ] Upload de **vidéo** sur les recettes (max 2 min, en plus des 5 photos max)

#### Fonctionnalités hors MVP (à ne pas implémenter maintenant)
- ❌ Messagerie privée instantanée
- ❌ Gamification (badges, points)
- ❌ Suggestions intelligentes / algorithme de recommandation
- ❌ Vente de produits ou services

---

## Endpoints backend

### Authentification
```
POST   /api/auth/login              → { token, utilisateur }
POST   /api/auth/register
GET    /api/auth/verify?token=
```

### Utilisateurs
```
GET    /api/utilisateurs/{id}
PUT    /api/utilisateurs/{id}
DELETE /api/utilisateurs/{id}
```

### Recettes
```
GET    /api/recettes
POST   /api/recettes
GET    /api/recettes/{id}
```

### Médias
```
POST   /api/media/recette/{recetteId}     # multipart/form-data, un fichier à la fois
```

### Interactions sociales
```
POST   /api/likes/recette/{recetteId}         → body: { utilisateurId }
POST   /api/favoris/recette/{recetteId}        → body: { auteurId }
POST   /api/commentaires/recette/{recetteId}   → body: { auteurId, contenu }
DELETE /api/commentaires/{id}?utilisateurId=
```

### Données de référence
```
GET    /api/ingredient/search?nom=
GET    /api/cuisines
```

---

## Enums backend

```java
DifficulteEnum : FACILE | MOYEN | DIFFICILE
TypePlat       : ENTREE | PLAT | DESSERT | SNACK
```

---

## Fonctionnalités Live (`LivePage.jsx`)

La `LivePage` est la fonctionnalité **différenciante** du projet. Elle doit permettre :

1. **Proposer une session** — un utilisateur peut mettre une de ses recettes en session live
2. **Rejoindre une session** — les membres soumettent une demande de participation
3. **Visioconférence intégrée** — outil de vidéo en temps réel (à intégrer : WebRTC ou SDK tiers)
4. **Chat en temps réel** — fenêtre de messagerie pendant la session (WebSocket ou SSE)

> Pour le MVP, cette fonctionnalité est **gratuite** pour stimuler l'adoption.

---

## Modèle de données (entités clés)

```
Utilisateur     id, pseudo, email, motDePasse, avatar, bio
Recette         id, titre, description, ingrédients, étapes, photos[], vidéo, datePublication, auteur→Utilisateur, typeFlat, difficulté, tempsPreparation
Commentaire     id, contenu, date, auteur→Utilisateur, recette→Recette
Like            id, utilisateur→Utilisateur, recette→Recette
Favori          id, utilisateur→Utilisateur, recette→Recette
Ingrédient      id, nom
Cuisine         id, nom
```

---

## Règles & conventions

- **Auth** : toutes les routes sauf `/auth/*` et consultation publique de recettes sont protégées via `ProtectedRoute` + token JWT en header `Authorization: Bearer <token>`
- **Axios** : toujours utiliser l'instance de `api/axios.js` (intercepteur JWT automatique), jamais d'instance brute
- **Upload médias** : envoyer les fichiers **un par un** en `multipart/form-data` via `POST /api/media/recette/{recetteId}`
- **Likes** : une seule action par utilisateur par recette
- **Commentaires** : seul l'auteur de la recette peut supprimer les commentaires sous son contenu
- **Style** : Tailwind CSS uniquement, pas de CSS custom sauf cas exceptionnel justifié
- **Composants** : préférer les composants réutilisables (`RecipeCard`, `IngredientSearch`) aux implémentations ad hoc