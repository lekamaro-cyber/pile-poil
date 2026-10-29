def f(x):
    "Ma documentation"
    return x
g = f
print(g(5), g is f, f.__doc__, callable(f), callable(5), f.__qualname__)
f.attribut = "valeur"
print(f.attribut)
def applique(fn, valeurs):
    return [fn(v) for v in valeurs]
print(applique(str.upper, ["a", "b"]), applique(len, ["abc", ""]), applique(abs, [-1, 2]))
operations = {"+": lambda a, b: a + b, "*": lambda a, b: a * b}
print(operations["+"](2, 3), operations["*"](2, 3))
