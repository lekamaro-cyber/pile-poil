donnees = ["1", "2", "x", "4", "", "6"]
total = 0
erreurs = 0
for d in donnees:
    try:
        total += int(d)
    except ValueError:
        erreurs += 1
        continue
    finally:
        pass
print(total, erreurs)
