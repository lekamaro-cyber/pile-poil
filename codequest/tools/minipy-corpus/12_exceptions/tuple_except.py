def conv(v):
    try:
        return int(v)
    except (ValueError, TypeError) as e:
        return f"{type(e).__name__}: {e}"
print(conv("12"), conv("x"), conv(None), conv([1]), conv(3.9))
erreurs = (KeyError, IndexError)
try:
    [][1]
except erreurs as e:
    print("attrapée", e)
