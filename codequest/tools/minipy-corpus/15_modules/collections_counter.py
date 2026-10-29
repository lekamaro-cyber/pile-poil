from collections import Counter, defaultdict, deque, namedtuple
c = Counter("abracadabra")
print(c.most_common(3))
print(c["a"], c["z"])
c.update("aaa")
print(c["a"])
d = defaultdict(list)
for mot in ["chat", "chien", "cheval", "ane"]:
    d[mot[0]].append(mot)
print(dict(d))
q = deque([1, 2, 3], maxlen=3)
q.append(4)
q.appendleft(0)
print(q, q.popleft(), list(q))
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(p, p.x + p.y, p._asdict())
x, y = p
print(x, y)
