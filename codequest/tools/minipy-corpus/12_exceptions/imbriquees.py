try:
    try:
        x = [1][5]
    except KeyError:
        print("pas ici")
    finally:
        print("finally interne")
except IndexError as e:
    print("externe :", e)
try:
    try:
        1 / 0
    except ZeroDivisionError:
        raise ValueError("pendant le traitement")
except ValueError as e:
    print(e)
