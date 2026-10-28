s = "abracadabra"
print(s.find("a"), s.find("a", 1), s.find("z"), s.rfind("a"), s.index("c"), s.rindex("a"))
print(s.count("a"), s.count("abra"), s.count(""), s.count("a", 5), s.find("bra", 2, 9))
print(s.startswith("abr"), s.endswith("bra"), s.startswith(("x", "a")), s.startswith("bra", 1), s.endswith("ab", 0, 2))
print("a" in s, "cad" in s, "dac" in s, "" in s, s.find(""), s.find("", 20))
try:
    s.index("z")
except ValueError as e:
    print("ValueError", e)
