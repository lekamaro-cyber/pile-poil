matrice = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(matrice[1][2], matrice[-1], [ligne[0] for ligne in matrice])
transposee = [[matrice[j][i] for j in range(3)] for i in range(3)]
print(transposee)
print(list(zip(*matrice)), sum(sum(l) for l in matrice), max(max(l) for l in matrice))
for ligne in matrice:
    print(" ".join(f"{v:2}" for v in ligne))
