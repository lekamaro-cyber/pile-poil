tests = [lambda: format(1.5, "d"), lambda: format("a", "d"), lambda: format(1, "s"), lambda: format("a", "+"),
         lambda: format("a", ","), lambda: format(10, ".2"), lambda: "{}".format(), lambda: "{0} {2}".format(1, 2),
         lambda: "{x}".format(y=1), lambda: "{} {0}".format(1, 2), lambda: "%d" % "a", lambda: "%s %s" % ("a",),
         lambda: "%s" % ("a", "b"), lambda: format(1, "z"), lambda: "{".format(), lambda: "}".format(),
         lambda: f"{1:,_}", lambda: format(3, ".f"), lambda: format(object(), "x"), lambda: "%z" % 1]
for t in tests:
    try:
        print(t())
    except Exception as e:
        print(type(e).__name__ + ":", e)
