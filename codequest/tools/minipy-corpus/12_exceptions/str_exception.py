class E(Exception):
    def __str__(self):
        return "message personnalisé"
try:
    raise E("ignoré")
except E as e:
    print(e, repr(e), f"{e}", str(e))
class F(ValueError):
    pass
print(repr(F("x")), F("x").args, isinstance(F(), ValueError), F.__name__, F.__mro__[1].__name__)
