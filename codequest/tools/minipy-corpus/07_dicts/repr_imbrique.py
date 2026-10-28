d = {"liste": [1, 2, {"x": None}], "tuple": (1,), "vide": {}, "chaine": "l'été", "flottant": 0.1 + 0.2, 1: True}
print(d)
print(str(d) == repr(d), [d["liste"]], {"k": "\n"})
d["moi"] = d
print(d)
l = [1]
l.append(l)
print(l)
