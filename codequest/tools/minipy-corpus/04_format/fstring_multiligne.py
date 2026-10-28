a = 5
texte = f"""Valeur : {a}
Double : {a * 2}
Liste : {[i for i in range(a)]}"""
print(texte)
msg = (f"partie {a} "
       f"et suite {a + 1}")
print(msg)
print(f"{'quote' + "s"}", f'{"mix"}')
