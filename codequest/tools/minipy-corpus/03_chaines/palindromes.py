def est_palindrome(s):
    s = "".join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]
for t in ["Radar", "Engage le jeu que je le gagne", "Python", "", "A man, a plan, a canal: Panama"]:
    print(repr(t), est_palindrome(t))
