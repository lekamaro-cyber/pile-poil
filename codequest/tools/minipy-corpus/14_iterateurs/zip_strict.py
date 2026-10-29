print(list(zip([1, 2], "ab", strict=True)))
try:
    list(zip([1, 2, 3], "ab", strict=True))
except ValueError as e:
    print("ValueError:", e)
noms = ["a", "b"]
ages = [1, 2]
for n, a in zip(noms, ages):
    print(n, a)
print(dict(zip(noms, ages)), list(zip(*[(1, "x"), (2, "y")])))
