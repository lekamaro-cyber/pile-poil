a = b = []
a.append(1)
print(a, b, a is b)
x = y = z = "texte"
print(x, y, z)
i, j, *k = range(5)
print(i, j, k)
(p, q), r = (1, 2), 3
print(p, q, r)
[m, n] = "xy"
print(m, n)
