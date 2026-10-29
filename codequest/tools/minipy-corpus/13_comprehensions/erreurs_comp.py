try:
    print([1 / x for x in [1, 0, 2]])
except ZeroDivisionError as e:
    print("ZeroDivisionError:", e)
try:
    print([y for x in range(3)])
except NameError as e:
    print("NameError:", e)
try:
    print(sum(int(c) for c in "12a"))
except ValueError as e:
    print("ValueError:", e)
