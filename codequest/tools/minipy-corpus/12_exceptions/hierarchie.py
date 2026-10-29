for exc in [ZeroDivisionError("z"), KeyError("k"), IndexError("i"), ValueError("v"), FileNotFoundError("f"), RecursionError("r")]:
    try:
        raise exc
    except ArithmeticError as e:
        print("ArithmeticError", type(e).__name__)
    except LookupError as e:
        print("LookupError", type(e).__name__, e)
    except OSError as e:
        print("OSError", type(e).__name__)
    except Exception as e:
        print("Exception", type(e).__name__, isinstance(e, RuntimeError))
print(issubclass(ZeroDivisionError, ArithmeticError), issubclass(KeyError, LookupError), issubclass(Exception, BaseException))
print(issubclass(UnboundLocalError, NameError), issubclass(ModuleNotFoundError, ImportError), issubclass(IndentationError, SyntaxError))
print(ValueError.__mro__, KeyboardInterrupt.__bases__)
