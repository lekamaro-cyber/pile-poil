a = [1, 2]
b = [3, 4]
print(a + b, a * 3, [0] * 0, len(a + b), min(a + b), sum(a + b), list(reversed(a + b)))
print([1, 2] == [1, 2], [1, 2] < [1, 3], [] < [0], [1, [2]] == [1, [2]])
l = [1, 2, 3]
l *= 2
print(l)
l += "ab"
print(l)
print(list(range(5)), list("abc"), list((1, 2)), list({1: 2}), list(map(int, "123")))
