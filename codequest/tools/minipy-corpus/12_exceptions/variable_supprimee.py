try:
    1 / 0
except ZeroDivisionError as err:
    print("dans except", err)
try:
    print(err)
except NameError as e:
    print("NameError:", e)
e = "avant"
try:
    raise ValueError("x")
except ValueError as e:
    pass
print("e" in dir())
