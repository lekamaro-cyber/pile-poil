mot = "Python"
for i, c in enumerate(mot):
    print(i, c, end=" ")
print()
voyelles = sum(1 for c in "bonjour tout le monde" if c in "aeiouy")
print(voyelles)
print([c for c in "hello" if c != "l"], "".join(reversed("abc")), list(map(ord, "AB")))
inverse = ""
for c in "radar":
    inverse = c + inverse
print(inverse, inverse == "radar")
