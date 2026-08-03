# Invitation de mariage — 31 octobre 2026

Site d’invitation numérique chic (automne / soirée) avec galerie photo, RSVP et espace admin pour uploader vos images.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4**
- Motion : **Framer Motion** + **GSAP** + **Lenis** (scroll fluide, reveals, parallax)
- Stockage local JSON + fichiers (`data/`, `public/uploads/`) — prêt à migrer vers Supabase plus tard
- Déploiement recommandé : **Vercel** + domaine custom

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Admin : [http://localhost:3000/admin](http://localhost:3000/admin)  
Mot de passe local par défaut : `wedding2026`

## Langues (FR / EN)

- Français : `/fr`
- English : `/en`
- `/` redirige selon `Accept-Language` (défaut : `fr`)
- Sélecteur **FR / EN** dans la navigation

Textes traduits : `src/i18n/dictionaries/fr.ts` et `src/i18n/dictionaries/en.ts`  
Données partagées (prénoms, date ISO, email) : `src/lib/site.ts`

## Personnaliser

1. Éditez `src/lib/site.ts` (prénoms, date, email)
2. Éditez les dictionnaires FR/EN (textes, lieux, dress code, deadline RSVP)
3. Uploadez vos photos via `/admin` :


- **Hero** : image plein écran d’accueil
- **Notre histoire** : 2–3 photos
- **Galerie** : le reste

## Variables d’environnement

Copiez `.env.example` vers `.env.local` :

```env
ADMIN_PASSWORD=votre-mot-de-passe
ADMIN_SECRET=une-longue-chaine-secrete
NEXT_PUBLIC_SITE_URL=https://votre-domaine.fr
```

## SEO / PWA / QR

- **SEO** : Open Graph + Twitter cards (`public/og.jpg`), favicon, `hreflang` FR/EN  
  Remplacez `public/og.jpg` par une photo duo 1200×630 pour WhatsApp.
- **PWA légère** : `public/manifest.webmanifest` + icônes (écran d’accueil mobile, sans service worker).
- **QR** : générez un QR vers `https://votre-domaine.fr/fr` (outil externe) une fois le domaine prêt.
- Régénérer les icônes monogramme : `npm run icons`

## Déploiement Vercel

1. Pousser le repo sur GitHub
2. Importer le projet dans Vercel
3. Ajouter `ADMIN_PASSWORD`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL`
4. Déployer

> Note : le stockage fichier local ne persiste pas sur Vercel (filesystem éphémère). Pour la prod, branchez ensuite **Supabase Storage + Postgres** (ou Cloudinary) — la couche `src/lib/storage.ts` est faite pour être remplacée proprement.

## Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm run start` — serveur production
- `npm run lint` — lint
- `npm run icons` — régénérer favicon / PWA / og.jpg
