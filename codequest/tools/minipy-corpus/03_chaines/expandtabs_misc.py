print("a\tb\tc".expandtabs(), "a\tb".expandtabs(4), "12345\t6".expandtabs(4))
print("Bonjour".removeprefix("Bon"), "fichier.txt".removesuffix(".txt"), "abc".removeprefix("x"))
table = str.maketrans("ae", "AE")
print("banane".translate(table), "hello".translate({ord("l"): None}), "abc".translate(str.maketrans({"a": "1", "b": None})))
