def ajoute(x, liste=[]):
    liste.append(x)
    return liste
print(ajoute(1), ajoute(2), ajoute(3, []), ajoute(4))
def ajoute_bien(x, liste=None):
    if liste is None:
        liste = []
    liste.append(x)
    return liste
print(ajoute_bien(1), ajoute_bien(2))
