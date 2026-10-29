def classe(n):
    if n < 0:
        return "négatif"
    elif n == 0:
        return "zéro"
    for d in range(2, n):
        if n % d == 0:
            return "composé"
    return "premier ou 1"
print([classe(v) for v in [-3, 0, 1, 2, 9, 13]])
def sans_return():
    x = 1
print(sans_return())
