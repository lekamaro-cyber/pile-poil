class Objet:
    pass
o = Objet()
o.a = 1
setattr(o, "b", 2)
print(o.a, getattr(o, "b"), getattr(o, "c", "défaut"), hasattr(o, "a"), hasattr(o, "z"), vars(o))
delattr(o, "a")
del o.b
print(vars(o), hasattr(o, "a"))
try:
    o.inexistant
except AttributeError as e:
    print("AttributeError:", e)
class AvecGetattr:
    def __getattr__(self, nom):
        return f"<{nom}>"
print(AvecGetattr().quelquechose, AvecGetattr().x)
