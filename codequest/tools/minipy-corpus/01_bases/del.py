x = 5
del x
l = [1, 2, 3, 4, 5]
del l[0]
del l[1:3]
print(l)
d = {"a": 1, "b": 2}
del d["a"]
print(d)
try:
    print(x)
except NameError as e:
    print("NameError :", e)
