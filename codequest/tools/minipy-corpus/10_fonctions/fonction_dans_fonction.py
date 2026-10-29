def calculatrice(op):
    def add(a, b): return a + b
    def sub(a, b): return a - b
    return {"add": add, "sub": sub}[op]
print(calculatrice("add")(2, 3), calculatrice("sub")(2, 3))
def externe():
    def interne():
        return "interne"
    return interne
print(externe()(), externe().__qualname__)
