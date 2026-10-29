class Vecteur:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, o):
        return Vecteur(self.x + o.x, self.y + o.y)
    def __sub__(self, o):
        return Vecteur(self.x - o.x, self.y - o.y)
    def __mul__(self, k):
        return Vecteur(self.x * k, self.y * k)
    def __rmul__(self, k):
        return self * k
    def __neg__(self):
        return Vecteur(-self.x, -self.y)
    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
    def __eq__(self, o):
        return (self.x, self.y) == (o.x, o.y)
    def __bool__(self):
        return self != Vecteur(0, 0)
    def __repr__(self):
        return f"Vecteur({self.x}, {self.y})"
a, b = Vecteur(1, 2), Vecteur(3, 4)
print(a + b, b - a, a * 3, 3 * a, -a, abs(b), a == Vecteur(1, 2), bool(Vecteur(0, 0)), bool(a))
v = Vecteur(0, 0)
v += a
v *= 2
print(v, sum([a, b], Vecteur(0, 0)))
try:
    a + 1
except AttributeError as e:
    print("AttributeError:", e)
try:
    a / 2
except TypeError as e:
    print("TypeError:", e)
