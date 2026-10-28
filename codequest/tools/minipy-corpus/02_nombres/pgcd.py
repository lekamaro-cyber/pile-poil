def pgcd(a, b):
    while b:
        a, b = b, a % b
    return a
print(pgcd(48, 18), pgcd(17, 5), pgcd(0, 9), pgcd(-12, 8))
import math
print(math.gcd(48, 18), math.gcd(-12, 8), math.gcd(0, 0), math.gcd(12, 18, 24))
