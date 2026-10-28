notes = [12, 15.5, 9, 18, 14]
moyenne = sum(notes) / len(notes)
print(moyenne, round(moyenne, 2), f"{moyenne:.2f}", int(moyenne))
print(max(notes) - min(notes), sorted(notes), sorted(notes)[len(notes) // 2])
