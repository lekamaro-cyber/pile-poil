try:
    open("inexistant.txt")
except FileNotFoundError as e:
    print(e, e.errno, e.strerror, e.filename, type(e).__name__, isinstance(e, OSError))
try:
    {"a": 1}["b"]
except KeyError as e:
    print(e, repr(e), e.args, str(e))
try:
    raise KeyError("message long")
except KeyError as e:
    print(e)
try:
    next(iter([]))
except StopIteration as e:
    print(repr(e), e.value)
try:
    "abc".x
except AttributeError as e:
    print(e, e.name, e.obj)
