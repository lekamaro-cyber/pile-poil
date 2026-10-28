x = 10 ** 5000
print(len(str(x // 10 ** 1000)))
try:
    print(str(x))
except ValueError as e:
    print("ValueError :", e)
