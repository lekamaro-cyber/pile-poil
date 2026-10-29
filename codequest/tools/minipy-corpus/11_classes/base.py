class Chien:
    espece = "canis"
    def __init__(self, nom, age):
        self.nom = nom
        self.age = age
    def aboyer(self):
        return f"{self.nom} dit wouf"
    def anniversaire(self):
        self.age += 1
rex = Chien("Rex", 3)
medor = Chien("Médor", 5)
rex.anniversaire()
print(rex.aboyer(), rex.age, medor.age, rex.espece, Chien.espece, rex.nom)
Chien.espece = "loup"
print(rex.espece, medor.espece)
rex.espece = "spécial"
print(rex.espece, medor.espece, Chien.espece)
print(type(rex), type(rex).__name__, rex.__class__.__name__, isinstance(rex, Chien), Chien)
print(vars(rex), rex.__dict__)
