// CodeQuest — parcours « Autres langages », fichier 2 : Java, C#, PHP.
(function () {
  var P = function () { return Array.prototype.slice.call(arguments).join('\n\n'); };

  // ---------------------------------------------------------------- autres.c4
  CQ.addChapter('autres', {
    id: 'autres.c4',
    title: 'Java',
    units: [
      {
        id: 'autres.u6',
        title: 'Bases de Java',
        summary: "La classe Main, les types, ArrayList, puis vos propres classes et objets.",
        requires: ['py.u14'],
        lessons: [
          {
            id: 'autres.u6.l1',
            title: 'Premier programme Java',
            minutes: 8,
            lang: 'java',
            objective: "Tu sais écrire un programme Java avec une classe `Main`, des types, une `ArrayList` et une classe avec constructeur et méthodes.",
            explain: P(
              "**Java** (1995) tourne partout où il y a une machine virtuelle Java (JVM) : serveurs d'entreprise et banques (framework Spring), Android historiquement, big data (Spark), Minecraft. **Forces** : typage statique strict, écosystème énorme, excellentes performances une fois lancé, ramasse-miettes. **Limites** : verbeux, démarrage plus lent, tout doit être dans une classe.",
              "Par rapport à Python :",
              "- tout le code est dans une **classe** ; le programme démarre dans `public static void main(String[] args)` ;\n- types déclarés : `int`, `double`, `boolean`, `String` (avec une majuscule : c'est une classe) ; `var` laisse le compilateur déduire le type ;\n- `ArrayList<String>` est la liste : `add`, `get(i)`, `size()`. Elle ne contient que des objets : on écrit `ArrayList<Integer>`, pas `ArrayList<int>` ;\n- on compare des textes avec `a.equals(b)` : `==` compare les références (« est-ce le même objet ? »), comme `is` en Python.",
              "À essayer sur ton ordinateur : installe un JDK (par exemple `winget install EclipseAdoptium.Temurin.21.JDK`), écris `Main.java`, puis `javac Main.java` (qui produit le bytecode `Main.class`) et `java Main`. Depuis Java 11, `java Main.java` fait les deux d'un coup."
            ),
            example: {
              code: `import java.util.ArrayList;

class Livre {
    String titre;
    int pages;

    Livre(String titre, int pages) { this.titre = titre; this.pages = pages; }

    boolean estLong() { return pages > 400; }
}

public class Main {
    public static void main(String[] args) {
        ArrayList<Livre> pile = new ArrayList<>();
        pile.add(new Livre("Dune", 896));
        pile.add(new Livre("Le Petit Prince", 96));
        for (Livre l : pile) System.out.println(l.titre + " : " + l.estLong());
    }
}`,
              output: `Dune : true
Le Petit Prince : false`,
              notes: [
                { line: 7, text: "Le constructeur porte le nom de la classe. `this` joue le rôle de `self` en Python." },
                { line: 12, text: "La classe publique doit porter le nom du fichier : `Main.java`." },
                { line: 14, text: "Liste typée : elle n'accepte que des `Livre`. Les chevrons vides `<>` reprennent le type déclaré à gauche." },
                { line: 17, text: "Boucle « pour chaque », comme `for l in pile:` ; `+` convertit les valeurs en texte." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Qu'affiche ce programme ?",
                code: `public class Main {
    public static void main(String[] args) {
        int a = 7;
        int b = 2;
        double c = a / b;
        String s = "Score : " + a + b;
        System.out.println(c);
        System.out.println(s);
        System.out.println(a + b + " points");
    }
}`,
                answer: `3.0
Score : 72
9 points`,
                mistakes: [
                  { answer: `3.5
Score : 9
9 points`, why: "`a / b` est une division entre deux `int` : 3, rangé ensuite dans un `double` (3.0). Et `\"Score : \" + a` est déjà une chaîne : on lui colle ensuite `b`." },
                  { answer: `3.0
Score : 72
72 points`, why: "Le `+` se lit de gauche à droite : `a + b` est d'abord une addition d'entiers (9), puis on colle le texte." }
                ],
                hint: "Lis chaque `+` de gauche à droite, en regardant si l'opérande de gauche est déjà une chaîne.",
                explain: "Comme en C, `7 / 2` entre entiers vaut 3. Pour le `+`, dès que le côté gauche est une `String`, tout ce qui suit est concaténé (« Score : 7 » puis « Score : 72 ») ; tant que les deux côtés sont des nombres, c'est une addition (9, puis « 9 points »). Python, lui, refuserait `\"Score : \" + 7` : il faut `str(7)`."
              },
              {
                type: 'bug',
                prompt: "Le rôle vaut bien `admin`, mais `estAdmin` renvoie `false`. Clique sur la ligne fautive.",
                code: `public class Main {
    static boolean estAdmin(String role) {
        return role == "admin";
    }

    public static void main(String[] args) {
        String role = String.join("", "ad", "min");  // texte construit à l'exécution, comme une saisie
        System.out.println(role);
        System.out.println(estAdmin(role));
    }
}`,
                bugLine: 3,
                why: "`==` compare les références : `role` est un objet `String` créé à l'exécution, distinct du littéral `\"admin\"`, même si le texte est identique.",
                fixes: [
                  "        return role.equals(\"admin\");",
                  "        return \"admin\" == role;",
                  "        return role === \"admin\";"
                ],
                fixAnswer: 0,
                fixWhy: {
                  1: "Inverser les côtés ne change rien : `==` compare toujours les références.",
                  2: "`===` n'existe pas en Java (c'est du JavaScript) : erreur de compilation."
                },
                output: `admin
true`,
                hint: "En Java, `==` sur des objets se comporte comme `is` en Python.",
                explain: "`equals` compare le contenu des chaînes ; `==` vérifie s'il s'agit du même objet en mémoire. Ce bug est sournois : avec deux littéraux identiques, `==` marche souvent par hasard (Java les partage), puis échoue dès que le texte vient d'une saisie ou d'un fichier."
              }
            ],
            challenge: {
              type: 'fill',
              prompt: "Complète la classe `Compte` (attribut caché, constructeur) et la création de l'objet.",
              code: `import java.util.ArrayList;

class Compte {
    ___ double solde;

    Compte(double soldeInitial) {
        ___.solde = soldeInitial;
    }

    void deposer(double montant) {
        if (montant > 0) solde += montant;
    }

    double getSolde() { return solde; }
}

public class Main {
    public static void main(String[] args) {
        ArrayList<Compte> comptes = new ArrayList<>();
        comptes.add(___ Compte(100));
        comptes.get(0).deposer(50);
        comptes.get(0).deposer(-20);
        System.out.println(comptes.get(0).getSolde());
    }
}`,
              blanks: [
                { answers: ['private'], options: ['private', 'var', 'self'], why: { 'var': "`var` sert aux variables locales, pas aux attributs d'une classe : erreur de compilation.", 'self': "`self` n'existe pas en Java." } },
                { answers: ['this'], options: ['this', 'self', 'Compte'], why: { 'self': "`self` est l'écriture Python ; en Java, l'objet courant s'appelle `this`.", 'Compte': "`Compte.solde` désignerait un attribut de classe (`static`), pas celui de cet objet." } },
                { answers: ['new'], options: ['new', 'create', 'make'], why: { 'create': "Java crée un objet avec le mot-clé `new`, toujours.", 'make': "`make` n'est pas un mot-clé Java." } }
              ],
              output: `150.0`,
              hint: "Encapsulation : l'attribut n'est pas accessible de l'extérieur. Et en Java, contrairement à Python, on ne crée pas un objet en appelant simplement la classe.",
              explain: "`private` cache le solde : on ne le modifie que par `deposer`, qui refuse les montants négatifs (le dépôt de -20 est ignoré). `this.solde` désigne l'attribut de l'objet en construction, et `new Compte(100)` crée l'objet. Résultat : 100 + 50 = 150.0, affiché avec sa décimale car c'est un `double`."
            },
            recap: [
              "Tout est dans une classe ; `public static void main(String[] args)` démarre le programme.",
              "Types déclarés, `var` pour l'inférence ; `ArrayList<Integer>` plutôt que `int`.",
              "Classes : attributs `private`, constructeur, `this`, objets créés avec `new`.",
              "Textes : `equals`, jamais `==` ; `javac Main.java` puis `java Main`."
            ],
            check: {
              type: 'qcm',
              prompt: "Tu compiles `Main.java` sur Windows avec `javac`. Que contient le fichier `Main.class` produit, et où peut-il s'exécuter ?",
              choices: [
                "Du code machine Windows : il faut recompiler pour Linux",
                "Le code source compressé, relu ligne à ligne comme du Python",
                "Du JavaScript exécuté par le navigateur",
                "Du bytecode, exécutable par n'importe quelle JVM, sous Windows, macOS ou Linux"
              ],
              answer: 3,
              why: {
                0: "C'est le cas de C ou C++. `javac` produit du bytecode, indépendant du processeur et du système.",
                1: "`javac` vérifie les types et compile vraiment : le fichier contient des instructions pour la JVM, pas le source.",
                2: "Java et JavaScript n'ont que le nom en commun ; le bytecode Java s'exécute dans une JVM."
              },
              hint: "Java s'est fait connaître avec le slogan « Write once, run anywhere ».",
              explain: "`javac` produit du bytecode, que la JVM de chaque système exécute (en compilant à la volée les parties souvent utilisées). On compile une fois, et le même `.class` tourne partout où une JVM est installée."
            }
          }
        ]
      }
    ]
  });

  // ---------------------------------------------------------------- autres.c5
  CQ.addChapter('autres', {
    id: 'autres.c5',
    title: 'C#',
    units: [
      {
        id: 'autres.u7',
        title: 'Bases de C#',
        summary: ".NET, les types, List<T>, les classes avec propriétés, et LINQ en bref.",
        requires: ['py.u14'],
        lessons: [
          {
            id: 'autres.u7.l1',
            title: 'C# et .NET',
            minutes: 8,
            lang: 'csharp',
            objective: "Tu sais lire et écrire un petit programme C# avec des types, une `List<T>`, une classe avec propriétés et une requête LINQ simple.",
            explain: P(
              "**C#** (prononcé « C sharp ») est le langage principal de **.NET**, la plateforme de Microsoft : applis Windows, services web (ASP.NET Core), jeux **Unity**, outils d'entreprise. Ça va te parler : **PowerShell est construit sur .NET** : `Get-Process` renvoie des objets .NET `System.Diagnostics.Process`, et `[string]` est le type .NET `System.String`. **Forces** : typage statique, outils excellents (Visual Studio, VS Code), multiplateforme, performant. **Limites** : écosystème centré sur Microsoft, moins présent en IA que Python.",
              "Par rapport à Python et Java :",
              "- types déclarés (`int`, `double`, `string`, `bool`) ou déduits avec `var` ;\n- `List<string>` est la liste (`Add`, `Count`, `foreach`) ;\n- les classes ont des **propriétés** : `public string Nom { get; set; }` ;\n- `$\"Bonjour {nom}\"` est une chaîne interpolée, comme une f-string ;\n- `==` compare le contenu des chaînes (contrairement à Java) ;\n- **LINQ** interroge une collection, un peu comme SQL : `notes.Where(n => n >= 10).Average()`.",
              "À essayer sur ton ordinateur : installe le SDK .NET (`winget install Microsoft.DotNet.SDK.8`, ou une version plus récente), puis `dotnet new console -o MonAppli`, `cd MonAppli` et `dotnet run`. Le fichier `Program.cs` accepte des instructions directement, sans méthode `Main`, et importe déjà `System`, `System.Collections.Generic` et `System.Linq`."
            ),
            example: {
              code: `var notes = new List<int> { 12, 8, 16, 17 };
notes.Add(9);

var admis = notes.Where(n => n >= 10).ToList();
Console.WriteLine($"{admis.Count} notes sur {notes.Count} sont au moins à 10");
Console.WriteLine($"Moyenne des admis : {admis.Average()}");

var e = new Eleve { Nom = "Ada", Note = 17 };
Console.WriteLine(e.Resume());

class Eleve
{
    public string Nom { get; set; } = "";
    public int Note { get; set; }
    public string Resume() => $"{Nom} : {Note}/20";
}`,
              output: `3 notes sur 5 sont au moins à 10
Moyenne des admis : 15
Ada : 17/20`,
              notes: [
                { line: 1, text: "Liste typée initialisée entre accolades ; `var` déduit `List<int>`." },
                { line: 4, text: "LINQ : `Where` filtre avec une fonction fléchée (une lambda), `ToList` produit une nouvelle liste." },
                { line: 8, text: "Initialiseur d'objet : on remplit les propriétés à la création." },
                { line: 13, text: "Propriété avec lecture (`get`) et écriture (`set`), initialisée à une chaîne vide." }
              ]
            },
            exercises: [
              {
                type: 'qcm',
                prompt: "Que contient `resultat` ?",
                code: `var prix = new List<int> { 30, 5, 12, 50 };
var resultat = prix.Where(p => p > 10).Select(p => p * 2).ToList();`,
                choices: [
                  "`[60, 10, 24, 100]`",
                  "`[30, 12, 50]`",
                  "`[60, 24, 100]`",
                  "`[24, 60, 100]`"
                ],
                answer: 2,
                why: {
                  0: "`Where` retire d'abord 5, qui n'est pas supérieur à 10 : il ne reste que trois éléments à doubler.",
                  1: "Tu as appliqué le filtre, mais pas `Select`, qui transforme chaque élément restant (ici, le double).",
                  3: "LINQ garde l'ordre d'origine : `Where` et `Select` ne trient rien."
                },
                hint: "Applique les étapes dans l'ordre : d'abord filtrer, ensuite transformer.",
                explain: "`Where` garde 30, 12 et 50 ; `Select` les double : 60, 24, 100, dans l'ordre d'origine. En Python, ce serait `[p * 2 for p in prix if p > 10]`. LINQ s'enchaîne étape par étape, comme un pipeline PowerShell (`Where-Object`, `ForEach-Object`)."
              },
              {
                type: 'fill',
                prompt: "Complète ce programme qui liste des tâches.",
                code: `var taches = new ___<Tache>();
taches.Add(new Tache { Titre = "Installer .NET", Faite = true });
taches.Add(new Tache { Titre = "Lancer dotnet run", Faite = false });

___ (var t in taches)
{
    Console.WriteLine(___"{t.Titre} : {(t.Faite ? "ok" : "à faire")}");
}

class Tache
{
    public string Titre { get; set; } = "";
    public bool Faite { ___; set; }
}`,
                blanks: [
                  { answers: ['List'], options: ['List', 'Array', 'list'], why: { 'Array': "`Array` est la classe de base des tableaux de taille fixe ; la liste extensible avec `Add` est `List<T>`.", 'list': "C# distingue les majuscules : le type s'écrit `List`." } },
                  { answers: ['foreach'], options: ['foreach', 'for', 'each'], why: { 'for': "`for` attend une initialisation, une condition et un pas ; pour parcourir les éléments, c'est `foreach`.", 'each': "Ce mot-clé n'existe pas en C# : c'est `foreach (var t in taches)`." } },
                  { answers: ['$'], options: ['$', 'f', '@'], why: { 'f': "Le préfixe `f` est celui des f-strings Python ; en C#, c'est `$`.", '@': "`@` crée une chaîne « verbatim » (sans échappements), sans remplacer les `{...}`." } },
                  { answers: ['get'], options: ['get', 'read', 'let'], why: { 'read': "Les accesseurs d'une propriété s'appellent `get` et `set`.", 'let': "`let` n'est pas un accesseur de propriété en C#." } }
                ],
                output: `Installer .NET : ok
Lancer dotnet run : à faire`,
                hint: "Liste typée, boucle « pour chaque », chaîne interpolée, propriété lisible et modifiable.",
                explain: "`List<Tache>` est une liste typée, `foreach` la parcourt, `$\"...\"` insère les valeurs entre accolades (ici une expression conditionnelle entre parenthèses), et `{ get; set; }` fait de `Faite` une propriété lisible et modifiable. C# et PowerShell partagent les mêmes types .NET : `List<T>` existe aussi en PowerShell, avec `[System.Collections.Generic.List[string]]`."
              }
            ],
            challenge: {
              type: 'predict',
              prompt: "Qu'affiche ce programme ?",
              code: `var mots = new List<string> { "data", "IA", "web", "API" };
int total = 0;
foreach (var m in mots)
{
    if (m.ToUpper() == m) total += m.Length;
}
Console.WriteLine(total);
Console.WriteLine(string.Join("-", mots.Where(w => w.Length > 2)));`,
              answer: `5
data-web-API`,
              mistakes: [
                { answer: `0
data-web-API`, why: "En C#, `==` sur deux `string` compare leur contenu (pas les références comme en Java) : « IA » et « API » sont déjà en majuscules, la condition est vraie pour eux." },
                { answer: `5
data-IA-web-API`, why: "« IA » a une longueur de 2 : le filtre `Length > 2` l'exclut." }
              ],
              hint: "Quels mots restent identiques une fois mis en majuscules ? Et pour le filtre, compte les lettres de chaque mot.",
              explain: "« IA » (2) et « API » (3) sont déjà en majuscules : total 5. Puis `Where` garde les mots de plus de 2 lettres, que `string.Join` relie par des tirets. Retiens la différence avec Java : en C#, `==` compare le texte des chaînes, comme en Python."
            },
            recap: [
              "C# et .NET : Windows, web (ASP.NET Core), jeux (Unity) ; PowerShell repose sur .NET.",
              "`List<T>`, `foreach`, propriétés `{ get; set; }`, chaînes `$\"...{x}...\"`.",
              "LINQ : `Where` filtre, `Select` transforme, `Sum`, `Average`, `ToList`.",
              "`dotnet new console` puis `dotnet run`."
            ],
            check: {
              type: 'bug',
              prompt: "Ce programme refuse de compiler : le compilateur signale qu'une propriété est en lecture seule. Clique sur la ligne fautive.",
              code: `var produits = new List<Produit>
{
    new Produit { Nom = "Clavier", Prix = 50 },
    new Produit { Nom = "Souris", Prix = 20 }
};
int total = produits.Sum(p => p.Prix);
Console.WriteLine($"Total : {total} euros");

class Produit
{
    public string Nom { get; set; } = "";
    public int Prix { get; }
}`,
              bugLine: 12,
              why: "`Prix` n'a qu'un accesseur `get` : on peut la lire, mais pas lui donner une valeur dans l'initialiseur `{ Prix = 50 }`.",
              fixes: [
                "    public int Prix { get; set; }",
                "    private int Prix { get; set; }",
                "    public string Prix { get; set; }"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Une propriété `private` n'est plus accessible depuis l'extérieur de la classe : ni l'initialiseur ni `Sum` ne pourraient l'utiliser.",
                2: "Le type ne correspond plus : on ne peut pas ranger l'entier 50 dans une `string`, et `Sum` attend des nombres."
              },
              output: `Total : 70 euros`,
              hint: "Compare les accesseurs de `Nom` et de `Prix`.",
              explain: "Avec `{ get; set; }`, la propriété est lisible et modifiable, donc utilisable dans un initialiseur d'objet. Le typage statique de C# signale l'erreur avant toute exécution, là où Python n'aurait rien dit jusqu'au lancement. (Pour une valeur fixée seulement à la création, C# propose aussi `{ get; init; }`.)"
            }
          }
        ]
      }
    ]
  });

  // ---------------------------------------------------------------- autres.c6
  CQ.addChapter('autres', {
    id: 'autres.c6',
    title: 'PHP',
    units: [
      {
        id: 'autres.u8',
        title: 'Bases de PHP',
        summary: "Variables en $, tableaux associatifs, fonctions, et PHP au cœur d'une page web.",
        requires: ['py.u9'],
        lessons: [
          {
            id: 'autres.u8.l1',
            title: 'PHP, le langage du web côté serveur',
            minutes: 8,
            lang: 'php',
            objective: "Tu sais écrire un script PHP avec des variables, des tableaux associatifs et des fonctions, et générer une page HTML sûre.",
            explain: P(
              "**PHP** fait tourner une grande partie du web : WordPress (plus de 40 % des sites), Wikipédia, et le framework **Laravel**. Le serveur exécute le script à chaque requête et renvoie le HTML produit. **Forces** : hébergement partout et bon marché, démarrage immédiat, frameworks mûrs. **Limites** : un historique incohérent (noms de fonctions disparates), peu utilisé hors du web (IA, mobile).",
              "Par rapport à Python :",
              "- le code est entre `<?php` et `?>`, chaque instruction finit par `;` ;\n- les variables commencent par `$`, comme en PowerShell : `$nom = \"Ada\";` ;\n- `.` concatène (`\"Bonjour \" . $nom`), et les guillemets doubles remplacent les variables (`\"Bonjour $nom\"`), pas les apostrophes ;\n- le **tableau associatif** joue le rôle du dictionnaire : `$ages = [\"Ada\" => 36];`, parcouru avec `foreach ($ages as $cle => $valeur)` ;\n- `function prix_ttc($ht) { return $ht * 1.2; }`.",
              "Dans une page, `<?= $x ?>` affiche une valeur. Échappe toujours ce qui vient d'un utilisateur avec `htmlspecialchars`, contre le XSS.",
              "À essayer sur ton ordinateur : `sudo apt install php-cli` (sous WSL ou Linux) ou l'installeur Windows de php.net, puis `php bonjour.php` ; `php -S localhost:8000` sert le dossier courant, à ouvrir dans ton navigateur."
            ),
            example: {
              code: `<?php
$stock = ["clavier" => 3, "souris" => 0, "ecran" => 5];

function etat(int $quantite): string {
    return $quantite > 0 ? "disponible" : "épuisé";
}

foreach ($stock as $produit => $quantite) {
    echo "$produit : " . etat($quantite) . "\\n";
}
echo count($stock) . " produits\\n";`,
              output: `clavier : disponible
souris : épuisé
ecran : disponible
3 produits`,
              notes: [
                { line: 2, text: "Tableau associatif : chaque clé (`\"clavier\"`) est associée à une valeur, comme un `dict` Python." },
                { line: 4, text: "Les types des paramètres et du résultat sont facultatifs en PHP, mais recommandés." },
                { line: 8, text: "`foreach` donne la clé et la valeur, comme `for produit, quantite in stock.items():`." },
                { line: 9, text: "Entre guillemets doubles, `$produit` est remplacé par sa valeur ; `.` concatène." }
              ]
            },
            exercises: [
              {
                type: 'predict',
                prompt: "Qu'affiche ce script ?",
                code: `<?php
$prix = ["cafe" => 2.5, "the" => 3];
$prix["chocolat"] = 4;
$total = 0;
foreach ($prix as $boisson => $p) {
    $total += $p;
}
echo count($prix) . " boissons, total $total\\n";
echo "Le " . "cafe" . ' coûte $prix' . "\\n";`,
                answer: `3 boissons, total 9.5
Le cafe coûte $prix`,
                mistakes: [
                  { answer: `3 boissons, total 9.5
Le cafe coûte 2.5`, why: "Entre apostrophes, PHP ne remplace pas les variables : `'$prix'` reste le texte « $prix ». (Et même entre guillemets doubles, `$prix` serait un tableau, pas un nombre.)" },
                  { answer: `2 boissons, total 5.5
Le cafe coûte $prix`, why: "`$prix[\"chocolat\"] = 4;` ajoute une troisième entrée au tableau avant la boucle." }
                ],
                hint: "Ajouter une clé à un tableau associatif l'agrandit. Et regarde le type de guillemets de chaque morceau de texte.",
                explain: "Le tableau a trois entrées, dont la somme vaut 2.5 + 3 + 4 = 9.5. Dans la dernière ligne, `'$prix'` est entre apostrophes : aucune substitution, comme avec les apostrophes en PowerShell. Les guillemets doubles, eux, remplacent `$total` par sa valeur."
              },
              {
                type: 'fill',
                prompt: "Complète ce gabarit de page qui affiche des commentaires d'utilisateurs sans risque de XSS.",
                code: `<?php
$commentaires = [
    ["auteur" => "Zoé", "texte" => "Super cours !"],
    ["auteur" => "Max", "texte" => "<script>alert(1)</script>"],
];
?>
<ul>
<?php ___ ($commentaires as $c): ?>
  <li><?= htmlspecialchars($c["auteur"]) ?> : <?= ___($c["texte"]) ?></li>
<?php endforeach; ?>
</ul>`,
                blanks: [
                  { answers: ['foreach'], options: ['foreach', 'for', 'while'], why: { 'for': "En PHP, `for` attend un compteur (`for ($i = 0; ...)`) ; pour parcourir un tableau, c'est `foreach`.", 'while': "`while` attend une condition, pas un parcours de tableau ; et il se termine par `endwhile`, pas `endforeach`." } },
                  { answers: ['htmlspecialchars'], options: ['htmlspecialchars', 'echo', 'strip_tags'], why: { 'echo': "`<?=` affiche déjà la valeur ; `echo` à l'intérieur serait une erreur de syntaxe, et rien ne serait échappé.", 'strip_tags': "`strip_tags` supprime les balises au lieu de les afficher : le texte de Max serait altéré, et ce filtrage n'est pas une protection fiable contre le XSS (attributs, balises mal formées)." } }
                ],
                output: `<ul>
  <li>Zoé : Super cours !</li>
  <li>Max : &lt;script&gt;alert(1)&lt;/script&gt;</li>
</ul>`,
                hint: "Pour parcourir un tableau dans un gabarit : `foreach (...):` et `endforeach;`. Et la même fonction d'échappement que pour l'auteur.",
                explain: "La syntaxe `foreach (...): ... endforeach;` rend les gabarits lisibles en alternant HTML et PHP. `htmlspecialchars` transforme `<` et `>` en entités : le script de Max s'affiche comme du texte au lieu de s'exécuter chez chaque visiteur. Les moteurs de gabarits comme Blade (Laravel) échappent automatiquement."
              }
            ],
            challenge: {
              type: 'bug',
              prompt: "Ce script devrait afficher `Bonjour Ada`, mais PHP 8 s'arrête sur une `TypeError` : « Unsupported operand types: string + string ». Clique sur la ligne fautive.",
              code: `<?php
function saluer(string $prenom): string {
    return "Bonjour " + $prenom;
}

echo saluer("Ada") . "\\n";`,
              bugLine: 3,
              why: "En PHP, `+` est **uniquement** l'addition de nombres. La concaténation de chaînes se fait avec `.`.",
              fixes: [
                "    return \"Bonjour \" . $prenom;",
                "    return 'Bonjour $prenom';",
                "    return \"Bonjour \" & $prenom;"
              ],
              fixAnswer: 0,
              fixWhy: {
                1: "Entre apostrophes, `$prenom` n'est pas remplacé : la fonction renverrait littéralement « Bonjour $prenom ».",
                2: "`&` est un opérateur bit à bit : appliqué à deux chaînes, il produit des caractères sans signification."
              },
              output: `Bonjour Ada`,
              hint: "Habitude Python ou JavaScript : quel opérateur PHP colle deux chaînes ?",
              explain: "PHP sépare clairement les deux opérations : `+` additionne, `.` concatène (et `.=` ajoute à la fin d'une chaîne). On aurait aussi pu écrire `\"Bonjour $prenom\"` avec des guillemets doubles. Python utilise `+` pour les deux, PowerShell aussi : c'est le piège classique en arrivant sur PHP."
            },
            recap: [
              "`<?php ... ?>`, variables en `$`, `;` à chaque instruction.",
              "`.` concatène ; les guillemets doubles remplacent les variables, pas les apostrophes.",
              "Tableau associatif `[\"cle\" => valeur]` et `foreach ($t as $cle => $valeur)`.",
              "Dans une page : `<?= htmlspecialchars($x) ?>` ; pour tester : `php -S localhost:8000`."
            ],
            check: {
              type: 'logic',
              prompt: "Combien d'éléments contient `$t` à la fin de ce script ? (`$t[] = ...` ajoute un élément à la fin, avec la prochaine clé numérique libre.)",
              code: `<?php
$t = ["a" => 1, "b" => 2];
$t["a"] = 10;
$t[] = 3;
$t["c"] = 4;
echo count($t);`,
              answer: '4',
              accept: ['quatre'],
              mistakes: [
                { answer: '5', why: "`$t[\"a\"] = 10;` ne crée pas d'élément : la clé `\"a\"` existe déjà, sa valeur est remplacée." },
                { answer: '3', why: "`$t[] = 3;` ajoute bien un élément, avec la clé numérique 0 : le tableau contient alors a, b et 0, puis c." }
              ],
              hint: "Écrire sur une clé qui existe remplace ; écrire sur une clé nouvelle ajoute.",
              explain: "Au départ : a et b. `$t[\"a\"] = 10` remplace la valeur de a. `$t[] = 3` ajoute la clé 0. `$t[\"c\"] = 4` ajoute c. Total : 4 éléments. Un même tableau PHP mélange clés textuelles et numériques, là où Python sépare `list` et `dict`."
            }
          }
        ]
      }
    ]
  });
})();
