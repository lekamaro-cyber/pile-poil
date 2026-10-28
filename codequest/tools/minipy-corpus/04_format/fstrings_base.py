nom, age, pi = "Ada", 36, 3.14159265
print(f"{nom} a {age} ans", f"{pi:.2f}", f"{pi:.0f}", f"{age:5d}|", f"{age:<5}|", f"{age:^7}|", f"{nom:>8}|")
print(f"{nom!r}", f"{nom!s}", f"{age=}", f"{pi = :.3f}", f"{age + 1}", f"{'imbriqué'}", f"{nom.upper()}")
print(f"{{accolades}}", f"{3 * 4}", f"{[1, 2][0]}", f"{ {'a': 1}['a'] }", f"{(lambda x: x * 2)(5)}")
largeur = 10
print(f"[{nom:>{largeur}}]", f"[{pi:{largeur}.{3}f}]", f"[{nom:*^{largeur}}]")
print(f"{1234567.891:,.2f}", f"{1234567:_}", f"{0.4567:.1%}", f"{255:x}", f"{255:#X}", f"{5:08b}", f"{12345.6789:e}")
print(f"{-5:+d}", f"{5:+d}", f"{5: d}", f"{-3.5:08.2f}", f"{42:,}", f"{-1234.5:,.1f}")
