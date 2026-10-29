it = iter([1, 2, 3])
print(next(it), next(it), next(it), next(it, "fin"))
try:
    next(it)
except StopIteration:
    print("StopIteration")
s = iter("ab")
print(list(s), list(s))
d = iter({"a": 1, "b": 2})
print(next(d), list(d))
r = iter(range(3))
print(next(r), list(r))
print(iter(it) is it, type(iter([])).__name__, type(iter(())).__name__, type(iter("")).__name__, type(iter({})).__name__, type(iter(range(2))).__name__)
