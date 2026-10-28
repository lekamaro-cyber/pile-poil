f = frozenset([3, 1, 2])
print(f, len(f), 2 in f, f | {5}, f & {1, 9}, type(f | {5}).__name__, {5} | f, type({5} | f).__name__)
d = {f: "valeur"}
print(d[frozenset({1, 2, 3})], frozenset() == set(), {frozenset({1}), frozenset({1})})
try:
    f.add(4)
except AttributeError as e:
    print("AttributeError", e)
