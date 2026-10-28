for t in [lambda: {[1, 2]}, lambda: set(5), lambda: {1} + {2}, lambda: set().add([]), lambda: {1} | [2],
          lambda: {1, 2}[0], lambda: frozenset([[1]]), lambda: {1}.update(3)]:
    try:
        t()
    except Exception as e:
        print(type(e).__name__ + ":", e)
