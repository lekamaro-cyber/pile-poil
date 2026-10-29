def a():
    x = 1
    def b():
        def c():
            nonlocal x
            x += 10
            return x
        return c()
    r = b()
    return x, r
print(a())
def total():
    resultat = []
    def ajouter(v):
        resultat.append(v)
    ajouter(1); ajouter(2)
    return resultat
print(total())
