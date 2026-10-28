// Parcours HTML et CSS, chapitre 4 : Qualité et projet (web.u13 et web.u14).
CQ.addChapter('web', {
  id: 'web.c4',
  title: 'Qualité et projet',
  units: [
    // ---------------------------------------------------------------- web.u13
    {
      id: 'web.u13',
      title: 'Accessibilité',
      summary: "Des pages utilisables par tous : contrastes, textes alternatifs, labels, clavier et ARIA.",
      lessons: [
        {
          id: 'web.u13.l1',
          title: 'Une page utilisable par tous',
          minutes: 8,
          objective: "Tu sais repérer et corriger les principaux défauts d'accessibilité : contraste, textes alternatifs, labels, navigation au clavier et ARIA.",
          explain:
            "Une page accessible fonctionne pour tout le monde : au lecteur d'écran, au clavier seul, avec une vue faible. L'essentiel :\n\n" +
            "- **Contraste** : au moins 4,5:1 entre le texte et son fond (3:1 pour un grand texte). L'inspecteur du navigateur affiche ce rapport quand tu sélectionnes un texte.\n" +
            "- **Textes alternatifs et labels** : chaque image informative a un `alt`, chaque champ un `<label>` relié.\n" +
            "- **Clavier** : tout doit marcher avec Tab, Entrée et Espace. Utilise les éléments natifs : `<button>` pour une action, `<a href>` pour aller ailleurs. Une `<div>` cliquable n'est ni atteignable au clavier ni annoncée comme un bouton ; un `<a>` sans `href` et un bouton `disabled` ne reçoivent pas le focus. Ne supprime jamais l'indicateur de focus sans le remplacer : stylise `:focus-visible`.\n" +
            "- **ARIA, avec parcimonie** : première règle, ne pas s'en servir si un élément HTML fait déjà le travail. Cas utiles : `aria-label` pour nommer un bouton qui ne contient qu'une icône, `aria-hidden=\"true\"` pour cacher une icône décorative aux lecteurs d'écran.",
          example: {
            code: `<style>
  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
  .texte { color: #374151; background: #ffffff; } /* contraste d'environ 10:1 */
</style>
<button type="button" aria-label="Fermer la fenêtre">
  <svg aria-hidden="true" width="16" height="16"><path d="M2 2L14 14M14 2L2 14" stroke="currentColor"/></svg>
</button>
<label for="recherche">Rechercher un projet</label>
<input type="search" id="recherche" name="q">
<img src="courbe.png" alt="Courbe d'apprentissage : la perte passe de 2,1 à 0,3 en 20 époques">`,
            notes: [
              { line: 2, text: "Un contour bien visible pour la navigation au clavier, sans gêner les clics à la souris." },
              { line: 5, text: "Le bouton ne contient qu'une icône : `aria-label` lui donne un nom lisible par un lecteur d'écran." },
              { line: 6, text: "L'icône est décorative : `aria-hidden` évite qu'elle soit lue." },
              { line: 8, text: "Un label visible et relié vaut mieux qu'un placeholder." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: "Pour ouvrir le menu, une appli utilise `<div class=\"bouton\" onclick=\"ouvrirMenu()\">Menu</div>` (`onclick` lance une fonction JavaScript au clic). Quel est le problème principal ?",
              choices: [
                "Au clavier, on ne peut ni l'atteindre avec Tab ni l'activer, et un lecteur d'écran ne l'annonce pas comme un bouton",
                "Le nom de classe « bouton » est réservé par le navigateur",
                "`onclick` est interdit dans une `div`",
                "Aucun : le clic à la souris fonctionne"
              ],
              answer: 0,
              why: {
                1: "Les noms de classes sont libres : « bouton » n'a aucun effet particulier.",
                2: "`onclick` est accepté sur n'importe quel élément ; le problème est ce qui manque, pas ce qui est présent.",
                3: "La souris n'est pas le seul moyen de naviguer : clavier, lecteur d'écran, commande vocale doivent aussi fonctionner."
              },
              hint: "Essaie mentalement d'utiliser ce menu sans souris.",
              explain: "Un `<button type=\"button\">` est atteignable avec Tab, activable avec Entrée et Espace, et annoncé « bouton » par les lecteurs d'écran, sans rien ajouter. Une `<div>` n'a rien de tout cela."
            },
            {
              type: 'bug',
              lang: 'css',
              prompt: "En naviguant avec la touche Tab, impossible de voir quel bouton est sélectionné. Clique sur la ligne fautive.",
              code: `.bouton {
  background: #1d4ed8;
  color: white;
}
.bouton:focus { outline: none; }`,
              bugLine: 5,
              why: "`outline: none` sur `:focus` supprime l'indicateur de focus sans le remplacer : une personne qui navigue au clavier ne sait plus où elle se trouve.",
              fixes: [
                '.bouton:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }',
                '.bouton:focus { outline: 0; }',
                '.bouton:hover { outline: none; }',
                '.bouton:focus { outline-color: transparent; }'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`outline: 0` revient au même que `outline: none` : le focus reste invisible.",
                2: "Le survol concerne la souris ; il faut un indicateur visible pour le focus clavier.",
                3: "Un contour transparent est aussi invisible qu'un contour supprimé."
              },
              hint: "Quelle ligne rend le focus invisible ?",
              explain: "`:focus-visible` s'applique quand le navigateur juge utile de montrer le focus, notamment au clavier. Un contour épais et contrasté, décalé de 2 px, rend la position évidente sans gêner les clics à la souris."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Rends cette barre de recherche accessible :\n\n- le logo a un texte alternatif ;\n- le champ a `id=\"recherche\"` et un `<label>` relié ;\n- le bouton-icône devient un vrai `<button>` avec un nom accessible (`aria-label`) ;\n- l'icône du bouton est cachée aux lecteurs d'écran ;\n- il ne reste aucune `<div>` cliquable.\n\nLe clic sera géré en JavaScript plus tard : ici, seul le HTML compte.",
            starter: `<img src="logo.svg" class="logo">
<input type="search" placeholder="Rechercher un projet">
<div class="bouton-icone" onclick="chercher()">
  <svg width="16" height="16"><circle cx="7" cy="7" r="5" stroke="currentColor" fill="none"/></svg>
</div>`,
            solution: `<img src="logo.svg" class="logo" alt="Lina.dev">
<label for="recherche">Rechercher un projet</label>
<input type="search" id="recherche" name="q">
<button type="button" class="bouton-icone" aria-label="Lancer la recherche">
  <svg aria-hidden="true" width="16" height="16"><circle cx="7" cy="7" r="5" stroke="currentColor" fill="none"/></svg>
</button>`,
            checks: [
              { sel: 'img.logo[alt]:not([alt=""])', count: 1, label: "Le logo a un texte alternatif" },
              { sel: 'body:has(label[for="recherche"]) input#recherche', count: 1, label: "Le champ #recherche a un label relié" },
              { sel: 'button[aria-label]:not([aria-label=""])', count: 1, label: "Un vrai bouton, nommé par aria-label" },
              { sel: 'button svg[aria-hidden="true"]', count: 1, label: "L'icône du bouton est cachée aux lecteurs d'écran" },
              { none: 'div[onclick]', label: "Plus de div cliquable" }
            ],
            hint: "Il manque un élément, et la `<div>` doit changer de balise. Pense à chaque profil : lecteur d'écran, clavier.",
            explain: "Le `<button>` natif apporte focus clavier et rôle ; comme il ne contient qu'une icône, `aria-label` lui donne un nom. L'icône, décorative, reçoit `aria-hidden`. Le label relié remplace le placeholder, et le `alt` du logo nomme le site."
          },
          recap: [
            "Contraste d'au moins 4,5:1 pour le texte courant (3:1 pour un grand texte).",
            "Chaque image informative a un `alt`, chaque champ un `<label>` relié.",
            "`<button>` et `<a href>` natifs plutôt qu'une `<div>` cliquable ; jamais de focus invisible : stylise `:focus-visible`.",
            "ARIA en dernier recours : `aria-label` pour un bouton-icône, `aria-hidden` pour une icône décorative."
          ],
          check: {
            type: 'logic',
            prompt: "En partant du haut de ce fragment, sur combien d'éléments la touche Tab s'arrête-t-elle ?",
            code: `<a href="/projets">Projets</a>
<a>Blog</a>
<button type="button">Menu</button>
<div class="carte" onclick="ouvrir()">Détecteur de spam</div>
<input type="email" id="mail" name="mail">
<button type="submit" disabled>Envoyer</button>`,
            answer: '3',
            accept: ['trois'],
            mistakes: [
              { answer: '4', why: "Un des éléments que tu as comptés ne reçoit pas le focus : un `<a>` sans `href` ou un bouton `disabled`." },
              { answer: '5', why: "Une `<div>` avec `onclick` n'est pas atteignable au clavier, pas plus qu'un `<a>` sans `href` ou un bouton `disabled`." },
              { answer: '6', why: "Tous les éléments ne sont pas focalisables : la `div`, le lien sans `href` et le bouton désactivé sont sautés." }
            ],
            hint: "Vérifie, ligne par ligne, s'il s'agit d'un élément interactif natif et utilisable.",
            explain: "Arrêts : le lien avec `href`, le bouton « Menu » et le champ e-mail. Le `<a>` sans `href` n'est pas un lien, la `div` n'est pas interactive pour le clavier, et le bouton `disabled` est désactivé. Réponse : 3."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- web.u14
    {
      id: 'web.u14',
      title: "Création d'un site complet",
      summary: "Construire pas à pas une page de portfolio de développeur, du HTML sémantique aux finitions.",
      lessons: [
        {
          id: 'web.u14.l1',
          title: 'Portfolio : structure et thème',
          minutes: 8,
          objective: "Tu sais poser la structure sémantique d'un portfolio et son thème CSS de base : variables, conteneur centré, en-tête et titre fluide.",
          explain:
            "Tu vas assembler un **portfolio de développeur** sur une seule page : présentation, projets, contact. À essayer sur ton ordinateur : crée un dossier avec `index.html` et `style.css`, relie la feuille avec `<link rel=\"stylesheet\" href=\"style.css\">` dans `<head>`, puis ouvre `index.html` dans ton navigateur.\n\n" +
            "Avance dans cet ordre :\n" +
            "- **Le contenu d'abord** : le HTML sémantique complet (`<header>` avec `<nav>`, `<main>` avec une `<section>` par partie, `<footer>`), sans CSS. La page doit déjà être lisible.\n" +
            "- **Le thème** : couleurs dans des variables sur `:root`, `box-sizing: border-box` partout, police et interligne sur `body`.\n" +
            "- **Le conteneur** : une classe `.conteneur` avec `max-width`, `margin-inline: auto` (marges gauche et droite automatiques) et `padding-inline` (espace intérieur à gauche et à droite) pour que le texte ne touche jamais les bords sur mobile.\n" +
            "- **L'en-tête** : en flex, logo à gauche, menu à droite.\n\n" +
            "Chaque lien du menu pointe vers l'`id` d'une section (`href=\"#projets\"`) : la navigation se fait dans la page, sans rechargement.",
          example: {
            code: `<style>
  :root { --accent: #4f46e5; --texte: #1e293b; --fond: #f8fafc; }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5;
         color: var(--texte); background: var(--fond); }
  .conteneur { max-width: 960px; margin-inline: auto; padding-inline: 16px; }
  .entete { display: flex; justify-content: space-between; align-items: center; }
</style>
<header class="entete conteneur">
  <a href="#" class="logo">Lina.dev</a>
  <nav><a href="#projets">Projets</a> <a href="#contact">Contact</a></nav>
</header>
<main class="conteneur">
  <section id="presentation"><h1>Développeuse web et IA</h1></section>
</main>`,
            notes: [
              { line: 2, text: "Tout le thème tient en trois variables : changer de couleur d'accent prend une seconde." },
              { line: 6, text: "Le conteneur limite la largeur, se centre, et garde 16 px de marge intérieure sur mobile." },
              { line: 7, text: "L'en-tête reprend le motif Flexbox : logo à gauche, menu à droite." },
              { line: 11, text: "Les liens visent les `id` des sections de la page." }
            ]
          },
          exercises: [
            {
              type: 'order',
              prompt: "Remets le corps du portfolio dans l'ordre : l'en-tête avec la navigation, puis le contenu principal (présentation, projets, contact), puis le pied de page.",
              lines: [
                '<header class="entete"><nav>…</nav></header>',
                '<main>',
                '  <section id="presentation"><h1>Lina Martin</h1></section>',
                '  <section id="projets"><h2>Projets</h2></section>',
                '  <section id="contact"><h2>Contact</h2></section>',
                '</main>',
                '<footer>© 2026 Lina Martin</footer>'
              ],
              hint: "Le `<main>` encadre les trois sections ; l'en-tête et le pied de page sont à l'extérieur.",
              explain: "L'en-tête et le pied de page sont communs au site, donc hors de `<main>`. Les sections suivent l'ordre de lecture voulu, et seule la présentation porte le `<h1>`."
            },
            {
              type: 'qcm',
              lang: 'css',
              prompt: "Sur un téléphone de 360 px, le texte de ton `.conteneur { max-width: 960px; margin-inline: auto; }` touche les bords de l'écran. Que faut-il ajouter ?",
              choices: ['`padding-inline: 16px;`', '`max-width: 100%;`', '`margin-inline: 16px;`', '`width: 960px;`'],
              answer: 0,
              why: {
                1: "Un bloc ne dépasse déjà pas la largeur de son parent : cela ne crée aucun espace entre le texte et le bord.",
                2: "Cela remplace `auto` : sur grand écran, le conteneur ne serait plus centré.",
                3: "Une largeur fixe de 960 px déborde d'un écran de 360 px et crée un défilement horizontal."
              },
              hint: "Il faut de l'espace à l'intérieur du conteneur, sans toucher à son centrage.",
              explain: "`padding-inline: 16px` ajoute 16 px d'espace intérieur à gauche et à droite. Sur grand écran, `margin-inline: auto` centre toujours le conteneur ; sur mobile, le texte respire."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Écris le CSS de l'en-tête et de la présentation :\n\n- tous les éléments en `box-sizing: border-box` ;\n- `.conteneur` limité à 960 px, centré, avec 16 px d'espace intérieur à gauche et à droite ;\n- `.entete` en flex, logo et menu aux deux extrémités, centrés verticalement ;\n- le `h1` a pour taille `clamp(2rem, 6vw, 3.5rem)` et pour couleur la variable `--accent`, déjà déclarée.",
            starter: `<style>
  :root { --accent: #4f46e5; }
  body { margin: 0; font-family: system-ui, sans-serif; }
  /* ton CSS ici */
</style>
<header class="entete conteneur">
  <a href="#" class="logo">Lina.dev</a>
  <nav><a href="#projets">Projets</a> <a href="#contact">Contact</a></nav>
</header>
<main class="conteneur">
  <section id="presentation">
    <h1>Je crée des applis web et des projets d'IA</h1>
    <p>Python, JavaScript, HTML et CSS.</p>
  </section>
</main>`,
            solution: `<style>
  :root { --accent: #4f46e5; }
  body { margin: 0; font-family: system-ui, sans-serif; }
  *, *::before, *::after { box-sizing: border-box; }
  .conteneur { max-width: 960px; margin-inline: auto; padding-inline: 16px; }
  .entete { display: flex; justify-content: space-between; align-items: center; }
  h1 { font-size: clamp(2rem, 6vw, 3.5rem); color: var(--accent); }
</style>
<header class="entete conteneur">
  <a href="#" class="logo">Lina.dev</a>
  <nav><a href="#projets">Projets</a> <a href="#contact">Contact</a></nav>
</header>
<main class="conteneur">
  <section id="presentation">
    <h1>Je crée des applis web et des projets d'IA</h1>
    <p>Python, JavaScript, HTML et CSS.</p>
  </section>
</main>`,
            checks: [
              { sel: '.conteneur', style: { 'box-sizing': 'border-box', 'max-width': '960px', 'padding-left': '16px', 'padding-right': '16px' }, label: "Conteneur en border-box, 960 px maximum, 16 px d'espace intérieur latéral" },
              { sel: '.conteneur', style: { 'margin-left': '20px', 'margin-right': '20px' }, vw: 1000, label: "Centré : sur 1 000 px, 20 px de marge de chaque côté" },
              { sel: '.entete', style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }, label: "En-tête en flex, logo et menu aux extrémités, centrés verticalement" },
              { sel: 'h1', style: { 'font-size': '32px' }, vw: 360, label: "Sur 360 px, le titre est au minimum : 2rem = 32 px" },
              { sel: 'h1', style: { 'font-size': '56px', color: 'rgb(79, 70, 229)' }, vw: 1000, label: "Sur 1 000 px, le titre est au maximum (56 px) et de couleur --accent" }
            ],
            hint: "Reprends les briques des unités précédentes : `box-sizing`, centrage avec des marges automatiques, Flexbox, `clamp()` et `var()`.",
            explain: "Avec `border-box`, les 960 px incluent le padding : sur 1 000 px, il reste 40 px, partagés en deux marges de 20 px. L'en-tête réutilise le motif Flexbox de l'unité 9, et `clamp()` borne le titre entre 32 et 56 px."
          },
          recap: [
            "Le contenu d'abord : un HTML sémantique lisible sans CSS.",
            "Le thème dans des variables sur `:root`, `box-sizing: border-box` partout.",
            "`.conteneur` : `max-width`, `margin-inline: auto`, `padding-inline` pour le mobile.",
            "Le menu pointe vers les `id` des sections : une page unique, sans rechargement."
          ],
          check: {
            type: 'fill',
            lang: 'css',
            prompt: "Complète la base du thème : largeur des boîtes prévisible, conteneur centré, liens à la couleur d'accent.",
            code: `:root {
  --accent: #4f46e5;
}
*, *::before, *::after { box-sizing: ___; }
.conteneur {
  max-width: 960px;
  margin-inline: ___;
  padding-inline: 16px;
}
a { color: ___(--accent); }`,
            blanks: [
              { answers: ['border-box'], options: ['border-box', 'content-box', 'padding-box'],
                why: { 'content-box': "C'est la valeur par défaut : `width` n'inclurait ni padding ni bordure.", 'padding-box': "`padding-box` n'est pas reconnu par les navigateurs actuels : la déclaration serait ignorée." } },
              { answers: ['auto'], options: ['auto', 'center', '0', '50%'],
                why: { center: "`center` n'est pas une valeur de marge.", '0': "Des marges nulles collent le conteneur à gauche.", '50%': "Une marge de 50 % de la largeur du parent pousserait le conteneur hors de l'écran." } },
              { answers: ['var'], options: ['var', 'get', 'calc'],
                why: { get: "`get()` n'existe pas en CSS.", calc: "`calc()` fait des calculs, il ne lit pas une variable." } }
            ],
            hint: "Trois notions déjà vues : le modèle de boîte, le centrage d'un bloc et les variables CSS.",
            explain: "`border-box` rend les largeurs prévisibles, `margin-inline: auto` centre un bloc de largeur limitée, et `var(--accent)` lit la couleur du thème : changer l'accent dans `:root` met à jour tous les liens."
          }
        },
        {
          id: 'web.u14.l2',
          title: 'Portfolio : projets, contact et finitions',
          minutes: 8,
          objective: "Tu sais compléter le portfolio avec une grille de projets adaptative et un formulaire de contact accessible, puis le vérifier avant de le publier.",
          explain:
            "La section projets réutilise tout le parcours : chaque projet est un `<article>` (image avec `alt`, titre `<h3>`, courte description, lien explicite comme « Code de Météo prédictive »), et la grille des cartes utilise `repeat(auto-fit, minmax(260px, 1fr))`.\n\n" +
            "La section contact contient un formulaire court : nom, e-mail et message, chacun avec son label. Le message utilise `<textarea>`, un champ de texte sur plusieurs lignes, qui a une balise fermante. Le bouton d'envoi est `type=\"submit\"`.\n\n" +
            "Avant de publier, vérifie :\n" +
            "- la page est lisible sur 360 px comme sur grand écran (mode responsive des outils de développement) ;\n" +
            "- tout se fait au clavier, avec un focus visible ;\n" +
            "- contrastes et `alt` sont corrects (l'audit Lighthouse de Chrome les contrôle) ;\n" +
            "- le HTML passe le validateur du W3C (validator.w3.org) ;\n" +
            "- les animations respectent `prefers-reduced-motion`.\n\n" +
            "Pour publier gratuitement, GitHub Pages sert directement les fichiers d'un dépôt.",
          example: {
            code: `<section id="projets" class="conteneur">
  <h2>Projets</h2>
  <div class="grille-projets">
    <article class="projet">
      <img src="meteo.png" alt="Courbe des températures prévues sur 7 jours">
      <h3>Météo prédictive</h3>
      <p>Prévision des températures par régression linéaire.</p>
      <ul class="tags"><li>Python</li><li>scikit-learn</li></ul>
      <a href="https://github.com/lina-dev/meteo">Code de Météo prédictive</a>
    </article>
  </div>
</section>
<style>
  .grille-projets { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
</style>`,
            notes: [
              { line: 3, text: "Une `div` suffit ici : elle ne sert qu'à la mise en page de la grille." },
              { line: 4, text: "Chaque projet est un contenu autonome : un `<article>`." },
              { line: 9, text: "Le texte du lien dit précisément où il mène, même lu hors contexte." },
              { line: 14, text: "La grille passe seule d'une colonne sur mobile à plusieurs sur grand écran." }
            ]
          },
          exercises: [
            {
              type: 'bug',
              lang: 'css',
              prompt: "Les cartes de projets devraient former une grille de colonnes d'au moins 260 px, mais elles s'écrasent toutes sur une seule ligne. Clique sur la ligne fautive.",
              code: `.grille-projets {
  display: flex;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}`,
              bugLine: 2,
              why: "`grid-template-columns` n'a d'effet que sur un conteneur de grille. En `display: flex`, elle est ignorée, et Flexbox garde toutes les cartes sur une ligne.",
              fixes: [
                '  display: grid;',
                '  display: block;',
                '  flex-wrap: wrap;',
                '  display: flex-grid;'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "En `block`, les cartes s'empilent toujours, et `grid-template-columns` reste ignorée.",
                2: "Sans `display: flex`, le conteneur redevient un bloc : les cartes s'empilent, et la grille n'existe toujours pas.",
                3: "`flex-grid` n'est pas une valeur de `display` : la déclaration serait ignorée."
              },
              hint: "À quel type de conteneur appartient la propriété de la ligne 3 ?",
              explain: "Les propriétés `grid-template-*` ne s'appliquent qu'avec `display: grid`. Quand une propriété semble sans effet, l'inspecteur du navigateur l'indique souvent comme inactive, avec la raison."
            },
            {
              type: 'logic',
              lang: 'css',
              prompt: "La section des projets fait 1 100 px de large et contient 6 projets. Combien de colonnes crée cette grille ?",
              code: `.grille-projets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}`,
              answer: '3',
              accept: ['trois'],
              mistakes: [
                { answer: '4', why: "4 × 260 = 1 040 px tiendrait, mais il faut ajouter les 3 écarts de 24 px : 1 112 px, c'est trop." },
                { answer: '6', why: "Il y a 6 projets, mais chaque colonne doit faire au moins 260 px : 6 colonnes demanderaient 1 680 px." }
              ],
              hint: "Pour n colonnes, il faut n × 260 px plus (n − 1) écarts de 24 px.",
              explain: "3 colonnes : 3 × 260 + 2 × 24 = 828 px, ça tient. 4 colonnes : 4 × 260 + 3 × 24 = 1 112 px, c'est plus que 1 100. Le navigateur crée donc 3 colonnes, étirées pour remplir la ligne."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Complète la section projets :\n\n- `.grille-projets` est une grille `repeat(auto-fit, minmax(260px, 1fr))` avec un écart de 20 px (une colonne sur 360 px, trois sur 1 000 px) ;\n- ajoute un troisième projet sur le modèle des deux autres ;\n- chaque image a un texte alternatif non vide.",
            starter: `<style>
  body { margin: 0; }
  .grille-projets { display: flex; }
</style>
<section id="projets">
  <h2>Projets</h2>
  <div class="grille-projets">
    <article class="projet">
      <img src="meteo.png" alt="Courbe des températures prévues sur 7 jours">
      <h3>Météo prédictive</h3>
      <a href="https://github.com/lina-dev/meteo">Code de Météo prédictive</a>
    </article>
    <article class="projet">
      <img src="chatbot.png">
      <h3>Chatbot de révision</h3>
      <a href="https://github.com/lina-dev/chatbot">Code du chatbot de révision</a>
    </article>
  </div>
</section>`,
            solution: `<style>
  body { margin: 0; }
  .grille-projets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
</style>
<section id="projets">
  <h2>Projets</h2>
  <div class="grille-projets">
    <article class="projet">
      <img src="meteo.png" alt="Courbe des températures prévues sur 7 jours">
      <h3>Météo prédictive</h3>
      <a href="https://github.com/lina-dev/meteo">Code de Météo prédictive</a>
    </article>
    <article class="projet">
      <img src="chatbot.png" alt="Le chatbot pose une question de quiz sur un cours d'histoire">
      <h3>Chatbot de révision</h3>
      <a href="https://github.com/lina-dev/chatbot">Code du chatbot de révision</a>
    </article>
    <article class="projet">
      <img src="spam.png" alt="Matrice de confusion : 96 % des spams détectés">
      <h3>Détecteur de spam</h3>
      <a href="https://github.com/lina-dev/spam">Code du détecteur de spam</a>
    </article>
  </div>
</section>`,
            checks: [
              { sel: '.grille-projets', style: { display: 'grid', 'column-gap': '20px', 'row-gap': '20px' }, label: "Une grille avec 20 px d'écart" },
              { sel: '.grille-projets', style: { 'grid-template-columns': '360px' }, vw: 360, label: "Sur 360 px : une seule colonne" },
              { sel: '.grille-projets', style: { 'grid-template-columns': '320px 320px 320px' }, vw: 1000, label: "Sur 1 000 px : trois colonnes de 320 px" },
              { sel: '.grille-projets > article.projet', count: 3, label: "Trois projets (article.projet)" },
              { sel: '.projet img[alt]:not([alt=""])', count: 3, label: "Les 3 images ont un texte alternatif non vide" }
            ],
            hint: "Commence par la grille, puis copie un `<article>` complet et adapte son contenu. Une image n'a pas encore de `alt`.",
            explain: "Sur 1 000 px, 3 colonnes de 260 px et 2 écarts tiennent (820 px), 4 non (1 100 px) : le navigateur étire 3 colonnes à (1 000 − 40) / 3 = 320 px. Chaque projet garde la même structure : image décrite, titre, lien explicite."
          },
          recap: [
            "Une carte de projet = `<article>` avec image décrite, titre, description et lien explicite.",
            "`repeat(auto-fit, minmax(260px, 1fr))` adapte la grille à toutes les largeurs.",
            "Le formulaire de contact : labels reliés, bons types, `<textarea>` pour le message, `type=\"submit\"`.",
            "Avant de publier : responsive, clavier, contrastes et `alt`, validateur W3C, `prefers-reduced-motion`."
          ],
          check: {
            type: 'code',
            prompt: "Termine le portfolio avec la section contact :\n\n- un formulaire qui envoie en `post` vers `/contact` ;\n- un champ nom (`id=\"nom\"`), obligatoire ;\n- un champ e-mail (`id=\"email\"`) de type `email`, obligatoire ;\n- un message (`<textarea id=\"message\">`), obligatoire ;\n- chacun relié à son `<label>`, et un bouton d'envoi `type=\"submit\"`.",
            starter: `<section id="contact">
  <h2>Contact</h2>
  <form>
    <input placeholder="Nom">
    <input placeholder="E-mail">
    <textarea placeholder="Message"></textarea>
    <div>Envoyer</div>
  </form>
</section>`,
            solution: `<section id="contact">
  <h2>Contact</h2>
  <form action="/contact" method="post">
    <label for="nom">Nom</label>
    <input type="text" id="nom" name="nom" required>
    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" required>
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>
    <button type="submit">Envoyer</button>
  </form>
</section>`,
            checks: [
              { sel: '#contact form', attrs: { action: '/contact', method: 'post' }, label: "Le formulaire envoie en post vers /contact" },
              { sel: 'form:has(label[for="nom"]) input#nom[required]', count: 1, label: "Champ nom obligatoire, relié à son label" },
              { sel: 'form:has(label[for="email"]) input#email[type="email"][required]', count: 1, label: "Champ e-mail de type email, obligatoire, relié à son label" },
              { sel: 'form:has(label[for="message"]) textarea#message[required]', count: 1, label: "Message obligatoire, relié à son label" },
              { sel: 'form button[type="submit"]', label: "Un bouton d'envoi type=\"submit\"" }
            ],
            hint: "Reprends la méthode de l'unité 4 : un label par champ, des `id` identiques aux `for`, les bons types, et `required`.",
            explain: "`action` et `method` disent où et comment partent les données. Chaque champ a un label relié par `for` et `id`, un type adapté et `required`. La `div` « Envoyer » devient un vrai `<button type=\"submit\">`, utilisable au clavier."
          }
        }
      ]
    }
  ]
});
