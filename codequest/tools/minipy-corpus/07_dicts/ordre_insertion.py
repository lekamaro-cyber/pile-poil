d = {}
d["c"] = 3
d["a"] = 1
d["b"] = 2
print(d)
d["a"] = 10
print(d)
del d["c"]
d["c"] = 30
print(d, list(d))
print({3: "a", 1: "b", 2: "c"}, {"z": 1, "a": 2})
