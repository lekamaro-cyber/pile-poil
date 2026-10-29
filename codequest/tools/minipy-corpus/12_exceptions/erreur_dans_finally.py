try:
    try:
        raise ValueError("premier")
    finally:
        print("nettoyage")
except ValueError as e:
    print("propagée :", e)
def f():
    try:
        return 1
    finally:
        print("avant le retour")
print(f())
