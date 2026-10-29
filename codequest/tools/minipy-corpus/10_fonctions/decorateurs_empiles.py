def gras(f):
    return lambda: "<b>" + f() + "</b>"
def italique(f):
    return lambda: "<i>" + f() + "</i>"
@gras
@italique
def texte():
    return "salut"
print(texte())
compteur_appels = {}
def compte(f):
    def w(*a):
        compteur_appels[f.__name__] = compteur_appels.get(f.__name__, 0) + 1
        return f(*a)
    return w
@compte
def carre(x):
    return x * x
[carre(i) for i in range(5)]
print(compteur_appels)
