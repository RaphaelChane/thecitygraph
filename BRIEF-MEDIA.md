# Brief médias — TCG

Spécifications pour fournir photos et vidéos en qualité maximale sur le site.
Le site ne sert jamais les fichiers natifs : il génère des dérivés optimisés.
**Plus la source est grande et propre, meilleur est le résultat final.**

---

## 1. Photos

### Ce qu'il faut livrer (master)

| Paramètre | Valeur |
| --- | --- |
| Format | RAW d'origine (ARW, CR3, DNG…) **ou** TIFF 16 bits / PSD |
| Résolution | **3000 px sur le grand côté minimum**, 4000 px idéal |
| Espace couleur | sRGB (ou Adobe RGB avec profil intégré, je convertis) |
| Profondeur | 8 bits accepté, 16 bits préféré |
| Retouche | étalonnage final inclus, **sans accentuation de sortie** |
| Recadrage | aucun — je recadre selon les formats du site |
| Poids | pas de limite pour le master |

### Ce qu'il faut éviter

- Exports Instagram / WhatsApp / messagerie (recompressés, métadonnées perdues)
- Images déjà redimensionnées à 1080 ou 2048 px
- Fichiers avec watermark, bordure, ou texte incrusté
- Captures d'écran, PDF, ou images passées par un outil de compression

### Formats d'image utilisés par le site

| Emplacement | Ratio affiché | Largeur max à l'écran | Source conseillée |
| --- | --- | --- | --- |
| Galerie — photo A | 4:5 | ~750 px (x2 retina = 1500) | 3000 px de haut |
| Galerie — photos B et C | 3:4 | ~750 px | 3000 px de haut |
| Galerie — photo D (paysage) | 4:3 | ~750 px | 3000 px de large |
| Aperçu au survol des projets | 4:3 | 240 px | 1200 px suffit |
| Portrait « Studio » | 4:5 | ~580 px (x2 = 1160) | 2400 px de haut |
| Still du film (affiche) | 16:9 | jusqu'à 1536 px (x2 = 3072) | **3000 px de large** |
| Coulisses du film | 16:10 | ~500 px | 2000 px de large |

> Le site recadre automatiquement (`object-fit: cover`). Gardez le sujet
> légèrement à l'intérieur du cadre : ne collez rien contre les bords.
> Pour le portrait studio, cadrez le visage dans le tiers supérieur.

Conseil de tournage : pour chaque série, livrez **au moins une verticale et une
horizontale**. Les 4 photos actuelles sont toutes en 4:5 — c'est ce qui limite
aujourd'hui la variété des compositions.

### Nommage

```
nom-du-projet-01.jpg      (minuscules, tirets, pas d'accents ni d'espaces)
nom-du-projet-02.jpg
```

Un dossier par projet, avec un fichier texte listant : titre, lieu, date,
crédit, et l'orientation souhaitée si elle est importante.

---

## 2. Vidéos

### Master à fournir

Le meilleur choix : **le fichier caméra d'origine** (ou un ProRes 422 / DNxHR).
Je fais les encodages web moi-même, sans perte de génération.

Si vous ne pouvez fournir que du H.264 :

| Paramètre | Hero (boucle) | Film complet |
| --- | --- | --- |
| Résolution | 1920×1080 (2560×1440 accepté) | 1920×1080, ou master 3840×2160 |
| Codec | H.264 High Profile | H.264 High Profile |
| Débit | 12–20 Mbps | 15–30 Mbps |
| Images/s | 24, 25 ou 30 (constant) | idem, constant |
| Couleur | Rec.709, 8 bits, 4:2:0 | idem |
| Audio | **aucun** (piste supprimée) | AAC 192 kbps, 48 kHz, stéréo |
| Durée | 8 à 15 s, boucle propre | durée finale |
| Poids | jusqu'à 40 Mo (je compresse) | jusqu'à 500 Mo |

### Contraintes importantes

- **Pas de letterbox** incrusté (bandes noires dans l'image) — donnez le cadre natif.
- **Pas de sous-titres ou titres incrustés** si vous voulez pouvoir les retoucher.
- La boucle du hero doit être **ciculaire** : première et dernière image proches,
  sinon on voit un « saut » au redémarrage. Évitez les mouvements de caméra
  qui s'arrêtent net.
- Audio du film : loudness **-14 LUFS** intégré, crête max **-1 dBTP**.
- Si le film a été tourné en HDR (HLG / PQ), livrez aussi une version SDR
  Rec.709 : le web grand public reste en SDR.

### Ce que le site produit ensuite

| Fichier | Source idéale | Poids actuel | Cible |
| --- | --- | --- | --- |
| `ekiden-loop.mp4` (hero desktop) | 1920×1080 | 5,1 Mo | ≤ 6 Mo |
| `ekiden-loop-mobile.mp4` | 1920×1080 | 1,9 Mo | ≤ 2,5 Mo |
| `ekiden.mp4` (film, au clic) | 1920×1080 | 9,2 Mo | ≤ 12 Mo |

Le film complet n'est téléchargé qu'au clic sur « Voir le film » : il peut donc
être plus lourd sans pénaliser le chargement de la page.

---

## 3. Transmission

- **WeTransfer / Smash / Dropbox / Google Drive en « original »**, jamais en aperçu
  compressé.
- Un seul transfert par projet, arborescence claire :
  ```
  projet/
    photos/    (masters)
    video/     (masters)
    notes.txt
  ```
- Éviter : AirDrop entre machines différentes, pièces jointes mail (> 20 Mo),
  WhatsApp, Instagram, LinkedIn.

---

## 4. Budget de poids du site

Objectif : **moins de 6 Mo au premier chargement** hors vidéo du hero.

| Poste | Budget |
| --- | --- |
| Hero (vidéo 16 s) | 5 Mo |
| Photos visibles au-dessus de la ligne de flottaison | 300 Ko |
| Photos restantes (lazy) | 100–400 Ko chacune |
| Polices | 90 Ko |
| CSS + JS | 80 Ko |

Aujourd'hui : **3,2 Mo d'images** pour 4 séries (3 tailles chacune) + 17 Mo de
vidéo. C'est correct, mais les fichiers `nomad-street` et `bamboo-city` sont
lourds (418 et 675 Ko en 1800 px) : des masters plus propres permettraient de
descendre encore de 30 à 40 % à qualité visuelle égale.

---

## 5. Checklist avant envoi

- [ ] Masters en pleine résolution (≥ 3000 px grand côté)
- [ ] Aucun recadrage, aucune accentuation, aucun watermark
- [ ] Profil colorimétrique intégré (sRGB ou Adobe RGB)
- [ ] Vidéos sans letterbox, sans audio pour le hero
- [ ] Boucle du hero réellement ciculaire
- [ ] Audio du film normalisé
- [ ] Noms de fichiers en minuscules avec tirets
- [ ] Envoi en original via lien de transfert
