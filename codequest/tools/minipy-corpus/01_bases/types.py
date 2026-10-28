valeurs = [1, 1.0, "1", True, None, [1], (1,), {1: 1}, {1}, range(1), 0]
for v in valeurs:
    print(type(v), type(v).__name__)
print(type(type(1)), type(print), type(len))
