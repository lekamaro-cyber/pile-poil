# Justo : prototype de jeu mobile

Prototype jouable dans un navigateur. Tout le jeu tient dans un seul fichier : `index.html` (HTML + CSS + JavaScript).
Aucune publicité, aucun achat. Les autres fichiers servent seulement à l'installer comme une appli sur le téléphone :
`manifest.webmanifest` (nom, icône), `sw.js` (hors ligne et mises à jour) et les icônes `*.png`.

**Jouer et installer : https://lekamaro-cyber.github.io/pile-poil/**

> Ce n'est **pas** une application Android ou iPhone prête à publier. C'est une page web qui sert à tester
> l'idée du jeu sur un écran tactile (voir « Ce que ce prototype n'est pas » plus bas).

## Le nom : Justo

Le jeu s'appelait « Pile Poil » (expression française intraduisible). Son nom international est **Justo** :

- « justo » veut dire « juste, pile » en espagnol et en portugais, et se comprend en français (juste), en italien
  (giusto) et en anglais (just right) ;
- court, facile à prononcer dans les 7 langues du jeu ;
- le « o » final est la bulle du logo.

En français, le tir parfait s'appelle toujours « PILE POIL ! ». L'adresse du site (`/pile-poil/`) et les données
enregistrées sur le téléphone gardent l'ancien nom : changer l'adresse casserait l'appli déjà installée.

Vérification faite (rapide, non juridique) : aucun jeu « Justo » trouvé sur les stores. Avant une vraie sortie,
il faudrait vérifier les marques déposées (INPI, EUIPO) et la disponibilité sur Google Play et l'App Store.

## Langues

Le jeu est traduit en **7 langues** : français, anglais, espagnol, allemand, italien, portugais (Brésil) et arabe
(affiché de droite à gauche). Par défaut, il suit la langue du téléphone ; si elle n'est pas disponible, il passe en
anglais. On peut la changer dans **Paramètres → Apparence → Langue**.

Les traductions ont été faites par Claude (IA) : à faire relire par des personnes dont c'est la langue maternelle
avant une vraie sortie. Tous les textes sont regroupés dans le bloc `LANGS` du script : pour corriger une phrase,
il suffit de la modifier là. Pour ajouter une langue, copier le bloc `en`, le traduire et ajouter son code à
`LANG_ORDER`.

Le tir parfait change selon la langue : PILE POIL ! (fr), JUST RIGHT! (en), ¡JUSTO! (es), PASST! (de), GIUSTO! (it),
NA MEDIDA! (pt), بالضبط! (ar).

## Le principe

Tu contrôles une bulle de savon. Des murs descendent vers elle, chacun percé d'un trou rond.

- **Doigt appuyé** : la bulle gonfle.
- **Doigt levé** : la bulle se dégonfle (elle fuit).
- Au moment où le trou passe sur la bulle, sa taille doit tomber dans **l'anneau vert** du trou.
  - Près du bord du trou : **PILE POIL !** 30 points, et les PILE POIL enchaînés font monter un multiplicateur jusqu'à ×5.
  - Dans l'anneau mais loin du bord : « Bien », 10 points.
  - Plus grosse que le trou : la bulle éclate, tu perds une vie.
  - Plus petite que l'anneau : tu perds une vie.
  - En cas d'échec, le jeu dit **de combien** c'était raté (« Raté de 3 % ! ») et dans quel sens. À 5 % près, il
    ajoute « Presque ! Un poil trop gros / trop petit » : un échec de justesse donne envie de réessayer.
- 3 vies. Une partie dure en général de 30 secondes à 2 minutes.

### Sensations

- **Son de bulle qui éclate** : un claquement, un « plop » qui chute et des gouttelettes. Une grosse bulle fait un son
  plus grave, et chaque éclatement sonne un peu différemment.
- **La bulle s'écrase** quand elle passe dans un trou juste, puis rebondit comme une gelée.
- **Ralenti** d'une demi-seconde sur un passage limite (bulle à 96 % du trou ou plus, « Au poil près ! ») et sur un
  raté de 5 % ou moins.
- **Vibrations** différentes pour un PILE POIL, un passage limite, un échec, une étoile, un niveau. Elles se coupent
  dans les Paramètres.
  - **Android** : vraies vibrations, si le navigateur et les réglages du téléphone les autorisent.
  - **iPhone** : Safari ne laisse pas les pages web faire vibrer. Le jeu déclenche à la place le petit « clic » haptique
    d'un interrupteur caché (astuce connue, iOS 18 et plus). C'est plus léger qu'une vibration, et Apple peut la
    bloquer dans une future mise à jour.
  - **Bouton « Tester la vibration »** (Paramètres) : il vibre, puis affiche la raison la plus probable si rien ne se
    passe (iPhone, page intégrée comme le lien claude.ai, réglages du téléphone).

Une aide visuelle entoure la bulle quand un mur approche : **vert** = bonne taille, **flèches vers l'extérieur** = gonfle,
**flèches vers l'intérieur** = dégonfle. Elle se désactive dans les Paramètres.

### Paramètres

Bouton **Paramètres** en bas du menu (et dans la pause). Tous les choix sont gardés sur le téléphone.

| Réglage | Choix |
| --- | --- |
| Langue | Automatique (langue du téléphone) ou l'une des 7 langues. |
| Thème | **Auto** (suit le téléphone), **Clair** (pastel) ou **Sombre** (version nuit dessinée pour le jeu). |
| Couleur de la bulle | Les couleurs débloquées (niveaux et série de jours). |
| Son, volume | Son activé ou coupé, curseur de volume. |
| Vibrations | Activées ou coupées, et bouton « Tester la vibration ». |
| Difficulté du mode classique | **Facile** (murs plus lents et plus espacés, anneau plus large), **Normal**, **Difficile**. Chaque difficulté a son propre record. Le défi du jour reste toujours en Normal. |
| Aide autour de la bulle | Anneau de couleur et flèches quand un mur approche. |
| Ralenti, tremblement | Effets sur les passages limites et sur les échecs. |
| Plein écran | Seulement si le navigateur le permet. |
| Effacer mes données | Remet à zéro records, série, défi du jour et couleurs (avec confirmation). Les réglages restent. |

Sur Android, le bouton retour du téléphone ferme les Paramètres sans quitter l'appli.

### Progression et difficulté

Tous les 10 murs réussis, tu passes au niveau suivant (la couleur du fond change) :

| Niveau | Ce qui change |
| --- | --- |
| 1 | Murs lents, anneau vert large. Les deux premiers trous servent de tutoriel (un gros, puis un petit). |
| 2 | Des étoiles bonus apparaissent sur les côtés : grossis pour les toucher. |
| 3 et + | Les murs vont plus vite et arrivent plus souvent. |
| 4 et + | L'anneau vert devient plus fin (il faut être plus précis). |
| 5 et + | Certains trous « respirent » : leur taille change en continu. |

Tes records (un par difficulté) et ton meilleur niveau sont gardés sur l'appareil. Atteindre les niveaux 3, 5, 7 et 9
en Normal ou Difficile débloque de nouvelles couleurs de bulle, à choisir dans les Paramètres.

### Défi du jour

- **Le même parcours pour tout le monde**, chaque jour : 30 murs, un niveau tous les 6 murs. Le parcours est calculé à
  partir de la date du téléphone (une « graine » de hasard), donc **aucun serveur n'est nécessaire** et ça marche hors
  ligne. Deux personnes qui jouent le même jour ont exactement les mêmes trous, dans le même ordre.
- **Un seul essai officiel par jour**, comme Wordle. Les essais suivants sont de l'entraînement : même parcours, mais
  ils ne changent pas le résultat officiel. Quitter l'essai officiel en cours le termine (il est enregistré après
  chaque mur, même si l'appli est fermée).
- **Résultat à partager** : une grille de 30 pastilles, 🟢 PILE POIL, 🟡 Bien, 🔴 Raté, ⚪ mur non atteint, avec le
  score et la série. Le bouton « Partager » ouvre le menu de partage du téléphone (WhatsApp, SMS…). S'il n'existe
  pas (sur PC par exemple), une fenêtre propose « Copier le texte » et « Ouvrir WhatsApp ».

  ```
  Justo · Défi n°1 (20/10)
  🟢🟢🟡🟢🔴🟢🟢🟢🟡🟢
  🟢🟢🟢🔴🟢🟡🟢🟢🟢🟢
  🟢🔴⚪⚪⚪⚪⚪⚪⚪⚪
  1 240 pts · 21/30 murs · série 4 🔥
  ```

- **Série de jours** : chaque jour où tu joues ton essai officiel prolonge la série. Si tu sautes un jour, elle repart
  à 1. Récompenses : bulle **Aurore** à 3 jours, **Nuit** à 7 jours, **Perle** à 14 jours. Elles restent acquises même
  si la série casse ensuite.

## Installer sur le téléphone (comme une appli)

1. Ouvre **https://lekamaro-cyber.github.io/pile-poil/** sur le téléphone.
2. Ajoute-le à l'écran d'accueil :
   - **Android (Chrome)** : menu **⋮** en haut à droite → **Installer l'application** (ou **Ajouter à l'écran
     d'accueil**) → **Installer**.
   - **iPhone (Safari)** : bouton **Partager** (carré avec une flèche) → **Sur l'écran d'accueil** → **Ajouter**.
3. Lance Justo depuis son icône : il s'ouvre en plein écran, sans barre d'adresse.

- **Hors ligne** : après la première ouverture, le jeu marche sans internet (mode avion compris).
- **Mises à jour automatiques** : à chaque ouverture avec internet, l'appli charge la dernière version publiée. Si le
  réseau est lent, elle s'ouvre avec la version gardée et prendra la nouvelle la fois suivante. Le numéro de version
  est affiché en bas du menu.
- **Tes données** (record, série, couleurs) restent sur le téléphone. Sur iPhone, l'appli de l'écran d'accueil a sa
  propre mémoire, séparée de Safari : un record fait dans Safari n'apparaît pas dans l'appli, et inversement.
- **Vibrations** : dans l'appli installée sur Android, elles fonctionnent (contrairement à l'aperçu dans Claude).

## Télécharger une version

Chaque version a son fichier ZIP (tout le jeu, à garder ou à partager) :

- **Toujours la dernière version** : https://github.com/lekamaro-cyber/pile-poil/archive/refs/heads/main.zip

| Version | Nouveautés | Télécharger |
| --- | --- | --- |
| 1.5 | Icône finale : fond pastel, anneau et « J » dans la bulle | [ZIP 1.5](https://github.com/lekamaro-cyber/pile-poil/archive/4034c68e9b394de1e2d740f07bd8ce3bddd3d344.zip) |
| 1.4 | Nouvelle icône : le « J » de Justo dans une bulle | [ZIP 1.4](https://github.com/lekamaro-cyber/pile-poil/archive/b925e83bfd963d13d9c75445999527682920e80d.zip) |
| 1.3 | Nom international Justo, 7 langues (dont l'arabe) | [ZIP 1.3](https://github.com/lekamaro-cyber/pile-poil/archive/585ca8b9f4d6c8cde78e81017a49e8141bea1fb4.zip) |
| 1.2 | Page Paramètres, vrai thème sombre, difficulté | [ZIP 1.2](https://github.com/lekamaro-cyber/pile-poil/archive/dbb5a19089d7d2cadbd73c18afa57d755b67fae0.zip) |
| 1.1 | Couleurs correctes quand le téléphone est en mode sombre | [ZIP 1.1](https://github.com/lekamaro-cyber/pile-poil/archive/8a3ba4a0b5284ba7065d57bdc0b9d591cf9b31b0.zip) |
| 1.0 | Première version installable (Pile Poil) | [ZIP 1.0](https://github.com/lekamaro-cyber/pile-poil/archive/84676e92cfade964e52a7d7082e7417e3931a1ea.zip) |

Dans le ZIP, ouvre `index.html` pour jouer sans internet sur un PC. Pour l'installer sur un téléphone avec les mises à
jour automatiques, passe plutôt par le site (voir ci-dessus).

## Publier une mise à jour

1. Modifie `index.html` et augmente `VERSION` en haut du script (par exemple `'1.0'` → `'1.1'`).
2. Pousse sur la branche `main` du dépôt `pile-poil`.
3. GitHub Pages republie le site en une à deux minutes (onglet **Actions** du dépôt pour suivre).
4. Les téléphones prennent la nouvelle version à leur prochaine ouverture avec internet.
5. Ajoute la version au tableau « Télécharger une version », avec le lien
   `https://github.com/lekamaro-cyber/pile-poil/archive/<identifiant du commit>.zip`.

## Lancer le jeu sur un PC

### Sur un PC Windows (le plus simple)

1. Récupère le fichier `index.html` (télécharge-le depuis GitHub ou clone le dépôt).
2. Double-clique dessus : il s'ouvre dans ton navigateur (Edge, Chrome ou Firefox).
3. Pour l'afficher au format téléphone dans Edge ou Chrome :
   1. Appuie sur **F12** (outils de développement).
   2. Appuie sur **Ctrl + Maj + M** (mode appareil mobile).
   3. En haut, choisis un modèle de téléphone (par exemple « Pixel 7 » ou « iPhone 12 Pro »).
   4. Appuie sur **F5** pour recharger la page.

Commandes sur PC : **clic maintenu** = gonfler, ou **barre d'espace maintenue**. **Échap** = pause. **Entrée** = rejouer.

Ouvert ainsi depuis un fichier, le jeu marche, mais sans installation ni mises à jour automatiques. Sur le téléphone,
utilise plutôt le site (voir « Installer sur le téléphone »). Tiens le téléphone **en mode portrait**.

## Comment le tester

Liste à cocher pour une séance de test :

1. Le menu s'affiche avec le bouton **Jouer**.
2. En partie, doigt appuyé : la bulle grossit et un son monte. Doigt levé : elle rétrécit.
3. Le 1er trou est gros (il faut gonfler), le 2e est petit (il faut dégonfler).
4. Bulle près du bord du trou : « PILE POIL ! » s'affiche et le badge ×2, ×3… apparaît à côté du score.
5. Bulle trop grosse : elle éclate (son de « plop »), l'écran tremble, une vie (rond en haut à droite) se vide, et
   « Raté de X % ! » s'affiche. De justesse : « Presque ! Un poil trop gros » et un court ralenti.
6. Bulle trop petite : « Raté de X % ! » avec « Bulle trop petite » (ou « Presque ! Un poil trop petit »).
7. Passe une bulle tout près du bord : « Au poil près ! », la bulle s'écrase et rebondit, le jeu ralentit un instant.
8. Après 10 murs réussis : bannière « Niveau 2 », le fond change de couleur, des étoiles apparaissent.
9. Après 3 erreurs : écran « Partie terminée » avec score, stats et une astuce. **Rejouer** relance tout de suite.
10. Recharge la page : le record est toujours affiché dans le menu.
11. Bouton pause (II) : le jeu s'arrête. Passe sur une autre appli puis reviens : le jeu s'est mis en pause tout seul.
12. **Hors ligne** : ouvre le jeu, active le mode avion, joue une partie complète. Rien ne doit changer.
13. Tourne le téléphone : la page s'adapte (le jeu reste prévu pour le portrait).
14. **Défi du jour** : joue-le, puis vérifie que le menu affiche « Fait » avec ta grille. « S'entraîner » relance le
    même parcours sans changer le résultat officiel.
15. **Même parcours pour tous** : joue le défi sur deux appareils le même jour (ou PC + téléphone). Les trous doivent
    être identiques, dans le même ordre.
16. **Partage** : touche « Partager », envoie-toi le résultat sur WhatsApp et vérifie que la grille s'affiche bien.
17. **Série** : rejoue le défi le lendemain, la série passe à 2 jours. Pour simuler sans attendre, voir ci-dessous.
18. **Vibrations** : touche « Tester la vibration » dans les Paramètres et lis le message. Puis en partie, elles se
    déclenchent sur PILE POIL, échec, étoile. Si rien ne vibre depuis le lien claude.ai, réessaie avec le fichier ouvert
    directement dans Chrome ou Firefox.

Quelques commandes utiles dans la console du navigateur (F12, onglet *Console*) :

- `Justo.CONFIG.lives = 99` puis lance une partie : pour tester sans fin.
- `localStorage.removeItem('pilepoil.daily')` puis recharge : pour rejouer l'essai officiel du jour.
- Pour simuler une série de 2 jours (recharge ensuite, puis joue le défi pour passer à 3 jours et débloquer Aurore) :

  ```js
  const d = new Date(); d.setDate(d.getDate() - 1);
  const hier = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  localStorage.setItem('pilepoil.streak', JSON.stringify({ last: hier, count: 2, best: 2 }));
  ```

## Régler le jeu

Tout en haut du `<script>`, le bloc `CONFIG` regroupe les réglages, avec un commentaire en français pour chacun.
Modifie un nombre, enregistre, recharge la page. Exemples :

- `lives: 3` : nombre de vies.
- `growTime: 1.2` : secondes pour gonfler de la plus petite à la plus grosse taille. Plus grand = plus facile à doser.
- `speedStart` / `speedStep` / `speedMax` : vitesse des murs au niveau 1, ajout par niveau, vitesse maximale.
- `tolStart` / `tolMax` : largeur de l'anneau vert (0,50 = la bulle peut faire de 50 % à 100 % du trou).
- `gatesPerLevel: 10` : murs à réussir pour changer de niveau.
- `closeCall: 0.96` / `nearMiss: 5` / `slowTime: 0.5` : seuil du passage limite, seuil du « Presque ! » (en %),
  durée du ralenti (en secondes).
- `daily: { gates: 30, gatesPerLevel: 6 }` : longueur du défi du jour et rythme de ses niveaux. Attention : changer ces
  valeurs change le parcours du jour, donc tout le monde doit avoir la même version du jeu pour comparer.

Le reste du code est découpé en sections numérotées (1. Réglages, 2. Outils, 3. Son… 12. Démarrage).

## Ce que ce prototype n'est pas

- C'est une appli web (on l'installe depuis le site), pas une application des stores : pas de fichier APK ou AAB,
  pas de fiche Google Play ni App Store.
- Il n'a été testé que dans Chromium (format téléphone simulé), pas sur un panel de vrais appareils Android et iPhone.
- Les sons sont générés par le navigateur. Il n'y a ni musique ni graphismes dessinés à la main.
- Le défi du jour n'a pas de classement en ligne : on compare ses résultats en les partageant. Il suit l'heure du
  téléphone, donc changer la date du téléphone permet de tricher (un serveur serait nécessaire pour l'empêcher).

Pour en faire une vraie application plus tard, il faudrait notamment : la transformer en PWA (fichier manifeste + service
worker pour l'installation et le hors-ligne garanti), ou l'emballer avec un outil comme Capacitor, la tester sur de
vrais téléphones, créer icônes et captures, puis passer par la Google Play Console (compte développeur, politique de
confidentialité, classification du contenu, tests fermés).
