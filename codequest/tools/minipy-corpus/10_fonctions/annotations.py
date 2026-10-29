def aire(largeur: float, hauteur: float = 1.0) -> float:
    return largeur * hauteur
x: int = 5
y: list[int] = [1, 2]
def h(t: tuple[int, ...], d: dict[str, int] | None = None) -> None:
    print(t, d)
print(aire(2, 3), aire(2), x, y)
h((1, 2))
