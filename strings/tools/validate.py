import json, sys, io, contextlib, itertools, re

qs = json.load(open(sys.argv[1]))
BL = re.compile(r"\{\{(\d+)\}\}")

def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<q>", "exec"), {"__name__": "__main__"})
        return "\n".join(l.rstrip() for l in buf.getvalue().rstrip("\n").split("\n"))
    except RecursionError:
        return (buf.getvalue() + "RecursionError").strip()
    except BaseException as e:
        return (buf.getvalue() + type(e).__name__).strip()

def fill(code, vals):
    return BL.sub(lambda m: vals[int(m.group(1))], code)

bad = 0
for i, q in enumerate(qs):
    tag = f"#{i} [{q['t']}] {q['q']}"
    if q.get("p"):
        out = run(q["c"])
        if out != q["a"][0]:
            print("PREDICT WRONG", tag, repr(out), "!=", repr(q["a"][0])); bad += 1
        for d in q["d"]:
            if d == out:
                print("PREDICT AMBIG", tag, d); bad += 1
        if len(set(q["a"] + q["d"])) != len(q["a"] + q["d"]):
            print("DUP CHIP", tag); bad += 1
        continue
    n = len(BL.findall(q["c"]))
    if n != len(q["a"]):
        print("BLANK COUNT", tag); bad += 1; continue
    out = run(fill(q["c"], q["a"]))
    if out != q["o"]:
        print("WRONG", tag, repr(out), "!=", repr(q["o"])); bad += 1
    pool = q["a"] + q["d"]
    seen = set()
    for perm in itertools.permutations(range(len(pool)), n):
        vals = tuple(pool[k] for k in perm)
        if vals in seen or list(vals) == q["a"]: continue
        seen.add(vals)
        if run(fill(q["c"], list(vals))) == q["o"]:
            print("AMBIG", tag, vals); bad += 1
    for line in fill(q["c"], q["a"]).split("\n"):
        if len(line) > 36: print("LONG", tag, repr(line))
for i, q in enumerate(qs):
    if q.get("p"):
        for line in q["c"].split("\n"):
            if len(line) > 36: print("LONG", i, repr(line))
print(len(qs), "questions,", bad, "problems")
