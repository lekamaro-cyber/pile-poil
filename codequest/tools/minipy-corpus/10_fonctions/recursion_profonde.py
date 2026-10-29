def profondeur(n):
    return 0 if n == 0 else 1 + profondeur(n - 1)
print(profondeur(900))
def boucle_infinie(n):
    return boucle_infinie(n + 1)
try:
    boucle_infinie(0)
except RecursionError as e:
    print("RecursionError:", e)
print("après")
