l = list(range(10))
print(l[2:5], l[:3], l[7:], l[::2], l[::-1], l[-3:], l[1:8:3], l[8:2:-2], l[100:], l[-100:2])
l[2:5] = ["a", "b"]
print(l)
l[::2] = [0] * 5
print(l)
l[:] = [1, 2, 3]
print(l)
l[1:1] = [9, 9]
print(l)
l[len(l):] = [7]
print(l)
del l[::2]
print(l)
m = [1, 2, 3]
m[1:2] = []
print(m)
