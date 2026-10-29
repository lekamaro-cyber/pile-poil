def f():
    try:
        int("abc")
    except ValueError:
        print("journalisation")
        raise
try:
    f()
except ValueError as e:
    print("rattrapé :", e)
def g():
    try:
        {}["x"]
    except KeyError as e:
        raise ValueError("conversion") from e
try:
    g()
except ValueError as e:
    print(e, repr(e.__cause__))
try:
    raise TypeError
except TypeError as e:
    print(repr(e), e.args)
