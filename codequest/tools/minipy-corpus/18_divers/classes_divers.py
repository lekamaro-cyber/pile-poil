class Compte:
    taux = 0.02
    nb = 0
    def __init__(self, titulaire, solde=0):
        self.titulaire = titulaire
        self._solde = solde
        Compte.nb += 1
    @property
    def solde(self):
        return self._solde
    @classmethod
    def ouvrir(cls, titulaire):
        return cls(titulaire, 10)
    @staticmethod
    def valide(montant):
        return montant > 0
    def __repr__(self):
        return f"Compte({self.titulaire!r}, {self._solde})"
    def __eq__(self, autre):
        return isinstance(autre, Compte) and self._solde == autre._solde
    def __lt__(self, autre):
        return self._solde < autre._solde
class Epargne(Compte):
    taux = 0.04
    def __init__(self, titulaire, solde=0, plafond=1000):
        super().__init__(titulaire, solde)
        self.plafond = plafond
    def __str__(self):
        return f"Épargne de {self.titulaire} : {self.solde}"
a = Compte.ouvrir("Ada")
b = Epargne("Linus", 50)
print(a, b, repr(b), a == Compte("X", 10), sorted([b, a]))
print(Compte.nb, b.taux, Compte.valide(-1), isinstance(b, Compte), issubclass(Epargne, Compte))
try:
    a.solde = 5
except AttributeError as e:
    print("AttributeError")
print(type(b).__name__, type(b), hasattr(b, "plafond"), getattr(b, "zzz", "?"))
