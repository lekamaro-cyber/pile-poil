pile = []
for x in "abc":
    pile.append(x)
while pile:
    print(pile.pop(), end=" ")
print()
file = [1, 2, 3]
while file:
    print(file.pop(0), end=" ")
print()
from collections import deque
d = deque()
d.append(1); d.append(2); d.appendleft(0)
print(d.popleft(), d.pop(), list(d))
