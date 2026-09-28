# MISS RDC 2026 — site officiel

Sept pages HTML statiques. Pas de framework ni d'étape de build : il suffit de déposer le dossier sur un hébergement (OVH, Netlify, Vercel, Apache) pour que le site fonctionne.

```
index.html         Accueil
edition.html       L'édition : institution, mission, licences, gouvernance, lignée
heritage.html      Les reines depuis 1968 (carrousel)
programme.html     Étapes, gala, calendrier, académie
souvenir.html      Galerie photo avec agrandissement
participer.html    Conditions, parcours, formulaire de candidature, FAQ
partenaires.html   Formes d'engagement, pôles de besoin, prise de contact
```

## Direction artistique

- **Registre** : magazine de mode (Vogue, Harper's Bazaar) plutôt que site événementiel.
- **Couleurs** : nuit `#0a0b10`, ivoire `#f2ede4`, or `#c6a15b`. Le bleu, le jaune et le rouge du drapeau n'apparaissent qu'en filet tricolore et dans la barre de chargement.
- **Typographie** : Cinzel sur tout le site, Cinzel Decorative dorée pour les mots mis en valeur. La police est intégrée dans `assets/css/fonts.css` (base64) pour fonctionner aussi en ouverture locale ; fichiers sources dans `assets/fonts/`.
- **Signature** : la diagonale du drapeau congolais sert de transition entre les pages.
- Toutes les valeurs (couleurs, tailles, espacements) sont des variables en tête de `assets/css/main.css`.

## Animations

Bibliothèques incluses en local dans `assets/vendor/` (aucun CDN) : GSAP 3.13, ScrollTrigger, SplitText, Lenis.

| Attribut HTML | Effet |
| --- | --- |
| `data-split` | Titre révélé ligne par ligne |
| `data-words` | Paragraphe qui s'allume mot à mot au défilement |
| `data-reveal` | Apparition en fondu vers le haut |
| `data-clip` | Image dévoilée par un rideau, avec léger zoom |
| `data-parallax="8"` | Image en parallaxe (amplitude en %) |
| `data-count="26"` | Compteur animé (`data-from` pour la valeur de départ) |
| `data-magnetic` | Bouton aimanté au survol (souris uniquement) |
| `data-cursor="Voir"` | Le curseur affiche ce libellé au survol |

Au niveau des sections : écran de chargement (première visite uniquement), couronne épinglée qui grandit au défilement, lignée des reines en défilement horizontal, film qui s'ouvre au défilement, images qui suivent la souris dans « Le parcours ».

**Accessibilité** : avec le réglage système « réduire les animations », ou si les scripts ne se chargent pas, toutes les animations sont désactivées et le contenu reste entièrement visible.

## Médias

- `assets/video/hero-gala.mp4` (5 Mo) et `hero-gala-mobile.mp4` (1,5 Mo) : extrait de 12 s de la captation du gala, recadré pour retirer les filigranes de la chaîne. Source : `hero-renaissance-loop.mp4`.
- `assets/video/intro-miss-rdc-web.mp4` (3,7 Mo) : film de l'identité, recompressé. Source : `intro-miss-rdc.mp4`.
- Les deux fichiers sources (29 Mo au total) ne sont plus utilisés par le site ; ils peuvent être retirés de l'hébergement.
- `assets/img/souvenir/` : photos réelles, dont sept images extraites de la captation du gala.

## Avant la mise en ligne

1. **Photos officielles.** Plusieurs visuels sont générés par IA : `gala-finalistes`, `gala-scene-large`, `gala-public`, `hero-podium`, `kinshasa-fleuve`, `mangroves-moanda`, `matadi-fleuve`, `lubumbashi`, `bijoux-detail`, `echarpe-detail`. Les remplacer par des photos de reportage fera davantage progresser le site que n'importe quel ajustement de code.
2. **Formulaire.** Il valide les champs mais n'envoie rien pour l'instant : il affiche seulement un message de confirmation de démonstration. À brancher sur un backend, Formspree ou un webhook (bloc `form[data-demo]` dans `assets/js/main.js`).
3. **Dates.** Le compte à rebours vise le **5 décembre 2026 à 20 h** (heure de Kinshasa), date reprise de l'ancien code : attribut `data-countdown` dans `index.html` et `programme.html`. À confirmer. La période de candidature (10 → 20 septembre) est passée : les dates ont été retirées des pages en attendant le nouveau calendrier.
4. **Réseaux sociaux.** Aucun compte officiel n'étant connu, le pied de page n'affiche pour l'instant que l'e-mail.
5. **Domaine.** Les balises `canonical` et `og:image` pointent sur `https://miss-rdc.cd/`. À ajuster si le domaine est différent.

## Modifier le menu ou le pied de page

La navigation et le pied de page sont copiés dans chaque page. Un changement de menu doit donc être reporté dans les sept fichiers HTML.
