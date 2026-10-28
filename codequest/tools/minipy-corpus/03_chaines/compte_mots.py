texte = """Le chat mange. Le chien dort.
Le chat dort aussi."""
mots = texte.lower().replace(".", "").split()
compte = {}
for m in mots:
    compte[m] = compte.get(m, 0) + 1
for m in sorted(compte):
    print(m, compte[m])
print(len(mots), len(set(mots)), max(compte, key=compte.get))
