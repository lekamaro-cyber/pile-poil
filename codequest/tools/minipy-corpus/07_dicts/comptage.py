texte = "abracadabra"
compte = {}
for c in texte:
    if c in compte:
        compte[c] += 1
    else:
        compte[c] = 1
print(compte)
compte2 = {}
for c in texte:
    compte2[c] = compte2.get(c, 0) + 1
print(compte2 == compte, sorted(compte2.items(), key=lambda kv: kv[1], reverse=True))
print(max(compte, key=compte.get), sorted(compte, key=compte.get))
