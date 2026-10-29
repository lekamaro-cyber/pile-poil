class Forme:
    def aire(self):
        raise NotImplementedError("à définir dans la sous-classe")
    def decrire(self):
        return f"{type(self).__name__} d'aire {self.aire():.2f}"
class Cercle(Forme):
    def __init__(self, r):
        self.r = r
    def aire(self):
        return 3.14159 * self.r ** 2
class Carre(Forme):
    def __init__(self, c):
        self.c = c
    def aire(self):
        return self.c ** 2
for f in [Cercle(1), Carre(3)]:
    print(f.decrire())
try:
    Forme().decrire()
except NotImplementedError as e:
    print("NotImplementedError:", e)
