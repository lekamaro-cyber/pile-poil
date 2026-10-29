import csv
with open("data.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["ville", "temp"])
    w.writerows([["Lyon", 18], ["Paris", 16]])
with open("data.csv") as f:
    print(f.read())
with open("data.csv") as f:
    lecteur = csv.DictReader(f)
    total = 0
    for row in lecteur:
        total += int(row["temp"])
    print(total)
