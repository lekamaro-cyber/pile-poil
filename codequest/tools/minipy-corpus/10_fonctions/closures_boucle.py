fonctions = []
for i in range(3):
    fonctions.append(lambda: i)
print([f() for f in fonctions])
fonctions = [lambda i=i: i for i in range(3)]
print([f() for f in fonctions])
fs = [lambda x: x * j for j in range(3)]
print([f(10) for f in fs])
def fabrique():
    res = []
    for k in range(3):
        def f():
            return k
        res.append(f)
    return res
print([f() for f in fabrique()])
