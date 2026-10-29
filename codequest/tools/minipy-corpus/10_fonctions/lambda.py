carre = lambda x: x ** 2
print(carre(4), (lambda a, b=1: a + b)(2), (lambda *a: len(a))(1, 2, 3), (lambda: "rien")())
paires = [(1, "b"), (3, "a"), (2, "c")]
print(sorted(paires, key=lambda p: p[1]), list(map(lambda x: x * 10, [1, 2])), list(filter(lambda x: x > 1, [0, 1, 2, 3])))
print((lambda x: (lambda y: x + y))(3)(4), carre.__name__)
