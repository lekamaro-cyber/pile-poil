scores = {"Ana": 12, "Bob": 18, "Cléo": 15}
for rang, (nom, s) in enumerate(sorted(scores.items(), key=lambda kv: kv[1], reverse=True), 1):
    print(rang, nom, s)
print(list(enumerate(scores)), list(enumerate(scores.values(), start=-1)))
