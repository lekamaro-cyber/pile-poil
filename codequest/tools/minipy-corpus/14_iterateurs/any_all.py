print(any([]), all([]), any([0, "", None]), all([1, "a", [0]]), any(x > 3 for x in [1, 5]), all(c.isalpha() for c in "abc"))
def verbeux(x):
    print("teste", x)
    return x > 1
print(any(verbeux(x) for x in [0, 2, 3]))
print(all(verbeux(x) for x in [5, 0, 7]))
