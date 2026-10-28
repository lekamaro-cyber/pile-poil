l = [3, 1, 3, 2, 1, 5, 2]
print(len(set(l)), sorted(set(l)))
vus = set()
uniques = []
for x in l:
    if x not in vus:
        vus.add(x)
        uniques.append(x)
print(uniques, list(dict.fromkeys(l)))
mots = "le chat et le chien et le chat".split()
print(sorted(set(mots)), len(mots) - len(set(mots)))
