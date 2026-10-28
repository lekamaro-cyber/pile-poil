d = {1: "un", 1.0: "un flottant", True: "vrai"}
print(d, len(d))
d2 = {}
d2[0] = "zéro"
d2[False] = "faux"
d2[0.0] = "flottant"
print(d2)
print({1: "a"}[1.0], {True: "t"}[1], {(1, 2): "t"}[(1.0, 2.0)], hash(1) == hash(1.0) == hash(True))
