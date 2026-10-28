// Parcours HTML et CSS, chapitre 2 : Mettre en forme (web.u6 à web.u8).
CQ.addChapter('web', {
  id: 'web.c2',
  title: 'Mettre en forme',
  units: [
    // ---------------------------------------------------------------- web.u6
    {
      id: 'web.u6',
      title: 'Sélecteurs CSS',
      summary: "Cibler précisément les éléments à styliser et comprendre quelle règle l'emporte.",
      lessons: [
        {
          id: 'web.u6.l1',
          title: 'Cibler les bons éléments',
          minutes: 8,
          objective: "Tu sais écrire des sélecteurs CSS précis et prévoir quelle règle s'applique en cas de conflit.",
          explain:
            "Une règle CSS associe un **sélecteur** à des **déclarations** : `h1 { color: navy; }`. Le CSS se place dans `<style>` (dans `<head>`) ou dans un fichier relié par `<link rel=\"stylesheet\" href=\"style.css\">`.\n\n" +
            "Les sélecteurs essentiels :\n" +
            "- `p` (balise), `.carte` (classe, réutilisable), `#contact` (id, unique dans la page) ;\n" +
            "- `.carte h2` : un `h2` **n'importe où** dans `.carte` ; `.carte > h2` : un enfant **direct** ;\n" +
            "- `h1, h2` : un groupe ; `.carte.promo` : un élément qui a les **deux** classes ;\n" +
            "- `input[type=\"email\"]` : selon un attribut ; `a:hover`, `li:first-child`, `li:nth-child(2)` : pseudo-classes (état ou position). `nth-child` compte à partir de 1.\n\n" +
            "Si deux règles se contredisent, la plus **spécifique** gagne : id > classe (ou attribut, pseudo-classe) > balise. À spécificité égale, la dernière écrite gagne. Préfère les classes, faciles à réutiliser et à surcharger, et évite `!important`, qui casse cette logique.",
          example: {
            code: `<style>
  .carte { padding: 16px; border: 1px solid #d0d7de; }
  .carte > h2 { font-size: 1.25rem; }
  .carte.promo { border-color: #d97706; }
  .tags li:first-child { font-weight: bold; }
  a:hover { text-decoration: underline; }
</style>
<article class="carte promo">
  <h2>Clavier mécanique</h2>
  <ul class="tags"><li>Nouveau</li><li>Sans fil</li></ul>
  <a href="/produits/clavier">Voir le produit</a>
</article>`,
            notes: [
              { line: 3, text: "`>` : seulement les `h2` enfants directs de `.carte`." },
              { line: 4, text: "Pas d'espace entre `.carte` et `.promo` : l'élément doit avoir les deux classes." },
              { line: 5, text: "Seul le premier `li` de chaque liste `.tags` passe en gras." },
              { line: 8, text: "Un élément peut porter plusieurs classes, séparées par des espaces." }
            ]
          },
          exercises: [
            {
              type: 'qcm',
              prompt: "De quelle couleur s'affiche le prix ?",
              code: `<style>
  #prix { color: green; }
  .prix { color: red; }
  p { color: blue; }
</style>
<p id="prix" class="prix">49 €</p>`,
              choices: ['Vert', 'Rouge', 'Bleu', 'Noir'],
              answer: 0,
              why: {
                1: "La règle `.prix` est écrite après `#prix`, mais l'ordre ne départage que des sélecteurs de même spécificité. Un id est plus spécifique qu'une classe.",
                2: "Un sélecteur de balise est le moins spécifique des trois : il perd contre la classe et contre l'id.",
                3: "Les trois règles ciblent bien ce paragraphe : la couleur par défaut est remplacée."
              },
              hint: "Classe les trois sélecteurs du plus spécifique au moins spécifique.",
              explain: "Les trois règles s'appliquent au paragraphe et se contredisent. La plus spécifique gagne : l'id `#prix`, quel que soit l'ordre d'écriture. C'est pour cela qu'on évite les id en CSS : ils deviennent difficiles à surcharger."
            },
            {
              type: 'predict',
              prompt: "Quel texte s'affiche en gras ? Réponds avec le texte exact de l'élément.",
              code: `<style>
  .tags li:nth-child(2) { font-weight: 700; }
</style>
<ul class="tags">
  <li>Nouveau</li>
  <li>Sans fil</li>
  <li>Garantie 2 ans</li>
</ul>`,
              answer: 'Sans fil',
              accept: ['sans fil', '« Sans fil »', '"Sans fil"'],
              mistakes: [
                { answer: 'Garantie 2 ans', why: "En Python, l'indice 2 désigne le troisième élément. En CSS, `nth-child` compte à partir de 1 : `nth-child(2)` est le deuxième." },
                { answer: 'Nouveau', why: "`Nouveau` est le premier enfant, `:nth-child(1)` ou `:first-child`." }
              ],
              hint: "Attention : en CSS, le premier enfant porte le numéro 1.",
              explain: "`:nth-child(2)` cible l'élément qui est le deuxième enfant de son parent. Contrairement aux indices Python, le comptage commence à 1."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Sans toucher au HTML, écris le CSS :\n\n- les titres `h2` **des cartes** en `#1e3a8a` (le titre « Autres produits », hors des cartes, ne change pas) ;\n- la carte qui a aussi la classe `promo` a une bordure de `3px` ;\n- seul le **premier** tag de chaque liste `.tags` est en gras (`font-weight: 700`).",
            starter: `<style>
  body { color: #1f2937; }
  .carte { border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 12px; }
  /* ton CSS ici */
</style>
<article class="carte">
  <h2>Casque audio</h2>
  <ul class="tags"><li>Bluetooth</li><li>Réduction de bruit</li></ul>
</article>
<article class="carte promo">
  <h2>Clavier mécanique</h2>
  <ul class="tags"><li>-20 %</li><li>Sans fil</li></ul>
</article>
<h2>Autres produits</h2>`,
            solution: `<style>
  body { color: #1f2937; }
  .carte { border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 12px; }
  .carte h2 { color: #1e3a8a; }
  .carte.promo { border-width: 3px; }
  .tags li:first-child { font-weight: 700; }
</style>
<article class="carte">
  <h2>Casque audio</h2>
  <ul class="tags"><li>Bluetooth</li><li>Réduction de bruit</li></ul>
</article>
<article class="carte promo">
  <h2>Clavier mécanique</h2>
  <ul class="tags"><li>-20 %</li><li>Sans fil</li></ul>
</article>
<h2>Autres produits</h2>`,
            checks: [
              { sel: '.carte h2', style: { color: 'rgb(30, 58, 138)' }, label: "Les titres des cartes sont en #1e3a8a" },
              { sel: 'body > h2', style: { color: 'rgb(31, 41, 55)' }, label: "Le titre « Autres produits » garde la couleur du texte de la page" },
              { sel: '.carte.promo', style: { 'border-top-width': '3px' }, label: "La carte promo a une bordure de 3px" },
              { sel: '.tags li:first-child', style: { 'font-weight': '700' }, label: "Le premier tag de chaque liste est en gras" },
              { sel: '.tags li:nth-child(2)', style: { 'font-weight': '400' }, label: "Les autres tags restent en graisse normale" }
            ],
            hint: "Combine les sélecteurs vus dans la leçon : descendant, double classe, pseudo-classe de position.",
            explain: "`.carte h2` ne vise que les titres situés dans une carte. `.carte.promo` exige les deux classes sur le même élément. `.tags li:first-child` cible le premier `li` de chaque liste, sans toucher aux suivants."
          },
          recap: [
            "Une règle = sélecteur + déclarations `propriété: valeur;`.",
            "Espace = descendant, `>` = enfant direct, `.a.b` = les deux classes, `a, b` = groupe.",
            "Spécificité : id > classe, attribut, pseudo-classe > balise ; à égalité, la dernière règle gagne.",
            "`:nth-child()` compte à partir de 1 ; préfère les classes aux id pour styliser."
          ],
          check: {
            type: 'logic',
            prompt: "Combien de liens sont ciblés par le sélecteur `.menu > a` ?",
            code: `<nav class="menu">
  <a href="/">Accueil</a>
  <a href="/projets">Projets</a>
  <div class="sous-menu">
    <a href="/projets/ia">IA</a>
    <a href="/projets/web">Web</a>
  </div>
  <a href="/contact">Contact</a>
</nav>`,
            answer: '3',
            accept: ['trois'],
            mistakes: [
              { answer: '5', why: "Tu as compté tous les liens descendants : c'est ce que ferait `.menu a` (avec un espace). `>` ne garde que les enfants directs." },
              { answer: '2', why: "Le lien « Contact » est aussi un enfant direct de `.menu`, même s'il vient après la `div`." }
            ],
            hint: "Ne compte que les liens dont le parent immédiat est la `nav`.",
            explain: "Les liens Accueil, Projets et Contact sont des enfants directs de `.menu`. IA et Web sont dans `.sous-menu` : ce sont des descendants, mais pas des enfants directs. Réponse : 3."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- web.u7
    {
      id: 'web.u7',
      title: 'Couleurs et typographie',
      summary: "Définir une palette avec des variables CSS et régler un texte lisible.",
      lessons: [
        {
          id: 'web.u7.l1',
          title: 'Couleurs, polices et variables',
          minutes: 7,
          objective: "Tu sais définir une palette avec des variables CSS et régler une typographie lisible.",
          explain:
            "Une couleur s'écrit de plusieurs façons : nom (`white`), hexadécimal (`#2563eb`), `rgb(37 99 235)` ou `hsl(221 83% 53%)`. `color` colore le texte, `background-color` le fond.\n\n" +
            "Plutôt que de répéter la même valeur partout, déclare des **variables CSS** (propriétés personnalisées, leur nom commence par `--`) dans `:root`, puis lis-les avec `var()` : `:root { --accent: #2563eb; }` puis `color: var(--accent);`. Changer de thème revient à modifier une ligne.\n\n" +
            "Pour le texte :\n" +
            "- `font-family` liste des polices de secours, jusqu'à une famille générique : `system-ui, sans-serif` ;\n" +
            "- `font-size` en `rem` : `1rem` vaut la taille de base du navigateur (16 px par défaut), que l'utilisateur peut agrandir ;\n" +
            "- `font-weight` : 400 normal, 700 gras ;\n" +
            "- `line-height: 1.5`, sans unité, s'adapte à chaque taille de texte.\n\n" +
            "`color` et les propriétés de police sont **héritées** : réglées sur `body`, elles s'appliquent à toute la page.",
          example: {
            code: `<style>
  :root {
    --accent: #2563eb;
    --texte: #1f2937;
  }
  body {
    font-family: system-ui, sans-serif;
    color: var(--texte);
    line-height: 1.5;
  }
  h1 { font-size: 2rem; color: var(--accent); }
  .badge { background-color: var(--accent); color: white; font-weight: 700; }
</style>
<h1>Tableau de bord</h1>
<span class="badge">En ligne</span>`,
            notes: [
              { line: 3, text: "Une variable CSS : son nom commence par deux tirets." },
              { line: 7, text: "Si la police système n'existe pas, le navigateur prend une police sans empattements." },
              { line: 9, text: "Interligne de 1,5 fois la taille du texte : plus confortable à lire." },
              { line: 11, text: "`2rem` = deux fois la taille de base, soit 32 px par défaut." }
            ]
          },
          exercises: [
            {
              type: 'fill',
              lang: 'css',
              prompt: "Complète : le bouton a pour fond la couleur d'accent, une police de secours générique sans empattements, et un texte en gras.",
              code: `:root {
  --accent: #7c3aed;
}
.bouton {
  background-color: ___(--accent);
  font-family: Inter, system-ui, ___;
  font-weight: ___;
}`,
              blanks: [
                { answers: ['var'], options: ['var', 'get', 'use', 'calc'],
                  why: { get: "`get()` n'existe pas en CSS.", use: "`use()` n'existe pas en CSS.", calc: "`calc()` fait des calculs, il ne lit pas une variable." } },
                { answers: ['sans-serif'], options: ['sans-serif', 'serif', 'Arial.ttf', 'default'],
                  why: { serif: "`serif` désigne une police avec empattements, comme Times.", 'Arial.ttf': "On donne un nom de famille de police, pas un nom de fichier.", default: "`default` n'est pas une famille générique." } },
                { answers: ['700'], options: ['700', '400', 'heavy', '2'],
                  why: { '400': "400 est la graisse normale.", heavy: "`heavy` n'est pas une valeur valide ; on utilise un nombre ou `bold`.", '2': "Les graisses vont de 100 à 900 par centaines." } }
              ],
              hint: "Une variable se lit avec une fonction CSS de trois lettres.",
              explain: "`var(--accent)` lit la variable déclarée dans `:root`. La liste de polices se termine par une famille générique (`sans-serif`), toujours disponible. `700` correspond à `bold`."
            },
            {
              type: 'logic',
              prompt: "Une personne qui voit mal a réglé la taille de texte de son navigateur à 20 px au lieu de 16 px. Quelle taille, en pixels, a pour elle un titre en `font-size: 1.5rem` ?",
              answer: '30',
              accept: ['30px', '30 px'],
              mistakes: [
                { answer: '24', why: "24 px correspond à la taille de base par défaut (16 × 1,5). Ici, la base vaut 20 px." },
                { answer: '1.5', why: "`1.5rem` est la valeur écrite ; en pixels, on la multiplie par la taille de base." }
              ],
              hint: "`1rem` vaut la taille de base choisie par l'utilisateur.",
              explain: "`1rem` = 20 px pour cette personne, donc `1.5rem` = 30 px. Avec des tailles en `rem`, toute la page grandit avec son réglage ; avec des `px` fixes, rien ne bougerait."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Mets en place le thème du tableau de bord :\n\n- déclare `--accent: #0f766e` et `--fond: #f0fdfa` dans `:root` ;\n- `body` a pour fond `--fond`, la police `system-ui, sans-serif` et un interligne de `1.5` ;\n- le `h1` est de la couleur `--accent` ;\n- `.badge` a pour fond `--accent`, un texte blanc et en gras (`700`).",
            starter: `<style>
  body { font-family: Times; }
  /* ton CSS ici */
</style>
<h1>Suivi des entraînements</h1>
<p>Dernier modèle : <span class="badge">validé</span></p>`,
            solution: `<style>
  :root {
    --accent: #0f766e;
    --fond: #f0fdfa;
  }
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    background-color: var(--fond);
  }
  h1 { color: var(--accent); }
  .badge { background-color: var(--accent); color: white; font-weight: 700; }
</style>
<h1>Suivi des entraînements</h1>
<p>Dernier modèle : <span class="badge">validé</span></p>`,
            checks: [
              { sel: 'html', style: { '--accent': '#0f766e', '--fond': '#f0fdfa' }, label: "Les variables --accent et --fond sont déclarées dans :root" },
              { sel: 'body', style: { 'background-color': 'rgb(240, 253, 250)' }, label: "Le fond de la page est --fond" },
              { sel: 'body', style: { 'font-family': 'system-ui, sans-serif', 'line-height': '24px' }, label: "Police system-ui, sans-serif et interligne 1.5" },
              { sel: 'h1', style: { color: 'rgb(15, 118, 110)' }, label: "Le titre est de la couleur --accent" },
              { sel: '.badge', style: { 'background-color': 'rgb(15, 118, 110)', color: 'rgb(255, 255, 255)', 'font-weight': '700' }, label: "Le badge : fond --accent, texte blanc en gras" }
            ],
            hint: "Commence par le bloc `:root`, puis utilise `var(--nom)` partout où la couleur revient.",
            explain: "Les deux couleurs du thème sont déclarées une seule fois dans `:root` et lues avec `var()`. La police et l'interligne réglés sur `body` sont hérités par tout le texte. L'interligne `1.5` donne ici 24 px, car le texte fait 16 px."
          },
          recap: [
            "Couleurs : nom, `#hex`, `rgb()`, `hsl()` ; `color` pour le texte, `background-color` pour le fond.",
            "Variables : `--nom: valeur;` dans `:root`, lues avec `var(--nom)`.",
            "Tailles de texte en `rem` : elles respectent le réglage de l'utilisateur.",
            "Une pile de polices finit par une famille générique ; `line-height` sans unité."
          ],
          check: {
            type: 'bug',
            lang: 'css',
            prompt: "Les liens de projet devraient prendre la couleur d'accent, mais ils gardent la couleur par défaut. Clique sur la ligne fautive.",
            code: `:root {
  --accent: #2563eb;
}
.lien-projet {
  color: var(accent);
  font-weight: 700;
}`,
            bugLine: 5,
            why: "Le nom d'une variable CSS commence par `--`, y compris quand on la lit : `var(accent)` est invalide, donc la déclaration est ignorée.",
            fixes: [
              '  color: var(--accent);',
              '  color: --accent;',
              '  color: $accent;',
              '  color: var("--accent");'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "Écrire le nom seul ne lit pas la variable : il faut passer par `var()`.",
              2: "`$accent` est la syntaxe de Sass, un outil à part ; le CSS ne la comprend pas.",
              3: "Le nom de la variable s'écrit sans guillemets dans `var()`."
            },
            hint: "Compare le nom déclaré dans `:root` et le nom utilisé.",
            explain: "On déclare `--accent: ...;` et on lit `var(--accent)`, avec le même nom complet. Quand une déclaration est invalide, le navigateur l'ignore sans message : c'est l'inspecteur (F12) qui la montre barrée."
          }
        }
      ]
    },
    // ---------------------------------------------------------------- web.u8
    {
      id: 'web.u8',
      title: 'Marges et espacements',
      summary: "Le modèle de boîte : contenu, padding, bordure, marge et box-sizing.",
      lessons: [
        {
          id: 'web.u8.l1',
          title: 'Le modèle de boîte',
          minutes: 8,
          objective: "Tu sais calculer la taille réelle d'une boîte et régler marges, espacements et `box-sizing`.",
          explain:
            "En CSS, chaque élément est une **boîte** composée, de l'intérieur vers l'extérieur, de :\n" +
            "- `content` : le contenu ;\n" +
            "- `padding` : l'espace intérieur, qui prend le fond de l'élément ;\n" +
            "- `border` : la bordure ;\n" +
            "- `margin` : l'espace extérieur, transparent, qui éloigne les voisins.\n\n" +
            "Par défaut (`box-sizing: content-box`), `width` ne règle que le contenu : une boîte `width: 300px` avec `padding: 20px` et une bordure de 2 px occupe 300 + 2 × 20 + 2 × 2 = 344 px. Avec `box-sizing: border-box`, `width` inclut padding et bordure. C'est plus prévisible, d'où la règle placée en tête de presque tous les projets : `*, *::before, *::after { box-sizing: border-box; }`.\n\n" +
            "Les raccourcis tournent dans le sens des aiguilles d'une montre : `margin: 8px 16px 24px 0` (haut, droite, bas, gauche) ; `padding: 8px 16px` (haut et bas, puis gauche et droite). Pour centrer un bloc : `max-width: 640px; margin: 0 auto;`.\n\n" +
            "Entre deux blocs l'un au-dessus de l'autre, les marges verticales ne s'additionnent pas : la plus grande l'emporte (fusion des marges).",
          example: {
            code: `<style>
  *, *::before, *::after { box-sizing: border-box; }
  .carte {
    max-width: 360px;
    margin: 0 auto;
    padding: 16px 24px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
  }
</style>
<article class="carte">
  <h2>Écouteurs sans fil</h2>
  <p>Autonomie : 30 heures.</p>
</article>`,
            notes: [
              { line: 2, text: "Toutes les boîtes incluent padding et bordure dans leur largeur." },
              { line: 5, text: "0 en haut et en bas, `auto` à gauche et à droite : le bloc est centré." },
              { line: 6, text: "16 px en haut et en bas, 24 px à gauche et à droite." },
              { line: 8, text: "`border-radius` arrondit les coins, sans changer la taille de la boîte." }
            ]
          },
          exercises: [
            {
              type: 'logic',
              lang: 'css',
              prompt: "Avec le `box-sizing` par défaut (`content-box`), quelle largeur totale, en pixels, occupe cette boîte à l'écran, bordure comprise mais marges non comprises ?",
              code: `.panneau {
  width: 300px;
  padding: 20px;
  border: 2px solid #94a3b8;
  margin: 10px;
}`,
              answer: '344',
              accept: ['344px', '344 px'],
              mistakes: [
                { answer: '300', why: "Ce serait le cas avec `box-sizing: border-box`. En `content-box`, `width` ne compte que le contenu." },
                { answer: '322', why: "Le padding et la bordure s'appliquent des deux côtés : 2 × 20 et 2 × 2." },
                { answer: '364', why: "Tu as ajouté les marges, que la question exclut : elles sont à l'extérieur de la bordure." }
              ],
              hint: "Additionne le contenu, puis le padding et la bordure à gauche et à droite.",
              explain: "300 (contenu) + 2 × 20 (padding) + 2 × 2 (bordure) = 344 px. La marge de 10 px éloigne ensuite les voisins, mais ne fait pas partie de la boîte visible."
            },
            {
              type: 'qcm',
              lang: 'css',
              prompt: "Que règle la déclaration `padding: 8px 16px;` ?",
              choices: [
                "8 px en haut et en bas, 16 px à gauche et à droite",
                "8 px à gauche et à droite, 16 px en haut et en bas",
                "8 px en haut, 16 px en bas, rien sur les côtés",
                "8 px à l'intérieur et 16 px à l'extérieur de la bordure"
              ],
              answer: 0,
              why: {
                1: "C'est l'inverse : avec deux valeurs, la première est verticale (haut et bas).",
                2: "Avec deux valeurs, les quatre côtés sont réglés : la seconde valeur vaut pour la gauche et la droite.",
                3: "`padding` est entièrement à l'intérieur de la bordure ; l'extérieur, c'est `margin`."
              },
              hint: "Les raccourcis commencent toujours par le haut.",
              explain: "Avec deux valeurs, la première règle le haut et le bas, la seconde la gauche et la droite. C'est le réglage classique d'un bouton : un peu d'air vertical, plus d'air horizontal."
            }
          ],
          challenge: {
            type: 'code',
            prompt: "Règle la carte produit :\n\n- elle fait exactement 320 px de large **bordure comprise** ;\n- 24 px d'espace intérieur sur tous les côtés ;\n- une bordure de 2 px ;\n- elle est centrée horizontalement dans la page.",
            starter: `<style>
  body { margin: 0; }
  .carte {
    width: 320px;
    padding: 10px;
    border: 1px solid #0f766e;
  }
</style>
<article class="carte">
  <h2>Montre connectée</h2>
  <p>Suivi du sommeil et du rythme cardiaque.</p>
</article>`,
            solution: `<style>
  body { margin: 0; }
  .carte {
    box-sizing: border-box;
    width: 320px;
    margin: 0 auto;
    padding: 24px;
    border: 2px solid #0f766e;
  }
</style>
<article class="carte">
  <h2>Montre connectée</h2>
  <p>Suivi du sommeil et du rythme cardiaque.</p>
</article>`,
            checks: [
              { sel: '.carte', style: { 'box-sizing': 'border-box', width: '320px' }, label: "320 px de large, padding et bordure compris (border-box)" },
              { sel: '.carte', style: { 'padding-top': '24px', 'padding-right': '24px', 'padding-bottom': '24px', 'padding-left': '24px' }, label: "24 px d'espace intérieur sur les 4 côtés" },
              { sel: '.carte', style: { 'border-top-width': '2px', 'border-left-width': '2px' }, label: "Une bordure de 2 px" },
              { sel: '.carte', style: { 'margin-left': '340px', 'margin-right': '340px' }, vw: 1000, label: "Centrée : sur un écran de 1 000 px, 340 px de marge de chaque côté" }
            ],
            hint: "Trois propriétés sont à modifier, une est à ajouter pour la largeur et une pour le centrage.",
            explain: "`box-sizing: border-box` fait entrer padding et bordure dans les 320 px. `margin: 0 auto` répartit l'espace libre à parts égales à gauche et à droite : (1 000 − 320) / 2 = 340 px sur un écran de 1 000 px."
          },
          recap: [
            "Une boîte = contenu + padding + bordure + marge.",
            "`box-sizing: border-box` : `width` inclut padding et bordure.",
            "Raccourcis : 1 valeur (tous les côtés), 2 (vertical, horizontal), 4 (haut, droite, bas, gauche).",
            "`max-width` + `margin: 0 auto` centre un bloc ; les marges verticales voisines fusionnent."
          ],
          check: {
            type: 'bug',
            lang: 'css',
            prompt: "Ce conteneur devrait être centré horizontalement dans la page, mais il reste collé à gauche. Clique sur la ligne fautive.",
            code: `.conteneur {
  max-width: 720px;
  margin: auto 0;
  padding: 0 16px;
}`,
            bugLine: 3,
            why: "Avec deux valeurs, la première vaut pour le haut et le bas, la seconde pour la gauche et la droite. `auto 0` met donc 0 à gauche et à droite : rien ne centre le bloc.",
            fixes: [
              '  margin: 0 auto;',
              '  padding: 0 auto;',
              '  margin: auto 0 auto 0;',
              '  text-align: center;'
            ],
            fixAnswer: 0,
            fixWhy: {
              1: "`padding` n'accepte pas `auto` : la déclaration serait ignorée, et aucune marge automatique ne centrerait le bloc.",
              2: "C'est exactement la même chose que `auto 0` : haut et bas automatiques, gauche et droite à 0.",
              3: "`text-align` centre le texte à l'intérieur du bloc, pas le bloc lui-même."
            },
            hint: "Dans un raccourci à deux valeurs, laquelle règle la gauche et la droite ?",
            explain: "`margin: 0 auto` met des marges automatiques à gauche et à droite : le navigateur partage l'espace libre en deux, ce qui centre un bloc qui a une largeur maximale."
          }
        }
      ]
    }
  ]
});
