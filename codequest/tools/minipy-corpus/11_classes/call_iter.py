class Compteur:
    def __init__(self, fin):
        self.fin = fin
        self.n = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.n >= self.fin:
            raise StopIteration
        self.n += 1
        return self.n
print(list(Compteur(3)), sum(Compteur(10)), [x * 2 for x in Compteur(2)])
c = Compteur(2)
print(next(c), next(c), next(c, "fini"))
class Multiplieur:
    def __init__(self, k):
        self.k = k
    def __call__(self, x):
        return x * self.k
m = Multiplieur(5)
print(m(3), callable(m), list(map(m, [1, 2])))
