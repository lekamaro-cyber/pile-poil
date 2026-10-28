l = [4, 8, 15, 16, 23, 42]
print(15 in l, 99 in l, 99 not in l, l.index(23))
def recherche_binaire(liste, x):
    g, d = 0, len(liste) - 1
    while g <= d:
        m = (g + d) // 2
        if liste[m] == x:
            return m
        if liste[m] < x:
            g = m + 1
        else:
            d = m - 1
    return -1
print([recherche_binaire(l, v) for v in [4, 42, 16, 5]])
