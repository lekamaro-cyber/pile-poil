n = 27
etapes = 0
while True:
    if n == 1:
        break
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    etapes += 1
print(etapes)
