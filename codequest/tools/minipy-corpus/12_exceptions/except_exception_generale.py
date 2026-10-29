resultats = []
for valeur in ["10", "0", "abc", None]:
    try:
        resultats.append(100 / int(valeur))
    except ZeroDivisionError:
        resultats.append("div0")
    except Exception as e:
        resultats.append(type(e).__name__)
print(resultats)
try:
    pass
except:
    print("jamais")
else:
    print("else sans erreur")
