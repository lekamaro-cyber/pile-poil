a = set("abracadabra")
b = set("alacazam")
print(sorted(a), sorted(b), sorted(a - b), sorted(a | b), sorted(a & b), sorted(a ^ b))
print(len(a), "z" in b, {c for c in "hello" if c not in "lo"})
