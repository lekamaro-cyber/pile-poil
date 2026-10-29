def moyenne(l):
    assert len(l) > 0, "liste vide"
    return sum(l) / len(l)
print(moyenne([1, 2, 3]))
try:
    moyenne([])
except AssertionError as e:
    print("AssertionError:", e, e.args)
try:
    assert 1 + 1 == 3
except AssertionError as e:
    print("AssertionError sans message:", repr(e), str(e) == "")
x = 5
assert x > 0, f"x vaut {x}"
print("ok")
