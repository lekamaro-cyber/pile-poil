x = "global"
r = [x for x in range(3)]
print(r, x)
y = 10
print([y * i for i in range(3)])
def f():
    k = 2
    return [k * i for i in range(3)], {i: k for i in range(2)}
print(f())
class C:
    a = 5
    b = [i * 2 for i in range(3)]
print(C.b)
