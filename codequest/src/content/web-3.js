// Parcours HTML et CSS, chapitre 3 : Mise en page (web.u9 à web.u12).
CQ.addChapter('web', {
  id: 'web.c3',
  title: 'Mise en page',
  units: [
    // ---------------------------------------------------------------- web.u9
    {
      id: 'web.u9',
      title: 'Flexbox',
      summary: "Aligner, répartir et adapter des éléments sur une ligne ou une colonne.",
      lessons: [
        {
          id: 'web.u9.l1',
          title: 'Aligner avec Flexbox',
          minutes: 7,
          objective: "Tu sais aligner des éléments avec Flexbox en raisonnant sur l'axe principal et l'axe secondaire.",
          explain:
            "`display: flex` sur un conteneur place ses **enfants directs** les uns à côté des autres. Tout se raisonne avec deux axes :\n" +
            "- l'**axe principal**, horizontal par défaut (`flex-direction: row`), vertical avec `flex-direction: column` ;\n" +
            "- l'**axe secondaire**, perpendiculaire au premier.\n\n" +
            "`justify-content` répartit les éléments sur l'axe principal : `flex-start`, `center`, `flex-end`, `space-between` (le premier et le dernier collés aux bords), `space-around`.\n\n" +
            "`align-items` les aligne sur l'axe secondaire : `stretch` (par défaut, même hauteur), `center`, `flex-start`, `flex-end`.\n\n" +
            "`gap` fixe l'espace entre les éléments, sans marges à gérer.\n\n" +
            "Ces propriétés se placent sur le **conteneur**, pas sur les enfants. Cas typique : une barre de navigation avec le logo à gauche, le menu à droite, le tout centré verticalement.",
          example: {
            code: `<style>
  .barre {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
  }
  .menu { display: flex; gap: 16px; list-style: none; margin: 0; padding: 0; }
</style>
<header class="barre">
  <a href="/" class="logo">Lina.dev</a>
  <ul class="menu"><li><a href="#projets">Projets</a></li><li><a href="#contact">Contact</a></li></ul>
</header>`,
            notes: [
              { line: 3, text: "Le logo et le menu, enfants directs de `.barre`, se placent côte à côte." },
              { line: 4, text: "Axe principal (horizontal) : le logo à gauche, le menu à droite." },
              { line: 5, text: "Axe secondaire (vertical) : les deux centrés en hauteur." },
              { line: 8, text: "Le menu est lui-même un conteneur flex : ses `li` passent en ligne, avec 16 px d'écart et sans puces." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              lang: 'css',
              prompt: "Un conteneur a `display: flex; flex-direction: column;`. Quelle déclaration, ajoutée au conteneur, centre ses enfants **horizontalement** ?",
              choices: ['`align-items: center;`', '`justify-content: center;`', '`vertical-align: middle;`', '`flex-direction: row;`'],
              answer: 0,
              why: {
                1: "En `column`, l'axe principal est vertical : `justify-content: center` centre les enfants de haut en bas.",
                2: "`vertical-align` concerne le texte et les cellules de tableau, pas les enfants d'un conteneur flex.",
                3: "Cela remet les enfants en ligne, sans les centrer."
              },
              hint: "En `column`, l'axe principal devient vertical. Lequel reste horizontal ?",
              explain: "`flex-direction: column` fait tourner les axes : l'axe principal est vertical, l'axe secondaire horizontal. `align-items`, qui agit sur l'axe secondaire, centre donc horizontalement."
            },
            {
              type: 'fill',
              lang: 'css',
              prompt: "Complète pour centrer le contenu de la bannière horizontalement et verticalement.",
              code: `.banniere {
  display: ___;
  justify-content: ___;
  ___: center;
  min-height: 300px;
}`,
              blanks: [
                { answers: ['flex'], options: ['flex', 'block', 'center', 'inline'],
                  why: { block: "En `block`, `justify-content` et `align-items` n'ont aucun effet.", center: "`center` n'est pas une valeur de `display`.", inline: "Un élément `inline` ignore `min-height` et n'aligne pas ses enfants." } },
                { answers: ['center'], options: ['center', 'middle', 'space-between', 'flex-end'],
                  why: { middle: "`middle` n'existe pas pour `justify-content`.", 'space-between': "Avec un seul enfant, `space-between` le colle à gauche.", 'flex-end': "`flex-end` le colle à droite." } },
                { answers: ['align-items'], options: ['align-items', 'vertical-align', 'text-align', 'justify-items'],
                  why: { 'vertical-align': "`vertical-align` ne s'applique pas aux enfants d'un conteneur flex.", 'text-align': "`text-align` aligne le texte horizontalement, pas les boîtes verticalement.", 'justify-items': "`justify-items` est ignoré par Flexbox." } }
              ],
              hint: "Un axe se règle avec `justify-content`, l'autre avec une propriété qui commence par `align`.",
              explain: "En `row`, `justify-content: center` centre sur l'axe principal (horizontal) et `align-items: center` sur l'axe secondaire (vertical). `min-height` donne de la hauteur pour que le centrage vertical se voie."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Mets en page l'en-tête du portfolio :\n\n- `.entete` en flex, le logo à gauche et le menu à droite (`space-between`), centrés verticalement ;\n- les liens de `.menu` sont alignés en ligne, avec un écart de 24 px et sans puces.",
            starter: `<style>
  .entete { padding: 12px 24px; background: #0f172a; }
  .entete a { color: white; }
  /* ton CSS ici */
</style>
<header class="entete">
  <a href="/" class="logo">Lina.dev</a>
  <ul class="menu">
    <li><a href="#projets">Projets</a></li>
    <li><a href="#parcours">Parcours</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</header>`,
            solution: `<style>
  .entete { padding: 12px 24px; background: #0f172a; }
  .entete a { color: white; }
  .entete {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .menu {
    display: flex;
    gap: 24px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
<header class="entete">
  <a href="/" class="logo">Lina.dev</a>
  <ul class="menu">
    <li><a href="#projets">Projets</a></li>
    <li><a href="#parcours">Parcours</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</header>`,
            checks: [
              { sel: '.entete', style: { display: 'flex', 'justify-content': 'space-between' }, label: "L'en-tête est en flex, logo et menu aux deux extrémités" },
              { sel: '.entete', style: { 'align-items': 'center' }, label: "Logo et menu sont centrés verticalement" },
              { sel: '.menu', style: { display: 'flex', 'column-gap': '24px' }, label: "Les liens du menu sont en ligne avec 24 px d'écart" },
              { sel: '.menu', style: { 'list-style-type': 'none' }, label: "Le menu n'a plus de puces" }
            ],
            hint: "Il y a deux conteneurs flex : l'en-tête (enfants : logo et liste) et la liste (enfants : les `li`).",
            explain: "Flexbox n'agit que sur les enfants directs : `.entete` aligne le logo et la liste, puis `.menu` aligne ses `li`. `list-style: none` retire les puces, et remettre `margin` et `padding` à 0 supprime le retrait par défaut des listes."
          },
          recap: [
            "`display: flex` agit sur les enfants directs du conteneur.",
            "`justify-content` : axe principal ; `align-items` : axe secondaire.",
            "`flex-direction: column` fait tourner les axes.",
            "`gap` espace les éléments ; les propriétés d'alignement vont sur le conteneur."
          ],
          check: {
            type: 'bug',
            lang: 'css',
            prompt: "Le logo et le menu devraient être aux deux extrémités de la barre, mais ils restent collés à gauche. Clique sur la ligne fautive.",
            code: `.barre {
  display: flex;
  align-items: space-between;
  padding: 12px 24px;
}`,
            bugLine: 3,
            why: "`align-items` agit sur l'axe secondaire (vertical ici) et n'accepte pas `space-between` : la déclaration est ignorée. La répartition horizontale se fait avec `justify-content`.",
            fixes: [
              '  justify-content: space-between;',
              '  align-items: center;',
              '  text-align: justify;',
              '  flex-direction: column;'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "Cela centre verticalement, mais les éléments restent groupés à gauche.",
              2: "`text-align` agit sur le texte à l'intérieur des éléments, pas sur leur répartition.",
              3: "Les éléments s'empileraient verticalement, au lieu d'aller aux deux extrémités."
            },
            hint: "Quel axe est concerné par « gauche et droite » dans une barre en `row` ?",
            explain: "En `row`, l'axe principal est horizontal : c'est `justify-content: space-between` qui pousse le premier élément à gauche et le dernier à droite."
          }
        },
        {
          id: 'web.u9.l2',
          title: 'Des éléments qui s’adaptent',
          minutes: 8,
          objective: "Tu sais répartir l'espace entre éléments flexibles et les faire passer à la ligne.",
          explain:
            "Chaque enfant d'un conteneur flex peut grandir ou rétrécir grâce au raccourci `flex: grow shrink basis` :\n" +
            "- `flex-basis` : taille de départ (`200px`, `0`, `auto`) ;\n" +
            "- `flex-grow` : part de l'espace **restant** que l'élément récupère ;\n" +
            "- `flex-shrink` : capacité à rétrécir si la place manque (0 = jamais).\n\n" +
            "Raccourcis courants : `flex: 1` (soit `1 1 0%`) partage tout l'espace selon les valeurs de grow ; `flex: 0 0 240px` fixe une largeur, idéal pour une barre latérale ; `flex: 1 1 220px` part de 220 px puis s'étire.\n\n" +
            "Par défaut, tout reste sur **une seule ligne**, quitte à écraser les éléments. `flex-wrap: wrap` autorise le passage à la ligne : avec `flex: 1 1 220px`, des cartes se placent à trois ou quatre par ligne sur grand écran et une par ligne sur mobile, sans media query.\n\n" +
            "Pour pousser un seul élément au bout de la ligne, `margin-left: auto` sur cet élément absorbe l'espace libre.",
          example: {
            code: `<style>
  .cartes { display: flex; flex-wrap: wrap; gap: 16px; }
  .carte { flex: 1 1 220px; padding: 16px; border: 1px solid #cbd5e1; }
  .tableau { display: flex; gap: 24px; }
  .tableau aside { flex: 0 0 240px; }
  .tableau main { flex: 1; }
</style>
<div class="cartes">
  <article class="carte">Précision : 94 %</article>
  <article class="carte">Requêtes : 1 284</article>
  <article class="carte">Latence : 120 ms</article>
</div>`,
            notes: [
              { line: 2, text: "`flex-wrap: wrap` : les cartes passent à la ligne quand la place manque." },
              { line: 3, text: "Chaque carte part de 220 px, puis grandit pour remplir la ligne." },
              { line: 5, text: "La barre latérale garde 240 px : elle ne grandit ni ne rétrécit." },
              { line: 6, text: "La zone principale prend tout l'espace restant." }
            ]
          },
          exercises: [
            {
              type: 'logic',
              lang: 'css',
              prompt: "Le conteneur fait 600 px de large, sans `gap` ni padding. Quelle largeur, en pixels, prend `.a` ?",
              code: `.ligne { display: flex; width: 600px; }
.a { flex: 2; }
.b { flex: 1; }
.c { flex: 1; }`,
              answer: '300',
              accept: ['300px', '300 px'],
              mistakes: [
                { answer: '200', why: "Les trois éléments ne sont pas égaux : `.a` a un `flex-grow` de 2, les autres de 1." },
                { answer: '400', why: "`.a` reçoit 2 parts sur 4 (2 + 1 + 1), pas 2 parts sur 3." }
              ],
              hint: "`flex: 2` part d'une base de 0 : tout l'espace est partagé selon les valeurs de grow.",
              explain: "`flex: n` vaut `n 1 0%` : la base est 0, donc les 600 px sont partagés en 2 + 1 + 1 = 4 parts. `.a` en reçoit 2, soit 300 px ; `.b` et `.c` 150 px chacun."
            },
            {
              type: 'qcm',
              lang: 'css',
              prompt: "Sur mobile, les quatre cartes d'un conteneur `display: flex` restent sur une seule ligne et deviennent minuscules. Que faut-il ajouter au conteneur ?",
              choices: ['`flex-wrap: wrap;`', '`flex-direction: row;`', '`justify-content: space-between;`', '`align-items: stretch;`'],
              answer: 0,
              why: {
                1: "`row` est déjà la valeur par défaut : rien ne change.",
                2: "Cela répartit l'espace sur la ligne, mais les cartes y restent toutes.",
                3: "`stretch` est déjà la valeur par défaut, et il agit sur la hauteur, pas sur le passage à la ligne."
              },
              hint: "Par défaut, un conteneur flex refuse de passer à la ligne.",
              explain: "`flex-wrap: nowrap` est la valeur par défaut : les éléments rétrécissent tant qu'ils peuvent. `flex-wrap: wrap` les laisse passer à la ligne suivante quand ils ne tiennent plus."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Construis la mise en page du tableau de bord :\n\n- `.tableau` en flex, avec un écart de 24 px ;\n- la barre latérale `aside` garde toujours 240 px (elle ne grandit ni ne rétrécit) ;\n- `main` prend tout l'espace restant ;\n- dans `.indicateurs`, les cartes partent de 180 px, s'étirent et passent à la ligne.",
            starter: `<style>
  body { margin: 0; }
  /* ton CSS ici */
</style>
<div class="tableau">
  <aside>Menu</aside>
  <main>
    <div class="indicateurs">
      <article class="carte">Précision : 94 %</article>
      <article class="carte">Requêtes : 1 284</article>
      <article class="carte">Latence : 120 ms</article>
    </div>
  </main>
</div>`,
            solution: `<style>
  body { margin: 0; }
  .tableau { display: flex; gap: 24px; }
  .tableau aside { flex: 0 0 240px; }
  .tableau main { flex: 1; }
  .indicateurs { display: flex; flex-wrap: wrap; gap: 16px; }
  .carte { flex: 1 1 180px; }
</style>
<div class="tableau">
  <aside>Menu</aside>
  <main>
    <div class="indicateurs">
      <article class="carte">Précision : 94 %</article>
      <article class="carte">Requêtes : 1 284</article>
      <article class="carte">Latence : 120 ms</article>
    </div>
  </main>
</div>`,
            checks: [
              { sel: '.tableau', style: { display: 'flex', 'column-gap': '24px' }, label: "Le tableau est en flex avec 24 px d'écart" },
              { sel: '.tableau > aside', style: { width: '240px', 'flex-shrink': '0' }, vw: 1000, label: "La barre latérale fait 240 px et ne rétrécit pas" },
              { sel: '.tableau > main', style: { width: '736px' }, vw: 1000, label: "Sur 1 000 px, main prend le reste : 1 000 − 240 − 24 = 736 px" },
              { sel: '.indicateurs', style: { display: 'flex', 'flex-wrap': 'wrap' }, label: "Les indicateurs sont en flex et passent à la ligne" },
              { sel: '.carte', style: { 'flex-grow': '1', 'flex-basis': '180px' }, label: "Les cartes partent de 180 px et s'étirent" }
            ],
            hint: "Trois valeurs de `flex` différentes : une taille fixe, « tout le reste », et « une base qui s'étire ».",
            explain: "`flex: 0 0 240px` fige la barre latérale ; `flex: 1` donne tout l'espace libre à `main` ; `flex: 1 1 180px` combiné à `flex-wrap: wrap` crée des cartes qui s'étirent et passent à la ligne selon la place."
          },
          recap: [
            "`flex: grow shrink basis` ; `flex: 1` partage l'espace, `flex: 0 0 240px` fige une largeur.",
            "`flex-grow` répartit l'espace restant proportionnellement.",
            "`flex-wrap: wrap` permet de passer à la ligne ; combiné à une base en px, la mise en page s'adapte seule.",
            "`margin-left: auto` pousse un élément au bout de la ligne."
          ],
          check: {
            type: 'fill',
            lang: 'css',
            prompt: "Complète : les cartes de projets partent d'une largeur de 250 px, s'étirent pour remplir la ligne, et passent à la ligne quand la place manque.",
            code: `.projets {
  display: flex;
  flex-wrap: ___;
  gap: 16px;
}
.projet {
  flex: ___ 1 ___;
}`,
            blanks: [
              { answers: ['wrap'], options: ['wrap', 'nowrap', 'row', 'column'],
                why: { nowrap: "`nowrap` est la valeur par défaut : tout reste sur une ligne.", row: "`row` est une valeur de `flex-direction`, pas de `flex-wrap`.", column: "`column` est une valeur de `flex-direction`, pas de `flex-wrap`." } },
              { answers: ['1'], options: ['1', '0'],
                why: { '0': "Avec un `flex-grow` de 0, les cartes ne s'étirent pas : il reste un vide en bout de ligne." } },
              { answers: ['250px'],
                why: { '250': "Une base sans unité est invalide : écris `250px`." } }
            ],
            hint: "Dans le raccourci `flex`, l'ordre est : grandir, rétrécir, taille de départ.",
            explain: "`flex: 1 1 250px` : chaque carte part de 250 px, grandit pour combler la ligne et peut rétrécir. Avec `flex-wrap: wrap`, une carte qui ne tient plus passe à la ligne suivante."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- web.u10
    {
      id: 'web.u10',
      title: 'CSS Grid',
      summary: "Placer des éléments en lignes et colonnes, et construire des grilles adaptatives.",
      lessons: [
        {
          id: 'web.u10.l1',
          title: 'Grilles en colonnes',
          minutes: 7,
          objective: "Tu sais créer une grille de colonnes avec `grid-template-columns`, l'unité `fr` et `gap`.",
          explain:
            "Flexbox aligne sur **un axe** ; CSS Grid place les éléments sur **deux axes** à la fois, en lignes et en colonnes. C'est l'outil idéal pour une galerie, un tableau de bord ou la structure d'une page.\n\n" +
            "`display: grid` sur le conteneur, puis :\n" +
            "- `grid-template-columns` définit les colonnes : `200px 1fr` donne une colonne fixe et une colonne qui prend le reste ;\n" +
            "- l'unité `fr` partage l'espace **disponible**, une fois les tailles fixes et les écarts retirés : `1fr 2fr` donne un tiers et deux tiers ;\n" +
            "- `repeat(3, 1fr)` évite de répéter : trois colonnes égales ;\n" +
            "- `gap: 16px` espace lignes et colonnes (ou `row-gap` et `column-gap` séparément).\n\n" +
            "Les éléments remplissent la grille dans l'ordre, ligne par ligne : avec 3 colonnes, le 4e élément commence une nouvelle ligne. Les lignes sont créées automatiquement selon le nombre d'éléments.",
          example: {
            code: `<style>
  .indicateurs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .page { display: grid; grid-template-columns: 240px 1fr; }
</style>
<section class="indicateurs">
  <article>Utilisateurs : 1 850</article>
  <article>Précision : 94 %</article>
  <article>Latence : 120 ms</article>
  <article>Erreurs : 3</article>
</section>`,
            notes: [
              { line: 4, text: "Trois colonnes de même largeur." },
              { line: 5, text: "16 px entre les colonnes et entre les lignes." },
              { line: 7, text: "Une barre latérale de 240 px et un contenu qui prend le reste." },
              { line: 13, text: "Le 4e élément commence automatiquement une deuxième ligne." }
            ]
          },
          exercises: [
            {
              type: 'logic',
              lang: 'css',
              prompt: "Cette galerie contient 10 images. Combien de lignes compte la grille ?",
              code: `.galerie {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}`,
              answer: '3',
              accept: ['trois'],
              mistakes: [
                { answer: '4', why: "4 est le nombre de colonnes, pas de lignes." },
                { answer: '2', why: "Deux lignes contiennent 8 images : les 2 dernières ouvrent une troisième ligne, incomplète." }
              ],
              hint: "Remplis la grille 4 par 4.",
              explain: "Les images remplissent 4 cases par ligne : 4 + 4 + 2. La troisième ligne n'est remplie qu'à moitié, mais elle existe : 3 lignes."
            },
            {
              type: 'fill',
              lang: 'css',
              prompt: "Complète pour obtenir 4 colonnes de même largeur, espacées de 12 px.",
              code: `.galerie {
  display: grid;
  grid-template-columns: ___(4, ___);
  gap: 12px;
}`,
              blanks: [
                { answers: ['repeat'], options: ['repeat', 'times', 'columns', 'range'],
                  why: { times: "`times()` n'existe pas en CSS.", columns: "`columns()` n'existe pas en CSS.", range: "`range()` est du Python, pas du CSS." } },
                { answers: ['1fr'], options: ['1fr', '25%', '1', 'fr'],
                  why: { '25%': "4 × 25 % font déjà 100 % : avec les 3 écarts de 12 px en plus, la grille déborde.", '1': "Une taille sans unité est invalide.", fr: "`fr` seul est invalide : il faut un nombre, comme `1fr`." } }
              ],
              hint: "L'unité `fr` partage l'espace qui reste après les écarts.",
              explain: "`repeat(4, 1fr)` équivaut à `1fr 1fr 1fr 1fr`. Les `fr` se partagent l'espace restant une fois les écarts retirés, donc la grille ne déborde jamais."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Range les 6 tuiles du tableau de bord en grille :\n\n- 3 colonnes : la première **deux fois plus large** que les deux autres ;\n- 16 px d'écart entre les lignes et entre les colonnes.\n\nLe conteneur fait 632 px de large.",
            starter: `<style>
  .tuiles { width: 632px; }
  .tuile { padding: 12px; background: #e0f2fe; }
</style>
<section class="tuiles">
  <div class="tuile">Utilisateurs</div>
  <div class="tuile">Sessions</div>
  <div class="tuile">Précision</div>
  <div class="tuile">Latence</div>
  <div class="tuile">Erreurs</div>
  <div class="tuile">Coût</div>
</section>`,
            solution: `<style>
  .tuiles {
    width: 632px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 16px;
  }
  .tuile { padding: 12px; background: #e0f2fe; }
</style>
<section class="tuiles">
  <div class="tuile">Utilisateurs</div>
  <div class="tuile">Sessions</div>
  <div class="tuile">Précision</div>
  <div class="tuile">Latence</div>
  <div class="tuile">Erreurs</div>
  <div class="tuile">Coût</div>
</section>`,
            checks: [
              { sel: '.tuiles', style: { display: 'grid' }, label: "Les tuiles sont dans une grille" },
              { sel: '.tuiles', style: { 'grid-template-columns': '300px 150px 150px' }, label: "3 colonnes : 300, 150 et 150 px (632 − 2 × 16 = 600 px à partager en 2 + 1 + 1)" },
              { sel: '.tuiles', style: { 'row-gap': '16px', 'column-gap': '16px' }, label: "16 px d'écart entre lignes et colonnes" }
            ],
            hint: "Une colonne deux fois plus large qu'une autre : pense en parts de `fr`.",
            explain: "`2fr 1fr 1fr` partage l'espace disponible en 4 parts. Les deux écarts retirent 32 px : il reste 600 px, soit 300 px pour la première colonne et 150 px pour les deux autres."
          },
          recap: [
            "`display: grid` + `grid-template-columns` définissent les colonnes.",
            "`fr` partage l'espace disponible, après les tailles fixes et les écarts.",
            "`repeat(n, taille)` évite les répétitions ; `gap` espace lignes et colonnes.",
            "Les éléments remplissent la grille ligne par ligne ; les lignes se créent seules."
          ],
          check: {
            type: 'qcm',
            lang: 'css',
            prompt: "Quelle déclaration crée une barre latérale fixe de 250 px à gauche et une zone de contenu qui prend tout le reste ?",
            choices: [
              '`grid-template-columns: 250px 1fr;`',
              '`grid-template-columns: 250px 100%;`',
              '`grid-template-columns: 1fr 250px;`',
              '`grid-template-rows: 250px 1fr;`'
            ],
            answer: 0,
            why: {
              1: "100 % vaut toute la largeur du conteneur : ajoutés aux 250 px, la grille déborde.",
              2: "L'ordre compte : ici, la colonne de 250 px est à droite.",
              3: "`grid-template-rows` définit des lignes : la barre ferait 250 px de haut, au-dessus du contenu."
            },
            hint: "Les colonnes se lisent de gauche à droite, et `fr` prend l'espace restant.",
            explain: "`250px 1fr` : la première colonne fait 250 px, la seconde reçoit tout l'espace qui reste. C'est la structure classique d'un tableau de bord."
          }
        },
        {
          id: 'web.u10.l2',
          title: 'Zones et grilles adaptatives',
          minutes: 8,
          objective: "Tu sais placer des éléments dans des zones nommées et créer une grille qui s'adapte à la largeur sans media query.",
          explain:
            "Pour la structure d'une page, `grid-template-areas` dessine la grille avec des noms : chaque chaîne entre guillemets est une ligne, chaque mot une cellule. Un nom répété sur plusieurs cellules forme une zone qui les couvre toutes. Chaque enfant rejoint sa zone avec `grid-area: nom`. Toutes les lignes doivent avoir le même nombre de cellules.\n\n" +
            "Pour qu'un élément s'étende sur plusieurs colonnes : `grid-column: span 2` (deux colonnes à partir de sa place) ou `grid-column: 1 / -1` (de la première à la dernière ligne de séparation de la grille, donc toute la largeur).\n\n" +
            "La formule la plus utile pour une galerie : `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`. Le navigateur crée **autant de colonnes que possible** d'au moins 220 px, puis les étire pour remplir la ligne. Résultat : une colonne sur mobile, trois ou quatre sur grand écran, sans aucune media query.",
          example: {
            code: `<style>
  .page {
    display: grid;
    grid-template-columns: 220px 1fr;
    grid-template-areas:
      "entete entete"
      "menu   contenu"
      "pied   pied";
  }
  header { grid-area: entete; }
  nav { grid-area: menu; }
  main { grid-area: contenu; }
  footer { grid-area: pied; }
  .galerie { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
</style>`,
            notes: [
              { line: 6, text: "`entete` est répété sur les deux cellules : l'en-tête couvre toute la largeur." },
              { line: 7, text: "Deuxième ligne : le menu à gauche (220 px), le contenu à droite." },
              { line: 10, text: "`grid-area` envoie l'élément dans la zone de ce nom." },
              { line: 14, text: "Autant de colonnes d'au moins 220 px que la largeur le permet." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              lang: 'css',
              prompt: "Dans une grille de 4 colonnes, que fait `grid-column: 1 / -1;` sur un élément ?",
              choices: [
                "Il occupe toute la largeur de la grille",
                "Il occupe uniquement la dernière colonne",
                "Il est retiré de la grille",
                "Il occupe la première colonne et décale les autres éléments vers la gauche"
              ],
              answer: 0,
              why: {
                1: "`-1` désigne la dernière ligne de séparation, pas la dernière colonne ; et l'élément part de la ligne 1.",
                2: "Une valeur négative compte depuis la fin : l'élément reste bien dans la grille.",
                3: "L'élément part de la ligne 1 et va jusqu'à la dernière : il couvre toutes les colonnes."
              },
              hint: "Les nombres désignent les lignes de séparation entre colonnes, et `-1` compte depuis la fin.",
              explain: "Une grille de 4 colonnes a 5 lignes de séparation, numérotées 1 à 5, ou -5 à -1 depuis la fin. `1 / -1` va de la première à la dernière : l'élément couvre toute la largeur, quel que soit le nombre de colonnes."
            },
            {
              type: 'fill',
              lang: 'css',
              prompt: "Complète : l'en-tête occupe toute la première ligne, et `main` se place dans la zone « contenu ».",
              code: `.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "entete ___"
    "menu   contenu";
}
main { ___: contenu; }`,
              blanks: [
                { answers: ['entete'],
                  why: { contenu: "La zone `contenu` couvrirait alors les deux lignes de la colonne de droite, et l'en-tête n'occuperait que la première colonne.", '.': "Un point laisse la cellule vide : l'en-tête n'occuperait que la première colonne." } },
                { answers: ['grid-area'], options: ['grid-area', 'grid-template-areas', 'area', 'grid-column'],
                  why: { 'grid-template-areas': "Cette propriété se place sur le conteneur pour dessiner la grille, pas sur un enfant.", area: "`area` n'existe pas en CSS.", 'grid-column': "`grid-column` attend des numéros de lignes ou `span`, pas un nom de zone seul." } }
              ],
              hint: "Pour qu'une zone couvre deux cellules, son nom doit apparaître deux fois.",
              explain: "Répéter `entete` sur les deux cellules de la première ligne crée une zone qui couvre toute la largeur. `grid-area: contenu` place `main` dans la zone du même nom."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Construis la structure du tableau de bord avec `grid-template-areas` :\n\n- 2 colonnes, `200px 1fr`, sans écart ;\n- ligne 1 : l'en-tête sur toute la largeur ;\n- ligne 2 : le menu, puis le contenu ;\n- ligne 3 : le pied de page sur toute la largeur.\n\nUtilise les noms de zones `entete`, `menu`, `contenu` et `pied`.",
            starter: `<style>
  .page { min-height: 300px; }
  /* ton CSS ici */
</style>
<div class="page">
  <header>Tableau de bord</header>
  <nav>Menu</nav>
  <main>Graphiques</main>
  <footer>Mis à jour il y a 5 min</footer>
</div>`,
            solution: `<style>
  .page {
    min-height: 300px;
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "entete entete"
      "menu contenu"
      "pied pied";
  }
  .page header { grid-area: entete; }
  .page nav { grid-area: menu; }
  .page main { grid-area: contenu; }
  .page footer { grid-area: pied; }
</style>
<div class="page">
  <header>Tableau de bord</header>
  <nav>Menu</nav>
  <main>Graphiques</main>
  <footer>Mis à jour il y a 5 min</footer>
</div>`,
            checks: [
              { sel: '.page', style: { display: 'grid', 'grid-template-columns': '200px 784px', 'grid-template-areas': '"entete entete" "menu contenu" "pied pied"' }, vw: 1000, label: "Une grille 200px 1fr dont les zones dessinent en-tête, menu + contenu, pied" },
              { sel: '.page > header', style: { 'grid-area': 'entete' }, label: "L'en-tête est dans la zone entete" },
              { sel: '.page > nav', style: { 'grid-area': 'menu' }, label: "Le menu est dans la zone menu" },
              { sel: '.page > main', style: { 'grid-area': 'contenu' }, label: "Le contenu est dans la zone contenu" },
              { sel: '.page > footer', style: { 'grid-area': 'pied' }, label: "Le pied de page est dans la zone pied" }
            ],
            hint: "Dessine d'abord les 3 lignes de 2 cellules, puis donne une zone à chacun des 4 enfants.",
            explain: "`grid-template-areas` décrit la page ligne par ligne ; répéter un nom fait couvrir plusieurs cellules à la zone. Chaque enfant rejoint sa zone avec `grid-area`, quel que soit son ordre dans le HTML."
          },
          recap: [
            "`grid-template-areas` dessine la grille avec des noms ; `grid-area` y place un enfant.",
            "Une zone est un rectangle ; toutes les lignes ont le même nombre de cellules.",
            "`grid-column: span 2` ou `1 / -1` étend un élément sur plusieurs colonnes.",
            "`repeat(auto-fit, minmax(220px, 1fr))` : une grille adaptative sans media query."
          ],
          check: {
            type: 'code',
            prompt: "Rends la galerie de projets adaptative, sans media query :\n\n- des colonnes d'au moins 200 px qui s'étirent pour remplir la ligne (`auto-fit` et `minmax`) ;\n- un écart de 16 px.\n\nRésultat attendu : une seule colonne sur un écran de 360 px, quatre sur un écran de 1 000 px.",
            starter: `<style>
  body { margin: 0; }
  .galerie { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
</style>
<section class="galerie">
  <article>Chatbot</article>
  <article>Météo</article>
  <article>Spam</article>
  <article>Films</article>
  <article>Traduction</article>
  <article>Vision</article>
  <article>Musique</article>
  <article>Quiz</article>
</section>`,
            solution: `<style>
  body { margin: 0; }
  .galerie {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
</style>
<section class="galerie">
  <article>Chatbot</article>
  <article>Météo</article>
  <article>Spam</article>
  <article>Films</article>
  <article>Traduction</article>
  <article>Vision</article>
  <article>Musique</article>
  <article>Quiz</article>
</section>`,
            checks: [
              { sel: '.galerie', style: { 'grid-template-columns': '360px' }, vw: 360, label: "Sur 360 px : une seule colonne" },
              { sel: '.galerie', style: { 'grid-template-columns': '238px 238px 238px 238px' }, vw: 1000, label: "Sur 1 000 px : quatre colonnes de 238 px" },
              { sel: '.galerie', style: { 'column-gap': '16px', 'row-gap': '16px' }, label: "16 px d'écart" }
            ],
            hint: "Remplace le nombre fixe de colonnes dans `repeat()` par un mot-clé, et la taille fixe par une taille minimale et maximale.",
            explain: "Sur 1 000 px, le navigateur place autant de colonnes de 200 px que possible avec les écarts : 4 (4 × 200 + 3 × 16 = 848 px). Il les étire ensuite à (1 000 − 48) / 4 = 238 px. Sur 360 px, une seule colonne tient, et elle prend toute la largeur."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- web.u11
    {
      id: 'web.u11',
      title: 'Responsive design',
      summary: "Adapter une page à toutes les tailles d'écran : unités relatives, clamp() et media queries.",
      lessons: [
        {
          id: 'web.u11.l1',
          title: 'Une page pour tous les écrans',
          minutes: 8,
          objective: "Tu sais adapter une page du mobile au grand écran avec des unités relatives, `clamp()` et des media queries écrites en mobile first.",
          explain:
            "Une page responsive s'adapte à la largeur de l'écran. Trois outils :\n\n" +
            "**Le viewport.** Sans `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`, un téléphone affiche la page comme sur un écran de 980 px, en tout petit.\n\n" +
            "**Les unités relatives.** `%` (de l'élément parent), `rem` (de la taille de base), `vw` (1 % de la largeur de l'écran), `ch` (largeur d'un caractère : `max-width: 65ch` garde des lignes lisibles). `img { max-width: 100%; height: auto; }` empêche une image de déborder. `clamp(min, idéal, max)` borne une valeur fluide : `font-size: clamp(1.5rem, 5vw, 3rem)` suit la largeur de l'écran sans descendre sous 1,5rem ni dépasser 3rem.\n\n" +
            "**Les media queries.** En **mobile first**, les styles de base visent le petit écran, puis `@media (min-width: 768px) { ... }` ajoute les changements pour les écrans d'au moins 768 px. Le CSS le plus simple sert au téléphone, souvent le moins puissant.\n\n" +
            "Teste avec le mode responsive des outils de développement (F12).",
          example: {
            code: `<style>
  img { max-width: 100%; height: auto; }
  h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
  .colonnes { display: flex; flex-direction: column; gap: 16px; }
  @media (min-width: 768px) {
    .colonnes { flex-direction: row; }
  }
</style>
<h1>Projets d'IA</h1>
<div class="colonnes">
  <article>Vision par ordinateur</article>
  <article>Traitement du langage</article>
</div>`,
            notes: [
              { line: 2, text: "Une image ne dépasse jamais la largeur de son conteneur." },
              { line: 3, text: "5 % de la largeur de l'écran, bornés entre 24 et 48 px (avec une base de 16 px)." },
              { line: 4, text: "Style de base, pour le mobile : les articles sont empilés." },
              { line: 5, text: "À partir de 768 px de large, les articles passent côte à côte." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              lang: 'css',
              prompt: "Ta feuille de style est écrite en mobile first. Quelle media query ajoute la mise en page sur deux colonnes pour les écrans larges ?",
              choices: [
                '`@media (min-width: 768px) { ... }`',
                '`@media (max-width: 768px) { ... }`',
                '`@media (width: 768px) { ... }`',
                '`@media (min-height: 768px) { ... }`'
              ],
              answer: 0,
              why: {
                1: "`max-width` vise les écrans de 768 px **ou moins** : c'est l'approche inverse (desktop first).",
                2: "Cette condition n'est vraie que pour une largeur d'exactement 768 px.",
                3: "C'est la hauteur de l'écran, pas sa largeur, qui serait testée."
              },
              hint: "En mobile first, on ajoute des styles quand l'écran devient plus large qu'un seuil.",
              explain: "En mobile first, la base vise le petit écran. `min-width: 768px` ajoute ensuite les styles pour les écrans d'au moins 768 px : les règles s'empilent du plus simple au plus riche."
            },
            {
              type: 'logic',
              lang: 'css',
              prompt: "La taille de base est de 16 px. Quelle taille de police, en pixels, donne `font-size: clamp(1rem, 4vw, 2rem)` sur un écran de 360 px de large ?",
              answer: '16',
              accept: ['16px', '16 px'],
              mistakes: [
                { answer: '14.4', why: "4vw vaut bien 14,4 px, mais c'est moins que le minimum de `1rem` (16 px) : `clamp` remonte la valeur au minimum." },
                { answer: '32', why: "32 px est le maximum (2rem), atteint seulement sur un écran d'au moins 800 px." }
              ],
              hint: "Calcule 4 % de 360, puis compare au minimum et au maximum.",
              explain: "4vw = 4 % de 360 = 14,4 px. C'est sous le minimum (1rem = 16 px), donc `clamp` renvoie 16 px. Le texte ne devient jamais illisible sur un petit écran."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Rends la page de projet responsive, en mobile first :\n\n- le `h1` utilise `clamp(1.5rem, 5vw, 3rem)` ;\n- `.colonnes` est en flex, **en colonne par défaut**, et passe en ligne à partir de 768 px de large ;\n- les images ne dépassent jamais leur conteneur (`max-width: 100%`).",
            starter: `<style>
  .colonnes { display: flex; flex-direction: row; gap: 24px; }
  /* ton CSS ici */
</style>
<h1>Assistant de révision</h1>
<div class="colonnes">
  <img src="capture.png" alt="Le chatbot propose un quiz de cinq questions">
  <p>Un assistant qui génère des quiz à partir de tes notes de cours.</p>
</div>`,
            solution: `<style>
  .colonnes { display: flex; flex-direction: column; gap: 24px; }
  @media (min-width: 768px) {
    .colonnes { flex-direction: row; }
  }
  h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
  img { max-width: 100%; height: auto; }
</style>
<h1>Assistant de révision</h1>
<div class="colonnes">
  <img src="capture.png" alt="Le chatbot propose un quiz de cinq questions">
  <p>Un assistant qui génère des quiz à partir de tes notes de cours.</p>
</div>`,
            checks: [
              { sel: 'h1', style: { 'font-size': '24px' }, vw: 360, label: "Sur 360 px, le titre est au minimum : 1.5rem = 24 px" },
              { sel: 'h1', style: { 'font-size': '48px' }, vw: 1000, label: "Sur 1 000 px, le titre est au maximum : 3rem = 48 px" },
              { sel: '.colonnes', style: { 'flex-direction': 'column' }, vw: 360, label: "Sur 360 px, les colonnes sont empilées" },
              { sel: '.colonnes', style: { 'flex-direction': 'row' }, vw: 1000, label: "Sur 1 000 px, les colonnes sont côte à côte" },
              { sel: 'img', style: { 'max-width': '100%' }, label: "Les images ne dépassent pas leur conteneur" }
            ],
            hint: "Le style de base doit être celui du téléphone ; la media query `min-width` ajoute le cas du grand écran.",
            explain: "La règle de base met `.colonnes` en colonne pour le mobile, et `@media (min-width: 768px)` la repasse en ligne sur les grands écrans. `clamp` borne le titre entre 24 et 48 px, et `max-width: 100%` protège la mise en page des grandes images."
          },
          recap: [
            "Sans balise viewport, le téléphone dézoome la page.",
            "Unités relatives : `%`, `rem`, `vw`, `ch` ; `clamp(min, idéal, max)` borne une valeur fluide.",
            "Mobile first : styles de base pour le mobile, puis `@media (min-width: ...)` pour les grands écrans.",
            "`img { max-width: 100%; height: auto; }` évite les débordements."
          ],
          check: {
            type: 'bug',
            lang: 'css',
            prompt: "Sur un grand écran, les colonnes restent empilées : la media query ne s'applique jamais. Clique sur la ligne fautive.",
            code: `.colonnes { display: flex; flex-direction: column; }

@media (min-width: 768) {
  .colonnes { flex-direction: row; }
}`,
            bugLine: 3,
            why: "Une longueur non nulle a toujours besoin d'une unité. `768` seul est invalide : la condition n'est jamais vraie et le bloc est ignoré.",
            fixes: [
              '@media (min-width: 768px) {',
              '@media (max-width: 768) {',
              '@media min-width: 768px {',
              '@media (min-width = 768px) {'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "L'unité manque toujours, et `max-width` inverserait la logique mobile first.",
              2: "Les parenthèses autour de la condition sont obligatoires.",
              3: "`min-width` s'écrit avec deux-points. (La syntaxe moderne `(width >= 768px)` existe aussi, mais sans le préfixe `min-`.)"
            },
            hint: "Regarde la valeur de la largeur : que lui manque-t-il ?",
            explain: "`(min-width: 768px)` est vraie pour les écrans d'au moins 768 px. Sans unité, le navigateur ignore la condition sans prévenir : l'inspecteur (F12) aide à repérer ces règles qui ne s'appliquent pas."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- web.u12
    {
      id: 'web.u12',
      title: 'Transitions et animations',
      summary: "Animer avec mesure, de façon fluide, et respecter le réglage « réduire les animations ».",
      lessons: [
        {
          id: 'web.u12.l1',
          title: 'Transitions et animations',
          minutes: 8,
          objective: "Tu sais animer un changement d'état avec une transition, créer une animation `@keyframes` et respecter `prefers-reduced-motion`.",
          explain:
            "Une **transition** anime le passage d'une valeur à une autre, par exemple au survol. Elle se déclare sur l'état **de base** de l'élément, pour jouer dans les deux sens : `transition: transform 200ms ease-out;` (propriété, durée, courbe). Liste les propriétés animées plutôt que `all`.\n\n" +
            "Anime de préférence `transform` (`translateY(-4px)`, `scale(1.05)`) et `opacity` : le navigateur les anime sans recalculer la mise en page, c'est fluide. Animer `width`, `top` ou `margin` coûte plus cher et décale les voisins.\n\n" +
            "Une **animation** joue seule, sans changement d'état : on décrit des étapes dans `@keyframes nom { from { ... } to { ... } }`, puis on l'applique avec `animation: nom 1s linear infinite;`.\n\n" +
            "Certaines personnes ont des vertiges ou des nausées face au mouvement et activent « réduire les animations » dans leur système. Respecte ce réglage : `@media (prefers-reduced-motion: reduce) { ... }` supprime ou adoucit les mouvements.",
          example: {
            code: `<style>
  .carte { transition: transform 200ms ease-out, box-shadow 200ms ease-out; }
  .carte:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgb(0 0 0 / 0.15); }
  .chargement { display: inline-block; animation: tourner 1s linear infinite; }
  @keyframes tourner {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .carte, .chargement { transition: none; animation: none; }
  }
</style>
<article class="carte">Détecteur de spam</article>
<p><span class="chargement">◌</span> Entraînement en cours…</p>`,
            notes: [
              { line: 2, text: "La transition est sur l'état de base : elle joue à l'arrivée et au départ de la souris." },
              { line: 3, text: "Au survol, la carte monte de 4 px : `transform` est fluide à animer." },
              { line: 4, text: "L'animation `tourner` dure 1 s, à vitesse constante, en boucle." },
              { line: 8, text: "Si l'utilisateur a demandé moins de mouvement, on coupe tout." }
            ]
          },
          exercises: [
            {
              type: 'fill',
              lang: 'css',
              prompt: "Complète : la carte s'élève en douceur au survol, et le mouvement est supprimé pour les personnes qui l'ont demandé.",
              code: `.carte {
  transition: ___ 200ms ease-out;
}
.carte:hover {
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: ___) {
  .carte { transition: none; }
}`,
              blanks: [
                { answers: ['transform'], options: ['transform', 'translateY', 'hover', 'position'],
                  why: { translateY: "`translateY()` est une valeur de `transform` ; la transition attend le nom de la propriété.", hover: "`hover` est un état (pseudo-classe), pas une propriété.", position: "C'est `transform` qui change au survol, pas `position`." } },
                { answers: ['reduce'], options: ['reduce', 'no-preference', 'none', 'true'],
                  why: { 'no-preference': "`no-preference` vise les personnes qui n'ont rien demandé : tu supprimerais l'animation pour elles.", none: "`none` n'est pas une valeur de `prefers-reduced-motion`.", true: "La media query attend `reduce` ou `no-preference`." } }
              ],
              hint: "La transition nomme la propriété qui change entre les deux états.",
              explain: "`transition: transform 200ms ease-out` anime le changement de `transform` dans les deux sens. Sous `prefers-reduced-motion: reduce`, la transition est retirée : la carte change de position sans mouvement."
            },
            {
              type: 'bug',
              lang: 'css',
              prompt: "La notification devrait apparaître en fondu en montant légèrement, mais elle s'affiche d'un coup. Clique sur la ligne fautive.",
              code: `.notification {
  animation: apparition 400 ease-out;
}

@keyframes apparition {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`,
              bugLine: 2,
              why: "Une durée a besoin d'une unité (`ms` ou `s`). Avec `400` seul, toute la déclaration `animation` est invalide et ignorée.",
              fixes: [
                '  animation: apparition 400ms ease-out;',
                '  animation: apparition ease-out;',
                '  transition: apparition 400ms ease-out;',
                '  animation-name: apparition 400ms;'
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Sans durée, l'animation dure 0 s par défaut : elle ne se voit pas.",
                2: "`transition` attend une propriété CSS, pas le nom d'une animation `@keyframes`.",
                3: "`animation-name` n'accepte que le nom : la durée rend la déclaration invalide."
              },
              hint: "Compare chaque valeur de la ligne `animation` avec l'exemple de la leçon.",
              explain: "`animation: apparition 400ms ease-out` : nom, durée avec unité, courbe. Le navigateur ignore sans prévenir une déclaration invalide, d'où l'intérêt de l'inspecteur, qui la montre barrée."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Ajoute deux effets, sans toucher au HTML :\n\n- `.carte` a une transition sur `transform` de 200 ms avec la courbe `ease-out`, et s'élève de 4 px au survol ;\n- `.chargement` joue en boucle infinie l'animation `tourner` (1 s, courbe `linear`), que tu définis avec `@keyframes` pour faire un tour complet.",
            starter: `<style>
  .carte { padding: 16px; border: 1px solid #cbd5e1; border-radius: 12px; }
  .chargement { display: inline-block; }
  /* ton CSS ici */
</style>
<article class="carte">Modèle de recommandation</article>
<p><span class="chargement">◌</span> Entraînement en cours…</p>`,
            solution: `<style>
  .carte { padding: 16px; border: 1px solid #cbd5e1; border-radius: 12px; }
  .chargement { display: inline-block; }
  .carte { transition: transform 200ms ease-out; }
  .carte:hover { transform: translateY(-4px); }
  .chargement { animation: tourner 1s linear infinite; }
  @keyframes tourner {
    to { transform: rotate(360deg); }
  }
</style>
<article class="carte">Modèle de recommandation</article>
<p><span class="chargement">◌</span> Entraînement en cours…</p>`,
            checks: [
              { sel: '.carte', style: { 'transition-property': 'transform' }, label: "La transition porte sur transform" },
              { sel: '.carte', style: { 'transition-duration': '0.2s', 'transition-timing-function': 'ease-out' }, label: "Elle dure 200 ms avec la courbe ease-out" },
              { sel: '.chargement', style: { 'animation-name': 'tourner', 'animation-duration': '1s' }, label: "L'animation tourner dure 1 s" },
              { sel: '.chargement', style: { 'animation-iteration-count': 'infinite', 'animation-timing-function': 'linear' }, label: "Elle tourne en boucle, à vitesse constante" }
            ],
            hint: "La transition se déclare sur `.carte` (pas sur `:hover`) ; l'animation a besoin d'un bloc `@keyframes` à son nom.",
            explain: "La transition, posée sur l'état de base, anime `transform` à l'aller comme au retour. `@keyframes tourner` décrit la rotation complète, et `animation: tourner 1s linear infinite` la répète à vitesse constante. Le survol ne peut pas être vérifié automatiquement : teste-le avec ta souris."
          },
          recap: [
            "`transition: propriété durée courbe` se place sur l'état de base.",
            "Anime `transform` et `opacity` : c'est fluide et sans effet sur la mise en page.",
            "`@keyframes nom` décrit les étapes, `animation: nom durée courbe répétitions` les joue.",
            "`@media (prefers-reduced-motion: reduce)` supprime ou adoucit le mouvement."
          ],
          check: {
            type: 'qcm',
            lang: 'css',
            prompt: "Une carte doit s'élever légèrement au survol, avec un mouvement doux à l'aller comme au retour. Quelle solution est la meilleure ?",
            choices: [
              '`.carte { transition: transform 200ms; }` et `.carte:hover { transform: translateY(-4px); }`',
              '`.carte:hover { transition: transform 200ms; transform: translateY(-4px); }`',
              '`.carte { transition: margin-top 200ms; }` et `.carte:hover { margin-top: -4px; }`',
              '`.carte { animation: monter 200ms; }` avec `@keyframes monter { to { transform: translateY(-4px); } }`'
            ],
            answer: 0,
            why: {
              1: "La transition n'existe qu'à l'état survolé : la carte monte en douceur, mais redescend d'un coup quand la souris part.",
              2: "Animer `margin-top` recalcule la mise en page à chaque image et décale les éléments voisins : moins fluide.",
              3: "Une animation joue une fois au chargement de la page, pas au survol, et la carte revient ensuite à sa place."
            },
            hint: "Où placer la transition pour qu'elle joue dans les deux sens ?",
            explain: "La transition sur l'état de base s'applique à l'aller et au retour, et `transform` s'anime sans recalculer la mise en page. Ajoute ensuite une règle `prefers-reduced-motion` pour les personnes sensibles au mouvement."
          }
        }
      ]
    }
  ]
});
