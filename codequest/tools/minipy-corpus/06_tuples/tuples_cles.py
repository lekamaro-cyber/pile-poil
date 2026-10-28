distances = {("Paris", "Lyon"): 465, ("Lyon", "Marseille"): 315}
print(distances[("Paris", "Lyon")], ("Lyon", "Paris") in distances)
for (a, b), d in distances.items():
    print(f"{a} -> {b} : {d} km")
coords = [(0, 0), (1, 2), (0, 0), (3, 1)]
print(len(set(coords)), sorted(set(coords)))
