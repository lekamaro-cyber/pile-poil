class Version:
    def __init__(self, s):
        self.parts = tuple(int(p) for p in s.split("."))
        self.s = s
    def __lt__(self, o):
        return self.parts < o.parts
    def __eq__(self, o):
        return self.parts == o.parts
    def __repr__(self):
        return f"V{self.s}"
vs = [Version("1.10"), Version("1.2"), Version("0.9"), Version("1.2.1")]
print(sorted(vs), max(vs), min(vs), Version("2") > Version("1.5"), Version("1.0") <= Version("1.0") if hasattr(Version, "__le__") else None)
try:
    print(Version("1") <= Version("2"))
except TypeError as e:
    print("TypeError:", e)
