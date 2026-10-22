# Ajusto : prototype de jeu mobile

Prototype jouable dans un navigateur. Tout le jeu tient dans un seul fichier : `index.html` (HTML + CSS + JavaScript).
Aucune publicité, aucun achat avec de l'argent réel : la Boutique s'utilise seulement avec les pièces gagnées en
jouant. Les autres fichiers servent seulement à l'installer comme une appli sur le téléphone :
`manifest.webmanifest` (nom, icône), `sw.js` (hors ligne et mises à jour) et les icônes `*.png`.

**Jouer et installer : https://lekamaro-cyber.github.io/pile-poil/**

> Ce n'est **pas** une application Android ou iPhone prête à publier. C'est une page web qui sert à tester
> l'idée du jeu sur un écran tactile (voir « Ce que ce prototype n'est pas » plus bas).

## Le nom : Ajusto

Le jeu s'est appelé « Pile Poil » (expression française intraduisible), puis « Justo » (versions 1.3 à 1.8). « Justo »
étant déjà utilisé par d'autres applis (commande de repas, supermarché en ligne au Mexique, assurance au Brésil), le
jeu s'appelle **Ajusto** depuis la version 1.9 :

- se comprend presque partout : ajuster (français), adjust (anglais), ajustar (espagnol, portugais) ;
- garde « justo » (juste, pile) à l'intérieur ;
- court, facile à prononcer dans les 7 langues du jeu ;
- le « o » final est la bulle du logo, et l'icône montre un « A » dans la bulle.

En français, le tir parfait s'appelle toujours « PILE POIL ! ». L'adresse du site (`/pile-poil/`) et les données
enregistrées sur le téléphone gardent l'ancien nom : changer l'adresse casserait l'appli déjà installée et ferait
perdre les sauvegardes.

Vérification faite (rapide, non juridique) : aucune appli ni aucun jeu « Ajusto » trouvé. Avant une vraie sortie,
vérifier les marques déposées (INPI, EUIPO/TMview, classes 9 et 41), Google Play, l'App Store et le nom de domaine.

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
| Son, volume | Son activé ou coupé, curseur de volume. |
| Vibrations | Activées ou coupées, et bouton « Tester la vibration ». |
| Difficulté du mode classique | **Facile** (murs plus lents et plus espacés, anneau plus large), **Normal**, **Difficile**. Chaque difficulté a son propre record. Le défi du jour reste toujours en Normal. |
| Aide autour de la bulle | Anneau de couleur et flèches quand un mur approche. |
| Ralenti, tremblement | Effets sur les passages limites et sur les échecs. |
| Plein écran | Seulement si le navigateur le permet. |
| Statistiques | Durée de la session en cours, session moyenne, plus longue session, nombre de parties, temps total (voir plus bas). |
| Effacer mes données | Remet à zéro records, série, défi du jour, pièces, achats, missions et statistiques (avec confirmation). Les réglages restent. |

Sur Android, le bouton retour du téléphone ferme les Paramètres (et la Boutique) sans quitter l'appli.

### Progression et difficulté

Tous les 10 murs réussis, tu passes au niveau suivant (la couleur du fond change). **Départ rapide** : après tes
3 premières parties, le niveau 1 ne dure plus que 5 murs, le premier mur arrive plus tôt et la consigne « Maintiens
appuyé » n'est plus affichée ; les règles disparaissent aussi du menu pour laisser la place aux missions.

| Niveau | Ce qui change |
| --- | --- |
| 1 | Murs lents, anneau vert large. Les deux premiers trous servent de tutoriel (un gros, puis un petit). |
| 2 | Des étoiles bonus apparaissent sur les côtés : grossis pour les toucher. |
| 3 et + | Les murs vont plus vite et arrivent plus souvent. |
| 4 et + | L'anneau vert devient plus fin (il faut être plus précis). |
| 5 et + | Certains trous « respirent » : leur taille change en continu. |
| 3 et + | **Couloirs** : 2 ou 3 murs très rapprochés, à enchaîner en rythme. Couloir passé en entier : points en plus. |
| 6 et + | **Trous qui se referment** : le trou arrive grand et se resserre jusqu'à l'anneau vert. Il faut viser la taille finale (l'anneau vert ne bouge pas). |
| 8 et + | **Pics** : deux rangées de pointes entre deux murs. La bulle doit rester assez petite pendant tout le passage, sinon elle éclate. |
| 10 et + | **Tout se mélange** : plus de couloirs, de trous qui se referment et de pics. |

Les obstacles des niveaux 3, 6, 8 et 10 (couloirs, trous qui se referment, pics) n'existent qu'en mode Classique et
en Chrono. Ils ont été testés avec un robot qui joue parfaitement : tous sont faisables.

**Murs dorés** (modes Classique et Chrono, à partir du 4e mur, environ 1 mur sur 12) : un reflet passe dessus. Le
traverser **double les points** et rapporte **5 pièces** de plus.

**Niveau de départ** (mode Classique) : une fois le niveau 5, 10 ou 15 atteint dans une difficulté, le menu propose
« Départ : Niv. 1 / Niv. 5 / Niv. 10… » pour ne plus refaire le début à chaque partie.

Tes records (un par mode et par difficulté) et ton meilleur niveau sont gardés sur l'appareil.

### Mode Chrono

Après tes 3 premières parties, le menu propose **Classique** ou **Chrono**. En Chrono : 60 secondes, pas de vies, on
commence au niveau 3 et le niveau monte tous les 8 murs. Une erreur coûte **5 secondes** (« −5 » sous le temps), un
PILE POIL en rapporte **1** (« +1 »). Le temps restant s'affiche en haut à droite, en rouge sous 10 secondes. Le
Chrono a ses propres records.

### Bonus

Trois bonus, utilisables en Classique et en Chrono (pas dans le défi du jour), avec les **boutons ronds en bas de
l'écran** pendant la partie (sur PC : touches **1**, **2**, **3**) :

| Bonus | Effet | Prix |
| --- | --- | --- |
| Bouclier | Pardonne la prochaine erreur (anneau bleu autour de la bulle). | 60 pièces |
| Ralenti | Murs plus lents pendant 8 secondes. | 40 pièces |
| Aimant | Attire les étoiles et les bulles bonus vers ta bulle pendant 12 secondes. | 40 pièces |

On les achète dans la Boutique (onglet **Bonus**), ou on les trouve en partie : à partir du niveau 2, des **bulles
bonus** (une icône dans une bulle) apparaissent parfois sur les côtés ; grossis pour les toucher. Le chiffre sur
chaque bouton indique le stock. En passant à la version 1.7, chaque joueur reçoit 1 bonus de chaque en cadeau.

### Pièces, missions et Boutique

- **Pièces** : 1 par mur passé, 2 par PILE POIL, 2 par étoile, 5 de plus sur un mur doré, plus la récompense des
  missions. Leur nombre est affiché en haut à droite du menu (toucher la pastille ouvre la Boutique). L'écran de fin
  affiche les pièces gagnées dans la partie. Pièces gagnées aussi pendant le défi du jour.
- **Missions** : 3 à la fois, affichées dans le menu et à la fin de chaque partie, avec une barre de progression.
  Exemples : « Passe 25 murs », « Fais 3 PILE POIL dans une partie », « Attrape 1 étoile dans une partie »,
  « Joue le défi du jour ». Après 3 parties s'ajoutent : « Réussis 1 couloir en entier », « Utilise 2 bonus »,
  « Joue 1 partie en Chrono ». Une mission réussie pendant la partie s'annonce tout de suite (+20 pièces…). Elle est
  remplacée par une nouvelle au retour au menu ou à la partie suivante. Toutes les 3 missions réussies, les objectifs
  et les récompenses montent (de 20 à 60 pièces ; 40 pour le défi du jour).
- **Boutique** (bouton du menu, de l'écran de fin, ou pastille de pièces) : quatre onglets. Les objets sont classés
  du plus courant au plus rare (voir « Raretés » ci-dessous).
  - **Bulles** : Menthe 100, Corail 200, Sakura 250, Lavande 300, Glace 350, Feu 450, Or 500, Galaxie 600,
    Arc-en-ciel 800. Aurore, Nuit et Perle ne s'achètent pas : elles se gagnent avec la série du défi du jour.
    Trou noir et Magma : 50 000 (légendaires). Dragon : Mythique (exploit ou coffre).
  - **Thèmes** du terrain : Classique (gratuit), Océan 300, Forêt 400, Crépuscule 500, Bonbon 600, Néon 900,
    Plage 1 200, Banquise 1 400, Jardin japonais 1 600, Jungle 1 800, Synthwave 3 000, Abysses 3 500, Volcan 4 000,
    Arcade 8-bit 4 500, Aurore boréale et Cosmos 50 000 (légendaires), Royaume céleste (Mythique : exploit ou coffre).
  - **Bonus** : Bouclier, Ralenti, Aimant (voir plus haut). Chaque achat ajoute 1 bonus au stock. Pouvoirs Phénix et
    Toucher de Midas : 50 000 (légendaires).
  - **Coffres** : coffres surprise (voir plus bas).
  - Achat en **deux appuis** (« Confirmer ? » au 1er appui) pour éviter les erreurs. Un article déjà acheté se choisit
    d'un appui. Les articles trop chers sont grisés ; un appui dit combien de pièces il manque.
- **Écran de fin** : bouton **Rejouer** en grand, pièces gagnées, missions, « Il te manquait X pts pour battre ton
  record » quand tu n'étais pas loin, et « Tu peux maintenant t'offrir… » quand une partie te permet un nouvel achat.
- Passage à la version 1.6 : les couleurs déjà débloquées par niveau (Menthe, Corail, Lavande, Or) restent acquises.

### Raretés

Chaque bulle et chaque thème a une **rareté**, écrite sous son nom dans la Boutique. Plus un objet est rare, plus il
est animé :

| Rareté | Cadre dans la Boutique | Bulles | Thèmes |
| --- | --- | --- | --- |
| Commun | aucun, étiquette grise | Savon, Menthe, Corail, Lavande : couleurs | Classique, Océan, Forêt, Crépuscule, Bonbon : couleurs |
| Rare | bleu | Sakura, Glace, Feu : particules autour de la bulle | Néon (anneaux lumineux), Plage (reflets de soleil), Banquise (neige), Jardin japonais (pétales), Jungle (feuilles de jour, lucioles de nuit) |
| Épique | violet lumineux | Or (reflet qui traverse la bulle), Galaxie (bras d'étoiles qui tournent), Arc-en-ciel, Aurore et Perle (film de savon irisé), Nuit (étoiles et croissant de lune) ; toutes avec particules | Synthwave (soleil à rayures, grille fluo qui défile), Abysses (méduses lumineuses), Volcan (lave et braises), Arcade 8-bit (étoiles en pixels, petits extraterrestres) ; toujours de nuit |
| Légendaire | arc-en-ciel qui tourne | Trou noir, Magma | Aurore boréale, Cosmos |
| Mythique | rouge et or qui tourne et brille | Dragon : écailles et œil de dragon qui fixe le prochain mur et cligne | Royaume céleste : îles volantes, cascades, nuages, temple doré, de jour comme de nuit |

**Objets Mythiques** : jamais en vente. On les gagne par un **exploit**, ou (très rarement) dans un coffre :

- **Dragon** : faire **20 PILE POIL d'affilée** dans une partie (n'importe quel mode). La Boutique affiche ton record.
- **Royaume céleste** : gagner **7 médailles d'or** (ou mieux) au défi du jour, depuis le début. Les médailles d'or
  déjà gagnées avant la version 1.12 (40 derniers jours) comptent.

### Coffres surprise

Un coffre donne **une bulle ou un thème que tu n'as pas encore** (jamais les bulles de la série du défi du jour, jamais
les pouvoirs). Onglet **Coffres** de la Boutique ; une pastille rouge sur le bouton Boutique indique les coffres à
ouvrir.

- **Gagner des coffres** : 1 par jour en jouant l'essai officiel du défi du jour ; 1 toutes les 5 missions réussies ;
  1 en battant ton record (1 par jour, pas à la toute première partie). On peut aussi en **acheter** : 1 000 pièces.
- **Chances**, affichées dans l'onglet avant tout achat : Commun 60 %, Rare 28 %, Épique 10 %, Légendaire 1,8 %,
  Mythique 0,2 %. La rareté est tirée d'abord, puis un objet pas encore obtenu de cette rareté.
- **Jamais de doublon** : si tu as déjà tout dans la rareté tirée, tu reçois des pièces à la place (Commun 150,
  Rare 400, Épique 900, Légendaire 5 000, Mythique 10 000).
- L'objet est enregistré dès l'appui sur « Ouvrir » (même si l'appli se ferme pendant l'animation). Un appui sur le
  coffre qui tremble l'ouvre tout de suite. « L'utiliser » équipe l'objet gagné.
- Les tirages utilisent le hasard normal du téléphone, jamais la graine du défi du jour : le parcours du jour ne change
  pas.

### Objets légendaires (50 000 pièces)

Six objets très chers, pour les joueurs les plus fidèles. Dans la Boutique, ils ont un **cadre arc-en-ciel qui
tourne** et l'étiquette **LÉGENDAIRE**. Les bulles et thèmes légendaires peuvent aussi sortir d'un coffre (1,8 %).

| Objet | Onglet | Ce qu'il fait |
| --- | --- | --- |
| Trou noir | Bulles | Bulle noire avec un anneau de feu qui tourne autour ; les particules sont aspirées vers le centre. |
| Magma | Bulles | Boule de lave avec des fissures lumineuses qui pulsent ; des braises s'envolent. |
| Aurore boréale | Thèmes | Ciel de nuit étoilé avec des rideaux de lumière verts, bleus et violets qui ondulent. |
| Cosmos | Thèmes | Espace profond : nébuleuses, étoiles qui scintillent, étoiles filantes de temps en temps. |
| Phénix | Bonus | Pouvoir permanent : une fois par partie, quand tu perds ta dernière vie, tu renais avec 1 vie (en Chrono : +10 secondes quand le temps est écoulé). |
| Toucher de Midas | Bonus | Pouvoir permanent : chaque PILE POIL rapporte le double de points et de pièces. |

- Les thèmes légendaires et épiques sont **toujours de nuit** : l'appli passe en sombre tant qu'ils sont choisis.
- Les **pouvoirs** s'achètent une seule fois. Ensuite, un appui dans la Boutique les **active** ou les
  **désactive** (pour jouer « à l'ancienne »). Ils ne marchent **pas dans le défi du jour**, pour que la
  comparaison reste juste entre tous les joueurs.

### Statistiques de session

Dans **Paramètres → Statistiques** : durée de la session en cours, parties dans cette session, durée moyenne d'une
session, plus longue session, nombre de sessions et de parties, temps total passé dans le jeu. Une session commence à
la première partie après l'ouverture de l'appli ; si tu quittes l'appli plus de 5 minutes, la suivante est une
nouvelle session. Le temps compte seulement quand le jeu est à l'écran. Ces chiffres servent à vérifier si les
parties s'enchaînent (objectif : des sessions de 5 à 10 minutes).

### Défi du jour

- **Le même parcours pour tout le monde**, chaque jour : 30 murs, un niveau tous les 6 murs. Le parcours est calculé à
  partir de la date du téléphone (une « graine » de hasard), donc **aucun serveur n'est nécessaire** et ça marche hors
  ligne. Deux personnes qui jouent le même jour ont exactement les mêmes trous, dans le même ordre.
- **Une règle du jour** différente chaque jour, avec ses propres couleurs. Les 8 règles reviennent dans un ordre
  mélangé tous les 8 jours, jamais deux jours de suite la même :

  | Règle | Ce qui change |
  | --- | --- |
  | 🌬️ Tout respire | Presque tous les trous respirent (anneau vert un peu plus large). |
  | 🚪 Couloirs | Beaucoup de couloirs de murs rapprochés. |
  | 🌵 Pics | Des zones de pics où la bulle doit rester petite. |
  | ⭕ Fermeture | Beaucoup de trous qui se referment en approchant. |
  | 🌫️ Brouillard | Le haut de l'écran est caché : les murs apparaissent au dernier moment (écarts de taille plus doux). |
  | ⭐ Pluie d'étoiles | Une étoile entre chaque mur, et elles valent double. |
  | ⚡ Turbo | Murs très rapides, mais anneau vert plus large. |
  | 🎯 Précision | Anneau vert très fin, mais murs plus lents. |

- **Médailles** : 🥉 bronze à 10 murs passés, 🥈 argent à 20, 🥇 or si le défi est terminé (30 murs avec au moins une
  vie), 👑 parfait si les 30 murs sont passés sans erreur. L'essai officiel rapporte des pièces : 15, 30, 60 ou 100.
- **Ta semaine** : dans le menu, la médaille de chacun des 7 derniers défis (✓ si joué sans médaille).
- **Un seul essai officiel par jour**, comme Wordle. Les essais suivants sont de l'entraînement : même parcours, mais
  ils ne changent pas le résultat officiel. Quitter l'essai officiel en cours le termine (il est enregistré après
  chaque mur, même si l'appli est fermée).
- **Résultat à partager** : la règle du jour, une grille de 30 pastilles (🟢 PILE POIL, 🟡 Bien, 🔴 Raté, ⚪ mur non
  atteint), le score, la médaille et la série. Le bouton « Partager » ouvre le menu de partage du téléphone (WhatsApp, SMS…). S'il n'existe
  pas (sur PC par exemple), une fenêtre propose « Copier le texte » et « Ouvrir WhatsApp ».

  ```
  Ajusto · Défi n°3 (22/10)
  ⚡ Turbo
  🟢🟢🟡🟢🔴🟢🟢🟢🟡🟢
  🟢🟢🟢🔴🟢🟡🟢🟢🟢🟢
  🟢🔴⚪⚪⚪⚪⚪⚪⚪⚪
  1 240 pts · 21/30 murs · 🥈 · série 4 🔥
  ```

- **Série de jours** : chaque jour où tu joues ton essai officiel prolonge la série. Si tu sautes un jour, elle repart
  à 1. Récompenses : bulle **Aurore** à 3 jours, **Nuit** à 7 jours, **Perle** à 14 jours. Elles restent acquises même
  si la série casse ensuite.
- Pas de mur doré ni de bonus dans le défi du jour : tout le monde a exactement le même parcours et les mêmes points
  possibles. Les obstacles de la règle du jour sont tirés avec la graine du jour, donc identiques pour tous.

## Installer sur le téléphone (comme une appli)

1. Ouvre **https://lekamaro-cyber.github.io/pile-poil/** sur le téléphone.
2. Ajoute-le à l'écran d'accueil :
   - **Android (Chrome)** : menu **⋮** en haut à droite → **Installer l'application** (ou **Ajouter à l'écran
     d'accueil**) → **Installer**.
   - **iPhone (Safari)** : bouton **Partager** (carré avec une flèche) → **Sur l'écran d'accueil** → **Ajouter**.
3. Lance Ajusto depuis son icône : il s'ouvre en plein écran, sans barre d'adresse.

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
| 1.11 | Objets légendaires à 50 000 pièces : bulles Trou noir et Magma, thèmes Aurore boréale et Cosmos, pouvoirs Phénix et Midas | [ZIP 1.11](https://github.com/lekamaro-cyber/pile-poil/archive/b4f0fc53e85f0e9473aec14cbba021f710789762.zip) |
| 1.10 | Menu secret « mode développeur » (pièces infinies, tout débloquer) | [ZIP 1.10](https://github.com/lekamaro-cyber/pile-poil/archive/eeb20bd98f6c875392d49fa8a26acf3e26a838b4.zip) |
| 1.9 | Nouveau nom : Ajusto (Justo était déjà pris), icône avec un « A » | [ZIP 1.9](https://github.com/lekamaro-cyber/pile-poil/archive/051675075bb317824be8caa5968a1270c6a786f2.zip) |
| 1.8 | Défi du jour : une règle différente chaque jour, médailles, « Ta semaine » | [ZIP 1.8](https://github.com/lekamaro-cyber/pile-poil/archive/077a3e6a3b28b30d6de7061f8ef276ae2ab52a4e.zip) |
| 1.7 | Couloirs, trous qui se referment, pics, niveau de départ, bonus, mode Chrono | [ZIP 1.7](https://github.com/lekamaro-cyber/pile-poil/archive/687ab0d7f9e2cc4201ef321aba38b78a34971378.zip) |
| 1.6 | Pièces, missions, Boutique (bulles et thèmes), murs dorés, départ rapide, statistiques | [ZIP 1.6](https://github.com/lekamaro-cyber/pile-poil/archive/e22d0c63cd144b3fbbea08f57e03620e8c7a15ad.zip) |
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
**1**, **2**, **3** = Bouclier, Ralenti, Aimant.

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
19. **Pièces** : après une partie, l'écran de fin affiche « Pièces gagnées » et le total du menu augmente.
20. **Missions** : réussis-en une pendant une partie, le message « Mission accomplie » s'affiche en bas. Au retour au
    menu, une nouvelle mission la remplace.
21. **Boutique** : touche un article trop cher (message « Il te manque… »), puis un article abordable deux fois
    (« Confirmer ? » puis achat). Lance une partie : la nouvelle bulle (ou le nouveau thème) est utilisée.
22. **Mur doré** : en mode classique, passe un mur doré, « Mur doré ! » s'affiche avec les points doublés.
23. **Statistiques** : Paramètres → Statistiques, la durée de la session avance pendant que tu joues.
24. **Nouveaux obstacles** : au niveau 3, un couloir de murs rapprochés ; au niveau 6, un trou qui se referme sur
    l'anneau vert ; au niveau 8, des pics où il faut rester petit. Une bannière annonce chaque nouveauté.
25. **Niveau de départ** : atteins le niveau 5, reviens au menu, choisis « Niv. 5 » et lance une partie.
26. **Bonus** : touche le bouton Bouclier en bas, rate un mur exprès : aucune vie perdue. Ralenti : les murs
    ralentissent 8 s. Aimant : les étoiles viennent vers la bulle.
27. **Chrono** : choisis « Chrono » dans le menu, le temps part de 1:00 ; une erreur affiche « −5 » sous le temps.
28. **Défi du jour** : la règle du jour est affichée dans le menu (icône, nom, explication) et au début de la partie.
    Joue l'essai officiel : l'écran de fin affiche la médaille, et la bande « Ta semaine » du menu se remplit.
29. **Même parcours pour tous** : deux téléphones le même jour ont la même règle et les mêmes trous.
30. **Objets légendaires** : avec les pièces infinies du mode développeur (ci-dessous), achète Trou noir, Cosmos,
    Phénix et Midas. Joue : la bulle a son anneau de feu, le fond est l'espace. Perds tes 3 vies : « Phénix ! », tu
    repars avec 1 vie (une seule fois). Un PILE POIL affiche le double de points. Dans la Boutique, touche Phénix :
    « Désactivé » ; la partie suivante se termine normalement.
31. **Raretés et nouveaux thèmes** : dans la Boutique, chaque objet a son étiquette (Commun, Rare, Épique, Légendaire,
    Mythique) et son cadre. Choisis Plage, Banquise, Jardin japonais ou Jungle (particules), puis Synthwave,
    Abysses, Volcan ou Arcade 8-bit (décor animé) : le fond change derrière les murs.
32. **Coffres** : mode développeur → « +5 coffres ». Onglet Coffres : « Ouvrir un coffre », le coffre tremble puis
    révèle l'objet avec sa rareté ; « Ouvrir le suivant (4) ». Les chances sont affichées en bas de l'onglet.
33. **Exploit Dragon** : enchaîne 20 PILE POIL sans en rater un ; « Objet Mythique débloqué : Dragon ! » s'affiche.

**Mode développeur (menu secret)** : dans les Paramètres, touche **7 fois rapidement le numéro de version** (tout en
bas). Un groupe « Mode développeur » apparaît : **pièces infinies** (le compte remonte à 999 999 après chaque achat),
**ajouter 1 000 pièces**, **+5 de chaque bonus**, **+5 coffres**, **tout débloquer** (toutes les bulles, même celles
de la série, tous les thèmes, les pouvoirs légendaires, les objets Mythiques, les départs aux niveaux 5, 10 et 15) et
**quitter le mode développeur**. Ces outils ne changent rien
pour les autres joueurs : tout reste sur ton téléphone.

Quelques commandes utiles dans la console du navigateur (F12, onglet *Console*) :

- `Ajusto.CONFIG.lives = 99` puis lance une partie : pour tester sans fin.
- `localStorage.removeItem('pilepoil.daily')` puis recharge : pour rejouer l'essai officiel du jour.
- `Ajusto.save.items.shield = 5` : 5 boucliers pour tester (même chose avec `slow` et `magnet`).
- `Ajusto.save.coins = 2000` puis ouvre la Boutique : pour tester les achats (les pièces sont enregistrées au
  prochain achat ou à la prochaine partie).
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
- `coins` : pièces gagnées par mur, PILE POIL, étoile et mur doré. `golden.chance: 0.08` : probabilité d'un mur doré.
- `fastStart: { afterGames: 3, gates: 5 }` : départ rapide après 3 parties, niveau 1 en 5 murs.
- `missions` : nombre de missions à la fois, récompenses par palier.
- `corridor`, `closing`, `spikes` : niveau d'apparition et fréquence des couloirs, trous qui se referment et pics.
- `checkpoints: [5, 10, 15]` : niveaux de départ possibles.
- `chrono` : durée (60 s), niveau de départ, temps perdu par erreur et gagné par PILE POIL.
- `bonus` : durées du ralenti et de l'aimant, fréquence des bulles bonus. `BONUSES` : prix des bonus.
- `phoenixTime: 10` : secondes rendues par le Phénix en Chrono. `POWERS` : prix des pouvoirs légendaires.
- `chest` : prix d'un coffre (1 000), chances par rareté (`odds`, en %, total 100), pièces données à la place d'un
  doublon (`dupCoins`), missions pour gagner un coffre (5). `mythic` : exploits des objets Mythiques (20 PILE POIL
  d'affilée, 7 médailles d'or). `RARITIES` : ordre des raretés ; chaque objet a sa `rarity` dans `SKINS` et `TERRAINS`.
- Juste en dessous de `CONFIG` : `SKINS` (bulles et leurs prix), `TERRAINS` (thèmes et leurs couleurs), `MISSIONS`
  (types de missions et objectifs par palier).

Le reste du code est découpé en sections numérotées (1. Réglages, 2. Outils, 3. Son… 12. Démarrage).

## Publier sur Google Play

La marche à suivre complète, étape par étape, est dans [PUBLIER-SUR-GOOGLE-PLAY.md](PUBLIER-SUR-GOOGLE-PLAY.md).

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
