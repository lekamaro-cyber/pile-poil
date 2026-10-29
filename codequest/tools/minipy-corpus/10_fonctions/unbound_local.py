x = 10
def f():
    print(x)
    x = 5
try:
    f()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)
def g():
    y += 1
    y = 0
try:
    g()
except UnboundLocalError as e:
    print("UnboundLocalError:", e)
def h():
    if False:
        z = 1
    return z
try:
    h()
except UnboundLocalError as e:
    print(type(e).__name__, isinstance(e, NameError), e)
