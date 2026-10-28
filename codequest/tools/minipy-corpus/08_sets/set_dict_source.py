d = {7: "a", 2: "b", 15: "c", 4: "d", 9: "e", 1: "f"}
print(set(d), set(d.keys()), set(d.values()) == set("abcdef"), frozenset(d))
s1 = {1, 2, 3, 4, 5, 6}
print(set(s1), s1.copy(), s1 | set(), set().union(s1, {40, 50}), {2, 4} | s1)
grand = set(range(0, 60, 7))
print(grand, grand - {14, 21}, grand & {0, 7, 100})
