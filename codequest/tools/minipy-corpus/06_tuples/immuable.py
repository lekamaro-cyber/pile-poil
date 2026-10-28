t = (1, [2, 3])
t[1].append(4)
print(t)
try:
    t[0] = 9
except TypeError as e:
    print("TypeError:", e)
try:
    del t[0]
except TypeError as e:
    print("TypeError:", e)
print(hash((1, 2)) == hash((1, 2)), {(1, 2): "ok"}[(1, 2)])
try:
    hash(t)
except TypeError as e:
    print("TypeError:", e)
