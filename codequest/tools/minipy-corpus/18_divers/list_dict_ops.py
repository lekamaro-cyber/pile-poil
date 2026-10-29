l = [5, 3, 8, 1]
l.sort(reverse=True)
print(l, sorted(l, key=lambda x: x % 3), l.index(8), l.count(3))
l.insert(1, 7); l.remove(3); print(l, l.pop(), l.pop(0), l)
m = [[0] * 3 for _ in range(2)]
m[0][1] = 5
print(m, [r[1] for r in m], list(zip(*m)))
d = {"b": 2, "a": 1}
d.update({"c": 3}); d.setdefault("a", 9)
print(d, list(d.items())[:2], d.pop("b"), d.get("z", 0), sorted(d))
print({k: v * 2 for k, v in d.items() if v > 1}, dict.fromkeys("ab", 0))
print({3, 1, 2} | {4}, {1, 2} & {2, 3}, {1, 2} - {2}, {10, 3, 7})
print(max(d, key=d.get), min([], default="vide"), sum([0.1] * 10))
print(list(enumerate("ab", 1)), list(map(str, [1, 2])), list(filter(None, [0, 1, "", "a"])))
print(any([0, 0, 1]), all([]), list(reversed(range(3))), [1, 2] * 2, (1,) + (2,))
