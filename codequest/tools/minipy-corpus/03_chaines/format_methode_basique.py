print("{} + {} = {}".format(1, 2, 3), "{0}{1}{0}".format("a", "b"), "{nom} a {age} ans".format(nom="Ana", age=12))
print("{:>6}|{:<6}|{:^6}|".format("a", "b", "c"), "{:05.1f}".format(3.14159), "{!r}".format("x"))
print("{0[0]}-{0[1]}".format([7, 8]), "{p.real}".format(p=5), "{{littéral}}".format())
d = {"x": 1, "y": 2}
print("{x},{y}".format(**d), "{} {}".format(*"ab"))
