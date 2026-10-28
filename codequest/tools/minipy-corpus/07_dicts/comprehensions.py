carres = {x: x * x for x in range(6)}
print(carres)
inverse = {v: k for k, v in {"a": 1, "b": 2}.items()}
print(inverse, {k: v for k, v in carres.items() if v % 2 == 0}, {c: ord(c) for c in "abc"})
mots = ["chat", "chien", "cheval", "oiseau"]
par_lettre = {}
for m in mots:
    par_lettre.setdefault(m[0], []).append(m)
print(par_lettre, {m: len(m) for m in mots})
