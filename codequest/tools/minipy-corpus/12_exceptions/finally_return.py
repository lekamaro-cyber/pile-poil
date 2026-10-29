def f():
    try:
        return "try"
    finally:
        print("finally exécuté")
print(f())
def g():
    try:
        raise ValueError
    finally:
        return "finally gagne"
print(g())
def h():
    for i in range(3):
        try:
            if i == 1:
                continue
            print("i =", i)
        finally:
            print("fin tour", i)
h()
def k():
    x = []
    try:
        x.append(1)
        return x
    finally:
        x.append(2)
print(k())
