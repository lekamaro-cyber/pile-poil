def salut(nom, formule="Bonjour", ponctuation="!"):
    return f"{formule} {nom}{ponctuation}"
print(salut("Ana"), salut("Bob", "Salut"), salut("Cléo", ponctuation="?"), salut(formule="Hey", nom="Dan"))
def puissance(base, exposant=2):
    return base ** exposant
print(puissance(3), puissance(2, 10), puissance(exposant=3, base=2))
print(salut.__name__, salut.__defaults__, puissance.__doc__)
