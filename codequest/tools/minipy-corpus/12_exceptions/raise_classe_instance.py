for x in [ValueError, ValueError("msg"), ValueError("a", 2)]:
    try:
        raise x
    except ValueError as e:
        print(repr(e), "|", e, "|", e.args)
try:
    raise 42
except TypeError as e:
    print("TypeError:", e)
try:
    raise
except RuntimeError as e:
    print("RuntimeError:", e)
