print("clé=valeur".partition("="), "pas_de_sep".partition("="), "a=b=c".partition("="), "a=b=c".rpartition("="))
print("fichier.tar.gz".rpartition("."), "fichier".rpartition("."))
nom, _, ext = "photo.jpg".partition(".")
print(nom, ext)
