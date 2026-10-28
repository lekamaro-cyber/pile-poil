s = {5, 3, 9, 1, 17}
res = []
while s:
    res.append(s.pop())
print(res)
s = set(range(10))
s.discard(3)
s.discard(7)
s.add(30)
s.add(14)
print(s, [s.pop() for _ in range(3)], s)
