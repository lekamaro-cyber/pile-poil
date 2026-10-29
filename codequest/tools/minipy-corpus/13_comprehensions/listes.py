print([x * x for x in range(6)], [x for x in range(20) if x % 3 == 0], [c.upper() for c in "abc"])
print([(x, y) for x in range(3) for y in range(3) if x != y], [[x * y for y in range(1, 4)] for x in range(1, 4)])
print([x if x % 2 else -x for x in range(6)], [len(m) for m in "le chat noir".split()], [i for i in "a1b2" if i.isdigit()])
mat = [[1, 2], [3, 4], [5, 6]]
print([v for ligne in mat for v in ligne], [sum(l) for l in mat], [[r[i] for r in mat] for i in range(2)])
print([x for x in []], [y for y in range(3) if y > 5], [str(x) for x in (1.5, None, True)])
