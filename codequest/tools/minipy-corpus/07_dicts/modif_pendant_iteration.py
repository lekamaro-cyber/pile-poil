d = {"a": 1, "b": 2, "c": 3}
try:
    for k in d:
        if d[k] == 2:
            del d[k]
except RuntimeError as e:
    print("RuntimeError:", e)
print(d)
d = {"a": 1, "b": 2}
for k in list(d):
    if d[k] == 1:
        del d[k]
print(d)
d = {"x": 1}
try:
    for k in d:
        d["y" + k] = 2
except RuntimeError as e:
    print("RuntimeError:", e)
