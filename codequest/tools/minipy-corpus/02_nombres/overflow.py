import math
try:
    print(2.0 ** 10000)
except OverflowError as e:
    print("OverflowError", e)
try:
    print(math.exp(1000))
except OverflowError as e:
    print("OverflowError", e)
try:
    print(float(10 ** 400))
except OverflowError as e:
    print("OverflowError", e)
try:
    print(int(float("inf")))
except OverflowError as e:
    print("OverflowError", e)
print(1e308 * 10, -1e308 * 10)
