"""Validate a Code Swipe theme file.

Usage (from the repo root):
    python3 codeswipe/tools/validate.py codeswipe/themes/loops.js [more.js ...]

For every question it runs the Python snippet and checks that:
  * the correct chips produce exactly the stated output (and file contents),
  * no other arrangement of the chips produces the same result,
  * the result doesn't depend on random numbers,
  * predict-the-output questions really print a[0].
It ends with "N questions, P problems". P must be 0.
"""
import contextlib, io, itertools, json, os, random, re, shutil, signal, subprocess, sys, tempfile

BL = re.compile(r"\{\{(\d+)\}\}")
TIMEOUT = 0.5
MAXOUT = 20000


class TooMuchOutput(Exception):
    pass


class Timeout(Exception):
    pass


class CappedIO(io.StringIO):
    def write(self, s):
        if self.tell() + len(s) > MAXOUT:
            raise TooMuchOutput()
        return super().write(s)


def _alarm(signum, frame):
    raise Timeout()


signal.signal(signal.SIGALRM, _alarm)


def load(path):
    js = r"""
const fs = require("fs");
const out = [];
global.CodeSwipe = { add: (id, qs) => out.push({ id, qs }) };
eval(fs.readFileSync(process.argv[1], "utf8"));
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", js, path], capture_output=True, text=True)
    if res.returncode:
        sys.exit(f"Could not load {path}:\n{res.stderr}")
    return json.loads(res.stdout)


def run(code, q, workdir, seed=1):
    # fresh files for every run
    for name in os.listdir(workdir):
        p = os.path.join(workdir, name)
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    for name, content in (q.get("f") or {}).items():
        with open(os.path.join(workdir, name), "w") as fh:
            fh.write(content)
    inputs = list(q.get("i") or [])

    def fake_input(prompt=""):
        if not inputs:
            raise EOFError()
        return inputs.pop(0)

    random.seed(seed)
    buf = CappedIO()
    g = {"__name__": "__main__", "input": fake_input}
    old = os.getcwd()
    os.chdir(workdir)
    err = None
    try:
        with contextlib.redirect_stdout(buf):
            signal.setitimer(signal.ITIMER_REAL, TIMEOUT)
            try:
                exec(compile(code, "<q>", "exec"), g)
            finally:
                signal.setitimer(signal.ITIMER_REAL, 0)
    except Timeout:
        err = "Timeout"
    except TooMuchOutput:
        err = "TooMuchOutput"
    except BaseException as e:  # noqa: BLE001 - we want every error name
        err = type(e).__name__
    finally:
        os.chdir(old)
    text = buf.getvalue()
    out = "\n".join(l.rstrip() for l in text.rstrip("\n").split("\n")) if text.strip() else ""
    if err:
        out = (out + "\n" + err).strip()
    files = {}
    for name in (q.get("fo") or {}):
        p = os.path.join(workdir, name)
        files[name] = open(p).read() if os.path.exists(p) else None
    return out, json.dumps(files, sort_keys=True)


def fill(code, vals):
    return BL.sub(lambda m: vals[int(m.group(1))], code)


def check_theme(theme, problems, warn):
    qs = theme["qs"]
    workdir = tempfile.mkdtemp(prefix="cs_")
    seen_code = {}
    for i, q in enumerate(qs):
        tag = f"{theme['id']}#{i} [{q.get('t')}] {q.get('q')}"
        def bad(msg):
            problems.append(f"{msg}: {tag}")
        for key in ("t", "q", "c", "a", "d", "w"):
            if key not in q:
                bad(f"MISSING {key}")
        if any(k not in q for k in ("c", "a", "d")):
            continue
        key = q["c"] + "|" + "|".join(q["a"])
        if key in seen_code:
            bad(f"DUPLICATE of #{seen_code[key]}")
        seen_code[key] = i
        if "\\" in q["c"]:
            warn.append(f"BACKSLASH in code (check it renders): {tag}")
        pool = q["a"] + q["d"]
        if len(pool) > 7:
            bad("TOO MANY CHIPS (max 7)")
        if len(q["d"]) < 2:
            bad("NEED AT LEAST 2 DISTRACTORS")
        if q.get("p"):
            if BL.search(q["c"]):
                bad("PREDICT QUESTION HAS BLANKS")
            if len(set(pool)) != len(pool):
                bad("DUPLICATE CHIP")
            outs = {run(q["c"], q, workdir, s)[0] for s in (1, 2, 3)}
            if len(outs) > 1:
                bad("NOT DETERMINISTIC")
            out = run(q["c"], q, workdir)[0]
            if out != q["a"][0]:
                bad(f"PREDICT WRONG got {out!r} want {q['a'][0]!r}")
            if "\n" in q["a"][0]:
                bad("PREDICT ANSWER MUST BE ONE LINE")
            for d in q["d"]:
                if d == out:
                    bad(f"PREDICT AMBIGUOUS distractor {d!r}")
            code_for_len = q["c"]
        else:
            n = len(BL.findall(q["c"]))
            if n != len(q["a"]) or n == 0:
                bad("BLANK COUNT MISMATCH")
                continue
            if any(a in q["d"] for a in q["a"]):
                bad("DISTRACTOR SAME AS AN ANSWER")
            if "o" not in q:
                bad("MISSING o")
                continue
            want = (q["o"], json.dumps(q.get("fo") or {}, sort_keys=True))
            code = fill(q["c"], q["a"])
            results = {run(code, q, workdir, s) for s in (1, 2, 3)}
            if len(results) > 1:
                bad("NOT DETERMINISTIC")
            got = run(code, q, workdir)
            if got != want:
                bad(f"WRONG got {got!r} want {want!r}")
            if got[0].endswith(("Timeout", "TooMuchOutput")):
                bad("CORRECT ANSWER HANGS")
            tried = set()
            for perm in itertools.permutations(range(len(pool)), n):
                vals = tuple(pool[k] for k in perm)
                if vals in tried or list(vals) == q["a"]:
                    continue
                tried.add(vals)
                if run(fill(q["c"], list(vals)), q, workdir) == want:
                    bad(f"AMBIGUOUS also right with {vals}")
            code_for_len = code
        for line in code_for_len.split("\n"):
            if len(line) > 38:
                warn.append(f"LONG LINE ({len(line)}): {tag}: {line!r}")
    shutil.rmtree(workdir, ignore_errors=True)
    return len(qs)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    total, problems, warn = 0, [], []
    for path in sys.argv[1:]:
        for theme in load(path):
            n = check_theme(theme, problems, warn)
            topics = {}
            for q in theme["qs"]:
                topics[q.get("t")] = topics.get(q.get("t"), 0) + 1
            predict = sum(1 for q in theme["qs"] if q.get("p"))
            print(f"{theme['id']}: {n} questions ({predict} predict) - " + ", ".join(f"{k} {v}" for k, v in topics.items()))
            total += n
    for w in warn:
        print("warning:", w)
    for p in problems:
        print("PROBLEM:", p)
    print(f"{total} questions, {len(problems)} problems")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
