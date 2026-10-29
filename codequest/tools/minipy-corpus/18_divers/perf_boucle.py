total = 0
for i in range(300000):
    total += i % 7
print(total)
cache = {}
def fib(n):
    if n < 2:
        return n
    if n in cache:
        return cache[n]
    cache[n] = fib(n - 1) + fib(n - 2)
    return cache[n]
print(fib(300))
print(len(str(2 ** 1000)), 10 ** 20 + 1, 3 ** 40 // 7)
