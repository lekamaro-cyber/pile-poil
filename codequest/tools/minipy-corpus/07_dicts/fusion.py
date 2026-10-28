a = {"x": 1, "y": 2}
b = {"y": 20, "z": 30}
print(a | b, b | a, {**a, **b}, {**b, "w": 0})
a |= {"q": 9}
print(a)
c = dict(a)
c.update(b)
print(c, a == dict(sorted(a.items())), {1: 2} == {1: 2.0})
