cache = {}
def fib(n):
    if n in cache:
        return cache[n]
    r = n if n < 2 else fib(n - 1) + fib(n - 2)
    cache[n] = r
    return r
print(fib(100), len(cache))
from functools import lru_cache, cache as fcache
@lru_cache(maxsize=None)
def chemins(l, c):
    if l == 0 or c == 0:
        return 1
    return chemins(l - 1, c) + chemins(l, c - 1)
print(chemins(16, 16), chemins.cache_info().hits > 0)
@fcache
def carre(x):
    print("calcul", x)
    return x * x
print(carre(3), carre(3), carre(4))
