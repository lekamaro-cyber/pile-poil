d = {"a": 1}
for t in [lambda: d["z"], lambda: d[[1]], lambda: {}.popitem(), lambda: d.pop("q"), lambda: {[1]: 2},
          lambda: dict([1, 2]), lambda: dict([(1, 2, 3)]), lambda: d.get(), lambda: d.update(1), lambda: {1: 2}[2],
          lambda: {(1, [2]): 3}, lambda: d.keys(1)]:
    try:
        t()
    except Exception as e:
        print(type(e).__name__ + ":", e)
