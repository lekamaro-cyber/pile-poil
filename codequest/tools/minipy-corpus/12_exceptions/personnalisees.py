class ErreurMetier(Exception):
    pass
class SoldeInsuffisant(ErreurMetier):
    def __init__(self, solde, montant):
        super().__init__(f"solde {solde} < {montant}")
        self.solde = solde
        self.montant = montant
class Simple(Exception):
    def __init__(self, x):
        self.x = x
def retirer(solde, montant):
    if montant > solde:
        raise SoldeInsuffisant(solde, montant)
    return solde - montant
try:
    retirer(10, 50)
except ErreurMetier as e:
    print(type(e).__name__, e, e.solde, e.montant, e.args)
s = Simple(42)
print(s.args, str(s), repr(s), s.x)
print(repr(ErreurMetier("a", 1)), str(ErreurMetier("a", 1)), str(ErreurMetier()), repr(ErreurMetier()))
