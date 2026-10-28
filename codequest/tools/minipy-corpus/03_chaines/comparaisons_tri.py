mots = ["banane", "Pomme", "abricot", "Éclair", "cerise", "10", "9"]
print(sorted(mots), sorted(mots, key=str.lower), sorted(mots, key=len), sorted(mots, reverse=True))
print(min(mots), max(mots), "a" < "B", "a".lower() < "B".lower())
