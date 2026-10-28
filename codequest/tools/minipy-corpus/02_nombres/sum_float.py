print(sum([0.1] * 10), sum([0.1, 0.2, 0.3]), sum([1, 2, 3]), sum([1, 2.5]), sum([], 10))
print(sum([1e100, 1, -1e100]), sum([0.1] * 3), sum(x / 10 for x in range(10)))
print(sum([[1], [2]], []), sum(range(101)), sum([True] * 5), sum([1, 2], 0.5))
total = 0.0
for i in range(10):
    total += 0.1
print(total, total == 1.0)
print(sum((0.1, 0.7)), sum([3, 0.1, 0.2]), sum([0.1, 0.2, 3]))
