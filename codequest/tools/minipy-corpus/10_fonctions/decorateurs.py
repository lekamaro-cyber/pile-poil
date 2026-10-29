def journal(f):
    def enveloppe(*args, **kwargs):
        print("appel de", f.__name__, args)
        r = f(*args, **kwargs)
        print("résultat", r)
        return r
    return enveloppe
@journal
def addition(a, b):
    return a + b
addition(2, 3)
print(addition.__name__)
def repete(n):
    def deco(f):
        def g(*a):
            return [f(*a) for _ in range(n)]
        return g
    return deco
@repete(3)
def bonjour(nom):
    return "bonjour " + nom
print(bonjour("Ana"))
import functools
def chrono(f):
    @functools.wraps(f)
    def w(*a, **k):
        return f(*a, **k)
    return w
@chrono
def calcul(x):
    """Docstring de calcul."""
    return x * 2
print(calcul(21), calcul.__name__, calcul.__doc__)
