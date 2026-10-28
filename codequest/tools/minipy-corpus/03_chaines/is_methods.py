tests = ["123", "12.5", "abc", "abc123", "  ", "", "Abc", "²", "½", "ⅷ", "éè", "a b", "\t\n", "٣", "0x1F"]
for t in tests:
    print(repr(t), t.isdigit(), t.isnumeric(), t.isdecimal(), t.isalpha(), t.isalnum(), t.isspace(), t.isascii())
print("nom_valide".isidentifier(), "2nom".isidentifier(), "élève".isidentifier(), "class".isidentifier())
print("abc".isprintable(), "a\nb".isprintable(), "".isprintable())
