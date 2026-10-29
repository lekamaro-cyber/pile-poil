with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("ligne 1\n")
    f.write("ligne 2\n")
with open("notes.txt", "a") as f:
    f.writelines(["ligne 3\n", "ligne 4"])
with open("notes.txt") as f:
    print(repr(f.read()))
with open("notes.txt") as f:
    print(f.readline().strip())
    for ligne in f:
        print(">", ligne.rstrip())
with open("notes.txt") as f:
    print(f.readlines())
try:
    open("absent.txt")
except FileNotFoundError as e:
    print(e)
