print(isinstance(1, int), isinstance(True, int), isinstance(1, (str, float)), isinstance(1.0, (int, float)))
print(isinstance("a", str), isinstance([], list), isinstance({}, dict), isinstance(None, type(None)), type(1) is int)
print(type(True) == bool, type(3) == int, issubclass(bool, int), issubclass(int, object), isinstance(int, type))
print(type(int), type(type), type(object), object.__name__, int.__name__, isinstance(3, int | str))
class X: pass
print(isinstance(X(), object), type(X()) is X, X.__name__, X.__module__, X.__qualname__)
