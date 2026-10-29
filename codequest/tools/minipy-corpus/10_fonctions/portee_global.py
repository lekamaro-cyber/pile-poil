compteur = 0
def incremente():
    global compteur
    compteur += 1
incremente()
incremente()
print(compteur)
x = "global"
def lecture():
    return x
def ombre():
    x = "local"
    return x
print(lecture(), ombre(), x)
def cree_global():
    global nouvelle
    nouvelle = 42
cree_global()
print(nouvelle)
