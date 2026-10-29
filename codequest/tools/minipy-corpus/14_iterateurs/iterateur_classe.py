class Fibo:
    def __init__(self, maximum):
        self.maximum = maximum
    def __iter__(self):
        a, b = 0, 1
        res = []
        while a <= self.maximum:
            res.append(a)
            a, b = b, a + b
        return iter(res)
print(list(Fibo(100)), sum(Fibo(10)), 13 in Fibo(20))
class Lettres:
    def __init__(self, mot):
        self.mot = mot
    def __getitem__(self, i):
        return self.mot[i]
print(list(Lettres("abc")), "b" in Lettres("abc"), [c for c in Lettres("xy")])
