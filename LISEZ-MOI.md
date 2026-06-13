# Site web — Paroisse Sainte Anne de Bingerville

Site vitrine statique (HTML / CSS / JavaScript, sans dépendance serveur).
Il suffit de téléverser tout le contenu de ce dossier chez un hébergeur web.

## 👀 Voir le site sur son ordinateur (en local)

N'ouvrez pas `index.html` en double-cliquant dessus : le navigateur bloquerait
le chargement du contenu (`contenu.json`) et l'administration ne marcherait pas.

À la place, **double-cliquez sur `DEMARRER-LE-SITE.bat`** :
une fenêtre noire s'ouvre (laissez-la ouverte) et le site s'affiche
automatiquement dans votre navigateur à l'adresse `http://localhost:8777/`.
L'administration est sur `http://localhost:8777/gestion/` et le bouton
💾 Enregistrer y fonctionne directement. Pour arrêter : fermez la fenêtre noire.

## ⚙ Mini-CMS : modifier le site sans toucher au code

Le contenu vivant du site (horaires, événements, actualités, photos, vidéos,
coordonnées, YouTube) est centralisé dans **un seul fichier : `contenu.json`**.
Les pages le chargent automatiquement via `cms.js`.

### Modifier le contenu

1. Ouvrez l'espace de gestion : **`/gestion/`** (en local `http://localhost:8777/gestion/`,
   en ligne `https://votredomaine.com/gestion/`).
2. Modifiez les champs : apparence/couleurs, coordonnées, horaires, événement vedette,
   agenda, actualités, galerie photos, vidéothèque, chaîne YouTube…
3. Cliquez sur **💾 Enregistrer** : la sauvegarde est **immédiate**, en local
   (serveur `DEMARRER-LE-SITE.bat`) comme en ligne (script PHP `gestion/enregistrer-contenu.php`
   sur Hostinger). Rechargez ensuite les pages du site (F5).
4. Secours : **⬇ Télécharger contenu.json** récupère le fichier à remplacer manuellement.

### Ajouter ses propres photos

Téléversez vos images dans le dossier `images/` de l'hébergement, puis dans
l'admin indiquez le chemin, par exemple `images/fete-patronale-2026.jpg`.

### Sécurité de l'espace /gestion/ (hébergement Hostinger)

L'espace de gestion permet d'écrire sur le site : il **doit** être protégé par mot de passe.
Sur Hostinger, sans rien mettre de secret dans le code :

1. hPanel → **Avancé → Protéger les répertoires par mot de passe** (« Password Protect Directories »).
2. Sélectionnez le dossier **`gestion`**.
3. Définissez un **nom d'utilisateur + mot de passe** (gardés par Hostinger, jamais dans le dépôt).
4. Désormais, ouvrir `https://votredomaine.com/gestion/` demande ce mot de passe,
   et seul vous pouvez enregistrer les modifications.

- En cas d'erreur dans `contenu.json`, le site retombe sur son contenu HTML d'origine.
- ⚠ Après chaque modification **en ligne**, si vous redéployez depuis GitHub, pensez à
  renvoyer aussi `contenu.json` sur GitHub (sinon le redéploiement écrase vos changements en ligne).

## Pages

| Fichier | Rubrique |
|---|---|
| `index.html` | Accueil (héros avec la photo de l'église, accès rapides, horaires, événements, YouTube, actualités) |
| `la-paroisse.html` | Histoire, sainte Anne notre patronne, équipe pastorale et conseils |
| `messes.html` | Horaires des messes, confessions, adoration, dévotions, secrétariat |
| `sacrements.html` | Les 7 sacrements et les démarches (accordéons) |
| `mouvements.html` | Mouvements et associations de la paroisse |
| `evenements.html` | Espace événementiel : fête patronale (compte à rebours), agenda |
| `medias.html` | Espace médias : galerie photos filtrable + vidéothèque |
| `youtube.html` | Espace chaîne YouTube : direct, playlists, abonnement |
| `actualites.html` | Annonces et nouvelles de la paroisse |
| `don.html` | Faire un don (Mobile Money, quête, denier du culte) |
| `contact.html` | Formulaire, coordonnées, permanences, plan d'accès (OpenStreetMap) |

## À personnaliser avant la mise en ligne

1. **Téléphone / WhatsApp** : remplacer partout `+225 07 00 00 00 00` (bandeau haut, pied de page, contact).
2. **E-mail** : remplacer `paroissesainteanne.bgv@gmail.com`.
3. **Chaîne YouTube** : dans `youtube.html`, un commentaire `✏ POUR ACTIVER LE DIRECT` indique où coller
   l'iframe avec l'identifiant de la chaîne (`https://www.youtube.com/embed/live_stream?channel=VOTRE_CHANNEL_ID`).
   Mettre aussi le vrai lien de la chaîne à la place des liens de recherche YouTube.
4. **Numéros Mobile Money** : dans `don.html` (Orange Money, MTN MoMo, Moov, Wave).
5. **Horaires des messes** : vérifier/ajuster les horaires indicatifs dans `messes.html`, `index.html` et les pieds de page.
6. **Position exacte de l'église** : dans `contact.html`, ajuster le paramètre `marker=LAT,LON` de la carte OpenStreetMap.
7. **Histoire et équipe** : compléter `la-paroisse.html` avec les dates et les noms réels.
8. **Réseaux sociaux** : remplacer le lien Facebook `#` du pied de page.
9. **Formulaire de contact** : il fonctionne en démonstration (message de confirmation sans envoi).
   Pour un envoi réel, brancher un service comme Formspree ou un script de l'hébergeur.

## Images et vidéos

- `images/interieur-eglise.jpg` : photo de l'intérieur de l'église (fournie), utilisée pour le header de toutes les pages.
- Les autres photos et les 4 vidéos sont des illustrations **Pexels** (libres de droits, URL vérifiées) ;
  remplacez-les progressivement par les photos et vidéos officielles de la paroisse.
- `images/poster-*.jpg` : affiches des vidéos de la page médias.
