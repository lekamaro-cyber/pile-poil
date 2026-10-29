class Produit:
    def __init__(self, nom, prix, quantite=1):
        self.nom = nom
        self.prix = prix
        self.quantite = quantite
    def total(self):
        return round(self.prix * self.quantite, 2)
    def __repr__(self):
        return f"Produit(nom={self.nom!r}, prix={self.prix}, quantite={self.quantite})"
stock = [Produit("stylo", 1.2, 10), Produit("cahier", 2.5, 4), Produit("gomme", 0.8)]
print(stock)
print(sorted(stock, key=lambda p: p.total(), reverse=True)[0], sum(p.total() for p in stock))
print({p.nom: p.total() for p in stock})
