class Groupe:
    membres = []
    def ajoute(self, x):
        self.membres.append(x)
g1, g2 = Groupe(), Groupe()
g1.ajoute("a")
print(g2.membres, Groupe.membres)
class GroupeOk:
    def __init__(self):
        self.membres = []
h1, h2 = GroupeOk(), GroupeOk()
h1.membres.append("a")
print(h2.membres)
