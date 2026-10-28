n = 0
while n < 5:
    n += 1
    if n == 3:
        continue
    print(n, end=" ")
else:
    print("fin normale")
i = 10
while i > 0:
    i -= 3
    if i == 4:
        print("break à", i)
        break
else:
    print("pas affiché")
while False:
    pass
else:
    print("else d'un while vide")
