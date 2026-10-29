donnees = [1, 5, 8, 2, 9]
resultat = [y for x in donnees for y in [x * 2] if y > 5]
print(resultat)
print([(i, c) for i, c in enumerate("abc")], [f"{k}={v}" for k, v in {"a": 1}.items()])
