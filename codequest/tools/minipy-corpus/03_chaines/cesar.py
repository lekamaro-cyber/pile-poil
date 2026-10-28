def cesar(texte, decalage):
    res = ""
    for c in texte:
        if c.isalpha() and c.isascii():
            base = ord("A") if c.isupper() else ord("a")
            res += chr((ord(c) - base + decalage) % 26 + base)
        else:
            res += c
    return res
code = cesar("Bonjour, le Monde!", 3)
print(code, cesar(code, -3), cesar("xyz", 3))
