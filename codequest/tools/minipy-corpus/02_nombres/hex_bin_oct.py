for n in [0, 1, 7, 8, 255, 256, -1, -255, 1000000]:
    print(n, bin(n), oct(n), hex(n), format(n, "b"), format(n, "x"), format(n, "#o"))
print(0xff, 0o17, 0b1010, 1_000_000, 0x_ff)
