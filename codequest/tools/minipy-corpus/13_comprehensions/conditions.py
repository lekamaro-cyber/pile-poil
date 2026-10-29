nombres = range(-5, 6)
print([n for n in nombres if n > 0 and n % 2 == 0], ["pair" if n % 2 == 0 else "impair" for n in range(4)])
print([abs(n) for n in nombres if n], [n for n in nombres if n not in (0, 1, -1)])
