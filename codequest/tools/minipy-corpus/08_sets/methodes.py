s = {3, 1, 2}
s.add(4)
s.add(2)
s.discard(10)
s.remove(1)
print(s, len(s), 3 in s, 1 in s)
print(s.pop(), s)
s.update([8, 7], {6})
print(s)
s.difference_update({7})
s.intersection_update({2, 3, 4, 6, 8})
s.symmetric_difference_update({2, 5})
print(s, s.copy(), sorted(s))
s.clear()
print(s, set(), frozenset())
try:
    s.remove(42)
except KeyError as e:
    print("KeyError", e)
try:
    set().pop()
except KeyError as e:
    print("KeyError", e)
