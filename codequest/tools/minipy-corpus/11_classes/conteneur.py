class Panier:
    def __init__(self):
        self.articles = []
    def __len__(self):
        return len(self.articles)
    def __getitem__(self, i):
        return self.articles[i]
    def __setitem__(self, i, v):
        self.articles[i] = v
    def __contains__(self, x):
        return x in self.articles
    def __iter__(self):
        return iter(self.articles)
    def ajoute(self, x):
        self.articles.append(x)
        return self
p = Panier()
p.ajoute("pomme").ajoute("kiwi").ajoute("pain")
p[1] = "banane"
print(len(p), p[0], p[-1], "pain" in p, "kiwi" in p, list(p), [a.upper() for a in p], bool(p), bool(Panier()))
for i, a in enumerate(p):
    print(i, a)
print(p[0:2], sorted(p), max(p))
