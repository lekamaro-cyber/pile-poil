l = [1, 2, 3, 4, 5, 6]
for x in l:
    if x % 2 == 0:
        l.remove(x)
print(l)
l = [1, 2, 3]
for x in l:
    if len(l) < 6:
        l.append(x * 10)
print(l)
l = [1, 2, 3, 4]
print([x for x in l if x % 2], l[:])
