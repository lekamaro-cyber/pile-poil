etudiants = [("Martin", "Léa", 15), ("Dupont", "Max", 12), ("Martin", "Alex", 15)]
print(sorted(etudiants), sorted(etudiants, key=lambda e: (-e[2], e[0], e[1])))
print(min(etudiants, key=lambda e: e[2]), (1, 2, 3) < (1, 2), (1, 2) < (1, 2, 3))
