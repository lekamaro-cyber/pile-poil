s = "  Bonjour le Monde  "
print(s.strip().lower().split(), s.count("o"), s.find("le"), s.rfind("o"))
print("a,b,,c".split(","), "a b  c".split(), "x".join(["1", "2"]))
print("abc".upper().center(9, "*"), "7".zfill(3), "py".ljust(4, ".") + "|")
print("Hello".replace("l", "L", 1), "titre de page".title(), "ÉtÉ".swapcase())
print("123".isdigit(), "abc1".isalnum(), " ".isspace(), "Abc".istitle())
print("nom=valeur=x".partition("="), "a-b-c".rsplit("-", 1))
print("ligne1\nligne2".splitlines(), "abc"[::-1], "abcdef"[1:5:2])
print(sorted("banane"), "banane".index("n"), ord("A"), chr(233))
