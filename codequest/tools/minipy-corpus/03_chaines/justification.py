print("[" + "ab".center(6) + "]", "[" + "ab".center(7) + "]", "[" + "abc".center(6) + "]", "[" + "a".center(4, "*") + "]")
print("[" + "ab".ljust(5) + "]", "[" + "ab".rjust(5, "-") + "]", "[" + "abcdef".center(3) + "]")
print("42".zfill(5), "-42".zfill(5), "+7".zfill(4), "abc".zfill(5), "".zfill(3), "123456".zfill(3))
for mot in ["chat", "éléphant", "ours"]:
    print(mot.ljust(10, ".") + "|" + mot.rjust(10) + "|" + mot.center(10, "~"))
