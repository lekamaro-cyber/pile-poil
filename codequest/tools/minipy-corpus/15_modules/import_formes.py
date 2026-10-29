import math as m
from math import sqrt, pi as PI
from string import ascii_lowercase, digits
print(m.floor(3.9), sqrt(2) ** 2 == 2, round(PI, 3))
print(ascii_lowercase[:5], digits)
import string
print(len(string.punctuation), string.ascii_uppercase[-3:])
try:
    import module_qui_nexiste_pas
except ModuleNotFoundError as e:
    print("absent :", e.name)
