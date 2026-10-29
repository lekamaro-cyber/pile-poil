def lire_age(texte):
    try:
        age = int(texte)
        if age < 0:
            raise ValueError("âge négatif")
    except ValueError as e:
        return f"invalide ({e})"
    return age
for t in ["12", "-3", "douze", "4.5", " 7 "]:
    print(repr(t), lire_age(t))
