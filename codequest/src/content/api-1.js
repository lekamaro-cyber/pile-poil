// CodeQuest — parcours « Back-end et API », chapitre 1 : le web côté serveur.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  var c1 = {
    id: 'api.c1',
    title: 'Le web côté serveur',
    units: [
      // ------------------------------------------------------------------ api.u1
      {
        id: 'api.u1',
        title: 'Architecture client-serveur',
        summary: "Qui fait quoi entre le client, le serveur et la base de données, et pourquoi le serveur a toujours le dernier mot.",
        lessons: [
          {
            id: 'api.u1.l1',
            title: 'Qui fait quoi ?',
            minutes: 6,
            objective: "Tu sais répartir les rôles entre client, serveur et base de données, et expliquer pourquoi le serveur ne fait jamais confiance au client.",
            explain: P(
              "Quand ton appli d'IA affiche une réponse, au moins trois acteurs travaillent :",
              "- le **client** (navigateur, appli mobile, script Python) envoie une **requête** et affiche la réponse ;\n- le **serveur** reçoit la requête, applique les règles métier (droits, calculs, validation) et renvoie une **réponse** ;\n- la **base de données** garde les données durablement ; seul le serveur lui parle.",
              "Le client n'est pas sous ton contrôle : n'importe qui peut modifier le JavaScript d'une page ou envoyer une requête à la main. Le serveur est donc la **source de vérité** : il recalcule les prix, vérifie les droits, valide tout ce qu'il reçoit.",
              "Une **API** est le contrat entre les deux : quelles adresses existent, ce qu'elles attendent, ce qu'elles renvoient.",
              "Dans ce parcours, le code Node.js (serveur, base de données) ne s'exécute pas dans CodeQuest : les exercices `code` portent sur la logique du serveur, écrite en fonctions JavaScript pures. À essayer sur ton ordinateur : `curl -i https://example.com` affiche la réponse brute d'un serveur (dans PowerShell, tape `curl.exe`, car `curl` y est parfois un alias d'`Invoke-WebRequest`)."
            ),
            example: {
              code: `// Données gardées côté serveur : le client n'y a pas accès
const PRIX = { cafe: 250, croissant: 120 }; // en centimes

function serveur(requete) {
  const prix = PRIX[requete.produit];
  if (prix === undefined) return { status: 404, body: { erreur: 'produit inconnu' } };
  // Le prix envoyé par le client est ignoré : le serveur recalcule
  return { status: 200, body: { total: prix * requete.quantite } };
}

const reponse = serveur({ produit: 'cafe', quantite: 2, prix: 1 });
console.log(reponse.status, reponse.body.total);
console.log(serveur({ produit: 'the', quantite: 1 }).status);`,
              output: `200 500
404`,
              notes: [
                { line: 2, text: "Les prix vivent sur le serveur, en centimes : des entiers, donc aucune erreur d'arrondi." },
                { line: 4, text: "Un serveur, c'est d'abord une fonction : une requête entre, une réponse (code de statut + corps) sort." },
                { line: 8, text: "Le total est recalculé avec les prix du serveur." },
                { line: 11, text: "Le client tente de payer 1 centime : le champ `prix` est simplement ignoré." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Deux clients commandent chacun 2 claviers, l'un après l'autre, sur le même serveur. Qu'affiche ce programme ?",
                code: `const stock = { clavier: 3 };

function commander(requete) {
  if (requete.quantite > stock[requete.produit]) {
    return { status: 409, body: 'stock insuffisant' };
  }
  stock[requete.produit] -= requete.quantite;
  return { status: 201, body: 'commande créée' };
}

console.log(commander({ produit: 'clavier', quantite: 2 }).status);
console.log(commander({ produit: 'clavier', quantite: 2 }).status);
console.log(stock.clavier);`,
                answer: `201
409
1`,
                mistakes: [
                  { answer: `201
201
-1`, why: "La deuxième commande demande 2 claviers alors qu'il n'en reste qu'1 : la condition `2 > 1` est vraie, le serveur refuse avec 409 et ne touche pas au stock." },
                  { answer: `201
409
3`, why: "Le stock est une donnée du serveur, partagée par tous les clients : la première commande l'a bien fait passer de 3 à 1." }
                ],
                hint: "Le stock est le même pour les deux clients. Calcule sa valeur après la première commande.",
                explain: "La première commande passe (3 ≥ 2) et le stock tombe à 1. La seconde demande plus que le stock : le serveur répond 409 (conflit avec l'état actuel) sans rien modifier. C'est le serveur qui fait respecter la règle pour tous les clients."
              },
              {
                type: 'order',
                lang: 'text',
                prompt: "Remets dans l'ordre le trajet d'une requête, du clic dans l'appli jusqu'à l'affichage.",
                lines: [
                  "Tu touches « Mes commandes » dans l'appli",
                  "Le client envoie GET /commandes au serveur, avec ton jeton de connexion",
                  "Le serveur vérifie le jeton et identifie l'utilisateur",
                  "Le serveur demande à la base de données les commandes de cet utilisateur",
                  "Le serveur met les commandes au format JSON et renvoie une réponse 200",
                  "L'appli affiche la liste"
                ],
                hint: "Le client ne parle jamais directement à la base de données : tout passe par le serveur, qui commence par savoir qui demande.",
                explain: "Le client envoie la requête, le serveur identifie l'utilisateur avant toute chose, puis seulement interroge la base pour ses données à lui. La réponse repart en JSON et le client se contente de l'afficher."
              }
            ],
            challenge: {
              type: 'code',
              prompt: "Écris `totalCommande(commande)` côté serveur. `commande.articles` est un tableau d'objets `{ produit, quantite, prix }`. Calcule le total **en centimes** avec les prix de `PRIX` (le champ `prix` envoyé par le client est ignoré). Renvoie `null` si un produit est inconnu ou si une quantité n'est pas un entier supérieur ou égal à 1. Une commande vide vaut 0.",
              starter: `const PRIX = { cafe: 250, croissant: 120, jus: 300 }; // centimes, côté serveur

function totalCommande(commande) {
  // ton code ici
  return 0;
}
`,
              solution: `const PRIX = { cafe: 250, croissant: 120, jus: 300 }; // centimes, côté serveur

function totalCommande(commande) {
  let total = 0;
  for (const article of commande.articles) {
    const prix = PRIX[article.produit];
    if (prix === undefined) return null;
    if (!Number.isInteger(article.quantite) || article.quantite < 1) return null;
    total += prix * article.quantite;
  }
  return total;
}
`,
              tests: [
                { code: "assertEqual(totalCommande({ articles: [{ produit: 'cafe', quantite: 2, prix: 1 }] }), 500)", label: "Le prix envoyé par le client est ignoré (2 cafés = 500)" },
                { code: "assertEqual(totalCommande({ articles: [{ produit: 'cafe', quantite: 1 }, { produit: 'croissant', quantite: 3 }] }), 610)", label: "Plusieurs articles : 250 + 3 × 120 = 610" },
                { code: "assertEqual(totalCommande({ articles: [{ produit: 'caviar', quantite: 1 }] }), null)", label: "Produit inconnu : null" },
                { code: "assertEqual(totalCommande({ articles: [{ produit: 'jus', quantite: -2 }] }), null)", label: "Quantité négative refusée : null" },
                { code: "assertEqual(totalCommande({ articles: [] }), 0)", label: "Commande vide : 0" }
              ],
              hint: "Parcours `commande.articles` avec une boucle `for...of`. Pour chaque article, cherche le prix dans `PRIX` et vérifie la quantité avec `Number.isInteger` avant d'additionner.",
              explain: "Le serveur ne garde de la requête que ce qu'il ne peut pas deviner : quel produit et combien. Le prix vient de ses propres données, et une quantité négative (qui ferait un total négatif, donc un remboursement) est refusée. C'est exactement le genre de règle qui doit vivre côté serveur."
            },
            recap: [
              "Le client demande et affiche ; le serveur décide ; la base de données garde.",
              "Le serveur est la source de vérité : il recalcule et vérifie tout ce qu'envoie le client.",
              "Une API est le contrat entre client et serveur : adresses, entrées, réponses.",
              "Les montants se manipulent en centimes (entiers) pour éviter les erreurs d'arrondi."
            ],
            check: {
              type: 'qcm',
              prompt: "Une appli mobile se connecte **directement** à la base de données de production, avec un identifiant et un mot de passe écrits dans son code. Quel est le problème principal ?",
              choices: [
                "Aucun, si la connexion est chiffrée (TLS)",
                "Les bases de données ne savent pas répondre à un téléphone",
                "N'importe qui peut extraire l'identifiant de l'appli et lire ou modifier toute la base",
                "C'est seulement plus lent qu'une API"
              ],
              answer: 2,
              why: {
                0: "TLS protège les données pendant le trajet, pas l'identifiant caché dans l'appli : une fois l'appli décompilée, l'attaquant se connecte avec, chiffrement ou pas.",
                1: "Techniquement, rien n'empêche une appli d'ouvrir une connexion à une base. Le problème n'est pas technique, il est de sécurité.",
                3: "La vitesse n'est pas le sujet : sans serveur au milieu, plus personne ne vérifie les droits ni ne valide les données."
              },
              hint: "Une appli installée sur des milliers de téléphones est entre les mains de n'importe qui.",
              explain: "Tout ce qui est dans le code d'une appli peut être extrait. Avec l'identifiant de la base, un attaquant contourne toutes les règles. C'est pour ça qu'on place un serveur (une API) entre le client et la base : lui seul détient les accès et décide de ce que chaque utilisateur peut faire."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u2
      {
        id: 'api.u2',
        title: 'HTTP et JSON',
        summary: "Lire une requête et une réponse HTTP, et échanger des données en JSON.",
        lessons: [
          {
            id: 'api.u2.l1',
            title: "Anatomie d'une requête HTTP",
            minutes: 7,
            lang: 'text',
            objective: "Tu sais lire une requête et une réponse HTTP : méthode, chemin, paramètres, en-têtes, corps et code de statut.",
            explain: P(
              "HTTP est un protocole texte : une requête et une réponse sont des lignes lisibles.",
              "Une **requête** commence par une ligne `MÉTHODE /chemin?paramètres HTTP/1.1`, suivie d'**en-têtes** (`Nom: valeur`), d'une ligne vide, puis d'un **corps** facultatif (souvent du JSON pour un `POST`).",
              "Une **réponse** commence par un **code de statut** :",
              "- `2xx` succès (`200 OK`, `201 Created`, `204 No Content`) ;\n- `3xx` redirection (`301 Moved Permanently`, `304 Not Modified`) ;\n- `4xx` erreur du client (`400` requête invalide, `401` non authentifié, `403` interdit, `404` introuvable) ;\n- `5xx` erreur du serveur (`500`, `503` indisponible).",
              "L'en-tête `Content-Type` dit comment lire le corps (`application/json`). Avec HTTPS, tout est chiffré par TLS pendant le trajet, mais le contenu est le même.",
              "À essayer sur ton ordinateur : `curl -i https://api.github.com/users/octocat` affiche la ligne de statut, les en-têtes, puis le corps JSON."
            ),
            example: {
              code: `GET /produits?categorie=livres&page=2 HTTP/1.1
Host: api.boutique.fr
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 48

{"page":2,"produits":[{"id":17,"titre":"Dune"}]}`,
              notes: [
                { line: 1, text: "Méthode `GET`, chemin `/produits`, puis la query string après `?` : deux paramètres séparés par `&`." },
                { line: 4, text: "Les en-têtes portent les métadonnées : ici le jeton qui prouve l'identité du client." },
                { line: 6, text: "Début de la réponse : version, code de statut et sa phrase." },
                { line: 10, text: "Le corps vient après une ligne vide ; `Content-Type` a annoncé du JSON." }
              ]
            },
            exercises: [
              {
                type: 'fill',
                prompt: "Le client crée un produit. Complète la réponse du serveur.",
                code: `POST /produits HTTP/1.1
Host: api.boutique.fr
Content-Type: application/json

{"titre":"Fondation","prix":890}

HTTP/1.1 ___ Created
Content-Type: ___
Location: /produits/18

{"id":18,"titre":"Fondation","prix":890}`,
                blanks: [
                  { answers: ['201'], options: ['200', '201', '204', '302'], why: { '200': "200 convient à une lecture ou une modification. Pour une création, le code dédié est 201, qui va avec l'en-tête `Location`.", '204': "204 signifie « pas de corps » ; or la réponse renvoie le produit créé.", '302': "302 est une redirection : le client irait chercher une autre adresse au lieu de lire la réponse." } },
                  { answers: ['application/json'], options: ['application/json', 'text/html', 'text/plain'], why: { 'text/html': "Le corps n'est pas une page HTML mais un objet JSON.", 'text/plain': "Avec `text/plain`, le client ne saurait pas qu'il doit lire du JSON." } }
                ],
                hint: "La phrase après le code est un indice : quel code se lit « Created » ? Et quel est le format du corps ?",
                explain: "Une création réussie renvoie `201 Created`, avec l'adresse de la nouvelle ressource dans `Location`. `Content-Type: application/json` annonce le format du corps, que le client pourra lire avec `JSON.parse`."
              },
              {
                type: 'code',
                lang: 'javascript',
                prompt: "Écris `lireLigneDeRequete(ligne)` qui découpe la première ligne d'une requête HTTP en `{ methode, chemin, query }`. `query` est un objet des paramètres, avec des valeurs en chaînes ; il vaut `{}` s'il n'y a pas de `?`.\n\nExemple : `'GET /produits?page=2&tri=prix HTTP/1.1'` donne `{ methode: 'GET', chemin: '/produits', query: { page: '2', tri: 'prix' } }`.",
                starter: `function lireLigneDeRequete(ligne) {
  // ton code ici
  return { methode: '', chemin: '', query: {} };
}
`,
                solution: `function lireLigneDeRequete(ligne) {
  const parties = ligne.split(' ');           // ['GET', '/produits?page=2', 'HTTP/1.1']
  const cible = parties[1].split('?');        // ['/produits', 'page=2']
  const query = {};
  if (cible.length > 1) {
    for (const paire of cible[1].split('&')) {
      const morceaux = paire.split('=');
      query[morceaux[0]] = morceaux[1];
    }
  }
  return { methode: parties[0], chemin: cible[0], query: query };
}
`,
                tests: [
                  { code: "assertEqual(lireLigneDeRequete('GET /produits HTTP/1.1'), { methode: 'GET', chemin: '/produits', query: {} })", label: "Sans paramètres : query vide" },
                  { code: "assertEqual(lireLigneDeRequete('GET /produits?page=2&tri=prix HTTP/1.1'), { methode: 'GET', chemin: '/produits', query: { page: '2', tri: 'prix' } })", label: "Deux paramètres, valeurs en chaînes" },
                  { code: "assertEqual(lireLigneDeRequete('DELETE /produits/18 HTTP/1.1').methode, 'DELETE')", label: "La méthode est lue" }
                ],
                hint: "`split(' ')` sépare méthode, cible et version. Puis `split('?')` sépare le chemin de la query string, et `split('&')` et `split('=')` découpent les paires.",
                explain: "Une ligne de requête a toujours trois morceaux séparés par des espaces. La cible se coupe en deux au `?`, et chaque paire `cle=valeur` remplit l'objet. Les valeurs restent des chaînes : c'est au code de la route de les convertir, comme le font Express et tous les frameworks."
              }
            ],
            challenge: {
              type: 'bug',
              lang: 'javascript',
              prompt: "Le tableau de bord classe le code `503` comme une **erreur du client**, et l'alerte part à la mauvaise équipe. Clique sur la ligne fautive.",
              code: `function famille(status) {
  if (status >= 200 && status < 300) return 'succès';
  if (status >= 300 && status < 400) return 'redirection';
  if (status >= 400) return 'erreur client';
  if (status >= 500) return 'erreur serveur';
  return 'inconnu';
}

console.log(famille(204));
console.log(famille(503));`,
              bugLine: 4,
              why: "Les tests s'enchaînent dans l'ordre : `503 >= 400` est vrai, donc la fonction renvoie « erreur client » avant d'atteindre la ligne des 5xx.",
              fixes: [
                "  if (status >= 400 && status < 500) return 'erreur client';",
                "  if (status > 400) return 'erreur client';",
                "  if (status >= 400 && status <= 500) return 'erreur client';"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "`503 > 400` reste vrai : 503 est toujours classé erreur client.",
                2: "Avec `<= 500`, le code 500 (l'erreur serveur la plus courante) serait classé erreur client."
              },
              output: `succès
erreur serveur`,
              hint: "Suis l'exécution de `famille(503)` ligne par ligne : quel est le premier `if` vrai ?",
              explain: "Chaque famille occupe une centaine : 4xx va de 400 à 499. En bornant la condition (`< 500`), 503 passe à la ligne suivante et devient une erreur serveur. Quand des conditions se suivent avec `return`, l'ordre et les bornes comptent."
            },
            recap: [
              "Requête : ligne `MÉTHODE /chemin?query HTTP/1.1`, en-têtes, ligne vide, corps facultatif.",
              "Réponse : code de statut, en-têtes, corps.",
              "2xx succès, 3xx redirection, 4xx faute du client, 5xx faute du serveur.",
              "`Content-Type` annonce le format du corps, `Authorization` porte la preuve d'identité."
            ],
            check: {
              type: 'qcm',
              prompt: "Lis cette requête. Quelle affirmation est exacte ?",
              code: `PATCH /commandes/42?notifier=oui HTTP/1.1
Host: api.boutique.fr
Authorization: Bearer abc123
Content-Type: application/json

{"adresse":"12 rue des Lilas"}`,
              choices: [
                "`42` est un paramètre de la query string",
                "La nouvelle adresse est dans le corps, `notifier` dans la query string, le jeton dans un en-tête",
                "Le corps est du texte brut, car il n'y a pas d'en-tête `Accept`",
                "Une requête `PATCH` ne peut pas avoir de corps"
              ],
              answer: 1,
              why: {
                0: "`42` fait partie du chemin (`/commandes/42`) : il identifie la ressource. La query string commence après le `?`.",
                2: "C'est `Content-Type` qui décrit le corps envoyé, et il annonce du JSON. `Accept` dirait quel format le client veut recevoir en réponse.",
                3: "`PATCH` sert justement à envoyer les champs à modifier, dans le corps."
              },
              hint: "Repère les quatre zones : ligne de requête (chemin et query), en-têtes, ligne vide, corps.",
              explain: "Le chemin identifie la commande 42, la query string porte une option (`notifier=oui`), l'en-tête `Authorization` prouve l'identité et le corps JSON contient les données à modifier. Chaque information a sa place."
            }
          },
          {
            id: 'api.u2.l2',
            title: 'JSON, la langue commune des API',
            minutes: 6,
            objective: "Tu sais convertir des données en JSON et inversement avec `JSON.stringify` et `JSON.parse`, et traiter un JSON invalide sans faire planter le serveur.",
            explain: P(
              "JSON (JavaScript Object Notation) est le format d'échange de presque toutes les API. Il ressemble aux objets JavaScript et aux dictionnaires Python, avec des règles strictes :",
              "- clés et chaînes entre **guillemets doubles** ;\n- valeurs possibles : chaîne, nombre, `true`/`false`, `null`, tableau, objet ;\n- ni commentaire, ni virgule finale, ni `undefined`, ni fonction, ni date (on envoie une chaîne comme `\"2026-10-28\"`).",
              "`JSON.stringify(valeur)` transforme une valeur en texte JSON (comme `json.dumps` en Python) ; `JSON.parse(texte)` fait l'inverse (comme `json.loads`).",
              "Un texte mal formé fait lever une `SyntaxError` à `JSON.parse`. Côté serveur, attrape-la avec `try`/`catch` et réponds `400` : sinon, c'est ton serveur qui renvoie une erreur 500 à cause d'un client maladroit."
            ),
            example: {
              code: `const produit = { id: 17, titre: 'Dune', prix: 990, enStock: true, tags: ['sf'] };
const texte = JSON.stringify(produit);
console.log(texte);

const copie = JSON.parse(texte);
console.log(copie.tags[0], typeof copie.prix);

try {
  JSON.parse("{'id': 1}");
} catch (e) {
  console.log('JSON invalide :', e.name);
}`,
              output: `{"id":17,"titre":"Dune","prix":990,"enStock":true,"tags":["sf"]}
sf number
JSON invalide : SyntaxError`,
              notes: [
                { line: 2, text: "L'objet devient une chaîne : c'est elle qui voyage dans le corps de la requête ou de la réponse." },
                { line: 5, text: "`JSON.parse` reconstruit un objet : les nombres redeviennent des `number`." },
                { line: 9, text: "Guillemets simples : ce n'est pas du JSON, `JSON.parse` lève une `SyntaxError`." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Qu'affiche ce programme ?",
                code: `const profil = {
  nom: 'Ada',
  age: undefined,
  actif: true,
  saluer: function () { return 'bonjour'; },
  scores: [12, null]
};
console.log(JSON.stringify(profil));`,
                answer: `{"nom":"Ada","actif":true,"scores":[12,null]}`,
                mistakes: [
                  { answer: `{"nom":"Ada","age":undefined,"actif":true,"scores":[12,null]}`, why: "`undefined` n'existe pas en JSON : `JSON.stringify` supprime simplement la propriété." },
                  { answer: `{"nom":"Ada","age":null,"actif":true,"scores":[12,null]}`, why: "C'est ce que ferait Python avec `None`. En JavaScript, une propriété `undefined` disparaît ; seul `null` est écrit tel quel." }
                ],
                hint: "JSON ne connaît ni `undefined` ni les fonctions. Que fait `JSON.stringify` des propriétés qui en contiennent ?",
                explain: "`JSON.stringify` omet les propriétés dont la valeur est `undefined` ou une fonction, car JSON ne sait pas les représenter. `null` est une vraie valeur JSON et reste. Conséquence pour une API : une méthode d'objet ne voyage jamais, seules les données passent."
              },
              {
                type: 'code',
                prompt: "Écris `lireCorps(texte)` qui lit le corps d'une requête :\n\n- si le texte n'est pas du JSON valide, renvoie `{ ok: false, erreur: 'JSON invalide' }` (sans planter) ;\n- si c'est du JSON mais pas un objet (tableau, `null`, nombre…), renvoie `{ ok: false, erreur: 'objet attendu' }` ;\n- sinon renvoie `{ ok: true, donnees }`.",
                starter: `function lireCorps(texte) {
  // ton code ici : cette version plante sur un JSON invalide
  return { ok: true, donnees: JSON.parse(texte) };
}
`,
                solution: `function lireCorps(texte) {
  let donnees;
  try {
    donnees = JSON.parse(texte);
  } catch (e) {
    return { ok: false, erreur: 'JSON invalide' };
  }
  if (typeof donnees !== 'object' || donnees === null || Array.isArray(donnees)) {
    return { ok: false, erreur: 'objet attendu' };
  }
  return { ok: true, donnees: donnees };
}
`,
                tests: [
                  { code: "assertEqual(lireCorps('{\"nom\":\"Ada\"}'), { ok: true, donnees: { nom: 'Ada' } })", label: "Un objet JSON valide est lu" },
                  { code: "assertEqual(lireCorps(\"{'nom': 'Ada'}\"), { ok: false, erreur: 'JSON invalide' })", label: "Guillemets simples : JSON invalide, sans planter" },
                  { code: "assertEqual(lireCorps('[1, 2]'), { ok: false, erreur: 'objet attendu' })", label: "Un tableau est refusé : objet attendu" },
                  { code: "assertEqual(lireCorps('null'), { ok: false, erreur: 'objet attendu' })", label: "`null` est refusé : objet attendu" }
                ],
                hint: "Place `JSON.parse` dans un `try`. Attention : `typeof null` vaut `'object'` et `typeof [1, 2]` aussi ; `Array.isArray` distingue les tableaux.",
                explain: "Le `try`/`catch` transforme une erreur de syntaxe en réponse propre (que la route traduira en 400). Le contrôle de type ensuite est nécessaire car `null`, un nombre ou un tableau sont du JSON valide, mais pas le corps attendu. Deux pièges JavaScript classiques : `typeof null === 'object'` et les tableaux qui sont aussi des objets."
              }
            ],
            challenge: {
              type: 'predict',
              prompt: "Une API renvoie un identifiant très grand, une fois en nombre et une fois en chaîne. Qu'affiche ce programme ?",
              code: `const texte = '{"id": 9007199254740993, "idTexte": "9007199254740993"}';
const objet = JSON.parse(texte);
console.log(objet.id);
console.log(objet.idTexte);`,
              answer: `9007199254740992
9007199254740993`,
              mistakes: [
                { answer: `9007199254740993
9007199254740993`, why: "Ce nombre dépasse 2 puissance 53 : un `number` JavaScript ne peut pas le représenter exactement, `JSON.parse` le remplace par le flottant le plus proche." }
              ],
              hint: "Un `number` JavaScript est un flottant 64 bits : il ne représente exactement les entiers que jusqu'à 9007199254740991.",
              explain: "Au-delà de 2 puissance 53, les flottants sautent des entiers : 9007199254740993 devient 9007199254740992, sans erreur ni avertissement. Voilà pourquoi beaucoup d'API envoient les grands identifiants en chaîne (champ `id_str` chez X, ex-Twitter) : la chaîne, elle, arrive intacte."
            },
            recap: [
              "JSON : guillemets doubles, pas de virgule finale, ni `undefined`, ni fonction, ni commentaire.",
              "`JSON.stringify` : valeur vers texte ; `JSON.parse` : texte vers valeur (comme `json.dumps` et `json.loads`).",
              "`JSON.parse` lève une `SyntaxError` sur un texte invalide : attrape-la et réponds 400.",
              "Les très grands identifiants voyagent en chaîne pour ne pas perdre de précision."
            ],
            check: {
              type: 'qcm',
              prompt: "Lequel de ces textes est un JSON valide ?",
              choices: [
                "`{'nom': 'Ada'}`",
                "`{\"nom\": \"Ada\", \"age\": 36,}`",
                "`{\"nom\": \"Ada\", \"langages\": [\"Python\", \"C\"], \"mentor\": null}`",
                "`{\"nom\": \"Ada\", \"actif\": True}`"
              ],
              answer: 2,
              why: {
                0: "JSON exige des guillemets doubles, pour les clés comme pour les chaînes.",
                1: "La virgule après le dernier élément (virgule finale) est interdite en JSON, même si JavaScript et Python l'acceptent dans leur code.",
                3: "`True` est l'écriture Python. En JSON, les booléens s'écrivent en minuscules : `true`."
              },
              hint: "Vérifie trois règles : guillemets doubles, pas de virgule finale, `true`/`false`/`null` en minuscules.",
              explain: "Seule la troisième version respecte toutes les règles : clés et chaînes entre guillemets doubles, un tableau, et `null` en minuscules. Les autres sont des habitudes de JavaScript ou de Python que `JSON.parse` refuse."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u3
      {
        id: 'api.u3',
        title: 'Node.js',
        summary: "Exécuter du JavaScript côté serveur : npm, modules et fonctionnement non bloquant.",
        lessons: [
          {
            id: 'api.u3.l1',
            title: 'JavaScript hors du navigateur',
            minutes: 7,
            objective: "Tu sais créer un projet Node.js avec npm, organiser le code en modules et expliquer pourquoi Node ne bloque pas pendant les entrées-sorties.",
            explain: P(
              "**Node.js** exécute du JavaScript hors du navigateur. Il n'a ni `document` ni `window`, mais il peut lire des fichiers, ouvrir des connexions réseau et lancer un serveur.",
              "- `npm` est l'équivalent de `pip`, et `package.json` celui de `requirements.txt` (dépendances, scripts comme `npm start`) ;\n- les paquets s'installent dans `node_modules/`, propre au projet (comme un environnement virtuel) : on ne le met jamais dans Git ;\n- un fichier est un **module** : `module.exports` exporte, `require('./fichier')` importe (ou `export` et `import` si `package.json` contient `\"type\": \"module\"`).",
              "Node exécute ton code sur **un seul fil d'exécution**, mais ne s'arrête pas pendant une lecture de fichier ou une requête à la base : il continue, et une fonction de rappel (ou un `await`) reprend quand le résultat arrive. Un gros calcul, lui, bloque tout le serveur.",
              "À essayer sur ton ordinateur : installe Node (version LTS sur nodejs.org), puis `node --version`, `npm init -y` et `node index.js`."
            ),
            example: {
              run: false,
              code: `// fichier prix.js
function formaterPrix(centimes) {
  return (centimes / 100).toFixed(2) + ' €';
}
module.exports = { formaterPrix };

// fichier index.js (lance-le avec : node index.js)
const { formaterPrix } = require('./prix');
const fs = require('node:fs');

console.log(formaterPrix(1990));             // 19.90 €
console.log(fs.existsSync('package.json'));  // true si le fichier existe`,
              notes: [
                { line: 5, text: "`module.exports` liste ce que le module rend disponible aux autres fichiers." },
                { line: 8, text: "`require('./prix')` charge le fichier voisin `prix.js` ; on récupère la fonction par déstructuration." },
                { line: 9, text: "Les modules intégrés de Node s'importent avec le préfixe `node:` (`fs` pour les fichiers, `http` pour le réseau)." }
              ]
            },
            exercises: [
              {
                type: 'order',
                lang: 'bash',
                prompt: "Remets dans l'ordre les commandes pour créer un projet d'API et le lancer (elles marchent aussi dans PowerShell).",
                lines: [
                  "mkdir mon-api",
                  "cd mon-api",
                  "npm init -y",
                  "npm install express",
                  "node index.js"
                ],
                hint: "On crée le dossier avant d'y entrer, et le projet (`package.json`) avant d'y ajouter des dépendances.",
                explain: "`npm init -y` crée `package.json` avec des valeurs par défaut ; `npm install express` y inscrit la dépendance et la télécharge dans `node_modules/`. On lance ensuite le point d'entrée avec `node`."
              },
              {
                type: 'predict',
                prompt: "Deux requêtes arrivent presque en même temps. La réponse pour A vient de la base de données (20 ms), celle pour B d'un cache (5 ms). `setTimeout` imite ces attentes. Qu'affiche ce programme ?",
                code: `console.log('A : requête reçue');
setTimeout(() => console.log('A : réponse de la base'), 20);
console.log('B : requête reçue');
setTimeout(() => console.log('B : réponse du cache'), 5);`,
                answer: `A : requête reçue
B : requête reçue
B : réponse du cache
A : réponse de la base`,
                mistakes: [
                  { answer: `A : requête reçue
A : réponse de la base
B : requête reçue
B : réponse du cache`, why: "Node n'attend pas la fin de `setTimeout` : il programme le rappel et passe tout de suite à la ligne suivante." },
                  { answer: `A : requête reçue
B : requête reçue
A : réponse de la base
B : réponse du cache`, why: "Les rappels ne passent pas dans l'ordre où ils ont été programmés mais quand leur attente se termine : 5 ms avant 20 ms." }
                ],
                hint: "Le code synchrone s'exécute d'abord, en entier. Ensuite seulement, les rappels passent, selon l'heure à laquelle leur attente se termine.",
                explain: "Node lance les deux attentes sans bloquer, affiche les deux lignes synchrones, puis exécute les rappels quand ils sont prêts : le cache (5 ms) avant la base (20 ms). C'est ainsi qu'un seul fil sert des milliers de requêtes : il ne reste jamais les bras croisés pendant les entrées-sorties."
              }
            ],
            challenge: {
              type: 'code',
              prompt: "Quand tu lances `node serveur.js --port 8080 --debug`, Node range les mots dans le tableau `process.argv` : `['/usr/bin/node', '/home/toi/serveur.js', '--port', '8080', '--debug']`.\n\nÉcris `lireArguments(argv)` qui ignore les deux premiers éléments et renvoie un objet d'options : `--nom valeur` donne `{ nom: 'valeur' }`, et une option suivie d'une autre option (ou placée en dernier) vaut `true`.",
              starter: `function lireArguments(argv) {
  const options = {};
  // ton code ici
  return options;
}
`,
              solution: `function lireArguments(argv) {
  const options = {};
  const mots = argv.slice(2);
  for (let i = 0; i < mots.length; i++) {
    if (!mots[i].startsWith('--')) continue;
    const nom = mots[i].slice(2);
    const suivant = mots[i + 1];
    if (suivant !== undefined && !suivant.startsWith('--')) {
      options[nom] = suivant;
      i++;
    } else {
      options[nom] = true;
    }
  }
  return options;
}
`,
              tests: [
                { code: "assertEqual(lireArguments(['node', 'serveur.js']), {})", label: "Sans option : objet vide" },
                { code: "assertEqual(lireArguments(['node', 'serveur.js', '--port', '8080']), { port: '8080' })", label: "--port 8080 donne { port: '8080' }" },
                { code: "assertEqual(lireArguments(['node', 'serveur.js', '--debug', '--port', '8080']), { debug: true, port: '8080' })", label: "Option suivie d'une autre option : true" },
                { code: "assertEqual(lireArguments(['node', 'serveur.js', '--port', '8080', '--debug']), { port: '8080', debug: true })", label: "Option en dernière position : true" }
              ],
              hint: "`argv.slice(2)` retire les deux premiers éléments. Dans la boucle, regarde le mot suivant (`mots[i + 1]`) : s'il existe et ne commence pas par `--`, c'est la valeur, et il faut le sauter.",
              explain: "On parcourt les mots avec un indice pour pouvoir regarder le suivant. Quand une option consomme une valeur, `i++` saute cette valeur. Les valeurs restent des chaînes (`'8080'`) : comme pour une query string, la conversion en nombre se fait ensuite. Des paquets comme `commander` ou le module intégré `node:util` (`parseArgs`) font ce travail en vrai."
            },
            recap: [
              "Node.js exécute du JavaScript côté serveur : fichiers, réseau, mais pas de DOM.",
              "npm et `package.json` gèrent les dépendances ; `node_modules/` ne va pas dans Git.",
              "Un fichier est un module : `module.exports` et `require` (ou `export` et `import`).",
              "Les entrées-sorties ne bloquent pas Node ; un gros calcul, si."
            ],
            check: {
              type: 'qcm',
              prompt: "Ton serveur Node calcule un filtre sur une image géante pendant 4 secondes, directement dans la fonction qui répond à `/filtre`. Que vivent les autres utilisateurs pendant ce temps ?",
              choices: [
                "Rien de spécial : Node crée un fil d'exécution par requête",
                "Leurs requêtes attendent : le fil unique est occupé par le calcul",
                "Ils reçoivent automatiquement une erreur 503",
                "Rien de spécial : tout code placé dans une fonction de route est asynchrone"
              ],
              answer: 1,
              why: {
                0: "C'est le modèle d'autres serveurs (un fil par requête). Node exécute ton JavaScript sur un seul fil.",
                2: "Node ne détecte pas la surcharge tout seul : les requêtes s'accumulent et attendent, sans erreur automatique.",
                3: "Être dans une fonction ne rend pas un calcul asynchrone. Seules les entrées-sorties (réseau, fichiers, base) sont confiées au système pendant que Node continue."
              },
              hint: "Distingue une attente (réseau, base de données) d'un calcul qui occupe le processeur.",
              explain: "Pendant une attente d'entrée-sortie, Node passe à autre chose. Mais un calcul lourd occupe le seul fil d'exécution : plus aucune requête n'est traitée avant la fin. On déplace ce genre de travail dans un `Worker`, une file de tâches ou un autre service."
            }
          }
        ]
      },

      // ------------------------------------------------------------------ api.u4
      {
        id: 'api.u4',
        title: 'Serveurs web',
        summary: "Écrire un serveur HTTP avec Node, puis avec Express : routes, paramètres et middlewares.",
        lessons: [
          {
            id: 'api.u4.l1',
            title: 'Un serveur avec le module http',
            minutes: 7,
            objective: "Tu sais écrire un serveur Node qui répond selon la méthode et le chemin, et isoler la décision de routage dans une fonction testable.",
            explain: P(
              "Le module intégré `node:http` suffit pour créer un serveur. `http.createServer(gerer)` appelle `gerer(req, res)` **à chaque requête** :",
              "- `req.method` et `req.url` disent ce que le client demande (`'GET'`, `'/sante?verbose=1'`) ; `req.headers` contient les en-têtes, avec des noms en minuscules ;\n- `res.writeHead(status, entetes)` fixe le code et les en-têtes ; `res.end(texte)` envoie le corps et **termine** la réponse. Sans `end`, le client attend jusqu'à abandonner.",
              "`serveur.listen(3000)` ouvre le port 3000 : ton serveur répond sur `http://localhost:3000`.",
              "Bonne pratique : garde la décision (« quelle réponse pour quelle requête ? ») dans une **fonction pure** `router({ method, path })` qui renvoie `{ status, body }`. Elle se teste sans réseau, et la fonction passée à `createServer` ne fait plus que traduire.",
              "À essayer : enregistre l'exemple dans `server.js`, lance `node server.js`, ouvre `http://localhost:3000/sante` dans ton navigateur, puis arrête le serveur avec Ctrl+C."
            ),
            example: {
              run: false,
              code: `const http = require('node:http');

function router({ method, path }) {
  if (method === 'GET' && path === '/sante') return { status: 200, body: { statut: 'ok' } };
  return { status: 404, body: { erreur: 'introuvable' } };
}

const serveur = http.createServer((req, res) => {
  const path = req.url.split('?')[0];
  const { status, body } = router({ method: req.method, path });
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
});

serveur.listen(3000, () => console.log('Serveur sur http://localhost:3000'));`,
              notes: [
                { line: 3, text: "La logique de routage est une fonction pure : un objet en entrée, un objet en sortie. Les accolades déstructurent le paramètre." },
                { line: 9, text: "`req.url` contient aussi la query string : on la retire avant de comparer les chemins." },
                { line: 12, text: "`res.end` envoie le corps (une chaîne) et clôt la réponse." },
                { line: 15, text: "Le rappel de `listen` s'exécute une fois le port ouvert." }
              ]
            },
            exercises: [
              {
                type: 'bug',
                run: false,
                prompt: "`curl http://localhost:3000/sante` reste bloqué sans jamais rien afficher, alors que `/autre` répond 404 tout de suite. Clique sur la ligne fautive.",
                code: `function gerer(req, res) {
  if (req.method === 'GET' && req.url === '/sante') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ statut: 'ok' }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erreur: 'introuvable' }));
}`,
                bugLine: 4,
                why: "`res.write` envoie un morceau du corps mais laisse la réponse ouverte : le client attend la suite, qui ne vient jamais.",
                fixes: [
                  "    res.end(JSON.stringify({ statut: 'ok' }));",
                  "    res.send(JSON.stringify({ statut: 'ok' }));",
                  "    return JSON.stringify({ statut: 'ok' });"
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "`res.send` est un raccourci d'Express : l'objet `res` du module `http` ne l'a pas, Node lèverait une `TypeError`.",
                  2: "Node ignore la valeur renvoyée par `gerer` : rien n'est envoyé et la réponse reste ouverte."
                },
                hint: "Compare la branche `/sante` avec la branche 404 : laquelle termine vraiment la réponse ?",
                explain: "Chaque réponse doit se terminer par `res.end(...)`. `write` sert à envoyer un corps en plusieurs morceaux (un gros fichier, par exemple), suivi d'un `end` final. Ici, `end` avec le JSON fait les deux en une fois."
              },
              {
                type: 'code',
                prompt: "Écris `router(requete)` pour une petite API de notes gardées en mémoire dans `NOTES` :\n\n- `GET /notes` : 200 et le tableau des notes ;\n- `GET /notes/2` : 200 et la note d'identifiant 2, ou 404 si elle n'existe pas ;\n- tout le reste : 404.\n\nLes réponses 404 ont le corps `{ erreur: 'introuvable' }`.",
                starter: `const NOTES = [
  { id: 1, texte: 'Lire la doc de Node' },
  { id: 2, texte: 'Tester avec curl' }
];

function router(requete) {
  // requete = { method: 'GET', path: '/notes/2' }
  return { status: 404, body: { erreur: 'introuvable' } };
}
`,
                solution: `const NOTES = [
  { id: 1, texte: 'Lire la doc de Node' },
  { id: 2, texte: 'Tester avec curl' }
];

function router(requete) {
  if (requete.method === 'GET' && requete.path === '/notes') {
    return { status: 200, body: NOTES };
  }
  const morceaux = requete.path.split('/'); // ['', 'notes', '2']
  if (requete.method === 'GET' && morceaux.length === 3 && morceaux[1] === 'notes') {
    const note = NOTES.find((n) => n.id === Number(morceaux[2]));
    if (note) return { status: 200, body: note };
  }
  return { status: 404, body: { erreur: 'introuvable' } };
}
`,
                tests: [
                  { code: "assertEqual(router({ method: 'GET', path: '/notes' }), { status: 200, body: NOTES })", label: "GET /notes : 200 et toutes les notes" },
                  { code: "assertEqual(router({ method: 'GET', path: '/notes/2' }), { status: 200, body: { id: 2, texte: 'Tester avec curl' } })", label: "GET /notes/2 : 200 et la note 2" },
                  { code: "assertEqual(router({ method: 'GET', path: '/notes/9' }).status, 404)", label: "GET /notes/9 (absente) : 404" },
                  { code: "assertEqual(router({ method: 'GET', path: '/autre' }).status, 404)", label: "Chemin inconnu : 404" }
                ],
                hint: "`'/notes/2'.split('/')` donne `['', 'notes', '2']`. L'identifiant arrive en chaîne : convertis-le avec `Number` avant de le comparer.",
                explain: "Le routeur teste d'abord la route exacte, puis découpe le chemin pour reconnaître `/notes/:id`. `Number(morceaux[2])` est indispensable : `'2' === 2` est faux. Comme la fonction est pure, on la teste sans lancer de serveur ; en production, la fonction passée à `createServer` l'appelle et envoie le résultat."
              }
            ],
            challenge: {
              type: 'predict',
              prompt: "Ce routeur compare les chemins tels quels. Qu'affiche ce programme ?",
              code: `function router({ method, path }) {
  if (path === '/sante') {
    return method === 'GET' ? 200 : 405;
  }
  return 404;
}

console.log(router({ method: 'GET', path: '/sante' }));
console.log(router({ method: 'POST', path: '/sante' }));
console.log(router({ method: 'GET', path: '/sante/' }));
console.log(router({ method: 'GET', path: '/sante?verbose=1' }));`,
              answer: `200
405
404
404`,
              mistakes: [
                { answer: `200
405
200
200`, why: "Le routeur compare des chaînes exactes : `'/sante/'` et `'/sante?verbose=1'` ne sont pas égales à `'/sante'`. Il faut retirer la query string (et éventuellement la barre finale) avant de router." },
                { answer: `200
404
404
404`, why: "Pour `POST /sante`, le chemin correspond : on entre dans le premier `if`, et la méthode n'étant pas `GET`, la fonction renvoie 405." }
              ],
              hint: "`===` entre chaînes : un seul caractère de différence suffit pour que ce soit faux.",
              explain: "405 (Method Not Allowed) signale un chemin connu avec une méthode non prévue, 404 un chemin inconnu. Les deux derniers appels montrent pourquoi l'exemple de la leçon retire la query string avec `req.url.split('?')[0]` : sans ça, le moindre paramètre casse le routage."
            },
            recap: [
              "`http.createServer(gerer)` appelle `gerer(req, res)` pour chaque requête.",
              "`req.method`, `req.url`, `req.headers` décrivent la requête.",
              "`res.writeHead` puis `res.end` : sans `end`, le client attend indéfiniment.",
              "La logique de routage dans une fonction pure se teste sans réseau."
            ],
            check: {
              type: 'fill',
              run: false,
              prompt: "Complète la fonction passée à `http.createServer(gerer)` pour qu'elle réponde `{\"statut\":\"ok\"}` en JSON à `GET /sante`.",
              code: `function gerer(req, res) {
  if (req.___ === 'GET' && req.url === '/sante') {
    res.writeHead(___, { 'Content-Type': 'application/json' });
    res.___(JSON.stringify({ statut: 'ok' }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erreur: 'introuvable' }));
}`,
              blanks: [
                { answers: ['method'], options: ['method', 'verb', 'type'], why: { 'verb': "La propriété s'appelle `method`, comme la méthode HTTP.", 'type': "`req.type` n'existe pas : la méthode HTTP est dans `req.method`." } },
                { answers: ['200'], options: ['200', '201', '204'], why: { '201': "201 annonce une création ; ici on lit un état.", '204': "204 annonce une réponse sans corps, or on envoie du JSON." } },
                { answers: ['end'], options: ['end', 'send', 'json'], why: { 'send': "`send` appartient à Express, pas au module `http`.", 'json': "`res.json` est aussi un raccourci d'Express." } }
              ],
              hint: "Avec le module `http`, la réponse se fait toujours en deux temps : en-têtes, puis corps et fin.",
              explain: "`req.method` donne la méthode, `200` signale une lecture réussie, et `res.end` envoie le corps et termine la réponse. Les raccourcis `send` et `json` n'existent qu'avec Express, que tu verras juste après."
            }
          },
          {
            id: 'api.u4.l2',
            title: 'Express : routes et middlewares',
            minutes: 8,
            objective: "Tu sais déclarer des routes Express avec paramètres et expliquer comment une chaîne de middlewares laisse passer ou arrête une requête.",
            explain: P(
              "**Express** est le framework web le plus utilisé de Node (l'équivalent de Flask en Python). Il t'évite le découpage à la main :",
              "- des **routes** par méthode : `app.get('/taches/:id', ...)`, `app.post(...)`, `app.delete(...)` ;\n- les **paramètres** prêts à l'emploi : `req.params.id` (chemin), `req.query.page` (query string), `req.body` (corps JSON, une fois `express.json()` branché) ;\n- des raccourcis de réponse : `res.status(404).json({ ... })`.",
              "Un **middleware** est une fonction `(req, res, next)` exécutée avant les routes, dans l'ordre des `app.use`. Elle peut répondre elle-même (et la chaîne s'arrête), ou appeler `next()` pour passer la main à la suivante. Lecture du JSON, journaux, authentification : ce sont des middlewares.",
              "À essayer sur ton ordinateur : `npm install express`, copie l'exemple dans `server.js`, lance `node server.js`, puis `curl http://localhost:3000/taches/1`."
            ),
            example: {
              run: false,
              code: `const express = require('express');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

const taches = [{ id: 1, titre: 'Lire la doc', faite: false }];
app.get('/taches/:id', (req, res) => {
  const tache = taches.find((t) => t.id === Number(req.params.id));
  if (!tache) return res.status(404).json({ erreur: 'introuvable' });
  res.json(tache);
});
app.listen(3000, () => console.log('API sur http://localhost:3000'));`,
              notes: [
                { line: 3, text: "Middleware intégré : il lit les corps JSON et remplit `req.body`." },
                { line: 4, text: "Middleware maison : il journalise chaque requête, puis `next()` passe la main." },
                { line: 10, text: "`:id` déclare un paramètre de chemin, lu dans `req.params.id` (toujours une chaîne)." },
                { line: 12, text: "`return` arrête la fonction après la réponse 404 : on ne répond qu'une fois." }
              ]
            },
            exercises: [
              {
                type: 'fill',
                run: false,
                prompt: "Ce module de routes reçoit `app` (créé avec `express()`) et le tableau `taches`. `GET /taches?faite=true` filtre les tâches, `GET /taches/3` renvoie la tâche 3. Complète.",
                code: `function routesTaches(app, taches) {
  app.get('/taches', (req, res) => {
    const filtre = req.___.faite;
    res.json(filtre ? taches.filter((t) => String(t.faite) === filtre) : taches);
  });
  app.get('/taches/:id', (req, res) => {
    const tache = taches.find((t) => t.id === Number(req.___.id));
    if (!tache) return res.___(404).json({ erreur: 'introuvable' });
    res.json(tache);
  });
}`,
                blanks: [
                  { answers: ['query'], options: ['query', 'params', 'body'], why: { 'params': "`req.params` contient les paramètres du chemin (`:id`), pas ceux après le `?`.", 'body': "Une requête `GET` n'a pas de corps : le filtre est dans la query string." } },
                  { answers: ['params'], options: ['params', 'query', 'body'], why: { 'query': "L'identifiant fait partie du chemin `/taches/:id`, pas de la query string.", 'body': "Le corps n'existe pas dans un `GET` ; l'identifiant est dans le chemin." } },
                  { answers: ['status'], options: ['status', 'send', 'code'], why: { 'send': "`send` envoie un corps ; il faut d'abord fixer le code avec `status`.", 'code': "La méthode d'Express s'appelle `status`." } }
                ],
                hint: "Chemin `/taches/:id` : `params`. Après le `?` : `query`. Le code de statut : la méthode qui se chaîne avant `.json(...)`.",
                explain: "Express range chaque information à sa place : `req.query` pour la query string, `req.params` pour les segments variables du chemin, `req.body` pour le corps. `res.status(404)` renvoie `res`, ce qui permet d'enchaîner `.json(...)`. Recevoir `app` en paramètre permet de découper l'API en plusieurs fichiers."
              },
              {
                type: 'order',
                run: false,
                prompt: "Cette fonction fabrique l'application Express (on l'importe ensuite dans `server.js` et dans les tests). Remets ses lignes dans l'ordre.",
                lines: [
                  "function creerApp(express, routesTaches, taches) {",
                  "  const app = express();",
                  "  app.use(express.json());",
                  "  routesTaches(app, taches);",
                  "  app.use((req, res) => res.status(404).json({ erreur: 'route inconnue' }));",
                  "  return app;",
                  "}"
                ],
                hint: "Les middlewares s'exécutent dans l'ordre de déclaration : ce qui lit le corps vient avant les routes, et le « filet » 404 après toutes les routes.",
                explain: "`express.json()` doit être branché avant les routes qui lisent `req.body`. Le middleware final ne reçoit que les requêtes qu'aucune route n'a traitées : placé avant les routes, il répondrait 404 à tout. Séparer la création de l'appli (`creerApp`) de son lancement (`listen`) permet de la tester sans ouvrir de port."
              }
            ],
            challenge: {
              type: 'code',
              prompt: "Express transforme un modèle comme `'/taches/:id'` en règle de correspondance. Écris `correspond(modele, chemin)` qui renvoie l'objet des paramètres si le chemin correspond au modèle, sinon `null`.\n\nExemples : `correspond('/taches/:id', '/taches/42')` donne `{ id: '42' }` ; `correspond('/taches', '/taches')` donne `{}` ; `correspond('/taches/:id', '/notes/42')` donne `null`.",
              starter: `function correspond(modele, chemin) {
  // ton code ici
  return null;
}
`,
              solution: `function correspond(modele, chemin) {
  const a = modele.split('/');
  const b = chemin.split('/');
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = b[i];
    else if (a[i] !== b[i]) return null;
  }
  return params;
}
`,
              tests: [
                { code: "assertEqual(correspond('/taches/:id', '/taches/42'), { id: '42' })", label: "/taches/:id et /taches/42 : { id: '42' }" },
                { code: "assertEqual(correspond('/users/:uid/taches/:id', '/users/7/taches/3'), { uid: '7', id: '3' })", label: "Deux paramètres" },
                { code: "assertEqual(correspond('/taches', '/taches'), {})", label: "Sans paramètre : objet vide" },
                { code: "assertEqual(correspond('/taches/:id', '/taches'), null)", label: "Nombre de segments différent : null" },
                { code: "assertEqual(correspond('/taches/:id', '/notes/42'), null)", label: "Segment fixe différent : null" }
              ],
              hint: "Découpe les deux chaînes sur `/` et compare segment par segment. Un segment du modèle qui commence par `:` capture la valeur au lieu d'être comparé.",
              explain: "Le modèle et le chemin doivent avoir le même nombre de segments. Les segments fixes doivent être identiques ; les segments `:nom` acceptent n'importe quelle valeur et la rangent dans l'objet. C'est, en simplifié, ce qu'Express fait pour remplir `req.params`."
            },
            recap: [
              "Express : `app.get`, `app.post`, `app.patch`, `app.delete` déclarent les routes.",
              "`req.params` (chemin), `req.query` (après le `?`), `req.body` (corps JSON).",
              "Un middleware `(req, res, next)` répond lui-même ou appelle `next()`.",
              "L'ordre des `app.use` compte : JSON avant les routes, 404 après."
            ],
            check: {
              type: 'qcm',
              run: false,
              prompt: "Un client appelle `GET /profil` **sans** en-tête `Authorization`. Que se passe-t-il ?",
              code: `app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ erreur: 'connexion requise' });
  }
  next();
});
app.get('/profil', (req, res) => res.json({ nom: 'Ada' }));`,
              choices: [
                "Il reçoit 401, puis Express exécute quand même la route `/profil`",
                "Il reçoit `{ nom: 'Ada' }`, car les routes passent avant les middlewares",
                "Il reçoit 404, car le middleware n'a pas appelé `next()`",
                "Il reçoit 401 et la route `/profil` n'est jamais exécutée"
              ],
              answer: 3,
              why: {
                0: "Le `return` sort du middleware avant `next()` : la chaîne s'arrête là, la route n'est jamais appelée.",
                1: "Les middlewares déclarés avec `app.use` avant la route passent en premier : c'est tout leur intérêt.",
                2: "Ne pas appeler `next()` n'entraîne pas de 404 : le middleware a déjà envoyé sa propre réponse, 401."
              },
              hint: "Suis la requête : quel est le premier code qu'elle traverse, et que fait `return` ?",
              explain: "Le middleware est déclaré avant la route, il s'exécute donc en premier. Sans en-tête, il répond 401 et sort avec `return` ; `next()` n'est jamais appelé, donc la route ne s'exécute pas. C'est le principe d'un middleware d'authentification."
            }
          }
        ]
      }
    ]
  };

  CQ.addTrack({
    id: 'api',
    title: 'Back-end et API',
    lang: 'javascript',
    summary: "Construire, sécuriser et mettre en ligne une API web avec Node.js et Express.",
    why: "Toute appli moderne, web, mobile ou d'IA, parle à un serveur à travers une API. Savoir en écrire une te permet de brancher ton modèle, ta base de données ou ton appli au reste du monde, proprement et en sécurité.",
    requires: ['js.u6'],
    chapters: [c1]
  });
})();
