for valeur in [[1, 2, 3], [1], 5, "ab", "abcd"]:
    try:
        a, b = valeur
        print(a, b)
    except (ValueError, TypeError) as e:
        print(type(e).__name__ + ":", e)
try:
    a, *b, c = [1]
except ValueError as e:
    print(e)
