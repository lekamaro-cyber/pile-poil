import statistics
from functools import reduce
notes = [12, 15, 9, 15, 18]
print(statistics.mean(notes), statistics.median(notes), statistics.mode(notes))
print(round(statistics.stdev(notes), 4), round(statistics.pstdev(notes), 4))
print(statistics.median([1, 2, 3, 4]))
print(reduce(lambda a, b: a * b, [1, 2, 3, 4, 5]))
print(reduce(lambda a, b: a + b, [], 0))
