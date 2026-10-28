age, membre, solde = 20, True, -5
if age >= 18 and (membre or solde > 0):
    print("accès")
if not (age < 18) and not solde > 0:
    print("majeur sans solde")
valeur = [] or {} or "défaut"
print(valeur, 0 or None, [1] and "oui", "" and "jamais")
x = None
print(x is None and "vide", x or "remplacement")
