class Compte:
    def __init__(self, solde):
        self._solde = solde
    @property
    def solde(self):
        return self._solde
    @solde.setter
    def solde(self, v):
        if v < 0:
            raise ValueError("solde négatif")
        self._solde = v
    @property
    def double(self):
        return self._solde * 2
c = Compte(100)
c.solde = 50
print(c.solde, c.double)
try:
    c.solde = -1
except ValueError as e:
    print("ValueError:", e)
try:
    c.double = 3
except AttributeError as e:
    print("AttributeError:", e)
print(type(Compte.solde).__name__)
