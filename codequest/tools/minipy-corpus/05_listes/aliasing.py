a = [1, 2, 3]
b = a
c = a[:]
d = list(a)
b.append(4)
print(a, b, c, d, a is b, a is c, a == c)
grille = [[0] * 3] * 3
grille[0][0] = 1
print(grille)
grille2 = [[0] * 3 for _ in range(3)]
grille2[0][0] = 1
print(grille2)
x = [1, 2]
y = x
x += [3]
print(y)
x = x + [4]
print(x, y)
