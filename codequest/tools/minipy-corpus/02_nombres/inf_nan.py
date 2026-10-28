inf = float("inf")
nan = float("nan")
print(inf + 1, inf - inf, inf * 0, -inf, inf > 10 ** 400, nan == nan, nan != nan, nan > 1)
print(1 / inf, inf / inf, min(1, inf), max(-inf, 0))
import math
print(math.isinf(inf), math.isnan(nan), math.isfinite(1.0))
print(float("Infinity"), float("-iNF"), str(nan), round(inf) if False else "ok")
