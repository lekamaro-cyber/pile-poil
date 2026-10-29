x = 1234567.891
print(f"{x:,.2f}|{x:>15.1f}|{x:<12.0f}|{x:^14,.0f}|{x:e}")
print(f"{42:05d}|{42:x}|{42:b}|{42:o}|{0.256:.1%}|{-3:+d}")
print("{:>6}|{:<6}|{:^6}|".format("a", "b", "c"))
print("%s a %d ans et %.2f€" % ("Ada", 36, 3.14159))
nom = "Ada"; n = 3
print(f"{nom!r} {n=} {n * 2 = }")
w = 8
print(f"[{nom:>{w}}]")
print(1e16, 1e-5, 123456789012345678.0, 0.1 + 0.2, 2.5e-3, float("inf"), -0.0)
print(round(2.5), round(3.5), round(2.675, 2), round(-0.5), round(1234, -2))
print(7 // -2, -7 % 3, 7 % -3, divmod(-7, 2), 2 ** -1, 10 / 4)
