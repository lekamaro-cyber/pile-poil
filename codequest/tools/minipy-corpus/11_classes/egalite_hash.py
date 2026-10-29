class P:
    def __init__(self, x):
        self.x = x
    def __eq__(self, autre):
        return isinstance(autre, P) and self.x == autre.x
a, b = P(1), P(1)
print(a == b, a != b, a is b, a == 1, P(1) in [P(0), P(1)])
try:
    {a}
except TypeError as e:
    print("TypeError:", e)
class Q:
    def __init__(self, x):
        self.x = x
    def __eq__(self, o):
        return self.x == o.x
    def __hash__(self):
        return hash(self.x)
print(len({Q(1), Q(1), Q(2)}), {Q(3): "trois"}[Q(3)])
class R:
    pass
r1, r2 = R(), R()
print(r1 == r2, r1 == r1, len({r1, r2, r1}))
