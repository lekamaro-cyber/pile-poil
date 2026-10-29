mots = ["chat", "chien", "cheval", "ane", "chat"]
print({m: len(m) for m in mots}, {len(m) for m in mots}, {m[0]: m for m in mots})
print({k: v for k, v in zip("abc", range(3)) if v}, {x % 4 for x in range(20)}, {i: i ** 2 for i in range(5) if i % 2 == 0})
notes = {"Ana": 15, "Bob": 8, "Cléo": 12}
print({n: ("admis" if v >= 10 else "refusé") for n, v in notes.items()}, sorted({v for v in notes.values()}))
