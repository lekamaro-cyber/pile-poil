# Ultimate Football : jeu de football 3D pour smartphone

Jeu de football en 3D, jouable dans Google Chrome sur Android (testé pour un Samsung Galaxy S24 en paysage) et
installable comme une appli (PWA). Moteur 3D : [Three.js](https://threejs.org) (version 0.170.0, incluse dans le dépôt).
Clubs, maillots et panneaux sont inventés : aucun logo ni élément protégé.

**Jouer et installer : https://lekamaro-cyber.github.io/pile-poil/**

> Version 0.4 : le jeu devient un jeu de **coups francs et penalties au doigt** (tirs au but et entraînement
> libre). Le match 11 contre 11 des versions 0.1 à 0.3 reste jouable en mode bonus.

## Nouveautés de la version 0.4 : coups francs et penalties au doigt

- **Tirer** : pose le doigt sur le ballon et trace la trajectoire voulue jusqu'au but. Le jeu calcule la vraie
  frappe (vitesse, direction, effet) dont la trajectoire ressemble le plus à ton tracé, puis le ballon suit la vraie
  physique (gravité, air, **effet Magnus réaliste** : environ 2 m de déviation sur 25 m au maximum).
- **Tirs au but** contre l'ordinateur : vraies règles (5 tirs chacun, arrêt quand c'est joué, puis mort subite).
  Quand l'adversaire tire, tu es le gardien : glisse le doigt pour plonger, touche l'écran pour sauter.
  S'il te voit plonger trop tôt, le tireur peut tirer de l'autre côté.
- **Entraînement libre** : bouton « Réglages du tir » pour placer le ballon sur une mini-carte, choisir le mur
  (0 à 5 joueurs, à 9,15 m, qui sautent) et le gardien (sans, ou 4 niveaux), ou tirer des penalties.
- Mur et gardien sont de vrais obstacles : le ballon rebondit sur leurs corps ; le gardien voit le ballon partir,
  prévoit sa trajectoire (il lit mal l'effet aux niveaux faciles), se déplace et plonge ; au penalty, il choisit
  souvent un côté et retient tes côtés préférés.

Testé dans Chromium (vrais événements tactiles) : 8 tracés (droit, courbé, lob, à côté, au-dessus) arrivent à 1
ou 2 cm de l'endroit où le doigt s'est levé ; tracé courbé = effet du bon côté ; coups francs avec mur et gardien :
buts par-dessus le mur et enroulés au 2e poteau, tirs bloqués par le mur ou arrêtés. **Pas encore réglé finement** :
la difficulté du gardien au penalty (dernier réglage pas encore re-mesuré) et la séance de tirs au but n'a pas été
jouée en entier dans les tests.

## Correctif de la version 0.3

| Ce qui gênait | Ce qui a changé |
| --- | --- |
| En tirant pendant la conduite de balle, le joueur arrêtait de pousser le ballon et partait sans lui | Pendant que tu charges un tir (ou une passe, un centre), le joystick sert **seulement à viser** : le joueur garde sa course et continue de pousser le ballon, par touches plus courtes pour l'avoir au pied au moment de frapper. Si le ballon est un peu loin quand tu relâches, le joueur **court le rattraper** et frappe dès qu'il est à portée. |

## Nouveautés de la version 0.2 (après le premier essai sur Galaxy S24)

| Ce qui gênait | Ce qui a changé |
| --- | --- |
| Ballon collé au pied | Conduite de balle **par petites touches** : le ballon roule vraiment devant le joueur (à moins d'un mètre), il suit les changements de direction, et le joueur le bloque sous la semelle quand on lâche le joystick. Pousser le ballon droit sur un défenseur le fait perdre ; le contourner au bon moment le garde (8 fois sur 10 dans les tests). |
| Passes molles | Herbe moins collante et ballon plus vif : passe de 25 m reçue en 1,9 s, de 40 m en 2,7 s. |
| Tirs qui flottent | Tirs de 22 à 34 m/s, plus tendus. Le joueur frappe dès que le ballon est à portée de pied. |
| Joueurs qui glissent | Démarrages et freinages nets, foulées calées sur la vitesse, joueurs qui ne se repoussent plus brusquement. |
| On ne voit pas tout le terrain | Caméra plus haute qui vise vers le côté proche : presque toute la largeur visible (réglage Normale), toute la largeur en Large. **Mini-carte** en bas au centre avec les 22 joueurs et le ballon. |
| Jeu un peu lent | Le temps du match passe **15 % plus vite**. Le jeu garde la même vitesse même si le téléphone ralentit. |
| Pas de difficulté | **4 niveaux** : Facile, Normal, Difficile, Légende (voir plus bas). |

Ce jeu remplace **Ajusto**, l'ancien jeu à cette adresse (voir « Ancien jeu : Ajusto » en bas). Le dossier
`codequest/` est un autre projet, indépendant.

## Ce que contient l'étape 1 (version 0.1)

| Partie | Ce qui marche |
| --- | --- |
| Terrain | 105 × 68 m, pelouse tondue en bandes, toutes les lignes réglementaires (surfaces, points de penalty, arcs, rond central, coins), deux cages avec poteaux, barre et filets. |
| Stade | Quatre tribunes en gradins avec toit, environ 8 000 supporters (moins en qualité basse), panneaux publicitaires inventés, pylônes d'éclairage. |
| Joueurs | 22 joueurs humanoïdes articulés (jambes, bras, tête), deux maillots différents et des gardiens en couleur ; animations de course, frappe, tacle glissé, plongeon du gardien, célébration. |
| Ballon | Vraie physique : gravité, résistance de l'air, rebonds de plus en plus faibles, roulement qui ralentit, poteaux et barre qui renvoient le ballon, filets qui l'arrêtent. |
| Commandes | Joystick et six boutons tactiles qui fonctionnent tous (voir plus bas). Plusieurs doigts en même temps. |
| Difficulté | Facile, Normal, Difficile, Légende : vitesse des adversaires, leur réussite au tacle, le nombre de joueurs qui te pressent, la précision de leurs tirs, leur sang-froid sous pression et la réussite des gardiens. |
| Caméra | Façon retransmission télé, sur le côté du terrain ; elle suit le ballon en douceur. Trois réglages : Proche, Normale (presque toute la largeur), Large (toute la largeur). Mini-carte du terrain en bas au centre. |
| Jeu | Possession du ballon, conduite de balle, passes vers le coéquipier visé, tirs (puissance + précision), centres en cloche, interceptions, tacles, changement de joueur, gardiens qui se placent, plongent, captent ou repoussent, buts et score. |
| IA (de base) | Les coéquipiers et les adversaires tiennent leur poste et suivent le jeu ; un adversaire presse le porteur, un autre couvre ; le porteur adverse dribble, passe ou tire. |
| Sorties | Touche, corner et six mètres décidés selon le dernier joueur qui a touché le ballon (remise en jeu simplifiée : le tireur repart ballon au pied). |
| Appli | Plein écran et paysage, écran « tourne ton téléphone » en portrait, pause (bouton ou touche retour d'Android), qualité graphique automatique, jeu hors ligne, réglages sauvegardés. |

### Ce qui n'est pas encore fait (prévu aux étapes suivantes)

- **Étape 2** : vrai match (durée, mi-temps, coup de sifflet final), IA collective (appels, démarquage, marquage,
  pressing organisé, retour défensif), gardiens plus fins. Les niveaux de difficulté sont déjà là (version 0.2).
- **Étape 3** : fautes, coups francs, penalties, hors-jeu, cartons jaunes et rouges, remplacements, vraies remises
  en jeu (lancer à la main, corners tirés), collisions plus riches, statistiques du match, célébrations.
- **Étape 4** : carrière joueur (créer son joueur, entraînements, expérience, offres de clubs, contrats).
- **Étape 5** : carrière entraîneur (effectif, transferts, budget, formations, tactiques, championnats, coupes).
- **Étape 6** : menus définitifs (Match rapide, choix des équipes et des maillots…), sauvegardes complètes.

## Commandes

| Commande | Action |
| --- | --- |
| **Joystick** (pouce gauche, n'importe où sur la moitié gauche) | Courir. Pousser à fond : courir plus vite. Avec le ballon, le joueur le pousse devant lui par petites touches ; joystick lâché, il le bloque sous le pied. |
| **Sprint** (maintenir) | Vitesse maximale (un peu moins avec le ballon). |
| **Passe** | Passe à terre vers le coéquipier dans la direction du joystick (sinon devant). La passe anticipe sa course ; on prend aussitôt le contrôle du receveur. |
| **Tir** (maintenir puis relâcher) | La barre de puissance se remplit en 0,9 s (au-dessus de la mini-carte). Le joueur frappe dès que le ballon est à portée de pied. Peu de puissance : tir lent, facile à arrêter. Trop de puissance : tir moins précis, parfois au-dessus. Joystick vers le haut ou le bas de l'écran : viser ce côté du but ; sans direction : petit filet opposé. Pendant la charge, le joystick vise sans changer la course du joueur, qui garde le ballon. |
| **Centre** | Près de la surface adverse : ballon en cloche vers un coéquipier dans la surface (sinon vers le point de penalty). Plus loin : longue passe en l'air. |
| **Tacle** (sans ballon) | Tacle glissé dans la direction du joystick, ou vers le ballon. Il fait sauter le ballon du pied adverse. |
| **Changer** (sans ballon) | Contrôler le coéquipier le plus proche du ballon. |
| Passe ou Tir **juste avant** de recevoir | Passe ou tir en une touche (la demi-seconde avant la réception). |

Les boutons inutiles à un moment donné sont grisés (Tacle et Changer quand tu as le ballon). Sur ordinateur, le
clavier marche aussi : flèches ou ZQSD, Espace ou K = tir, J = passe, L = centre, Maj = sprint, I = tacle, E = changer.

## Installer sur le téléphone (Samsung Galaxy S24)

1. Ouvrir **https://lekamaro-cyber.github.io/pile-poil/** dans Chrome.
2. Menu ⋮ → **Ajouter à l'écran d'accueil** → **Installer**.
3. L'appli s'ouvre en plein écran et en paysage. Elle marche ensuite sans internet, et se met à jour toute seule
   quand il y a du réseau (fermer complètement l'appli puis la rouvrir pour prendre une nouvelle version).

Si l'ancienne appli Ajusto était installée, elle devient Ultimate Football (même adresse). Android peut garder
quelque temps l'ancien nom et l'ancienne icône : désinstaller puis réinstaller pour les mettre à jour tout de suite.

## Réglages (accueil et pause)

- **Qualité** : *Auto* (recommandé : la finesse de l'image baisse si le téléphone n'arrive pas à suivre, et remonte
  s'il a de la marge), *Haute*, *Moyenne*, *Basse* (moins de supporters, image moins fine, sans anticrénelage au
  prochain lancement).
- **Difficulté** : Facile, Normal, Difficile, Légende (change tout de suite, même en plein match).
- **Caméra** : Proche, Normale, Large.
- **Mini-carte** : afficher ou masquer.
- **Images/s** : afficher le nombre d'images par seconde en haut à droite (60 = parfaitement fluide).

## Jouer sur un PC

Le jeu est découpé en modules JavaScript : Chrome refuse de les charger en ouvrant simplement `index.html` (double
clic). Deux solutions :

1. Le plus simple : jouer sur le site (adresse ci-dessus).
2. Hors ligne, depuis le ZIP : clic droit sur `serveur-local.ps1` → **Exécuter avec PowerShell** (ou, dans une fenêtre
   PowerShell ouverte dans le dossier : `powershell -ExecutionPolicy Bypass -File .\serveur-local.ps1`). Le script
   lance un petit serveur web sur `http://localhost:8080/` et ouvre le navigateur. Fermer la fenêtre PowerShell pour
   l'arrêter.

## Organisation du code

| Dossier / fichier | Rôle |
| --- | --- |
| `index.html`, `css/style.css` | Page, écrans (accueil, pause, aide, portrait), tableau de score, boutons tactiles. |
| `src/main.js` | Démarrage : scène 3D, lumières, boucle du jeu, écrans, pause, plein écran. |
| `src/config.js` | **Tous les réglages** : dimensions, physique, vitesses, puissance des tirs, gardiens, équipes, formation. |
| `src/engine/` | Rendu 3D et qualité adaptative (`renderer.js`), caméra de match (`camera.js`), outils de géométrie (`geometry.js`). |
| `src/world/` | Terrain, lignes et cages (`pitch.js`), tribunes, supporters, panneaux et pylônes (`stadium.js`). |
| `src/entities/` | Joueur humanoïde, déplacement et animations (`player.js`), ballon (`ball.js`). |
| `src/physics/ballPhysics.js` | Physique du ballon et calculs de visée (passe à terre, lob, hauteur d'un tir). |
| `src/ai/simpleAI.js` | IA de base de l'étape 1 (placement, pressing, porteur, gardiens). |
| `src/input/touch.js` | Joystick, boutons tactiles, clavier. |
| `src/game/match.js` | Le match : possession, actions, tacles, arrêts, collisions, buts, sorties. |
| `src/ui/` | Affichage du match (`hud.js`), menus et réglages (`menus.js`). |
| `src/save/storage.js` | Sauvegarde sur le téléphone (clés `uf.*`). |
| `lib/three.module.min.js` | Three.js 0.170.0 (licence MIT, `lib/THREE-LICENSE.txt`). |
| `manifest.webmanifest`, `sw.js`, `*.png` | Installation comme appli, jeu hors ligne, icônes. |

Pour ajouter une équipe : un bloc de plus dans `TEAMS` (`src/config.js`). Pour une autre formation : une entrée de plus
dans `FORMATIONS` (position de chaque joueur en fraction du terrain).

## Tests faits (versions 0.1 à 0.3)

Version 0.3 :

- **Tir pendant la conduite de balle** : 9 cas (tir chargé 0,3 s, 0,6 s et 1 s, en course ou en sprint, joystick
  vers le haut, vers le bas ou sans visée, plus une passe et un centre).
  - Dans les 9 cas, le joueur garde le ballon pendant la charge : il reste à 1,2 m du pied au plus.
  - La frappe part toujours : de 13 à 35 m/s selon l'action et la puissance.
- **Ballon un peu loin au moment du tir** : le joueur le rattrape et frappe dès qu'il est à portée.
- **Visée** : depuis 18 m, joystick vers le haut, les tirs partent en moyenne vers le haut du but ; joystick vers
  le bas, vers le bas. De loin ou à pleine puissance, l'écart est plus grand (c'est voulu).
- **Tout ce qui marchait en 0.2** marche toujours :
  - les 12 vérifications au toucher ;
  - la conduite de balle ;
  - les passes (12, 25 et 40 m reçues en 0,9, 1,9 et 2,7 s) ;
  - l'appli hors ligne ;
  - les réglages.

Version 0.2 :

- **Conduite de balle** : ballon gardé en ligne droite, en sprint, en zigzag et au demi-tour.
  - Distance pied-ballon entre 0,3 et 1 m.
  - Il s'arrête au pied quand on lâche le joystick.
  - Face à un défenseur : foncer dessus fait perdre le ballon ; le contourner au dernier moment le garde 8 fois
    sur 10.
- **Ballon** :
  - passes de 12, 25 et 40 m reçues en 0,9, 1,9 et 2,7 s ;
  - tirs de 22 à 34 m/s au départ, 19 à 30 m/s en arrivant au but ;
  - rebonds, poteaux et filets comme avant.
- **Difficultés** : l'ordinateur joue les deux équipes, et seule l'équipe adverse change de niveau.
  - Sur 2 matchs de 5 minutes : Facile 8-0 pour ton équipe, Normal 4-2, Difficile 2-10.
  - Légende a été durci après ce test, car sur deux matchs seulement l'écart restait trop faible face au hasard.
- **Tout ce qui marchait en 0.1** marche toujours (commandes au toucher, arrêts de jeu, appli hors ligne).

Version 0.1 :

Dans Chromium (Playwright), écran de 780 × 360 points comme un S24 en paysage, avec de vrais événements tactiles
(plusieurs doigts) et un mode « pas à pas » qui avance le jeu image par image pour mesurer la physique :

- **Commandes** : chaque bouton déclenche son action, et le joystick et le sprint marchent ensemble (deux doigts).
- **Conduite de balle** : 13 à 15 m en 2,5 s. Un adversaire qui presse peut parfois voler le ballon (c'est voulu).
- **Passes et centres** : passes courtes et de 30 m reçues ; centre en cloche (3,3 m de haut) contrôlé par l'attaquant.
- **Tir en une touche** : Tir pressé quand la passe arrive, le joueur frappe dès la réception (25 m/s).
- **Tirs** : 8 essais par cas depuis 17 m face au gardien.
  - Tir faible au centre : surtout arrêté.
  - Tir moyen ou fort dans un coin : 3 à 6 buts sur 8 selon les séries (la précision a une part de hasard).
  - Pleine puissance : souvent non cadré.
- **Physique** : un ballon lâché de 5 m rebondit de moins en moins haut.
  - Il roule 22 m à 12 m/s avant de s'arrêter.
  - Poteau et barre renvoient le ballon ; le filet le garde.
  - Un lob tombe à 10 cm du point visé.
- **Arrêts de jeu** : touche, corner et six mètres attribués à la bonne équipe.
  - But, score, puis engagement par l'équipe qui a encaissé.
- **IA seule pendant 3 minutes** : passes, tirs et buts, aucune valeur aberrante.
  - Calcul du jeu : 0,06 ms par image.
- **Appli** :
  - installable, sans erreur ;
  - hors ligne ;
  - pause par le bouton et par la touche retour ;
  - écran portrait ;
  - réglages gardés après fermeture.

Les images par seconde n'ont pas pu être mesurées comme sur un vrai téléphone : le navigateur de test dessine la 3D
sans carte graphique. La scène reste légère pour un S24 : environ 130 objets dessinés et 100 000 triangles par image,
la plupart pour les supporters, qui diminuent en qualité basse. **À vérifier sur ton S24** : réglage « Images/s →
Afficher » pendant un match.

## Télécharger une version

- **Toujours la dernière version** : https://github.com/lekamaro-cyber/pile-poil/archive/refs/heads/main.zip

| Version | Nouveautés | Télécharger |
| --- | --- | --- |
| 0.4 | Coups francs et penalties au doigt (tracé de trajectoire, effet réaliste), tirs au but, entraînement libre ; match en bonus | dernière version (lien ci-dessus) |
| 0.3 | Le joueur garde le ballon pendant qu'il charge un tir, une passe ou un centre (le joystick vise seulement) ; ballon un peu loin : il le rattrape et frappe | [ZIP 0.3](https://github.com/lekamaro-cyber/pile-poil/archive/583daf3c6c7feefdeabed3def25d5c6d2adba833.zip) |
| 0.2 | Conduite de balle par touches, ballon plus vif, joueurs qui ne glissent plus, caméra plus large et mini-carte, jeu 15 % plus rapide, 4 difficultés | [ZIP 0.2](https://github.com/lekamaro-cyber/pile-poil/archive/376dbe50faf61aea7d65f8682f926155a6d49cd8.zip) |
| 0.1 | Étape 1 : prototype 3D jouable (terrain, stade, 22 joueurs, ballon physique, commandes tactiles, caméra) | [ZIP 0.1](https://github.com/lekamaro-cyber/pile-poil/archive/145cef822f964db4cd217af615cea6c25102d974.zip) |

## Ancien jeu : Ajusto

Ajusto (le jeu de la bulle) occupait cette adresse jusqu'à la version 1.13. Il reste entier dans l'historique du
dépôt : **[ZIP d'Ajusto 1.13](https://github.com/lekamaro-cyber/pile-poil/archive/72dfd207a242bc2aa8effa5b65b7b4ba31f2b67d.zip)**
(ouvrir `index.html` pour y jouer sur un PC).

## Publier sur Google Play

Le guide pas à pas reste valable (compte développeur, testeurs, fiche) : voir `PUBLIER-SUR-GOOGLE-PLAY.md` et
`DECISIONS-PUBLICATION.md`. Le nom du jeu, son titre sur le Play Store et l'identifiant de l'appli sont à revoir pour
Ultimate Football avant le premier envoi à Google.
