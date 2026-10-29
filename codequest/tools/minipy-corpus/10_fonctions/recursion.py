def factorielle(n):
    return 1 if n <= 1 else n * factorielle(n - 1)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
def hanoi(n, src, dst, aux, coups):
    if n == 0:
        return
    hanoi(n - 1, src, aux, dst, coups)
    coups.append((src, dst))
    hanoi(n - 1, aux, dst, src, coups)
coups = []
hanoi(3, "A", "C", "B", coups)
print(factorielle(10), factorielle(50), [fib(i) for i in range(15)], len(coups), coups[:3])
def somme_liste(l):
    return 0 if not l else l[0] + somme_liste(l[1:])
print(somme_liste(list(range(100))))
def aplatir(l):
    res = []
    for x in l:
        if isinstance(x, list):
            res.extend(aplatir(x))
        else:
            res.append(x)
    return res
print(aplatir([1, [2, [3, [4]], 5], [[6]]]))
