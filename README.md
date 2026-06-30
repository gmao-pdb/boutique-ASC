# Boutique AS Casinca — version mobile

Suivi des packs d'équipement du club (joueurs, packs, chèques, stock) — React + Vite + Firebase, PWA mobile.

## Démarrer en local
```bash
npm install
npm run dev
```

## Configuration Firebase (à faire une fois)
1. Créer un projet sur https://console.firebase.google.com (gratuit).
2. Activer **Firestore Database** et **Authentication → E-mail/Mot de passe**.
3. Créer les comptes utilisateurs (Authentication → Users).
4. Récupérer la **config web** (Paramètres du projet → Vos applications → SDK) et la copier dans un fichier `.env` (voir `.env.example`).

## Déploiement (Cloudflare Pages)
- Connecter le dépôt GitHub à Cloudflare Pages.
- Build command : `npm run build` — Output : `dist`.
- Renseigner les variables `VITE_FIREBASE_*` dans Cloudflare Pages.

## Avancement
- [x] P0 — squelette (shell, navigation, connexion Firebase câblée)
- [x] P1 — authentification (login e-mail/mdp) + règles Firestore + modèle de données
- [ ] P2 — liste joueurs
- [ ] P3 — fiche joueur (packs, catégories FFF, gardien, sac)
- [ ] P4 — chèques / dépôts
- [ ] P5 — paramètres
- [ ] P5-bis — stock & approvisionnement (inventaires, seuils mini, manquants)
- [ ] P6 — import des données existantes
- [ ] P7 — PWA + finitions mobile
