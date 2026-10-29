def f(*args, **kwargs):
    print(args, kwargs)
f()
f(1, 2, a=3, b=4)
f(*[1, 2], **{"x": 9})
def somme(*nombres):
    return sum(nombres)
print(somme(), somme(1, 2, 3), somme(*range(5)))
def g(a, b=2, *args, c, d=4, **kw):
    return (a, b, args, c, d, kw)
print(g(1, c=3), g(1, 5, 6, 7, c=8, e=9), g(*(1, 2), c=0, **{"d": 1, "z": 2}))
def h(a, /, b, *, c):
    return a + b + c
print(h(1, 2, c=3), h(1, b=2, c=3))
