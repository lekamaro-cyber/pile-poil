class SoldeInsuffisant(Exception):
    pass
def retirer(solde, montant):
    if montant > solde:
        raise SoldeInsuffisant(f"solde {solde} < {montant}")
    return solde - montant
try:
    retirer(10, 50)
except SoldeInsuffisant as e:
    print("erreur :", e, repr(e))
retirer(1, 2)
