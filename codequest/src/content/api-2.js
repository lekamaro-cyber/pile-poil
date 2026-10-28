// CodeQuest — parcours « Back-end et API », chapitre 2 : construire une API.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  CQ.addChapter('api', {
    id: 'api.c2',
    title: 'Construire une API',
    units: [
      // ------------------------------------------------------------------ api.u5
      {
        id: 'api.u5',
        title: 'API REST',
        summary: "Organiser une API autour de ressources, de verbes HTTP et de codes de statut cohérents.",
        lessons: [
          {
            id: 'api.u5.l1',
            title: 'Ressources, URL et verbes',
            minutes: 7,
            objective: "Tu sais concevoir les routes REST d'une ressource : des noms au pluriel dans l'URL et le bon verbe HTTP pour chaque action.",
            explain: P(
              "**REST** organise une API autour de **ressources** (livres, utilisateurs, commandes). L'URL désigne la ressource avec un nom, le **verbe HTTP** dit l'action :",
              "- `GET /livres` liste, `GET /livres/42` lit un livre ;\n- `POST /livres` crée (le serveur choisit l'identifiant) ;\n- `PUT /livres/42` remplace tout le livre, `PATCH /livres/42` modifie certains champs ;\n- `DELETE /livres/42` supprime.",
              "Les relations s'expriment par l'imbrication (`GET /auteurs/3/livres`) ; les filtres, le tri et la pagination passent dans la query string (`GET /livres?auteur=3&tri=titre`).",
              "À éviter : des verbes dans l'URL (`/getLivres`, `/supprimerLivre?id=42`), et surtout `GET` pour modifier des données : un robot qui suit les liens, ou un navigateur qui précharge une page, déclencherait la modification.",
              "Chaque requête est **sans état** : elle porte tout ce qu'il faut (identifiants, jeton), le serveur ne se souvient pas de la précédente."
            ),
            example: {
              run: false,
              code: `// Une ressource « livres », cinq actions
app.get('/livres', listerLivres);            // GET    /livres?auteur=3
app.post('/livres', creerLivre);             // POST   /livres      corps : { titre, auteurId }
app.get('/livres/:id', lireLivre);           // GET    /livres/42
app.patch('/livres/:id', modifierLivre);     // PATCH  /livres/42   corps : { titre }
app.delete('/livres/:id', supprimerLivre);   // DELETE /livres/42

// Ressource imbriquée : les livres d'un auteur
app.get('/auteurs/:id/livres', livresDeLAuteur);`,
              notes: [
                { line: 2, text: "La collection : le même chemin sert à lister (`GET`) et à créer (`POST`)." },
                { line: 4, text: "Un élément précis : l'identifiant est dans le chemin." },
                { line: 5, text: "`PATCH` ne modifie que les champs envoyés ; `PUT` remplacerait tout le livre." },
                { line: 9, text: "La relation se lit dans l'URL : les livres de l'auteur `:id`." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Quelle requête suit les principes REST pour **marquer la commande 18 comme expédiée** ?",
                choices: [
                  "`GET /commandes/18/expedier`",
                  "`POST /expedierCommande?id=18`",
                  "`PATCH /commandes/18` avec le corps `{ \"statut\": \"expediee\" }`",
                  "`PUT /commandes` avec le corps `{ \"id\": 18, \"statut\": \"expediee\" }`"
                ],
                answer: 2,
                why: {
                  0: "`GET` doit seulement lire. Un lien préchargé ou un robot d'indexation expédierait la commande sans le vouloir.",
                  1: "L'URL contient un verbe (`expedier`) et l'identifiant passe en query string : l'action devrait être portée par la méthode HTTP, la ressource par le chemin.",
                  3: "`PUT` sur la collection signifierait « remplacer toutes les commandes ». L'identifiant de la commande visée doit être dans le chemin."
                },
                hint: "On modifie un seul champ d'une ressource existante et identifiée.",
                explain: "La ressource est `/commandes/18`, et l'action « modifier une partie » est le verbe `PATCH`, avec dans le corps le seul champ qui change. L'URL reste un nom, le verbe HTTP porte l'action."
              },
              {
                type: 'code',
                prompt: "Écris `routeVersAction(method, path)` pour la ressource `livres`. Elle renvoie `'lister'`, `'creer'`, `'lire'`, `'remplacer'`, `'modifier'` ou `'supprimer'` selon la méthode et le chemin (`/livres` ou `/livres/:id`), et `null` pour toute autre combinaison.",
                starter: `function routeVersAction(method, path) {
  // ton code ici
  return null;
}
`,
                solution: `function routeVersAction(method, path) {
  const morceaux = path.split('/').filter((m) => m !== ''); // '/livres/7' -> ['livres', '7']
  if (morceaux[0] !== 'livres') return null;
  if (morceaux.length === 1) {
    if (method === 'GET') return 'lister';
    if (method === 'POST') return 'creer';
    return null;
  }
  if (morceaux.length === 2) {
    const actions = { GET: 'lire', PUT: 'remplacer', PATCH: 'modifier', DELETE: 'supprimer' };
    return actions[method] || null;
  }
  return null;
}
`,
                tests: [
                  { code: "assertEqual(routeVersAction('GET', '/livres'), 'lister')", label: "GET /livres : lister" },
                  { code: "assertEqual(routeVersAction('POST', '/livres'), 'creer')", label: "POST /livres : creer" },
                  { code: "assertEqual([routeVersAction('GET', '/livres/7'), routeVersAction('PUT', '/livres/7'), routeVersAction('PATCH', '/livres/7'), routeVersAction('DELETE', '/livres/7')], ['lire', 'remplacer', 'modifier', 'supprimer'])", label: "Sur /livres/7 : lire, remplacer, modifier, supprimer" },
                  { code: "assertEqual(routeVersAction('POST', '/livres/7'), null)", label: "POST sur un livre précis : null" },
                  { code: "assertEqual(routeVersAction('GET', '/auteurs'), null)", label: "Autre ressource : null" }
                ],
                hint: "Découpe le chemin en segments non vides. Un segment : la collection (`GET`, `POST`). Deux segments : un livre précis (`GET`, `PUT`, `PATCH`, `DELETE`). Un objet qui associe méthode et action évite une série de `if`.",
                explain: "La forme du chemin (collection ou élément) et la méthode suffisent à déterminer l'action : c'est toute l'idée de REST. `POST /livres/7` n'a pas de sens (on ne crée pas « dans » un livre), d'où `null`, que l'API traduirait en 405 ou 404."
              }
            ],
            challenge: {
              type: 'logic',
              prompt: "Une API REST gère les `livres` (lister, créer, lire, remplacer, modifier, supprimer), les `auteurs` (lister, créer, lire, supprimer) et la liste des livres d'un auteur. Combien de **chemins différents** faut-il déclarer, sans compter les méthodes ? (Un chemin comme `/livres/:id` compte une fois, quel que soit le nombre de méthodes.)",
              answer: '5',
              accept: ['cinq'],
              mistakes: [
                { answer: '11', why: "11, c'est le nombre de routes (méthode + chemin). La question porte sur les chemins : plusieurs méthodes partagent le même." },
                { answer: '4', why: "Tu as oublié la ressource imbriquée `/auteurs/:id/livres`." },
                { answer: '6', why: "Lister et créer partagent le même chemin (`/livres` avec `GET` et `POST`), tout comme lire, modifier et supprimer partagent `/livres/:id`." }
              ],
              hint: "Pour chaque ressource, il y a le chemin de la collection et celui d'un élément. Ajoute la relation.",
              explain: "`/livres`, `/livres/:id`, `/auteurs`, `/auteurs/:id` et `/auteurs/:id/livres` : 5 chemins pour 11 routes. En REST, l'action est portée par la méthode, ce qui garde un petit nombre de chemins prévisibles."
            },
            recap: [
              "L'URL nomme une ressource (au pluriel) ; le verbe HTTP dit l'action.",
              "GET lit, POST crée, PUT remplace, PATCH modifie en partie, DELETE supprime.",
              "Relations par imbrication (`/auteurs/3/livres`), filtres et pagination en query string.",
              "Jamais de modification avec GET, jamais de verbe dans l'URL."
            ],
            check: {
              type: 'fill',
              run: false,
              prompt: "Complète les routes REST des commentaires d'un article : lister et créer les commentaires de l'article, modifier en partie et supprimer un commentaire.",
              code: `function routesCommentaires(app, c) {
  app.___('/articles/:id/commentaires', c.lister);
  app.post('/articles/:id/___', c.creer);
  app.___('/commentaires/:id', c.modifier);
  app.delete('/commentaires/___', c.supprimer);
}`,
              blanks: [
                { answers: ['get'], options: ['get', 'post', 'put'], why: { 'post': "`POST` est déjà utilisé sur ce chemin pour créer ; lister, c'est lire : `GET`.", 'put': "`PUT` remplace une ressource ; il ne sert pas à lister." } },
                { answers: ['commentaires'], options: ['commentaires', 'creerCommentaire', 'commentaire/nouveau'], why: { 'creerCommentaire': "Pas de verbe dans l'URL : c'est `POST` qui dit « créer ».", 'commentaire/nouveau': "La création se fait sur la collection elle-même, au pluriel." } },
                { answers: ['patch'], options: ['patch', 'put', 'post'], why: { 'put': "`PUT` remplace tout le commentaire ; pour une modification partielle, c'est `PATCH`.", 'post': "`POST` crée une nouvelle ressource, il ne modifie pas un commentaire existant." } },
                { answers: [':id'], options: [':id', 'id', '{id}'], why: { 'id': "Sans les deux-points, Express attendrait littéralement le mot « id » dans l'URL.", '{id}': "Les accolades sont la syntaxe d'OpenAPI ou de FastAPI ; Express utilise `:id`." } }
              ],
              hint: "Les commentaires d'un article sont une collection imbriquée ; un commentaire précis a sa propre adresse.",
              explain: "La collection imbriquée `/articles/:id/commentaires` sert à lister (`GET`) et créer (`POST`). Un commentaire existant se manipule à son adresse `/commentaires/:id`, avec `PATCH` pour une modification partielle et `DELETE` pour la suppression."
            }
          },
          {
            id: 'api.u5.l2',
            title: 'Codes de statut et idempotence',
            minutes: 7,
            objective: "Tu sais choisir le code de statut adapté à chaque résultat et dire quelles requêtes peuvent être rejouées sans danger.",
            explain: P(
              "Le code de statut est la première chose qu'un client lit. Les plus utiles :",
              "- `200` OK (lecture, modification) ; `201` Created (création, avec l'en-tête `Location: /livres/43`) ; `204` No Content (suppression réussie, sans corps) ;\n- `400` requête invalide ; `401` non authentifié ; `403` interdit ; `404` introuvable ; `409` conflit avec l'état actuel (doublon) ; `422` données bien formées mais refusées par une règle métier ;\n- `500` erreur inattendue : jamais volontaire, et sans détail technique dans le corps.",
              "Une méthode est **idempotente** si la répéter laisse le serveur dans le même état qu'un seul appel : `GET`, `PUT` et `DELETE` le sont, `POST` non (deux `POST` créent deux commandes). C'est crucial, car un client, une appli mobile ou un proxy **rejouent** une requête quand le réseau coupe. Pour les paiements, on ajoute aux `POST` une clé d'idempotence (en-tête `Idempotency-Key`) que le serveur mémorise."
            ),
            example: {
              code: `const livres = { 1: { id: 1, titre: 'Dune' } };
let prochainId = 2;

function creer(donnees) {
  const livre = { id: prochainId, titre: donnees.titre };
  prochainId++;
  livres[livre.id] = livre;
  return { status: 201, location: '/livres/' + livre.id };
}

function supprimer(id) {
  if (!(id in livres)) return { status: 404 };
  delete livres[id];
  return { status: 204 };
}

console.log(creer({ titre: 'Fondation' }));
console.log(supprimer(1).status, supprimer(1).status);`,
              output: `{ status: 201, location: '/livres/2' }
204 404`,
              notes: [
                { line: 2, text: "Le serveur choisit l'identifiant : le client ne l'envoie pas." },
                { line: 8, text: "201 et l'adresse de la nouvelle ressource, que le client pourra lire ensuite." },
                { line: 12, text: "Supprimer ce qui n'existe pas : 404." },
                { line: 18, text: "Le second DELETE répond 404, mais l'état est le même qu'après un seul appel : le livre 1 n'existe plus. C'est ça, l'idempotence." }
              ]
            },
            exercises: [
              {
                type: 'logic',
                prompt: "Le réseau est instable : l'appli envoie trois fois `DELETE /livres/7` (le livre 7 existait), puis trois fois `POST /livres` avec le même corps `{ \"titre\": \"Ubik\" }`, sans clé d'idempotence. À la fin, combien de livres « Ubik » ont été créés ?",
                answer: '3',
                accept: ['trois'],
                mistakes: [
                  { answer: '1', why: "C'est vrai pour `DELETE` (le livre 7 n'est supprimé qu'une fois), mais `POST` n'est pas idempotent : chaque appel crée une nouvelle ressource avec un nouvel identifiant." },
                  { answer: '0', why: "Les `DELETE` portent sur le livre 7, pas sur les nouveaux livres : les trois `POST` réussissent." }
                ],
                hint: "Applique la définition : que donne chaque méthode si on la répète ?",
                explain: "`DELETE` est idempotent : trois appels laissent le même état qu'un seul. `POST` ne l'est pas : trois appels, trois créations. C'est pour ça que les API de paiement exigent une clé d'idempotence sur leurs `POST`."
              },
              {
                type: 'code',
                prompt: "Écris `creerLivre(livres, donnees)` (`livres` est un tableau). Elle renvoie :\n\n- `{ status: 400, body: { erreur: 'titre manquant' } }` si `donnees.titre` est absent ou vide ;\n- `{ status: 409, body: { erreur: 'isbn déjà utilisé' } }` si un livre a déjà cet `isbn` ;\n- sinon, elle ajoute `{ id, titre, isbn }` au tableau, avec `id` égal au plus grand identifiant existant + 1 (1 si le tableau est vide), et renvoie `{ status: 201, headers: { Location: '/livres/<id>' }, body: livre }`.",
                starter: `function creerLivre(livres, donnees) {
  // ton code ici
  return { status: 201 };
}
`,
                solution: `function creerLivre(livres, donnees) {
  if (!donnees.titre) return { status: 400, body: { erreur: 'titre manquant' } };
  if (livres.some((l) => l.isbn === donnees.isbn)) {
    return { status: 409, body: { erreur: 'isbn déjà utilisé' } };
  }
  let maxId = 0;
  for (const l of livres) if (l.id > maxId) maxId = l.id;
  const livre = { id: maxId + 1, titre: donnees.titre, isbn: donnees.isbn };
  livres.push(livre);
  return { status: 201, headers: { Location: '/livres/' + livre.id }, body: livre };
}
`,
                tests: [
                  { code: "assertEqual(creerLivre([], { isbn: '111' }), { status: 400, body: { erreur: 'titre manquant' } })", label: "Sans titre : 400" },
                  { code: "assertEqual(creerLivre([{ id: 1, titre: 'Dune', isbn: '111' }], { titre: 'Dune bis', isbn: '111' }).status, 409)", label: "ISBN déjà présent : 409" },
                  { code: "const livres = [{ id: 3, titre: 'Dune', isbn: '111' }];\nassertEqual(creerLivre(livres, { titre: 'Fondation', isbn: '222' }), { status: 201, headers: { Location: '/livres/4' }, body: { id: 4, titre: 'Fondation', isbn: '222' } });\nassertEqual(livres.length, 2);", label: "Création : 201, Location /livres/4 et livre ajouté" },
                  { code: "assertEqual(creerLivre([], { titre: 'Ubik', isbn: '333' }).body.id, 1)", label: "Premier livre : id 1" }
                ],
                hint: "Traite les cas d'erreur d'abord, avec des `return` immédiats. `livres.some(...)` dit si au moins un élément vérifie une condition.",
                explain: "Les vérifications passent d'abord (400 pour une entrée invalide, 409 pour un conflit avec l'existant), et la création n'a lieu qu'ensuite. La réponse 201 donne au client l'adresse de la ressource créée dans `Location` : il n'a pas à deviner l'identifiant."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "`PUT /stock/7` avec le corps `{ quantite: 15 }` doit **fixer** la quantité à 15. Le réseau a rejoué la requête et le stock affiche 40. Clique sur la ligne fautive.",
              code: `const stock = { 7: { id: 7, quantite: 10 } };

// PUT /stock/:id : remplace la quantité par celle du corps
function remplacerStock(id, corps) {
  stock[id].quantite += corps.quantite;
  return { status: 200, body: stock[id] };
}

remplacerStock(7, { quantite: 15 });
remplacerStock(7, { quantite: 15 }); // requête rejouée
console.log(stock[7].quantite);`,
              bugLine: 5,
              why: "`+=` ajoute 15 à chaque appel : la requête n'est plus idempotente, alors que `PUT` doit l'être. Le premier appel donne 25, le second 40.",
              fixes: [
                "  stock[id].quantite = corps.quantite;",
                "  stock[id].quantite++;",
                "  stock[id].quantite += Number(corps.quantite);"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Ajouter 1 à chaque appel n'est pas plus idempotent, et ignore la valeur demandée.",
                2: "La conversion ne change rien au problème : on additionne toujours au lieu de remplacer."
              },
              output: `15`,
              hint: "Après un `PUT` avec `{ quantite: 15 }`, la quantité doit valoir 15, que la requête arrive une fois ou dix fois.",
              explain: "Une affectation (`=`) donne le même résultat quel que soit le nombre d'appels : c'est ce qui rend `PUT` idempotent. Si tu as besoin d'une opération « ajouter 5 au stock », c'est un `POST` (une action qui n'est pas idempotente), avec une clé d'idempotence pour se protéger des répétitions."
            },
            recap: [
              "201 + `Location` pour une création, 204 pour une suppression sans corps.",
              "400 entrée invalide, 404 absent, 409 conflit, 422 règle métier non respectée.",
              "GET, PUT et DELETE sont idempotents ; POST ne l'est pas.",
              "Les requêtes peuvent être rejouées : conçois les routes pour le supporter."
            ],
            check: {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `const comptes = { 'ada@ex.fr': { role: 'admin' } };

function inscrire(corps) {
  if (!corps.email) return 400;
  if (corps.email in comptes) return 409;
  comptes[corps.email] = { role: 'membre' };
  return 201;
}

console.log(inscrire({ email: 'linus@ex.fr' }));
console.log(inscrire({ email: 'linus@ex.fr' }));
console.log(inscrire({}));`,
              answer: `201
409
400`,
              mistakes: [
                { answer: `201
201
400`, why: "Le premier appel a ajouté linus@ex.fr dans `comptes` : le second tombe sur un doublon, 409." },
                { answer: `201
409
404`, why: "Un corps sans e-mail est une requête invalide : 400. 404 signifierait que la ressource demandée n'existe pas." }
              ],
              hint: "L'état de `comptes` change après le premier appel.",
              explain: "Première inscription : 201 (création). La même requête répétée : 409 (conflit, le compte existe déjà), ce qui montre que ce `POST` n'est pas idempotent dans ses effets. Un corps incomplet : 400. Chaque code dit précisément au client ce qui s'est passé."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u6
      {
        id: 'api.u6',
        title: 'Requêtes et réponses',
        summary: "Placer chaque information au bon endroit, convertir les paramètres et paginer les listes.",
        lessons: [
          {
            id: 'api.u6.l1',
            title: 'Paramètres, filtres et pagination',
            minutes: 7,
            objective: "Tu sais où placer chaque information d'une requête (chemin, query string, corps, en-têtes) et paginer une liste proprement.",
            explain: P(
              "Chaque information a sa place :",
              "- **chemin** : l'identité de la ressource (`/commandes/18`) ;\n- **query string** : filtres, tri, pagination (`?statut=payee&page=2&limite=20`) ;\n- **corps** (JSON) : les données à créer ou modifier ;\n- **en-têtes** : les métadonnées (jeton `Authorization`, `Content-Type`, langue).",
              "Tout ce qui vient de l'URL est une **chaîne** : `req.query.page` vaut `'2'`, pas `2`. Convertis avec `Number(...)` et prévois une valeur par défaut.",
              "Ne renvoie jamais 100 000 lignes d'un coup : **pagine**. Avec `page` (à partir de 1) et `limite`, on saute `(page - 1) * limite` éléments. Plafonne `limite` (par exemple à 50) pour qu'un client ne puisse pas tout demander, et renvoie le contexte : `{ data, page, limite, total }`.",
              "Garde enfin un format d'erreur unique dans toute l'API, comme `{ \"erreur\": \"message lisible\" }` : le client le traite toujours de la même façon."
            ),
            example: {
              code: `const produits = ['clavier', 'souris', 'écran', 'micro', 'casque'];

function lister(query) {
  const page = Number(query.page) || 1;
  const limite = Math.min(Number(query.limite) || 2, 50);
  const debut = (page - 1) * limite;
  return { data: produits.slice(debut, debut + limite), page, limite, total: produits.length };
}

console.log(lister({ page: '2' }).data);
console.log(lister({ page: '3', limite: '2' }).data);
console.log(lister({ limite: '1000' }).limite);`,
              output: `[ 'écran', 'micro' ]
[ 'casque' ]
50`,
              notes: [
                { line: 4, text: "`Number(undefined)` donne `NaN`, et `NaN || 1` donne 1 : valeur par défaut si le paramètre manque." },
                { line: 5, text: "`Math.min` plafonne la limite : un client ne peut pas demander 1000 éléments." },
                { line: 6, text: "Page 2 avec une limite de 2 : on saute les 2 premiers éléments." },
                { line: 7, text: "`{ page, limite }` est un raccourci pour `{ page: page, limite: limite }`." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Une route reçoit `?page=2&limite=10`. Qu'affiche ce programme ?",
                code: `const query = { page: '2', limite: '10' };

console.log(query.page + 1);
console.log(Number(query.page) + 1);
console.log(query.page * query.limite);
console.log(Number(undefined) || 1);`,
                answer: `21
3
20
1`,
                mistakes: [
                  { answer: `3
3
20
1`, why: "`query.page` est la chaîne `'2'` : avec `+`, JavaScript concatène, `'2' + 1` donne `'21'`." },
                  { answer: `21
3
210
1`, why: "L'opérateur `*` n'existe que pour les nombres : JavaScript convertit les deux chaînes, `'2' * '10'` donne 20." }
                ],
                hint: "`+` avec une chaîne concatène ; `*` convertit toujours en nombre.",
                explain: "Les paramètres d'URL sont des chaînes. `+` les colle, `*` les convertit : un comportement incohérent qui cause des bugs discrets. D'où la règle : convertir explicitement avec `Number` dès l'entrée de la route, et prévoir une valeur par défaut (`|| 1`)."
              },
              {
                type: 'code',
                prompt: "Écris `paginer(items, query)` qui renvoie `{ data, page, limite, total, pages }` :\n\n- `page` : `Number(query.page)`, ou 1 si absente ou invalide (pas un entier supérieur ou égal à 1) ;\n- `limite` : 10 par défaut (ou si invalide), plafonnée à 50 ;\n- `total` : nombre d'éléments, `pages` : nombre de pages (`Math.ceil(total / limite)`).",
                starter: `function paginer(items, query) {
  // ton code ici
  return { data: items, page: 1, limite: 10, total: items.length, pages: 1 };
}
`,
                solution: `function paginer(items, query) {
  let page = Number(query.page);
  if (!Number.isInteger(page) || page < 1) page = 1;
  let limite = Number(query.limite);
  if (!Number.isInteger(limite) || limite < 1) limite = 10;
  limite = Math.min(limite, 50);
  const debut = (page - 1) * limite;
  return {
    data: items.slice(debut, debut + limite),
    page: page,
    limite: limite,
    total: items.length,
    pages: Math.ceil(items.length / limite)
  };
}
`,
                tests: [
                  { code: "const items = Array.from({ length: 25 }, (_, i) => i + 1);\nassertEqual(paginer(items, {}), { data: items.slice(0, 10), page: 1, limite: 10, total: 25, pages: 3 });", label: "Sans paramètres : page 1, 10 éléments, 3 pages" },
                  { code: "const items = Array.from({ length: 25 }, (_, i) => i + 1);\nassertEqual(paginer(items, { page: '3' }).data, [21, 22, 23, 24, 25]);", label: "page=3 : les 5 derniers éléments" },
                  { code: "const items = Array.from({ length: 25 }, (_, i) => i + 1);\nconst r = paginer(items, { limite: '100' });\nassertEqual([r.limite, r.pages, r.data.length], [50, 1, 25]);", label: "limite=100 est plafonnée à 50" },
                  { code: "const items = Array.from({ length: 25 }, (_, i) => i + 1);\nassertEqual([paginer(items, { page: 'abc' }).page, paginer(items, { page: '0' }).page, paginer(items, { page: '-2' }).page], [1, 1, 1]);", label: "page=abc, 0 ou -2 : retour à la page 1" }
                ],
                hint: "`Number.isInteger(Number('abc'))` est faux, ce qui couvre aussi les valeurs absentes. `slice(debut, debut + limite)` ne plante pas si on dépasse la fin.",
                explain: "Chaque paramètre est converti, contrôlé, puis remplacé par une valeur sûre s'il est invalide : le client ne peut ni faire planter la route ni demander toute la base. Renvoyer `total` et `pages` permet à l'interface d'afficher « page 2 sur 3 »."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Avec des pages numérotées à partir de 1, la page 1 de cette liste devrait être `[ 'a', 'b' ]`. Clique sur la ligne fautive.",
              code: `function pageDe(items, page, limite) {
  const debut = page * limite;
  return items.slice(debut, debut + limite);
}

const lettres = ['a', 'b', 'c', 'd', 'e'];
console.log(pageDe(lettres, 1, 2));
console.log(pageDe(lettres, 3, 2));`,
              bugLine: 2,
              why: "Avec `page * limite`, la page 1 commence à l'indice 2 : on saute toute la première page. La formule correcte pour des pages qui commencent à 1 est `(page - 1) * limite`.",
              fixes: [
                "  const debut = (page - 1) * limite;",
                "  const debut = page * limite - 1;",
                "  const debut = page - 1 * limite;"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Pour la page 1, `1 * 2 - 1` donne 1 : on renverrait `[ 'b', 'c' ]`.",
                2: "La multiplication passe avant la soustraction : `page - 1 * limite` vaut `page - limite`, soit -1 pour la page 1."
              },
              output: `[ 'a', 'b' ]
[ 'e' ]`,
              hint: "Calcule `debut` à la main pour la page 1 : quel indice obtiens-tu, et lequel faut-il ?",
              explain: "La page 1 commence à l'indice 0, la page 2 à `limite`, la page n à `(n - 1) * limite`. Les parenthèses sont indispensables à cause de la priorité des opérateurs. Ce décalage d'une page est l'un des bugs de pagination les plus fréquents."
            },
            recap: [
              "Chemin : identité ; query string : filtres et pagination ; corps : données ; en-têtes : métadonnées.",
              "Les paramètres d'URL sont des chaînes : convertis-les avec `Number` et prévois un défaut.",
              "Pagination : `debut = (page - 1) * limite`, limite plafonnée, total renvoyé.",
              "Un format d'erreur unique dans toute l'API."
            ],
            check: {
              type: 'qcm',
              prompt: "Une appli veut la page 2 des commandes **payées** du client 18, avec le jeton `abc123`. Quelle requête est bien construite ?",
              choices: [
                "`GET /clients/commandes?client=18&statut=payee&page=2&jeton=abc123`",
                "`GET /clients/18/commandes?statut=payee&page=2` avec l'en-tête `Authorization: Bearer abc123`",
                "`POST /clients/18/commandes` avec le corps `{ \"statut\": \"payee\", \"page\": 2 }`",
                "`GET /clients/18/commandes/payee/2`"
              ],
              answer: 1,
              why: {
                0: "Un jeton dans l'URL finit dans les journaux des serveurs et l'historique du navigateur : il va dans un en-tête. Et le client visé est une ressource, il a sa place dans le chemin.",
                2: "`POST` créerait une commande. Pour lire, c'est `GET`, avec les filtres dans la query string.",
                3: "Mettre le filtre et la page dans le chemin les fige : impossible d'ajouter un tri ou d'omettre un filtre sans inventer de nouvelles routes."
              },
              hint: "Pour chaque information, demande-toi : identité, filtre, donnée ou métadonnée ?",
              explain: "Le chemin désigne la ressource (les commandes du client 18), la query string porte le filtre et la page, et le jeton voyage dans l'en-tête `Authorization`, qui n'est pas enregistré dans les journaux d'URL."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u7
      {
        id: 'api.u7',
        title: 'Validation des entrées',
        summary: "Vérifier côté serveur tout ce que le client envoie, et répondre clairement quand ça ne va pas.",
        lessons: [
          {
            id: 'api.u7.l1',
            title: 'Ne jamais faire confiance aux entrées',
            minutes: 8,
            objective: "Tu sais valider le corps d'une requête (présence, type, format, bornes, champs autorisés) et renvoyer une erreur 400 claire.",
            explain: P(
              "Tout ce qui arrive au serveur peut être faux, incomplet ou malveillant, même si ton formulaire vérifie déjà les champs : n'importe qui peut envoyer une requête avec `curl`. Valide donc **côté serveur**, à l'entrée de chaque route :",
              "- la **présence** des champs obligatoires ;\n- le **type** (`typeof x === 'string'`, `Number.isInteger(n)`) ;\n- le **format** et les **bornes** (e-mail, longueur, `1 <= quantite <= 99`) ;\n- une **liste blanche** de champs : ne recopie jamais tout `req.body` dans ta base, sinon un client ajoute `\"role\": \"admin\"` (attaque par affectation de masse).",
              "Si quelque chose ne va pas, réponds `400` avec **toutes** les erreurs d'un coup, pour que le client corrige tout en une fois : `{ \"erreurs\": [\"email invalide\", \"age invalide\"] }`.",
              "En pratique, on décrit un schéma avec une bibliothèque : **zod** ou **Joi** en Node, **pydantic** en Python (FastAPI). À essayer sur ton ordinateur : `npm install zod`. Ici, tu écris la validation à la main pour comprendre ce que ces outils font pour toi."
            ),
            example: {
              code: `function validerProduit(corps) {
  const erreurs = [];
  if (typeof corps.nom !== 'string' || corps.nom.trim() === '') {
    erreurs.push('nom obligatoire');
  }
  if (!Number.isInteger(corps.prix) || corps.prix < 0) {
    erreurs.push('prix invalide');
  }
  return erreurs;
}

console.log(validerProduit({ nom: 'Clavier', prix: 4990 }));
console.log(validerProduit({ nom: '  ', prix: '49.90' }));`,
              output: `[]
[ 'nom obligatoire', 'prix invalide' ]`,
              notes: [
                { line: 2, text: "On accumule les erreurs au lieu de s'arrêter à la première." },
                { line: 3, text: "Type, puis contenu : `trim()` refuse un nom fait d'espaces." },
                { line: 6, text: "Le prix doit être un entier (en centimes) : la chaîne `'49.90'` est refusée." },
                { line: 9, text: "Liste vide : tout va bien. Sinon, la route répondra 400 avec cette liste." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Avant de valider un nombre reçu en texte, il faut savoir ce que fait `Number`. Qu'affiche ce programme ?",
                code: `console.log(Number('42'));
console.log(Number(''));
console.log(Number('12abc'));
console.log(Number.isInteger(Number('3.0')));`,
                answer: `42
0
NaN
true`,
                mistakes: [
                  { answer: `42
NaN
NaN
true`, why: "Piège classique : `Number('')` donne 0, pas `NaN`. Un champ vide passerait donc pour le nombre 0 si tu ne testes pas la chaîne vide." },
                  { answer: `42
0
12
true`, why: "Contrairement à `parseInt('12abc')` qui lit le début (12), `Number` exige une chaîne entièrement numérique : sinon `NaN`." },
                  { answer: `42
0
NaN
false`, why: "`Number('3.0')` donne le nombre 3 : en JavaScript, 3.0 et 3 sont la même valeur, donc un entier." }
                ],
                hint: "`Number` convertit toute la chaîne ou échoue. Et la chaîne vide est un cas particulier.",
                explain: "`Number` est strict sur le contenu (`'12abc'` donne `NaN`) mais convertit la chaîne vide en 0. En validation, teste donc la présence d'une valeur non vide avant de convertir, et vérifie le résultat avec `Number.isInteger` ou `Number.isFinite`."
              },
              {
                type: 'code',
                prompt: "Écris `validerInscription(corps)` qui renvoie la liste des erreurs, dans cet ordre :\n\n- `'email invalide'` si `email` n'est pas une chaîne contenant un `@` avec au moins un caractère avant et après ;\n- `'mot de passe trop court'` si `motDePasse` n'est pas une chaîne d'au moins 12 caractères ;\n- `'age invalide'` si `age` est présent mais n'est pas un entier entre 13 et 120 (`age` est facultatif) ;\n- puis `'champ inconnu : <nom>'` pour chaque autre champ, dans l'ordre des clés.",
                starter: `function validerInscription(corps) {
  const erreurs = [];
  // ton code ici
  return erreurs;
}
`,
                solution: `function validerInscription(corps) {
  const erreurs = [];
  const email = corps.email;
  const arobase = typeof email === 'string' ? email.indexOf('@') : -1;
  if (arobase < 1 || arobase === email.length - 1) erreurs.push('email invalide');
  if (typeof corps.motDePasse !== 'string' || corps.motDePasse.length < 12) {
    erreurs.push('mot de passe trop court');
  }
  if (corps.age !== undefined) {
    if (!Number.isInteger(corps.age) || corps.age < 13 || corps.age > 120) erreurs.push('age invalide');
  }
  for (const cle of Object.keys(corps)) {
    if (!['email', 'motDePasse', 'age'].includes(cle)) erreurs.push('champ inconnu : ' + cle);
  }
  return erreurs;
}
`,
                tests: [
                  { code: "assertEqual(validerInscription({ email: 'ada@ex.fr', motDePasse: 'une phrase secrète', age: 36 }), [])", label: "Inscription valide : aucune erreur" },
                  { code: "assertEqual(validerInscription({ email: 'ada', motDePasse: 'court' }), ['email invalide', 'mot de passe trop court'])", label: "Toutes les erreurs sont signalées d'un coup" },
                  { code: "assertEqual(validerInscription({ email: 'ada@', motDePasse: 'une phrase secrète' }), ['email invalide'])", label: "Rien après le @ : email invalide" },
                  { code: "assertEqual(validerInscription({ email: 'ada@ex.fr', motDePasse: 'une phrase secrète', age: '30' }), ['age invalide'])", label: "age en chaîne : age invalide" },
                  { code: "assertEqual(validerInscription({ email: 'ada@ex.fr', motDePasse: 'une phrase secrète', role: 'admin' }), ['champ inconnu : role'])", label: "Champ non prévu (role) : refusé" }
                ],
                hint: "`indexOf('@')` donne la position du `@` (ou -1). Pour le champ facultatif, teste `!== undefined` avant de valider. `Object.keys(corps)` liste les champs reçus.",
                explain: "Chaque règle ajoute son message sans arrêter les autres, ce qui permet de tout corriger en un aller-retour. Le refus des champs inconnus bloque l'affectation de masse : un client ne peut pas glisser `role: 'admin'` dans son inscription. La vérification d'e-mail reste volontairement simple : la seule preuve qu'une adresse existe, c'est un e-mail de confirmation."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Une remise de 0 % est autorisée, mais l'API la refuse en disant qu'elle est obligatoire. Clique sur la ligne fautive.",
              code: `function validerRemise(corps) {
  if (!corps.remise) return 'remise obligatoire';
  if (corps.remise < 0 || corps.remise > 50) return 'remise entre 0 et 50';
  return 'ok';
}

console.log(validerRemise({ remise: 20 }));
console.log(validerRemise({ remise: 0 }));
console.log(validerRemise({}));`,
              bugLine: 2,
              why: "`!corps.remise` est vrai pour `undefined`, mais aussi pour `0`, `''` et `NaN` : la valeur 0, pourtant valide, est prise pour une absence.",
              fixes: [
                "  if (typeof corps.remise !== 'number') return 'remise obligatoire';",
                "  if (corps.remise == 0) return 'remise obligatoire';",
                "  if (!Number(corps.remise)) return 'remise obligatoire';"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "C'est exactement le cas qu'il faut accepter : 0 serait toujours refusé.",
                2: "`Number(0)` vaut 0, toujours faux : le problème reste le même."
              },
              output: `ok
ok
remise obligatoire`,
              hint: "Quelles valeurs rendent `!x` vrai en JavaScript ?",
              explain: "Pour tester la présence d'un nombre, vérifie son type : `typeof corps.remise !== 'number'` refuse l'absence (et les chaînes), mais accepte 0. Les tests de « vérité » (`!x`, `if (x)`) confondent absence et valeur nulle : à éviter dès que 0 ou la chaîne vide sont des valeurs légitimes."
            },
            recap: [
              "Valide côté serveur, même si le formulaire valide déjà : le client est contournable.",
              "Présence, type, format, bornes, puis liste blanche des champs.",
              "Réponds 400 avec la liste complète des erreurs.",
              "Attention aux valeurs « fausses » légitimes : 0, `''`. Teste le type."
            ],
            check: {
              type: 'fill',
              prompt: "Complète la route de modification de profil : refuser un nom qui n'est pas du texte (400), et ne garder que les champs autorisés.",
              code: `function modifierProfil(corps) {
  const erreurs = [];
  if (typeof corps.nom !== '___' || corps.nom.length > 40) erreurs.push('nom invalide');
  if (erreurs.length > 0) return { status: ___, body: { erreurs: erreurs } };
  const autorises = ['nom', 'bio'];
  const propre = {};
  for (const cle of autorises) {
    if (cle ___ corps) propre[cle] = corps[cle];
  }
  return { status: 200, body: propre };
}

console.log(modifierProfil({ nom: 42 }).status);
console.log(modifierProfil({ nom: 'Ada', role: 'admin' }).body);`,
              blanks: [
                { answers: ['string'], options: ['string', 'String', 'text'], why: { 'String': "`typeof` renvoie le nom du type en minuscules : `'string'`.", 'text': "Ce type n'existe pas en JavaScript : `typeof 'abc'` vaut `'string'`." } },
                { answers: ['400'], options: ['400', '404', '500', '200'], why: { '404': "La ressource existe ; ce sont les données envoyées qui sont invalides.", '500': "500 accuserait le serveur, alors que c'est la requête qui est fautive.", '200': "Renvoyer 200 avec des erreurs trompe les clients qui ne regardent que le code." } },
                { answers: ['in'], options: ['in', 'of', '=='], why: { 'of': "`of` sert à parcourir dans une boucle ; pour tester la présence d'une clé dans un objet, c'est `in`.", '==': "On ne compare pas un nom de champ à tout l'objet : on veut savoir si la clé existe." } }
              ],
              output: `400
{ nom: 'Ada' }`,
              hint: "`typeof` renvoie une chaîne en minuscules. Pour savoir si un objet possède une clé : `cle ... objet`.",
              explain: "La validation de type précède tout le reste et produit un 400. Ensuite, seule la liste blanche (`nom`, `bio`) est recopiée : le champ `role` envoyé par le client disparaît. Le reste du serveur ne voit ainsi que des données propres."
            }
          }
        ]
      }
    ]
  });
})();
