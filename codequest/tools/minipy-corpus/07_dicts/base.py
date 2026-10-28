d = {"nom": "Ada", "age": 36}
d["ville"] = "Londres"
d["age"] = 37
print(d, len(d), d["nom"], "age" in d, "Ada" in d, d.get("x"), d.get("x", 0))
print(list(d), list(d.keys()), list(d.values()), list(d.items()))
for cle in d:
    print(cle, d[cle])
for cle, valeur in d.items():
    print(f"{cle} = {valeur}")
print(dict(a=1, b=2), dict([("x", 1)]), dict({"y": 2}, z=3), dict(zip("ab", [1, 2])), {})
