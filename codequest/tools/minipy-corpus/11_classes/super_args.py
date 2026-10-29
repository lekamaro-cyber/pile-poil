class Base:
    def __init__(self, a, b=0):
        self.a, self.b = a, b
    def total(self):
        return self.a + self.b
class Derivee(Base):
    def __init__(self, a, b, c):
        super().__init__(a, b=b)
        self.c = c
    def total(self):
        return super().total() + self.c
class Petite(Derivee):
    def __init__(self):
        super(Petite, self).__init__(1, 2, 3)
print(Derivee(1, 2, 3).total(), Petite().total(), Petite().a)
