eleves = [("Alice", 15.5, 2), ("Bob", 9.25, 10), ("Charlotte", 12.0, 5)]
print(f"{'Nom':<12}{'Note':>8}{'Rang':>6}")
print("-" * 26)
for nom, note, rang in eleves:
    print(f"{nom:<12}{note:>8.2f}{rang:>6}")
print("-" * 26)
moy = sum(e[1] for e in eleves) / len(eleves)
print(f"{'Moyenne':<12}{moy:>8.2f}")
