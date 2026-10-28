a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a | b, a & b, a - b, b - a, a ^ b)
print(a.union(b), a.intersection(b), a.difference(b), a.symmetric_difference(b), a.union([7, 8], (9,)))
print(a <= b, {1, 2} <= a, {1, 2} < a, a >= {1}, a.issubset(range(10)), a.issuperset([1, 2]), a.isdisjoint({9}))
c = {1, 2, 3}
c |= {10}
c &= {1, 2, 10}
c -= {2}
c ^= {1, 99}
print(c)
