class A:
    def f(self):
        return "f de " + type(self).__name__
a = A()
m = a.f
print(m(), A.f(a), m.__self__ is a, m.__func__ is A.f, m.__name__)
print(type(m).__name__, type(A.f).__name__)
