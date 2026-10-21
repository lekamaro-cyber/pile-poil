# Publier Ajusto sur Google Play : le guide pas à pas

Ce guide explique, dans l'ordre, tout ce qu'il faut faire pour que n'importe qui puisse installer Ajusto depuis le
Play Store (le magasin d'applis des téléphones Android). Il resservira pour les prochains jeux.

- **Toi** : ce que toi seul peux faire (créer les comptes, payer, prouver ton identité, trouver les testeurs).
- **Claude** : ce que je prépare pour toi (l'appli, les textes, les images, les réponses aux questionnaires).
- Les mots techniques sont expliqués la première fois qu'ils apparaissent, et regroupés dans le
  [lexique](#les-mots-compliqués) à la fin.

**Durée réaliste** : 4 à 6 semaines (surtout à cause des 14 jours de test et des vérifications de Google).
**Coût** : 25 $ une seule fois pour Google Play. Conseillé : un nom de domaine, environ 10 à 15 € par an.

## Vue d'ensemble

1. **Décider** : nom du studio, type de compte, identifiant de l'appli, âge du public. *(Toi, une soirée)*
2. **Créer les comptes** : compte Google du studio, compte développeur Google Play. *(Toi, quelques jours à
   4 semaines)*
3. **Fabriquer l'appli Android** à partir du jeu. *(Claude, avec une petite étape pour Toi)*
4. **Préparer la fiche du jeu** : textes, images, questionnaires. *(Claude prépare, Toi recopies dans la console)*
5. **Faire tester** le jeu. *(Toi et tes testeurs, au moins 14 jours)*
6. **Publier**, puis faire vivre le jeu.

---

## Étape 1 : les décisions (Toi)

### 1.1 Le nom du studio

Le **studio**, c'est le nom d'éditeur affiché sous le jeu dans le Play Store (comme « Ubisoft » sous un jeu
Ubisoft). Ce n'est pas le nom du jeu : tous tes futurs jeux seront publiés sous ce même nom.

Idées (recherche rapide déjà faite : aucun homonyme trouvé) :

| Nom | Points forts | Risques |
| --- | --- | --- |
| **Pilou Games** (conseillé) | Vient de « Pile Poil », mignon, se dit pareil dans toutes les langues | Aucun repéré |
| **Bulleo Studio** | Fait écho au « o » en bulle du logo d'Ajusto | Lie le studio aux bulles |
| **Petit Pois Games** | Drôle, charme français | Un peu proche du studio « Petite Games » |

Avant de valider : vérifie que le nom de domaine est libre (chez OVHcloud ou Gandi), que la marque est libre
(data.inpi.fr et TMview) et qu'aucun développeur ne porte ce nom sur le Play Store.

### 1.2 Compte « personnel » ou compte « organisation » : le choix le plus important

Google propose deux sortes de comptes développeur. Les deux permettent de publier et de gagner de l'argent.

**Option A : compte personnel** (au nom de la personne que tu es)
- Il faut : ta pièce d'identité.
- Affiché sur le Play Store : ton nom. En Europe, si tu gagnes de l'argent avec le jeu (publicité), ton adresse
  et ton téléphone peuvent aussi devenir publics (règle européenne sur les vendeurs en ligne).
- **Obligatoire** : un test fermé avec au moins 12 testeurs pendant 14 jours avant de pouvoir publier
  (voir l'étape 5).
- Rapide à ouvrir, aucune démarche administrative.

**Option B : compte organisation** (au nom d'une entreprise)
- Il faut : une entreprise. Le plus simple est une **micro-entreprise** : un statut d'entrepreneur individuel qui
  se crée gratuitement en ligne ; on déclare ce qu'on gagne et on paie des cotisations sur ce montant (à vérifier
  avec l'URSSAF ou un comptable).
- Il faut aussi un **numéro D-U-N-S** : un numéro d'identification international des entreprises, gratuit, demandé à
  la société Dun & Bradstreet ; l'obtenir peut prendre jusqu'à 30 jours.
- Affiché sur le Play Store : le nom et l'adresse de l'entreprise. Pour ne pas montrer l'adresse de chez toi, on
  peut louer une adresse professionnelle (domiciliation, payante).
- D'après plusieurs guides, le test fermé de 12 testeurs n'est pas exigé (à confirmer dans la console).

| | A : personnel | B : organisation |
| --- | --- | --- |
| Démarches | Aucune | Micro-entreprise + numéro D-U-N-S |
| Délai | Quelques jours | Jusqu'à environ 1 mois |
| Test de 12 testeurs pendant 14 jours | Obligatoire | Pas exigé (d'après plusieurs guides) |
| Ce qui est public | Ton nom (et peut-être ton adresse si tu gagnes de l'argent) | Les coordonnées de l'entreprise |

**Recommandation** : option B si tu veux gagner de l'argent et publier plusieurs jeux. Option A si tu veux
commencer vite et gratuitement, et que tu trouves 12 testeurs avec un téléphone Android.

### 1.3 L'identifiant de l'appli

C'est le nom technique unique de l'appli, écrit à l'envers comme une adresse web : par exemple
`com.pilougames.ajusto`. Les joueurs ne le voient presque jamais (il apparaît seulement dans l'adresse de la page
du jeu). **Il ne pourra jamais changer** : on le choisit une fois pour toutes, à partir du nom du studio.

### 1.4 L'âge du public

Google demande pour quels âges le jeu est fait.

- **Option A : 13 ans et plus.** Règles normales.
- **Option B : aussi les moins de 13 ans.** Les règles « Familles » de Google s'appliquent : règles spéciales pour
  les applis destinées aux enfants (aucune donnée personnelle collectée, publicités seulement de fournisseurs
  approuvés pour les enfants, etc.).

**Recommandation** : option A si tu prévois de la publicité plus tard. Attention, il faut rester honnête : Google
juge aussi d'après l'apparence du jeu et de sa fiche.

---

## Étape 2 : les comptes (Toi)

1. **Un compte Google dédié au studio** (une nouvelle adresse Gmail), différent de ton compte personnel.
   Protège-le avec la **double authentification** : en plus du mot de passe, une confirmation sur ton téléphone ou
   une clé de sécurité. Garde les codes de secours sur papier.
2. **Conseillé : un nom de domaine**, ton adresse web à toi (par exemple `pilougames.com`), environ 10 à 15 € par
   an. Il donne une adresse e-mail pro `contact@pilougames.com` (une simple redirection vers le Gmail du studio)
   et une adresse pour la politique de confidentialité.
3. **Si tu as choisi l'option B** : créer la micro-entreprise, puis demander le numéro D-U-N-S.
4. **Le compte développeur Google Play**, sur play.google.com/console, avec le compte Google du studio :
   1. Payer 25 $ (une seule fois).
   2. Prouver ton identité (photo de la pièce d'identité).
   3. Confirmer ton adresse e-mail et ton numéro de téléphone.
   4. **Vérifier un téléphone Android** : Google demande d'installer l'appli « Play Console » sur un vrai téléphone
      Android (Android 10 ou plus) pour prouver que tu en as un.

---

## Étape 3 : fabriquer l'appli Android (Claude, plus une étape pour Toi)

Aujourd'hui, Ajusto est un site web. Pour le Play Store, il doit devenir une appli Android.

1. **Claude** met le jeu dans une vraie appli avec **Capacitor** : un outil gratuit qui « emballe » un jeu web dans
   une appli Android. Le jeu est à l'intérieur de l'appli et marche sans internet.
2. **Claude** adapte le jeu à l'appli : partage, vibrations, bouton retour d'Android, écran en hauteur.
3. **Claude** prépare la fabrication automatique avec **GitHub Actions** : un service de GitHub qui fabrique l'appli
   sur ses propres ordinateurs. Tu n'as rien à installer chez toi. Le résultat est un fichier **`.aab`** : le format
   de fichier que Google Play demande pour recevoir une appli.
   - L'appli vise **Android 16**, la version minimale que Google exige pour les nouvelles applis depuis le
     31 août 2026.
4. **Toi** : créer la **clé de signature**.
   - C'est une signature numérique qui prouve que chaque version envoyée vient bien de toi (comme la clé privée
     d'un certificat de signature de code).
   - Je te donne une commande PowerShell à copier pour la créer sur ton PC.
   - Tu en fais **2 copies hors ligne** (clé USB rangée, par exemple) et tu gardes son mot de passe dans ton
     gestionnaire de mots de passe.
   - Tu la ranges dans les **secrets GitHub** : un coffre-fort de GitHub où l'on met des mots de passe que la
     fabrication automatique peut utiliser, sans que personne ne puisse les relire. Elle ne va jamais dans le dépôt.
   - Bonne nouvelle : Google garde sa propre clé pour signer l'appli finale (« signature d'application par Google
     Play »). Si tu perds ta clé, tu peux en demander une nouvelle à Google.

---

## Étape 4 : la fiche du jeu (Claude prépare, Toi recopies dans la console)

La **fiche**, c'est la page du jeu dans le Play Store : nom, descriptions, images. La **console** (Play Console),
c'est le site de Google où tu gères ton jeu.

1. **Les textes, en 7 langues** : le titre (30 caractères maximum), la description courte (80 caractères), la
   description longue (4 000 caractères).
2. **Les images** : l'icône (512 × 512 pixels), une bannière (1 024 × 500 pixels) et 4 à 8 captures d'écran du jeu.
3. **La politique de confidentialité** : une page web, obligatoire, qui explique quelles données l'appli collecte.
   Pour Ajusto : aucune, tout reste sur le téléphone.
4. **La rubrique « Contenu de l'appli »** : une série de questionnaires. Je te donnerai les réponses une par une.
   - **Classification du contenu** : un questionnaire (appelé IARC) qui donne l'âge conseillé du jeu en Europe
     (PEGI). Ajusto devrait obtenir PEGI 3, le plus bas.
   - **Public cible** : ton choix de l'étape 1.4.
   - **Sécurité des données** : quelles données l'appli collecte et partage. Pour Ajusto : aucune.
   - **Annonces** : l'appli contient-elle de la publicité ? Pour la première version : non.
   - **Accès à l'appli** : faut-il un compte pour jouer ? Non.

---

## Étape 5 : faire tester (Toi et tes testeurs)

Google propose trois façons de distribuer une appli :

- **Test interne** : toi et jusqu'à 100 personnes, disponible en quelques minutes. Sert à vérifier que l'appli
  s'installe et marche sur ton téléphone.
- **Test fermé** : une liste de testeurs choisis. **Obligatoire avec un compte personnel** : au moins 12 testeurs
  inscrits sans interruption pendant 14 jours.
- **Production** : la vraie sortie, pour tout le monde.

### Comment un testeur rejoint le test

1. Tu mets son adresse Gmail dans la liste des testeurs (dans la console).
2. Tu lui envoies le **lien d'inscription**.
3. Sur son téléphone Android, connecté avec ce même compte Google, il ouvre le lien et touche « Devenir testeur ».
4. Il installe Ajusto depuis le Play Store (le jeu n'apparaît pas dans la recherche, seulement par le lien).
5. Il garde l'appli et joue un peu chaque jour pendant 14 jours. Google regarde si les testeurs jouent vraiment.

### Où trouver des testeurs

| Idée | Points forts | Risques |
| --- | --- | --- |
| **Famille et amis avec un Android** (conseillé) | Fiables, vrais retours | Les iPhone ne comptent pas |
| **Collègues** | Repèrent bien les bugs | Rester sur la base du volontariat |
| **Club, association, voisins, groupe local** | Beaucoup de monde | Moins impliqués |
| **Échange entre développeurs** (Reddit) | Rapide | Ils jouent peu et désinstallent ; Google peut refuser |
| **Services payants de testeurs** | (aucun) | À éviter : Google repère les faux testeurs |

**Recommandation** : vise 15 à 20 personnes (pour garder une marge) et crée un **groupe WhatsApp « Testeurs
Ajusto »** où chacun partage son résultat du défi du jour. Tout le monde joue chaque jour, et tu récoltes les remarques
au même endroit.

### Pendant et après les 14 jours

1. Note les remarques des testeurs. Claude corrige, et tu envoies au moins une petite mise à jour pendant le test :
   Google regarde si le jeu s'améliore.
2. Après 14 jours, tu demandes l'**accès à la production** : un questionnaire sur le test (qui a testé, combien de
   personnes, quels retours, quelles corrections). Les réponses doivent être précises ; Claude t'aide à les écrire.

---

## Étape 6 : publier et faire vivre le jeu

1. Envoyer la version en **production** et choisir les pays où le jeu sera disponible (conseil : tous).
2. Google examine le jeu : quelques jours, parfois plus.
3. Le jeu est en ligne. Ensuite, chaque mise à jour = une nouvelle version, fabriquée et envoyée de la même façon.
4. Suivre les avis des joueurs et le rapport des plantages dans la console.
5. Plus tard, si tu veux gagner de l'argent : ajouter les publicités **AdMob** (le service de publicité de Google
   pour les applis), dans une mise à jour à part. Il faudra alors demander le consentement des joueurs européens
   (règle RGPD) et mettre à jour les déclarations « Annonces » et « Sécurité des données ».

---

## Les mots compliqués

| Mot | Ce que ça veut dire |
| --- | --- |
| **.aab** (Android App Bundle) | Le fichier de l'appli que l'on envoie à Google Play. |
| **AdMob** | Le service de publicité de Google pour les applis. |
| **Android 16 (API 36)** | Une version d'Android. Google exige que les nouvelles applis soient faites pour une version récente. |
| **Capacitor** | Outil gratuit qui transforme un jeu web en appli Android. |
| **Clé de signature** | Signature numérique qui prouve que les versions envoyées viennent de toi. |
| **Console (Play Console)** | Le site de Google où l'on gère ses applis : envois, fiche, tests, statistiques. |
| **Compte organisation / personnel** | Compte développeur au nom d'une entreprise ou d'une personne (étape 1.2). |
| **D-U-N-S** | Numéro international qui identifie une entreprise, demandé pour un compte organisation. |
| **Domiciliation** | Adresse professionnelle louée, pour ne pas afficher l'adresse de chez soi. |
| **Double authentification** | Une confirmation en plus du mot de passe (code, téléphone ou clé de sécurité). |
| **Fiche** | La page du jeu dans le Play Store. |
| **GitHub Actions** | Service de GitHub qui fabrique l'appli automatiquement, sans rien installer chez soi. |
| **IARC / PEGI** | Questionnaire de classification par âge / l'âge conseillé qui en sort (PEGI 3, 7, 12…). |
| **Identifiant de l'appli** | Nom technique unique et définitif, par exemple `com.pilougames.ajusto`. |
| **Micro-entreprise** | Statut simple d'entrepreneur individuel, création gratuite en ligne. |
| **Nom de domaine** | Ton adresse web à toi, par exemple `pilougames.com`. |
| **Politique de confidentialité** | Page web qui explique quelles données l'appli collecte. |
| **Production** | La vraie sortie du jeu, pour tout le monde. |
| **RGPD** | Règlement européen sur les données personnelles (consentement pour les publicités personnalisées). |
| **Secrets GitHub** | Coffre-fort de GitHub pour les mots de passe utilisés par la fabrication automatique. |
| **Sécurité des données** | Formulaire où l'on déclare à Google les données que l'appli collecte. |
| **Studio** | Le nom d'éditeur affiché sous tous tes jeux. |
| **Test interne / fermé** | Distribution à toi seul et quelques proches / à une liste de testeurs choisis. |

## Récapitulatif : qui fait quoi

| Étape | Toi | Claude |
| --- | --- | --- |
| 1. Décider | Nom du studio, type de compte, âge du public | Idées et conseils |
| 2. Comptes | Compte Google, domaine, compte développeur (25 $) | Explications pas à pas |
| 3. Appli Android | Créer et ranger la clé de signature | Projet Android, adaptations, fabrication automatique |
| 4. Fiche | Recopier dans la console, valider | Textes en 7 langues, images, confidentialité, réponses |
| 5. Tests | Recruter 15 à 20 testeurs, récolter les retours | Corrections, réponses au questionnaire |
| 6. Sortie | Envoyer en production | Mises à jour, puis publicité plus tard |
