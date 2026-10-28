l = [1, 2, 3]
for t in [lambda: l[10], lambda: l.pop(10), lambda: [].pop(), lambda: l.remove(9), lambda: l.index(9),
          lambda: l["a"], lambda: l[1.5], lambda: l.insert(), lambda: l.append(1, 2), lambda: [1, "a"].sort(),
          lambda: l + (4,), lambda: l * 1.5, lambda: l.sort(1), lambda: sorted([1, None]), lambda: max([])]:
    try:
        t()
    except Exception as e:
        print(type(e).__name__ + ":", e)
def assign():
    l[5] = 1
try:
    assign()
except IndexError as e:
    print(e)
