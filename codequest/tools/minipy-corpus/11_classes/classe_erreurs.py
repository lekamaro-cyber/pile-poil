class A:
    def __init__(self, x):
        self.x = x
class B:
    pass
class C:
    def __init__(self):
        return 5
for t in [lambda: A(), lambda: A(1, 2), lambda: B(1), lambda: A(1).y, lambda: A.y, lambda: C(), lambda: A(1)(),
          lambda: A(1)[0], lambda: len(A(1)), lambda: A(1) < A(2), lambda: iter(A(1)), lambda: B() + B()]:
    try:
        t()
    except Exception as e:
        print(type(e).__name__ + ":", e)
