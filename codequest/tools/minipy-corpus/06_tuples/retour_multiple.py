def stats(l):
    return min(l), max(l), sum(l) / len(l)
mn, mx, moy = stats([4, 8, 6])
print(mn, mx, moy, stats([1]))
def divise(a, b):
    return a // b, a % b
q, r = divise(17, 5)
print(q, r, divise(-17, 5))
