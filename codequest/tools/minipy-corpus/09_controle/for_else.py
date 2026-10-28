for n in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]:
    for d in range(2, n):
        if n % d == 0:
            print(n, "=", d, "*", n // d)
            break
    else:
        print(n, "est premier")
for x in []:
    print("jamais")
else:
    print("boucle vide : else exécuté")
