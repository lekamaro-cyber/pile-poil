class Temperature:
    nb_instances = 0
    def __init__(self, celsius):
        self.celsius = celsius
        Temperature.nb_instances += 1
    @classmethod
    def depuis_fahrenheit(cls, f):
        return cls((f - 32) * 5 / 9)
    @staticmethod
    def valide(c):
        return c >= -273.15
    def __repr__(self):
        return f"Temperature({self.celsius:.1f})"
t = Temperature.depuis_fahrenheit(212)
print(t, Temperature.valide(-300), t.valide(20), Temperature.nb_instances, Temperature(5).nb_instances)
class Sous(Temperature):
    pass
print(type(Sous.depuis_fahrenheit(32)).__name__)
