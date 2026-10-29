def creer_profil(nom, **infos):
    profil = {"nom": nom}
    profil.update(infos)
    return profil
print(creer_profil("Ana", age=12, ville="Lyon"), creer_profil("Bob"))
def affiche(**kw):
    for k, v in kw.items():
        print(f"{k}: {v}")
affiche(b=2, a=1, c=3)
options = {"sep": " | ", "end": " FIN\n"}
print("x", "y", **options)
