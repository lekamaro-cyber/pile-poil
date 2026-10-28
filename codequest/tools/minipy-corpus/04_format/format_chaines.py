for s in ["", "a", "abc", "abcdefghij", "é🎉"]:
    print(f"[{s:5}][{s:>5}][{s:^5}][{s:.<5}][{s:.2}][{s:>8.3}]")
print(format("x", "^5"), format(3.14159, ".3"), format(10, ".2f"), format("abc", "s"), format(True), format(None))
print(format(True, "d"), format(True, ">5"), format(2, "%"), format(1e16, ""), format(1.0, ".3"), format(123456.0, ".3"))
