class Eleve:
    effectif = 0
    tous = []
    def __init__(self, nom):
        self.nom = nom
        Eleve.effectif += 1
        Eleve.tous.append(self)
    def __repr__(self):
        return self.nom
for n in ["Ana", "Bob", "Cléo"]:
    Eleve(n)
print(Eleve.effectif, Eleve.tous, [e.nom.upper() for e in Eleve.tous])
