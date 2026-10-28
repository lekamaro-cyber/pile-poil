nombres = [5, 2, 9, 1, 5, 6]
print(sorted(nombres), sorted(nombres, reverse=True), nombres)
nombres.sort(reverse=True)
print(nombres)
mots = ["poire", "Kiwi", "banane", "abricot", "Ananas"]
print(sorted(mots), sorted(mots, key=str.lower), sorted(mots, key=len), sorted(mots, key=lambda m: (len(m), m)))
eleves = [("Bob", 12), ("Ana", 15), ("Cyril", 12), ("Dan", 15)]
print(sorted(eleves, key=lambda e: e[1]), sorted(eleves, key=lambda e: -e[1]), sorted(eleves, key=lambda e: e[1], reverse=True))
print(sorted([3, 1, 2], key=None), sorted("hello"), sorted({3: "a", 1: "b"}), sorted((2, 1)), sorted([[2, 1], [1, 2], [1]]))
