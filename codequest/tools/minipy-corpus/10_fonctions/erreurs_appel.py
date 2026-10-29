def f(a, b, c=0):
    return a + b + c
def g(*, cle):
    return cle
class C:
    def m(self, x):
        return x
tests = [lambda: f(1), lambda: f(), lambda: f(1, 2, 3, 4), lambda: f(1, 2, d=3), lambda: f(1, 2, a=3),
         lambda: g(1), lambda: g(), lambda: g(cle=1, autre=2), lambda: C().m(), lambda: C().m(1, 2),
         lambda: C.m(1), lambda: (lambda: 0)(1), lambda: f(1, 2, cc=3), lambda: len(), lambda: f(**{"a": 1, "b": 2, "z": 3})]
for t in tests:
    try:
        t()
    except TypeError as e:
        print("TypeError:", e)
