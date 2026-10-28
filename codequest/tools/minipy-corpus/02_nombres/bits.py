a, b = 12, 10
print(a & b, a | b, a ^ b, ~a, a << 2, a >> 1, -a >> 1, -1 >> 10)
print(bin(a), hex(255), oct(8), bin(-5), hex(-255), hex(0))
print(True & False, True | False, True ^ True, type(True & True))
print((5).bit_length(), (255).bit_length(), (0).bit_length(), (-8).bit_length())
print(1 << 100, (1 << 100) >> 99)
print(int.bit_count(255) if hasattr(int, "bit_count") else 8)
