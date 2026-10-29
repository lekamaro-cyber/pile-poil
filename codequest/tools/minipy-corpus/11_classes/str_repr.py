class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"
    def __str__(self):
        return f"({self.x}, {self.y})"
p = Point(1, 2)
print(p, str(p), repr(p), [p, Point(0, "a")], f"{p}", f"{p!r}", "%s %r" % (p, p))
class SansStr:
    def __repr__(self):
        return "SansStr()"
print(SansStr(), str(SansStr()), [SansStr()])
class SeulementStr:
    def __str__(self):
        return "joli"
s = SeulementStr()
print(s, str(s), format(s), f"{s:>6}" if False else f"{s}")
