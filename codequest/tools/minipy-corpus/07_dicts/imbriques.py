ecole = {
    "6A": {"eleves": ["Ana", "Bob"], "prof": "M. Lin"},
    "6B": {"eleves": ["Cléo"], "prof": "Mme Roy"},
}
for classe, info in ecole.items():
    print(classe, info["prof"], len(info["eleves"]), ", ".join(info["eleves"]))
ecole["6B"]["eleves"].append("Dan")
print(ecole["6B"])
print(sum(len(c["eleves"]) for c in ecole.values()))
