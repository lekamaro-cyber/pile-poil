d = {"a": 1, "b": 2, "c": 3}
print(d.pop("a"), d.pop("z", "défaut"), d)
print(d.setdefault("b", 99), d.setdefault("d", 4), d)
d.update({"b": 20, "e": 5}, f=6)
print(d)
print(d.popitem(), d)
c = d.copy()
c["b"] = 0
print(d, c)
print(dict.fromkeys("abc"), dict.fromkeys(["x", "y"], 0))
d.clear()
print(d)
