print(sorted({3: 1, 1: 2}), sorted({3, 1, 2}), sorted("bca"), sorted((3, 1)), sorted(range(3, 0, -1)), sorted(map(abs, [-3, 1, -2])))
print(sorted([1, 2, 3], key=lambda x: -x), sorted(["b", "A", "c"], key=str.casefold))
