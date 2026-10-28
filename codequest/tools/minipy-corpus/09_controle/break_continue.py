for i in range(10):
    if i == 2:
        continue
    if i == 6:
        break
    print(i, end=",")
print()
for i in range(3):
    for j in range(3):
        if j == i:
            continue
        if j > 1:
            break
        print((i, j), end="")
print()
trouve = None
for i, v in enumerate([5, 8, 12, 3]):
    if v > 10:
        trouve = i
        break
print(trouve)
