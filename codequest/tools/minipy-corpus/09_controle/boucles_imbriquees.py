for i in range(1, 4):
    ligne = ""
    for j in range(1, 6):
        ligne += f"{i * j:4}"
    print(ligne)
for i in range(4):
    print(" " * (3 - i) + "*" * (2 * i + 1))
