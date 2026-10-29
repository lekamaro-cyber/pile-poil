def compteur():
    n = 0
    def incremente():
        nonlocal n
        n += 1
        return n
    return incremente
c1 = compteur()
c2 = compteur()
print(c1(), c1(), c1(), c2())
def multiplicateur(k):
    return lambda x: x * k
double, triple = multiplicateur(2), multiplicateur(3)
print(double(5), triple(5))
def exterieur():
    x = "extérieur"
    def interieur():
        return x
    x = "modifié"
    return interieur()
print(exterieur())
