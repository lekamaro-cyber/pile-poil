class Ressource:
    def __init__(self, nom):
        self.nom = nom
    def __enter__(self):
        print("ouverture", self.nom)
        return self
    def __exit__(self, type_exc, valeur, tb):
        print("fermeture", self.nom, type_exc.__name__ if type_exc else None)
        return type_exc is KeyError
with Ressource("A") as r:
    print("utilisation", r.nom)
with Ressource("B"):
    raise KeyError("ignorée")
print("après B")
try:
    with Ressource("C"):
        raise ValueError("propagée")
except ValueError as e:
    print("rattrapée", e)
with Ressource("D") as d, Ressource("E") as e:
    print(d.nom, e.nom)
