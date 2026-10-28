fruits = ["pomme", "poire", "kiwi"]
prix = [1.2, 2.5, 0.8]
for i, f in enumerate(fruits):
    print(i, f)
for i, f in enumerate(fruits, start=1):
    print(f"{i}. {f}")
for f, p in zip(fruits, prix):
    print(f, p)
print(list(zip(fruits, prix, "abc")), list(zip([1, 2, 3], [4])), dict(zip(fruits, prix)), list(zip()))
