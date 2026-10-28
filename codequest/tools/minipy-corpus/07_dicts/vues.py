d = {"a": 1, "b": 2}
k = d.keys()
v = d.values()
it = d.items()
print(k, v, it, len(k))
d["c"] = 3
print(k, v, it)
print("a" in k, 2 in v, ("a", 1) in it, ("a", 2) in it)
print(k & {"a", "z"}, k | {"z"} == {"a", "b", "c", "z"}, sorted(k - {"a"}), sorted(k ^ {"a", "q"}))
print(list(reversed(d)), list(reversed(d.values())), list(reversed(d.items())))
