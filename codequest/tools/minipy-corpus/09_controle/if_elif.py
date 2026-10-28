for note in [5, 10, 12, 14, 16, 19, 20]:
    if note < 10:
        mention = "insuffisant"
    elif note < 12:
        mention = "passable"
    elif note < 14:
        mention = "assez bien"
    elif note < 16:
        mention = "bien"
    else:
        mention = "très bien"
    print(note, mention)
x = 7
print("pair" if x % 2 == 0 else "impair", "positif" if x > 0 else "négatif" if x < 0 else "nul")
