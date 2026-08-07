# MISS RDC 2026 — site officiel

Cinq pages HTML autonomes. Aucune dépendance, aucun framework, aucun build : on dépose le dossier sur n'importe quel hébergement (OVH, Netlify, Vercel, un simple Apache) et ça tourne.

```
index.html         Accueil
edition.html       L'édition de la Renaissance (contexte, piliers, gouvernance, lignée)
programme.html     Activités, tournée des provinces, chronogramme complet, dispositif médias
participer.html    Éligibilité, parcours de sélection, formulaire de candidature, FAQ
partenaires.html   Principes, placements produit, grille PLATINE → OKAPI, formulaire
```

## Direction artistique

- **Palette** : forêt profonde (vert institutionnel), cuivre champagne, papier clair. Direction éditoriale haute couture, pas dark-mode orné.
- **Typographie** : Cormorant Garamond (display) + Outfit (corps), via Google Fonts.
- **Assets partagés** : `assets/css/main.css` et `assets/js/main.js`.
- **Élément signature** : « la lignée interrompue » — la frise 1968 → 2016 → **dix ans de vide** → 2026.
- **Photos** : Unsplash en placeholder ; remplacer par la banque d'images officielle dès qu'elle est disponible.

## Ce qu'il reste à faire avant la mise en ligne

1. **Photos.** Le site est conçu pour tenir sans images — les deux vignettes d'immersion portent une illustration au trait (grue, chevalement). Dès que la banque d'images existe, remplacer le contenu de `.feature .vis` par une photo en `object-fit:cover` et un hero en vidéo courte.
2. **Formulaires.** Les deux formulaires sont fonctionnels côté navigateur mais n'envoient rien : ils affichent un message de confirmation de démonstration. À brancher sur votre backend (ou Formspree / un webhook) — voir la fin de `<script>` dans chaque page, bloc `form[data-demo]`.
3. **Réseaux sociaux.** Les icônes du pied de page pointent sur `#`. À remplacer par les comptes officiels.
4. **Adresses e-mail.** `contact@`, `partenariats@`, `presse@ miss-rdc.cd` — à créer ou à modifier.
5. **Image de partage** (Open Graph). Ajouter `<meta property="og:image" content="https://miss-rdc.cd/og.jpg">` dans chaque `<head>` avec un visuel 1200×630.
6. **Analytics** et bandeau cookies si vous en installez.

## Deux points à trancher dans la note conceptuelle

- **Dates d'inscription.** Le § 4.2 annonce « du 24 août au 20 septembre », le chronogramme du § 10 annonce le lancement de la campagne le 10 septembre. Le site retient **10 → 20 septembre** partout. À aligner dans le document avant publication.
- **Budget.** Les montants du § 11 (2 180 000 USD, détail par poste) ne figurent nulle part sur le site public : la note est un document de travail à diffusion restreinte. Seule la grille de sponsoring apparaît, sur la page partenaires — si vous préférez la réserver aux prospects, il suffit de la déplacer derrière le formulaire de demande de dossier.

## Qualité technique

- Responsive jusqu'à 360 px, menu mobile plein écran.
- Focus clavier visible, `prefers-reduced-motion` respecté (animations coupées).
- Balises `title`, `description`, Open Graph et favicon sur chaque page.
- Compte à rebours en direct vers le 24 décembre 2026, 20 h, heure de Kinshasa.

---

## Mise à jour — hero « la main qui tire les photos »

Le carrousel en fondu a été remplacé par une séquence gestuelle.

**Principe.** Les quatre photos sont empilées et garées derrière le panneau blanc, invisibles. Une main sort de derrière le bloc « Édition de la Renaissance », pince le coin de la photo, la tire vers la gauche jusqu'à ce qu'elle occupe toute la scène, lâche, puis repart se cacher derrière le panneau. Trois secondes plus tard, elle revient chercher la suivante. Le premier tirage se déclenche au chargement de la page, sur un fond velours bordeaux.

**Réglages.** Tout est en haut du bloc `data-hero-pull` dans `assets/js/main.js` :

| Variable | Valeur | Rôle |
| --- | --- | --- |
| `PULL` | 1700 ms | durée du tirage |
| `HOLD` | 240 ms | temps de lâcher |
| `BACK` | 820 ms | retour derrière le panneau |
| `DWELL` | 3200 ms | pause avant la photo suivante |
| `PINCH_X` / `PINCH_Y` | 0.062 / 0.315 | point de pince dans l'image de la main |
| `handW` | `min(largeur × 0.38, 560)` | taille de la main |

La main est calée assez bas pour que l'avant-bras sorte par le bas du cadre : c'est ce qui évite une coupe nette en plein milieu de la photo. Si vous changez sa taille, vérifiez ce point.

**L'image de la main** (`assets/img/main-tirage.png`) a été retournée en miroir — l'originale tirait vers la droite —, débarrassée de la feuille de papier dessinée, nettoyée de son grain de contour, et la pointe de l'avant-bras a été fondue en transparence.

**Ajouter ou retirer une photo :** ajoutez un `<figure class="pull">` dans `.hero-deck` et mettez à jour le total du compteur (`<span>4</span>`). Le reste s'adapte tout seul.

**Repli.** Si `prefers-reduced-motion` est actif, la main disparaît et les photos changent sans animation. Les pastilles permettent la navigation manuelle ; le défilement se met en pause au survol et quand l'onglet est en arrière-plan.

## Correctifs

- **Menu mobile.** Il était `position: fixed; inset: 0` mais ne mesurait que 120 px de haut, donc le `translateY(-102%)` ne le sortait pas de l'écran : les liens restaient affichés par-dessus le hero et le site était inutilisable sous 880 px. Corrigé avec `height: 100dvh`, `translateY(-100vh)` et `visibility` pour qu'il ne capte plus les clics une fois fermé.
- **Pastilles du hero.** Leurs styles avaient disparu ; elles réapparaissaient en rectangles blancs en haut à gauche. Rétablies en bas à gauche, au-dessus des photos.
- **Compte à rebours mobile.** « Secondes » passait à la ligne sous 520 px. Passé en grille de quatre colonnes.
