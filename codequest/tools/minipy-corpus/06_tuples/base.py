t = (1, 2, 3)
print(t, t[0], t[-1], t[1:], len(t), t + (4,), t * 2, 2 in t, t.count(2), t.index(3))
vide = ()
un = (1,)
pas_tuple = (1)
print(vide, un, pas_tuple, type(un), type(pas_tuple), tuple(), tuple("ab"))
a, b, c = t
print(a, b, c)
x, *reste = t
*debut, z = t
print(x, reste, debut, z)
print((1, 2) < (1, 3), (1, 2) == (1, 2.0), (2,) > (1, 9), max([(1, "b"), (1, "a")]))
