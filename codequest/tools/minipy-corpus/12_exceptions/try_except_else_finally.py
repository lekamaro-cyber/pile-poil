def test(x):
    try:
        r = 10 / x
    except ZeroDivisionError:
        print("division par zéro")
    except TypeError as e:
        print("mauvais type :", e)
    else:
        print("résultat", r)
    finally:
        print("toujours")
test(2)
test(0)
test("a")
