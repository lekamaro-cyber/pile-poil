s = "abc"
t = s
s += "d"
print(s, t)
try:
    s[0] = "X"
except TypeError as e:
    print("TypeError", e)
print(s.replace("a", "X"), s)
