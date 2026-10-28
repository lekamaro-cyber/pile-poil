# CodeQuest

**Apprends à coder. Construis pour de vrai.**

CodeQuest est une application d'apprentissage de la programmation, sur le principe de Duolingo ou Mimo
mais avec sa propre identité : leçons courtes, exercices interactifs, révisions espacées, projets guidés.
Elle tient dans une seule page web, sans compte, sans abonnement et sans clé d'API.

Ce dossier est indépendant du jeu Ajusto (qui reste à la racine du dépôt pour ne pas casser l'appli déjà installée).

## Ouvrir l'application

- **Sur ton ordinateur** : ouvre `codequest/index.html` dans Chrome, Edge ou Firefox (double-clic).
- **En ligne** : la version publiée comme artefact Claude (lien donné dans la conversation) sauvegarde ta progression
  sur ton compte claude.ai.

## Ce que contient l'application

| Section | Contenu |
|---|---|
| Accueil | Niveau, XP, série, leçons terminées, temps actif, taux de réussite, compétences maîtrisées, notions à réviser, défi du jour, prochain objectif, accès aux projets |
| Parcours | Chemin recommandé et bibliothèque : Python, HTML/CSS, JavaScript, Git, SQL, Back-end, Data/IA, autres langages |
| Réviser | Notions à échéance (J+1, 3, 7, 14, 30), erreurs à refaire, notions anciennes, session mixte |
| Pratique | Bac à sable (Python, JavaScript, HTML/CSS, SQL) et katas vérifiés par des tests |
| Projets | 13 projets guidés, du plus simple au plus avancé, étape par étape |
| Compétences | État de chaque notion : à découvrir, en cours, en révision, acquise, maîtrisée durablement |
| Profil | Badges, couleurs d'accent, objectifs, test de positionnement, export/import de la progression |

## Ce qui s'exécute vraiment

| Langage | Exécution |
|---|---|
| Python | **MiniPy** (`src/core/minipy.js`) : un interpréteur d'un sous-ensemble de Python 3 écrit pour CodeQuest. Bases, fonctions, classes, exceptions, fichiers virtuels, modules math, random, collections, json, csv… Pas de numpy, pandas ni réseau. |
| JavaScript | Dans un Web Worker isolé (pas d'accès à la page), arrêté au bout de 5 s. `fetch` parle à un faux serveur d'entraînement. |
| JavaScript + page | Dans une page « bac à sable » séparée de l'application. |
| HTML / CSS | Rendu réel dans un cadre sans script, puis vérifications sur la page affichée. |
| SQL | SQLite réel (sql.js), chargé à la demande depuis un CDN. |
| Autres (C, C++, Java, C#, PHP, TypeScript, Bash, Dart, Git) | Pas d'exécution : lecture, prédiction, trous, bugs. Les sorties annoncées ont été vérifiées avec les vrais outils lors de la création des leçons (sauf C# et Dart, relus à la main). |

Aucun résultat d'exécution n'est simulé.

## Sauvegarde

- Dans l'artefact Claude : progression enregistrée sur ton compte (capacité « db »), et aussi dans le navigateur.
- En local : dans le navigateur (`localStorage`).
- Toujours possible : **Profil → Exporter (JSON)**, puis **Importer** sur un autre appareil.

## Pour modifier CodeQuest

Le code est découpé en fichiers dans `src/`, puis assemblé en une seule page :

```
src/core/      moteurs : registre du contenu, MiniPy, exécution JS/HTML/SQL, coloration
src/content/   leçons, test de positionnement, katas, énigmes, projets (un fichier par chapitre)
src/app/       interface : état et sauvegarde, exercices, lecteur de leçon, écrans
src/app.css    styles
```

1. Modifier les fichiers de `src/`.
2. Vérifier le contenu : `node codequest/tools/validate.mjs` (exécute réellement chaque exemple et chaque exercice ;
   la première fois : `cd codequest/tools && npm install`).
3. Assembler : `node codequest/build.mjs` → `codequest/index.html`.

Le guide d'écriture des leçons est dans `CONTENT-GUIDE.md`.
