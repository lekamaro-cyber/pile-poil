s = "café 🎉 中文"
print(len(s), s[5], s[-1], s[::-1], s.upper(), list(s)[:6])
print(ord("é"), chr(233), ord("🎉"), chr(128512), ord("A"), chr(97 + 25))
print("🎉" * 3, "é" in s, s.find("🎉"), s.index("中"), s.count("中"), s.split(" "))
for ch in "aé🎉":
    print(ch, ord(ch), len(ch))
print(sorted("éaz"), "é" < "z", max("abcé"), "ÉCOLE".lower(), "straße".upper())
