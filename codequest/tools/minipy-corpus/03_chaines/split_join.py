s = "  le  chat   dort  "
print(s.split(), s.split(" "), s.split(None, 1), s.rsplit(None, 1), s.strip().split(" ", 2))
print("a,b,,c".split(","), "a,b,,c".split(",", 1), "a,b,,c".rsplit(",", 1), "".split(), "".split(","))
print("-".join(["a", "b", "c"]), "".join(["x", "y"]), ", ".join("abc"), " ".join(str(i) for i in range(3)))
print("ligne1\nligne2\r\nligne3".splitlines(), "a\nb\n".splitlines(True), "".splitlines(), "x\n\ny".split("\n"))
print("a b\tc\nd".split(), "a1b2c3".split("2"), "aaa".split("a"))
