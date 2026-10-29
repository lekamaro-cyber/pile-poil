valeurs = [1, 2, 3, 0, 4]
it = iter(valeurs)
print(list(iter(lambda: next(it), 0)))
compteur = [0]
def tick():
    compteur[0] += 1
    return compteur[0]
print(list(iter(tick, 5)))
