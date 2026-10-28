a, b = 1, 2
a, b = b, a
print(a, b)
a, b, c = "xyz"
print(a, b, c)
for (x, y), z in [((1, 2), 3), ((4, 5), 6)]:
    print(x, y, z)
point = (3, 4)
x, y = point
print((x ** 2 + y ** 2) ** 0.5)
premier, *_, dernier = range(10)
print(premier, dernier)
