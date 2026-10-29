class Animal:
    def __init__(self, nom):
        self.nom = nom
    def parler(self):
        return "..."
    def presente(self):
        return f"{self.nom} : {self.parler()}"
class Chat(Animal):
    def parler(self):
        return "miaou"
class Chaton(Chat):
    def __init__(self, nom, age):
        super().__init__(nom)
        self.age = age
    def parler(self):
        return super().parler() + " (petit)"
animaux = [Animal("x"), Chat("Tom"), Chaton("Mini", 1)]
for a in animaux:
    print(a.presente())
print(isinstance(animaux[2], Animal), issubclass(Chaton, Animal), issubclass(Animal, Chat), Chaton.__mro__)
print(Chaton.__bases__, Chat.__name__, [c.__name__ for c in Chaton.mro()])
