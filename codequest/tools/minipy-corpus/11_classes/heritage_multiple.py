class A:
    def qui(self):
        return "A"
class B(A):
    def qui(self):
        return "B>" + super().qui()
class C(A):
    def qui(self):
        return "C>" + super().qui()
class D(B, C):
    def qui(self):
        return "D>" + super().qui()
print(D().qui(), [k.__name__ for k in D.__mro__])
class Volant:
    def voler(self):
        return f"{self.nom} vole"
class Nageur:
    def nager(self):
        return f"{self.nom} nage"
class Canard(Volant, Nageur):
    def __init__(self, nom):
        self.nom = nom
c = Canard("Donald")
print(c.voler(), c.nager(), isinstance(c, Nageur))
