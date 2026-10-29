class Calculatrice:
    def add(self, a, b): return a + b
    def mul(self, a, b): return a * b
c = Calculatrice()
for op in ["add", "mul"]:
    print(op, getattr(c, op)(3, 4))
print(callable(getattr(c, "add")), [m for m in dir(c) if not m.startswith("_")])
