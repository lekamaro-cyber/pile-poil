import itertools, copy
print(list(itertools.product("ab", [1, 2])))
print(list(itertools.permutations([1, 2, 3], 2)))
print(list(itertools.combinations("abcd", 2)))
print(list(itertools.chain([1, 2], (3,), "ab")))
print(list(itertools.accumulate([1, 2, 3, 4])))
for i in itertools.count(10, 5):
    if i > 25:
        break
    print(i)
a = [[1, 2], [3]]
b = copy.copy(a)
c = copy.deepcopy(a)
a[0].append(9)
print(b, c)
