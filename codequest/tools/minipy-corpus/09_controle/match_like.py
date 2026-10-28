def jour(n):
    noms = {1: "lundi", 2: "mardi", 3: "mercredi"}
    return noms.get(n, "inconnu")
print(jour(1), jour(3), jour(9))
commande = "aide"
if commande == "quitter":
    print("au revoir")
elif commande in ("aide", "?"):
    print("affichage de l'aide")
