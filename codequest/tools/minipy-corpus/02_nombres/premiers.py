def est_premier(n):
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True
print([n for n in range(50) if est_premier(n)])
crible = [True] * 100
crible[0] = crible[1] = False
for i in range(2, 10):
    if crible[i]:
        for j in range(i * i, 100, i):
            crible[j] = False
print(sum(crible), [i for i, p in enumerate(crible) if p][-5:])
