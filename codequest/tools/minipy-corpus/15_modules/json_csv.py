import json, csv
data = {"nom": "Ada", "scores": [1, 2.5, None], "actif": True}
s = json.dumps(data)
print(s)
print(json.dumps(data, indent=2))
print(json.loads(s)["scores"])
print(json.dumps("é"), json.dumps("é", ensure_ascii=False))
try:
    json.loads("{pas du json}")
except json.JSONDecodeError as e:
    print("erreur JSON", type(e).__name__)
lignes = ["nom,age", "Ada,36", "Linus,28"]
for row in csv.reader(lignes):
    print(row)
for row in csv.DictReader(lignes):
    print(row["nom"], int(row["age"]) + 1)
