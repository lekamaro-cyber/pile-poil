nombres = [3, 1, 4, 1, 5, 9, 2, 6]
print(sum(x * x for x in nombres), max(x % 5 for x in nombres), any(x > 8 for x in nombres), all(x > 0 for x in nombres))
print(sorted(x for x in nombres if x % 2), list(x * 2 for x in range(3)), tuple(c for c in "ab"), set(x % 3 for x in range(10)))
print(", ".join(str(x) for x in nombres), dict((k, len(k)) for k in ["ab", "c"]), min((len(m), m) for m in ["ccc", "a", "bb"]))
g = (x ** 2 for x in range(4))
print(next(g), next(g), list(g), list(g))
