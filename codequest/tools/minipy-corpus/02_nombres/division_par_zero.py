for expr in ["1 / 0", "1 // 0", "1 % 0", "1.0 / 0", "1.0 // 0.0", "1 % 0.0", "divmod(1, 0)", "divmod(1.0, 0)", "0 ** -1", "0.0 ** -2"]:
    try:
        eval_result = None
        if expr == "1 / 0": eval_result = 1 / 0
        elif expr == "1 // 0": eval_result = 1 // 0
        elif expr == "1 % 0": eval_result = 1 % 0
        elif expr == "1.0 / 0": eval_result = 1.0 / 0
        elif expr == "1.0 // 0.0": eval_result = 1.0 // 0.0
        elif expr == "1 % 0.0": eval_result = 1 % 0.0
        elif expr == "divmod(1, 0)": eval_result = divmod(1, 0)
        elif expr == "divmod(1.0, 0)": eval_result = divmod(1.0, 0)
        elif expr == "0 ** -1": eval_result = 0 ** -1
        else: eval_result = 0.0 ** -2
    except ZeroDivisionError as e:
        print(expr, "->", e)
