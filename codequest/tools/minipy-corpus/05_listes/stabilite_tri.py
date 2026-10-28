donnees = [("b", 2), ("a", 2), ("c", 1), ("d", 1), ("e", 3), ("f", 2)]
print(sorted(donnees, key=lambda x: x[1]))
print(sorted(donnees, key=lambda x: x[1], reverse=True))
grand = [(i % 7, i) for i in range(100)]
r = sorted(grand, key=lambda x: x[0])
print(r[:10], r[-5:])
print(sorted(range(100), key=lambda x: (x % 3, -x))[:12])
