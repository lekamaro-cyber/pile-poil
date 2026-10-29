class Unique:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
a = Unique()
b = Unique()
print(a is b)
class Positif(int.__class__ if False else object):
    pass
print(Positif.__name__)
