// Theme: Robust programs (OCR J277 2.3.1 defensive design, 2.3.2 testing). Validate with codeswipe/tools/validate.py
CodeSwipe.add("robust", [
// ---------- Range checks ----------
{t:"Range checks", q:"Accept ages from 11 to 16 only.", i:["18"],
c:`age = int(input())
if age >= 11 {{0}} age <= 16:
    print("Valid")
else:
    print("Invalid")`, a:["and"], d:["or","not"], o:"Invalid",
w:"Both limits must hold at once, so use and. With or, 18 passes because 18 >= 11 is already True."},

{t:"Range checks", q:"Keep asking until the mark is between 0 and 100.", i:["-5","120","75"],
c:`mark = int(input())
while mark < 0 {{0}} mark > 100:
    print("Try again")
    mark = int(input())
print("Saved", mark)`, a:["or"], d:["and","else"], o:"Try again\nTry again\nSaved 75",
w:"A mark is bad if it is below 0 OR above 100. No number can be both at once, so with and the loop would never run."},

{t:"Range checks", q:"Accept marks from 0 to 100, including 100.",
c:`score = 100
if score >= 0 and score {{0}} 100:
    print("Accepted")
else:
    print("Rejected")`, a:["<="], d:["<",">","!="], o:"Accepted",
w:"\"Up to and including 100\" needs <=. Using < would wrongly reject the boundary value 100."},

{t:"Range checks", p:1, q:"What does this print?",
c:`speed = 70
limit = 70
if speed > limit:
    print("Fine issued")
else:
    print("No fine")`, a:["No fine"], d:["Fine issued","70","True"],
w:"70 > 70 is False, because 70 is not greater than itself. Only >= would include the limit."},

{t:"Range checks", p:1, q:"What is printed when the user types 10?", i:["10"],
c:`lvl = int(input())
if lvl < 1 or lvl >= 10:
    print("Rejected")
else:
    print("Level", lvl)`, a:["Rejected"], d:["Level 10","Level","10"],
w:"lvl >= 10 is True for 10, so 10 is rejected. If 10 should be allowed, the check should be lvl > 10."},

{t:"Range checks", q:"Hours run from 0 to 23. Finish the check.",
c:`def valid(h):
    return h >= 0 and h {{0}} 24
print(valid(23), valid(24))`, a:["<"], d:["<=",">","=="], o:"True False",
w:"h < 24 allows 23 but rejects 24. Writing h <= 23 would work too; h <= 24 would let a 25th hour through."},

{t:"Range checks", q:"Only quantities from low to high are ok.",
c:`low = 5
high = 20
for q in [4, 12, 21]:
    if {{0}} <= q <= {{1}}:
        print(q, "ok")
    else:
        print(q, "no")`, a:["low","high"], d:["q","0"], o:"4 no\n12 ok\n21 no",
w:"Python lets you chain comparisons: low <= q <= high means q >= low and q <= high. The lower limit goes on the left."},

{t:"Range checks", p:1, q:"What does this print?",
c:`x = 0
print(1 <= x <= 5)`, a:["False"], d:["True","0","1"],
w:"1 <= 0 is False, so the whole chained comparison is False. 0 is outside the range 1 to 5."},

{t:"Range checks", q:"Accept 4-digit PINs from 1000 to 9999.", i:["999","9999"],
c:`pin = int(input())
while not (1000 <= pin {{0}} 9999):
    pin = int(input())
print("PIN", pin)`, a:["<="], d:["<",">","!="], o:"PIN 9999",
w:"9999 is a valid 4-digit PIN, so the top limit must be inclusive (<=). With < the loop would reject 9999 and ask again."},

{t:"Range checks", q:"Re-ask for a rating from 1 to 5.", i:["0","6","4"],
c:`r = int(input())
while r < 1 or r > 5:
    print("1 to 5 only")
    r = {{0}}
print("Thanks for", r)`, a:["int(input())"], d:["input()","r + 1","int(r)"], o:"1 to 5 only\n1 to 5 only\nThanks for 4",
w:"A validation loop must ask again inside the loop, and cast again too. Plain input() gives a string, and comparing \"6\" < 1 raises a TypeError."},

{t:"Range checks", p:1, q:"What does this print?",
c:`speed = 30
if speed > 70 and speed < 20:
    print("Out of range")
else:
    print("OK")`, a:["OK"], d:["Out of range","30","False"],
w:"No number is above 70 AND below 20 at the same time, so this check can never fail anything. An outside-the-range check needs or."},

{t:"Range checks", q:"Flag sensor readings outside -50 to 60.",
c:`temps = [21, -60, 35, 99]
for t in temps:
    if t < -50 {{0}} t > 60:
        print(t, "sensor error")`, a:["or"], d:["and","+"], o:"-60 sensor error\n99 sensor error",
w:"A reading is out of range if it is too low OR too high. With and, nothing would ever be flagged."},

{t:"Range checks", p:1, q:"What does this print?",
c:`n = 150
if n > 0 or n < 100:
    print("Valid")
else:
    print("Invalid")`, a:["Valid"], d:["Invalid","150","Error"],
w:"With or, only one side needs to be True. 150 > 0 is True, so every positive number passes. A range check needs and."},

{t:"Range checks", q:"Keep asking until the price is more than 0.", i:["0","-1","3.5"],
c:`price = float(input())
while price {{0}} 0:
    price = float(input())
print("Price:", price)`, a:["<="], d:["<","==",">"], o:"Price: 3.5",
w:"A price of 0 must also be rejected, so loop while price <= 0. With < the program would accept 0.0."},

{t:"Range checks", q:"Months must be from 1 to 12.",
c:`for m in [0, 1, 12, 13]:
    if m >= {{0}} and m <= {{1}}:
        print(m, "ok")`, a:["1","12"], d:["0","11","13"], o:"1 ok\n12 ok",
w:"Both 1 and 12 are real months, so they are the limits and both are included with >= and <=."},

{t:"Range checks", p:1, q:"What is printed when the user types 24, then -1, then 0?", i:["24","-1","0"],
c:`h = int(input())
bad = 0
while h < 0 or h > 23:
    bad = bad + 1
    h = int(input())
print(bad, h)`, a:["2 0"], d:["3 0","2 24","1 0"],
w:"24 and -1 are both rejected, so bad goes up twice. 0 is a valid hour and ends the loop."},

{t:"Range checks", q:"Use a flag to re-ask for a dice face from 1 to 6.", i:["0","7","3"],
c:`valid = False
while not valid:
    n = int(input())
    if 1 <= n <= 6:
        valid = {{0}}
print("Dice face", n)`, a:["True"], d:["False","0","valid"], o:"Dice face 3",
w:"Setting the flag to True makes not valid False, which ends the loop. This is a common pattern for validation loops."},

{t:"Range checks", q:"Only allow menu choices that exist.", i:["3"],
c:`menu = ["Play", "Help", "Quit"]
c = int(input())
if 1 <= c <= {{0}}:
    print(menu[c - 1])`, a:["len(menu)"], d:["len(menu)-1","2","0"], o:"Quit",
w:"Choices run from 1 to the number of items, len(menu). Using len() means the check still works if the menu grows."},

{t:"Range checks", p:1, q:"What does this print?",
c:`v = 7.5
print(v >= 1 and v <= 7)`, a:["False"], d:["True","7","7.5"],
w:"7.5 is above the upper limit of 7. A range check works on decimals too, not just whole numbers."},

{t:"Range checks", q:"Width and height must both be 1 to 50.", i:["10","60"],
c:`w = int(input())
h = int(input())
if 0 < w <= 50 {{0}} 0 < h <= 50:
    print("Area", w * h)
else:
    print("Too big")`, a:["and"], d:["or","not"], o:"Too big",
w:"Both values must be in range, so join the two checks with and. With or, the valid width alone would let 60 through."},

// ---------- Type checks ----------
{t:"Type checks", q:"Only convert the age if it is all digits.", i:["15"],
c:`age = input()
if age.{{0}}():
    print(int(age) + 1)
else:
    print("Numbers only")`, a:["isdigit"], d:["isalpha","isupper","islower"], o:"16",
w:"isdigit() is True only when every character is 0 to 9. Checking first means int() can't crash."},

{t:"Type checks", q:"Catch the error when the input is not a number.", i:["ten"],
c:`try:
    n = int(input())
    print(n * 2)
{{0}} ValueError:
    print("Not a number")`, a:["except"], d:["catch","else","error"], o:"Not a number",
w:"Python uses try/except. Other languages use catch, but in Python that is a syntax error."},

{t:"Type checks", q:"Name the error that int() raises for 3.5.", i:["3.5"],
c:`try:
    n = int(input())
    print("Got", n)
except {{0}}:
    print("Whole numbers only")`, a:["ValueError"], d:["TypeError","NameError","IndexError"], o:"Whole numbers only",
w:"int(\"3.5\") is the right type (a string) but the wrong value for a whole number, so Python raises a ValueError."},

{t:"Type checks", p:1, q:"What does this print?",
c:`print("-5".isdigit())`, a:["False"], d:["True","-5","ValueError"],
w:"The minus sign is not a digit, so isdigit() is False. isdigit() can't be used to accept negative numbers."},

{t:"Type checks", p:1, q:"What does this print?",
c:`x = int("3.5")
print(x)`, a:["ValueError"], d:["3","4","3.5"],
w:"int() can turn the number 3.5 into 3, but it can't read the string \"3.5\". Use float() first, or int(float(s))."},

{t:"Type checks", p:1, q:"What does this print?",
c:`print(int(" 42 ") + 1)`, a:["43"], d:["ValueError","TypeError"," 42 1"],
w:"int() ignores spaces at the start and end, so int(\" 42 \") is 42. Spaces in the middle would cause a ValueError."},

{t:"Type checks", q:"Keep asking until only digits are typed.", i:["two","2"],
c:`s = input()
while not s.{{0}}():
    print("Digits only")
    s = input()
qty = int(s)
print(qty * 3)`, a:["isdigit"], d:["isalpha","isspace","isupper"], o:"Digits only\n6",
w:"The loop repeats while the string is NOT all digits. After it ends, int(s) is safe."},

{t:"Type checks", q:"Leave the loop once a whole number is typed.", i:["x","9"],
c:`while True:
    try:
        n = int(input())
        {{0}}
    except ValueError:
        print("Try again")
print(n)`, a:["break"], d:["continue","pass","return"], o:"Try again\n9",
w:"break is only reached if int() succeeded, so the loop ends with a valid number. continue would just ask again."},

{t:"Type checks", q:"Read a temperature that may have a decimal point.", i:["21.5"],
c:`try:
    t = {{0}}(input())
    print("Temp", t)
except ValueError:
    print("Not a number")`, a:["float"], d:["int","len","round"], o:"Temp 21.5",
w:"float() accepts decimals such as 21.5. int(\"21.5\") would raise a ValueError. In OCR's reference language this is real()."},

{t:"Type checks", p:1, q:"What is printed when the user types 7?", i:["7"],
c:`print(float(input()))`, a:["7.0"], d:["7","7.00","ValueError"],
w:"float() always gives a real number, so 7 becomes 7.0."},

{t:"Type checks", p:1, q:"What is printed when the user types 4, then 5?", i:["4","5"],
c:`a = input()
b = input()
print(a + b)`, a:["45"], d:["9","4 5","TypeError"],
w:"input() always returns a string, so + joins \"4\" and \"5\" together. You must cast with int() to add them."},

{t:"Type checks", q:"Add the two numbers the user types.", i:["4","5"],
c:`a = input()
b = input()
print({{0}}(a) + int(b))`, a:["int"], d:["str","float","len"], o:"9",
w:"Both values must be integers to add them. Mixing a string and an int with + raises a TypeError."},

{t:"Type checks", q:"Check the value is a decimal (float).",
c:`val = 4.5
if type(val) == {{0}}:
    print("Decimal")`, a:["float"], d:["int","str","bool"], o:"Decimal",
w:"type() tells you the data type of a value. 4.5 is a float (a real number in OCR terms)."},

{t:"Type checks", q:"Return False if the text is not a whole number.",
c:`def is_int(s):
    try:
        int(s)
        return True
    except {{0}}:
        return False
print(is_int("12"), is_int("1.2"))`, a:["ValueError"], d:["TypeError","IndexError","ZeroDivisionError"], o:"True False",
w:"int(\"1.2\") raises a ValueError. Only that error is caught, so the function returns False instead of crashing."},

{t:"Type checks", p:1, q:"What does this print?",
c:`s = "12a"
if s.isdigit():
    print(int(s) * 2)
else:
    print("Rejected")`, a:["Rejected"], d:["24","12a12a","ValueError"],
w:"One letter is enough to make isdigit() False, so the int() line never runs and nothing crashes."},

{t:"Type checks", p:1, q:"What does this print?",
c:`print("".isdigit())`, a:["False"], d:["True","None","ValueError"],
w:"An empty string has no digits, so isdigit() is False. This means an isdigit() check also rejects empty input."},

{t:"Type checks", q:"Total three decimal values typed by the user.", i:["2","4","9"],
c:`total = 0
for k in range(3):
    total = total + {{0}}
print(total / 3)`, a:["float(input())"], d:["input()","float(k)","len(input())"], o:"5.0",
w:"Each value must be read AND converted inside the loop. Adding input() to a number raises a TypeError."},

{t:"Type checks", q:"Reject non-numbers first, then values over 10.", i:["x","50","7"],
c:`s = input()
while not s.isdigit() {{0}} int(s) > 10:
    s = input()
print("Accepted", s)`, a:["or"], d:["and","+"], o:"Accepted 7",
w:"With or, Python stops as soon as the type check is True, so int(\"x\") never runs. With and, int(\"x\") is tried and crashes."},

{t:"Type checks", p:1, q:"What is printed when the user types 5?", i:["5"],
c:`print(type(input()))`, a:["<class 'str'>"], d:["<class 'int'>","int","str"],
w:"input() always returns a string, even when the user types digits. That's why you need int() or float()."},

{t:"Type checks", q:"Keep asking until the name is letters only.", i:["Sam7","Sam"],
c:`name = input()
while not name.{{0}}():
    name = input()
print("Hello", name)`, a:["isalpha"], d:["isdigit","islower","isupper"], o:"Hello Sam",
w:"isalpha() is True only if every character is a letter, so \"Sam7\" is rejected and \"Sam\" is accepted."},

{t:"Type checks", p:1, q:"What does this print?",
c:`n = "8"
if type(n) == int:
    print("int")
else:
    print("not int")`, a:["not int"], d:["int","8","TypeError"],
w:"\"8\" is in quotes, so it is a string. A string of digits is still a string until you cast it."},

// ---------- Length & presence ----------
{t:"Length & presence", q:"Reject an empty name.", i:[""],
c:`name = input()
if name == {{0}}:
    print("Name required")
else:
    print("Hi", name)`, a:['""'], d:['" "',"None","0"], o:"Name required",
w:"Pressing Enter without typing gives an empty string \"\". input() never returns None."},

{t:"Length & presence", q:"Treat spaces-only input as missing.", i:["   "],
c:`city = input().{{0}}()
if city == "":
    print("Required")
else:
    print(city)`, a:["strip"], d:["upper","lower","title"], o:"Required",
w:"strip() removes spaces from both ends, so \"   \" becomes \"\". Without it, a few spaces would pass the presence check."},

{t:"Length & presence", q:"Passwords need at least 8 characters.", i:["abc","abcdefgh"],
c:`pw = input()
while len(pw) {{0}} 8:
    print("Too short")
    pw = input()
print("Saved")`, a:["<"], d:["<=",">","=="], o:"Too short\nSaved",
w:"Exactly 8 characters is allowed, so only lengths less than 8 are rejected. With <= the 8-character password would be refused."},

{t:"Length & presence", p:1, q:"What does this print?",
c:`user = "   "
if user:
    print("Present")
else:
    print("Missing")`, a:["Present"], d:["Missing","   ","False"],
w:"Any non-empty string counts as True, even if it is only spaces. Use strip() before a presence check."},

{t:"Length & presence", p:1, q:"What is printed when the user types \"  Bob  \"?", i:["  Bob  "],
c:`s = input()
print(len(s.strip()))`, a:["3"], d:["7","5","Bob"],
w:"strip() removes the two spaces at each end, leaving \"Bob\", which has 3 characters."},

{t:"Length & presence", q:"Usernames can be at most 12 characters.",
c:`for u in ["Al", "A" * 12, "B" * 13]:
    if len(u) > {{0}}:
        print(len(u), "too long")`, a:["12"], d:["13","11","len(u)"], o:"13 too long",
w:"A maximum length check rejects anything longer than the limit, so len(u) > 12. Exactly 12 is still fine."},

{t:"Length & presence", q:"Names must be 3 to 15 characters.",
c:`for u in ["Jo", "Jim", "Penelope"]:
    if {{0}} <= len(u) <= {{1}}:
        print(u)`, a:["3","15"], d:["2","7"], o:"Jim\nPenelope",
w:"A length check is a range check on len(). \"Jo\" has only 2 characters, so it is rejected."},

{t:"Length & presence", p:1, q:"What is printed when the user types 0042?", i:["0042"],
c:`code = input()
if len(code) != 4:
    print("Must be 4 characters")
else:
    print("Code", code)`, a:["Code 0042"], d:["Code 42","Must be 4 characters","4"],
w:"input() keeps the leading zeros because it is a string, so the length is 4. Casting to int would lose them."},

{t:"Length & presence", q:"Keep asking while the email is blank.", i:["","a@b.com"],
c:`email = input()
while {{0}}:
    email = input()
print("Saved", email)`, a:['email == ""'], d:['email != ""',"email","len(email) > 0"], o:"Saved a@b.com",
w:"The loop must repeat while the input is empty. The other conditions are True when something WAS typed."},

{t:"Length & presence", q:"Count the fields that were left blank.",
c:`fields = ["Ann", "", "07700", ""]
missing = 0
for f in fields:
    if {{0}} == 0:
        missing = missing + 1
print(missing)`, a:["len(f)"], d:["f","len(fields)","f[0]"], o:"2",
w:"A blank field has length 0. f[0] would crash on an empty string with an IndexError."},

{t:"Length & presence", p:1, q:"What is printed when the user types one space?", i:[" "],
c:`name = input()
if name == "":
    print("Empty")
else:
    print("Got", len(name))`, a:["Got 1"], d:["Empty","Got 0","Got"],
w:"A space is a character, so \" \" is not equal to \"\". This is why presence checks often strip() first."},

{t:"Length & presence", q:"Remove the spaces around the postcode, then count it.", i:["  SW1A  "],
c:`pc = input()
pc = pc.{{0}}()
print(len(pc))`, a:["strip"], d:["upper","split","lower"], o:"4",
w:"strip() removes leading and trailing spaces, so only \"SW1A\" is left. split() would return a list instead."},

{t:"Length & presence", q:"Messages must be 1 to 20 characters.",
c:`for m in ["", "Hi", "x" * 25]:
    if len(m) == 0:
        print("Empty")
    elif len(m) {{0}} 20:
        print("Too long")
    else:
        print("Sent")`, a:[">"], d:["<","==","<="], o:"Empty\nSent\nToo long",
w:"The presence check runs first. Then anything longer than 20 characters fails the length check."},

{t:"Length & presence", p:1, q:"What is printed when the user types three spaces?", i:["   "],
c:`print(len(input().strip()) == 0)`, a:["True"], d:["False","3","0"],
w:"strip() turns \"   \" into \"\", which has length 0, so the comparison is True."},

{t:"Length & presence", q:"Use \"Guest\" if no nickname is given.", i:["  "],
c:`nick = input().strip()
if {{0}} nick:
    nick = "Guest"
print("Welcome", nick)`, a:["not"], d:["is","and","len"], o:"Welcome Guest",
w:"An empty string counts as False, so not nick is True when nothing was typed."},

{t:"Length & presence", q:"Passwords must be 8 to 16 characters.", i:["short"],
c:`pw = input()
if len(pw) < 8 {{0}} len(pw) > 16:
    print("8 to 16 characters")
else:
    print("OK")`, a:["or"], d:["and","not"], o:"8 to 16 characters",
w:"Too short OR too long is a failure. A length can't be both under 8 and over 16, so and would let everything through."},

{t:"Length & presence", p:1, q:"What does this print?",
c:`words = "  ".split()
print(len(words))`, a:["0"], d:["2","1","IndexError"],
w:"split() with no argument ignores runs of spaces, so a string of only spaces gives an empty list."},

{t:"Length & presence", q:"Phone numbers need 11 characters, all digits.", i:["0770090012a"],
c:`tel = input()
if len(tel) == 11 {{0}} tel.isdigit():
    print("Valid number")
else:
    print("Invalid number")`, a:["and"], d:["or","+"], o:"Invalid number",
w:"This has the right length but contains a letter. Both checks must pass, so join them with and."},

{t:"Length & presence", p:1, q:"How many answers are blank?",
c:`answers = ["B", "", "A", " "]
blank = 0
for a in answers:
    if a.strip() == "":
        blank = blank + 1
print(blank)`, a:["2"], d:["1","3","4"],
w:"\"\" and \" \" both become \"\" after strip(), so both count as blank."},

{t:"Length & presence", q:"Return True if something was typed.",
c:`def present(s):
    return len(s.strip()) {{0}} 0
print(present(" "), present("x"))`, a:[">"], d:["==","<",">="], o:"False True",
w:"After strip(), a real answer has a length greater than 0. Spaces alone strip down to length 0."},

{t:"Length & presence", p:1, q:"What does this print?",
c:`pw = "pass word"
if len(pw) >= 8:
    print("Long enough")
else:
    print("Too short")`, a:["Long enough"], d:["Too short","8","9"],
w:"The space counts as a character, so \"pass word\" has 9 characters."},
// ---------- Format checks ----------
{t:"Format checks", q:"An email address must contain an @.", i:["sam.example.com"],
c:`email = input()
if {{0}} in email:
    print("Looks OK")
else:
    print("Missing @")`, a:['"@"'], d:['"."','"com"',"@"], o:"Missing @",
w:"The in operator checks whether one string appears inside another. The @ must be in quotes because it is a string."},

{t:"Format checks", q:"An email must have exactly one @.", i:["ab@c.com"],
c:`e = input()
if e.{{0}}("@") == 1:
    print("OK")
else:
    print("Invalid")`, a:["count"], d:["find","index","endswith"], o:"OK",
w:"count() returns how many times \"@\" appears. find() and index() return its position instead, which is 2 here."},

{t:"Format checks", q:"The postcode must start with two letters.", i:["cb21 3ab"],
c:`pc = input().upper()
start = pc[:2]
if start.{{0}}():
    print("Format OK")
else:
    print("Bad format")`, a:["isalpha"], d:["isdigit","islower","isspace"], o:"Format OK",
w:"start is the first two characters, \"CB\". isalpha() checks they are letters. The code converts to upper case first so either case is accepted."},

{t:"Format checks", p:1, q:"What does this print?",
c:`pc = "SW1A 1AA"
print(pc[-3:])`, a:["1AA"], d:["1A","A 1AA","AA"],
w:"[-3:] takes the last three characters. In a UK postcode these are always a digit and two letters (the inward code)."},

{t:"Format checks", q:"A postcode must contain exactly one space.", i:["LS1 4AP"],
c:`pc = input()
if pc.count(" ") {{0}} 1:
    print("Accept")
else:
    print("Reject")`, a:["=="], d:["!=",">","<"], o:"Accept",
w:"count(\" \") gives the number of spaces. Exactly one means == 1."},

{t:"Format checks", q:"IDs are 2 letters then 4 digits, like AB1234.", i:["AB1234","AB12C4"],
c:`for k in range(2):
    sid = input()
    ok = len(sid) == 6
    ok = ok and sid[:2].isalpha()
    ok = ok and sid[{{0}}].isdigit()
    print(sid, ok)`, a:["2:"], d:[":2","2","-1"], o:"AB1234 True\nAB12C4 False",
w:"sid[2:] is everything from index 2 to the end, the four digits. Checking just one character, like sid[2], misses the C."},

{t:"Format checks", p:1, q:"What does this print?",
c:`e = "sam@mail"
ok = "@" in e and "." in e
print(ok)`, a:["False"], d:["True","sam@mail","None"],
w:"There is an @ but no dot, and and needs both to be True. A format check can test for several parts at once."},

{t:"Format checks", q:"There must be a dot after the @.", i:["jo@mail.uk"],
c:`e = input()
at = e.find("@")
dot = e.rfind(".")
if at > 0 and dot {{0}} at:
    print("Valid")
else:
    print("Invalid")`, a:[">"], d:["<","==","<="], o:"Valid",
w:"find() gives the position of the @ and rfind() the position of the last dot. The dot must come later, so its position is greater."},

{t:"Format checks", q:"Split a date typed as DD/MM/YYYY into parts.", i:["25/12/2025"],
c:`d = input()
parts = d.split({{0}})
print(len(parts))`, a:['"/"'], d:['"-"','" "','""'], o:"3",
w:"split(\"/\") cuts the string at each slash, giving a day, a month and a year. Counting the parts is a quick format check."},

{t:"Format checks", p:1, q:"What does this print?",
c:`parts = "31/02/2025".split("/")
print(int(parts[1]) <= 12)`, a:["True"], d:["False","02","ValueError"],
w:"The month is 2, which is in range. The format is fine, but 31 February still isn't a real date, so a format check alone isn't enough."},

{t:"Format checks", q:"Times must look like HH:MM.", i:["09:30"],
c:`t = input()
if len(t) == 5 and t[{{0}}] == ":":
    print("Time OK")
else:
    print("Use HH:MM")`, a:["2"], d:["3","1","-2"], o:"Time OK",
w:"The two hour digits are at indexes 0 and 1, so the colon is at index 2."},

{t:"Format checks", q:"Usernames may only use letters and digits.", i:["sam99"],
c:`u = input()
ok = True
for ch in u:
    if not ch.{{0}}():
        ok = False
print(ok)`, a:["isalnum"], d:["isalpha","isdigit","isupper"], o:"True",
w:"isalnum() is True for letters AND digits. isalpha() would reject the 9s and isdigit() would reject the letters."},

{t:"Format checks", p:1, q:"What does this print?",
c:`pc = "B1 1AA"
print(pc[:2].isalpha())`, a:["False"], d:["True","B1","B"],
w:"pc[:2] is \"B1\", and the 1 is not a letter. Some postcodes start with one letter and some with two, so a check must allow for both."},

{t:"Format checks", q:"Product codes must start with PRD-.", i:["PRD-4471"],
c:`code = input()
if code.{{0}}("PRD-"):
    print("Valid code")
else:
    print("Invalid code")`, a:["startswith"], d:["endswith","find","isalpha"], o:"Valid code",
w:"startswith() checks the beginning of a string. find() returns 0 here, and 0 counts as False, so it would wrongly reject the code."},

{t:"Format checks", q:"There must be text before and after the @.",
c:`tests = ["@x", "a@x", "a@", "ab"]
for e in tests:
    at = e.find("@")
    ok = at {{0}} 0 and at < len(e) - 1
    print(ok)`, a:[">"], d:[">=","!=","=="], o:"False\nTrue\nFalse\nFalse",
w:"at > 0 means at least one character comes before the @. find() returns -1 if there is no @, which > 0 also rejects."},

{t:"Format checks", p:1, q:"What does this print?",
c:`code = "ab12"
print(code.isalnum(), code.isalpha())`, a:["True False"], d:["False False","True True","False True"],
w:"isalnum() accepts letters and digits, so it is True. isalpha() needs letters only, and the digits make it False."},

{t:"Format checks", q:"Passwords need at least one digit.", i:["tiger7"],
c:`pw = input()
has_digit = False
for ch in pw:
    if ch.isdigit():
        has_digit = {{0}}
print(has_digit)`, a:["True"], d:["False","ch","0"], o:"True",
w:"The flag starts False and is set to True as soon as one digit is found. This checks every character without using the re module."},

{t:"Format checks", q:"The space must come before the last 3 characters.", i:["SW1A 1AA"],
c:`pc = input()
if pc[{{0}}] == " ":
    print("Space in right place")
else:
    print("Check the space")`, a:["-4"], d:["-3","3","-5"], o:"Space in right place",
w:"The last three characters are -3, -2 and -1, so the space is at -4. Counting from the end works for postcodes of any length."},

{t:"Format checks", p:1, q:"What does this print?",
c:`d = "2025-13-01"
m = int(d[5:7])
print(1 <= m <= 12)`, a:["False"], d:["True","13","ValueError"],
w:"d[5:7] is \"13\". The date has the right format, but 13 is not a real month, so a range check is needed as well."},

{t:"Format checks", q:"UK mobile numbers start with 07 and have 11 digits.", i:["07700900123"],
c:`tel = input()
if tel[{{0}}] == "07" and len(tel) == 11:
    print("Mobile")
else:
    print("Not a mobile")`, a:[":2"], d:["0:1","2:","0"], o:"Mobile",
w:"tel[:2] is the first two characters. The slice stops before index 2, so 0:1 would give only \"0\"."},

{t:"Format checks", p:1, q:"What does this print?",
c:`e = "jo@@site.com"
print(e.count("@") == 1)`, a:["False"], d:["True","2","1"],
w:"There are two @ signs, so count() gives 2 and the check fails. Just testing \"@\" in e would wrongly pass this."},

// ---------- Authentication ----------
{t:"Authentication", q:"Compare the typed password with the stored one.", i:["tiger42"],
c:`stored = "Tiger42"
pw = input()
if pw {{0}} stored:
    print("Access granted")
else:
    print("Access denied")`, a:["=="], d:["=","!=",">"], o:"Access denied",
w:"== compares the strings exactly, and capital letters matter, so \"tiger42\" does not match \"Tiger42\"."},

{t:"Authentication", q:"Allow at most 3 attempts.", i:["a","b","c"],
c:`tries = 0
ok = False
while tries < {{0}} and not ok:
    ok = input() == "letmein"
    tries = tries + 1
print(ok, tries)`, a:["3"], d:["2","4","tries"], o:"False 3",
w:"tries goes 0, 1, 2, so the loop runs 3 times. With < 4 it would ask a fourth time."},

{t:"Authentication", p:1, q:"What is printed when the user types 1111, then 1234?", i:["1111","1234"],
c:`attempts = 0
pin = input()
while pin != "1234" and attempts < 2:
    attempts = attempts + 1
    pin = input()
print(pin == "1234")`, a:["True"], d:["False","1234","2"],
w:"The first PIN is wrong, so the loop asks again. The second PIN is right, so the comparison prints True."},

{t:"Authentication", q:"Both the username and password must match.", i:["admin","pass"],
c:`user = input()
pw = input()
if user == "admin" {{0}} pw == "Pa55":
    print("Welcome")
else:
    print("Denied")`, a:["and"], d:["or","not"], o:"Denied",
w:"With or, knowing the username alone would let someone in. Both checks must pass, so use and."},

{t:"Authentication", q:"Stop asking once the right password is typed.", i:["cat","owl"],
c:`fails = 0
while fails < 3:
    if input() == "owl":
        print("In")
        {{0}}
    fails = fails + 1
if fails == 3:
    print("Locked")`, a:["break"], d:["continue","pass"], o:"In",
w:"break leaves the loop straight away. Without it the program would keep asking for the password."},

{t:"Authentication", p:1, q:"What is printed when the user types ben, then r3d?", i:["ben","r3d"],
c:`names = ["amy", "ben", "cal"]
pws = ["r3d", "b1ue", "gr33n"]
u = input()
p = input()
if u in names:
    k = names.index(u)
    print(pws[k] == p)
else:
    print("No such user")`, a:["False"], d:["True","No such user","b1ue"],
w:"ben is at index 1, so his stored password is pws[1], \"b1ue\". \"r3d\" belongs to amy."},

{t:"Authentication", q:"Find the user's position to look up their password.", i:["cal","gr33n"],
c:`names = ["amy", "ben", "cal"]
pws = ["r3d", "b1ue", "gr33n"]
u = input()
p = input()
k = names.{{0}}(u)
if pws[k] == p:
    print("Logged in")`, a:["index"], d:["find","count","pop"], o:"Logged in",
w:"index() gives the position of an item in a list. The same position in the parallel list holds that user's password."},

{t:"Authentication", q:"Count down the attempts left.", i:["a","b","c"],
c:`left = 3
while left > 0:
    if input() == "k1wi":
        print("OK")
        break
    left = left {{0}} 1
    print(left, "left")`, a:["-"], d:["+","*","//"], o:"2 left\n1 left\n0 left",
w:"Each wrong attempt takes one away. When left reaches 0 the loop stops, which locks the user out."},

{t:"Authentication", p:1, q:"What does this print?",
c:`stored = "admin"
u = "Admin "
print(u.strip().lower() == stored)`, a:["True"], d:["False","admin","Admin"],
w:"Usernames are often cleaned with strip() and lower() before comparing. Passwords should not be, because their case matters."},

{t:"Authentication", q:"Check the login against the records in the file.", i:["ben","b1ue"], f:{"users.txt":"amy,r3d\nben,b1ue\n"},
c:`u = input()
p = input()
found = False
for line in open("users.txt"):
    n, w = line.strip().split(",")
    if n == u and w == p:
        found = {{0}}
print(found)`, a:["True"], d:["False","n","u"], o:"True",
w:"Each line is split into a name and a password. The flag only becomes True when both match the same record."},

{t:"Authentication", q:"Give the user exactly 3 attempts.", i:["a","b","c"],
c:`attempts = 0
while attempts {{0}} 3:
    pw = input()
    attempts = attempts + 1
    if pw == "x9":
        break
print(attempts)`, a:["<"], d:["<=",">","=="], o:"3",
w:"Starting at 0, < 3 allows attempts 0, 1 and 2, which is three tries. <= 3 would give a fourth try."},

{t:"Authentication", p:1, q:"What does this print?",
c:`fails = 0
for pw in ["a", "b", "c"]:
    if pw != "ok":
        fails = fails + 1
if fails >= 3:
    print("Account locked")
else:
    print("Fails:", fails)`, a:["Account locked"], d:["Fails: 3","Fails: 2","Fails: 0"],
w:"All three attempts are wrong, so fails reaches 3 and the account is locked."},

{t:"Authentication", q:"Check the username is on the list.", i:["BEN"],
c:`users = ["amy", "ben", "cal"]
u = input().lower()
if u {{0}} users:
    print("Enter password")
else:
    print("Unknown user")`, a:["in"], d:["not in","==","is"], o:"Enter password",
w:"lower() turns \"BEN\" into \"ben\", and in checks whether it is one of the stored usernames."},

{t:"Authentication", p:1, q:"What is printed when the user types 1234, then 4096?", i:["1234","4096"],
c:`pin = "4096"
for n in range(3):
    if input() == pin:
        print("Attempt", n)
        break`, a:["Attempt 1"], d:["Attempt 2","Attempt 0","4096"],
w:"range(3) counts from 0, so the second attempt has n = 1. Add 1 if you want to show attempts counted from 1."},

{t:"Authentication", q:"Ask again until the two passwords match.", i:["moon7","mon7","moon7"],
c:`p1 = input()
p2 = input()
while p1 {{0}} p2:
    print("No match")
    p2 = input()
print("Password set")`, a:["!="], d:["==","=","<"], o:"No match\nPassword set",
w:"Typing a new password twice catches typing mistakes. The loop repeats while they are NOT equal."},

{t:"Authentication", q:"Return True only for the correct login.",
c:`def login(u, p):
    if u == "jo" and p == "k3y":
        return {{0}}
    return {{1}}
a = login("jo", "k3y")
b = login("jo", "x")
print(a, b)`, a:["True","False"], d:["None","0"], o:"True False",
w:"The function returns True as soon as both details match. Otherwise it reaches the last line and returns False."},

{t:"Authentication", p:1, q:"What does this print?",
c:`saved = "Pass123"
typed = "pass123"
if typed == saved:
    print("In")
else:
    print("Wrong password")`, a:["Wrong password"], d:["In","pass123","Pass123"],
w:"String comparison is case-sensitive: \"p\" and \"P\" are different characters."},

{t:"Authentication", q:"Unlock if the right word is typed within 3 tries.", i:["lion","zebra"],
c:`locked = True
for n in range(3):
    if input() == "zebra":
        locked = {{0}}
        break
if locked:
    print("Locked out")
else:
    print("Welcome")`, a:["False"], d:["True","n","zebra"], o:"Welcome",
w:"The user starts locked and is only unlocked by a correct answer, which is a safe default for security."},

{t:"Authentication", p:1, q:"How many failed attempts are counted?",
c:`log = []
for pw in ["x", "y", "ok"]:
    log.append(pw == "ok")
print(log.count(False))`, a:["2"], d:["1","3","[False, False]"],
w:"The list holds False, False, True. count(False) gives 2 failed attempts."},

{t:"Authentication", q:"Check a security answer, ignoring case and spaces.", i:["  LONDON "],
c:`ans = "London"
t = input().strip()
if t.{{0}}() == ans.lower():
    print("Verified")
else:
    print("Not verified")`, a:["lower"], d:["upper","title","strip"], o:"Verified",
w:"Both sides must be in the same case. The stored answer is lowered, so the typed answer must be lowered too."},

{t:"Authentication", p:1, q:"What is printed when the user types a, b, then c?", i:["a","b","c"],
c:`tries = 0
while tries < 3:
    if input() == "pw":
        break
    tries = tries + 1
print("Locked:", tries == 3)`, a:["Locked: True"], d:["Locked: False","Locked: 3","Locked: 2"],
w:"Three wrong answers take tries to 3 and end the loop, so the lockout condition is True."},
// ---------- Fix the bug ----------
{t:"Fix the bug", q:"This should include 100. Fix the condition.",
c:`n = 100
if n >= 1 and n {{0}} 100:
    print("Accepted")
else:
    print("Rejected")`, a:["<="], d:["<",">","!="], o:"Accepted",
w:"n < 100 leaves out 100 itself. This off-by-one mistake is a logic error: the program runs but gives the wrong result."},

{t:"Fix the bug", q:"This crashes with a TypeError. Fix the input line.", i:["21"],
c:`age = {{0}}
if age >= 18:
    print("Adult")`, a:["int(input())"], d:["input()","str(input())","input(int)"], o:"Adult",
w:"input() returns a string, and Python can't compare a string with 18. Cast it with int() as soon as it is read."},

{t:"Fix the bug", q:"This gives a SyntaxError. Fix the comparison.", i:["open"],
c:`pw = input()
if pw {{0}} "open":
    print("Unlocked")`, a:["=="], d:["=","!=","<"], o:"Unlocked",
w:"A single = assigns a value. Comparing needs ==. Using = inside an if is a syntax error, so the program won't run at all."},

{t:"Fix the bug", q:"This should total the scores. Fix the wrong variable.",
c:`total = 0
for score in [4, 7, 9]:
    total = total + {{0}}
print(total)`, a:["score"], d:["total","1","scores"], o:"20",
w:"The loop variable is score, so that's what must be added each time. scores doesn't exist, which would cause a NameError."},

{t:"Fix the bug", q:"This should print 1 to 5 but stops at 4.",
c:`for n in range(1, {{0}}):
    print(n)`, a:["6"], d:["5","4","7"], o:"1\n2\n3\n4\n5",
w:"range() stops BEFORE the end value, so to include 5 the end must be 6."},

{t:"Fix the bug", q:"This loops forever. Fix the last line.",
c:`count = 1
while count <= 3:
    print(count)
    {{0}}`, a:["count = count + 1"], d:["count + 1","count == count + 1","count = 1"], o:"1\n2\n3",
w:"count + 1 works out a value but never stores it. Without the assignment, count stays at 1 and the loop never ends."},

{t:"Fix the bug", q:"This prints 0 instead of the highest temperature.",
c:`temps = [-4, -9, -2]
high = {{0}}
for t in temps:
    if t > high:
        high = t
print(high)`, a:["temps[0]"], d:["0","temps","-1"], o:"-2",
w:"Starting at 0 fails when every value is negative. Starting with the first item in the list always works."},

{t:"Fix the bug", q:"This raises a TypeError. Fix it.",
c:`score = 42
print("Score: " + {{0}})`, a:["str(score)"], d:["score","int(score)","len(score)"], o:"Score: 42",
w:"+ can't join a string and an integer. str() turns 42 into \"42\" so the two strings can be joined."},

{t:"Fix the bug", q:"This should print the last name but raises an IndexError.",
c:`names = ["Ali", "Bo", "Cy"]
print(names[{{0}}])`, a:["2"], d:["3","len(names)","1"], o:"Cy",
w:"A list of 3 items has indexes 0, 1 and 2. Index 3 is out of range."},

{t:"Fix the bug", q:"The average is wrong. Fix the divisor.",
c:`marks = [6, 8, 10]
avg = sum(marks) / {{0}}
print(avg)`, a:["len(marks)"], d:["2","marks","len(marks)-1"], o:"8.0",
w:"An average divides by how many values there are, which is len(marks). Hard-coding a number breaks if the list changes."},

{t:"Fix the bug", q:"This never warns, even at 50. Fix the operator.",
c:`t = 50
if t < 0 {{0}} t > 40:
    print("Warning")
else:
    print("Normal")`, a:["or"], d:["and","not"], o:"Warning",
w:"A temperature can't be below 0 and above 40 at once, so and never warns. Out-of-range checks need or."},

{t:"Fix the bug", q:"This crashes with a TypeError. Fix the function.",
c:`def double(n):
    {{0}} n * 2
x = double(4) + 1
print(x)`, a:["return"], d:["print","pass","n ="], o:"9",
w:"print() only shows a value; the function would still give back None, and None + 1 is a TypeError. return sends the value back."},

{t:"Fix the bug", q:"This raises a NameError. Add the missing line.",
c:`words = ["a", "b", "c"]
{{0}}
for w in words:
    count = count + 1
print(count)`, a:["count = 0"], d:["count = 1","count == 0","count = count"], o:"3",
w:"A variable must be given a value before it is used. count = count + 1 needs count to exist already."},

{t:"Fix the bug", q:"70 should get Grade 7. Fix the condition.",
c:`mark = 70
if mark {{0}} 70:
    print("Grade 7")
else:
    print("Below 7")`, a:[">="], d:[">","<","!="], o:"Grade 7",
w:"A grade boundary is the lowest mark that gets the grade, so the mark must be greater than OR equal to it."},

{t:"Fix the bug", q:"Typing 1.5 crashes the program. Fix the cast.", i:["1.5"],
c:`h = {{0}}(input())
print(h * 2)`, a:["float"], d:["int","str","len"], o:"3.0",
w:"int(\"1.5\") raises a ValueError. float() accepts decimal values."},

{t:"Fix the bug", q:"This misses the last number. Fix the range.",
c:`nums = [3, 8, 2]
total = 0
for k in range({{0}}):
    total = total + nums[k]
print(total)`, a:["len(nums)"], d:["len(nums)-1","len(nums)+1","nums"], o:"13",
w:"range(len(nums)) gives 0, 1, 2, every valid index. range(len(nums)-1) stops one too early."},

{t:"Fix the bug", q:"The loop never ends. Fix the last line of the loop.", i:["-1","4"],
c:`n = int(input())
while n < 0:
    print("Must be positive")
    {{0}}
print("OK", n)`, a:["n = int(input())"], d:["int(input())","n = -n","n == int(input())"], o:"Must be positive\nOK 4",
w:"The new value must be stored back in n. Otherwise the condition checks the old value for ever."},

{t:"Fix the bug", q:"Typing YES doesn't work. Fix the method.", i:["YES"],
c:`ans = input()
if ans.{{0}}() == "yes":
    print("Saving")`, a:["lower"], d:["upper","strip","title"], o:"Saving",
w:"The program compares with lower-case \"yes\", so the input must be converted to lower case first."},

{t:"Fix the bug", q:"best never changes. Fix the assignment.",
c:`best = 0
for s in [12, 30, 18]:
    if s > best:
        best {{0}} s
print(best)`, a:["="], d:["==","+=","-="], o:"30",
w:"best == s only compares and throws the answer away. A single = stores the new best score."},

{t:"Fix the bug", q:"This says 4 is odd. Fix the operator.",
c:`n = 4
if n {{0}} 2 == 0:
    print("Even")
else:
    print("Odd")`, a:["%"], d:["//","/","*"], o:"Even",
w:"% gives the remainder (MOD in OCR's reference language). Even numbers have a remainder of 0 when divided by 2."},

{t:"Fix the bug", q:"Only the last mark is counted. Move the reset.",
c:`{{0}}
for m in [5, 3, 4]:
    {{1}}
    total = total + m
print(total)`, a:["total = 0","pass"], d:["total = m","print(total)"], o:"12",
w:"If total = 0 is inside the loop, it is reset every time round. It must be set once, before the loop starts."},

// ---------- Error types ----------
{t:"Error types", p:1, q:"What does this print?",
c:`print(10 / 0)`, a:["ZeroDivisionError"], d:["0","10","ValueError"],
w:"Dividing by zero has no answer, so Python stops with a ZeroDivisionError. This is a runtime error: the code is valid but fails when it runs."},

{t:"Error types", p:1, q:"What does this print?",
c:`print("Age: " + 15)`, a:["TypeError"], d:["Age: 15","ValueError","SyntaxError"],
w:"+ can't join a string and an integer, which is a TypeError. Use str(15), or a comma in print()."},

{t:"Error types", p:1, q:"What does this print?",
c:`n = int("seven")
print(n)`, a:["ValueError"], d:["7","TypeError","NameError"],
w:"int() is given a string, which is the right type, but \"seven\" isn't a valid number. A bad value gives a ValueError."},

{t:"Error types", p:1, q:"What does this print?",
c:`total = 5
print(totl)`, a:["NameError"], d:["5","ValueError","None"],
w:"totl was never given a value, so Python doesn't know the name. A typo in a variable name causes a NameError."},

{t:"Error types", p:1, q:"What does this print?",
c:`days = ["Mon", "Tue"]
print(days[2])`, a:["IndexError"], d:["Tue","None","KeyError"],
w:"The list has indexes 0 and 1 only. Asking for index 2 is out of range, so Python raises an IndexError."},

{t:"Error types", p:1, q:"Is there an error? What does this print?",
c:`a = 4
b = 6
avg = a + b / 2
print(avg)`, a:["7.0"], d:["5.0","5","TypeError"],
w:"Division happens before addition, so this is 4 + 3. Python raises no error, but the answer is wrong: a logic error. It needs (a + b) / 2."},

{t:"Error types", p:1, q:"What does this print?",
c:`print("5" * 3)`, a:["555"], d:["15","TypeError","ValueError"],
w:"A string times an integer repeats the string, so there is no error. Forgetting to cast \"5\" causes a logic error here, not a crash."},

{t:"Error types", p:1, q:"What does this print?",
c:`print(len(42))`, a:["TypeError"], d:["2","1","ValueError"],
w:"len() works on strings and lists, not on integers. Using a value of the wrong type gives a TypeError."},

{t:"Error types", q:"Catch the error when the user types 0.", i:["0"],
c:`try:
    r = 10 // int(input())
    print(r)
except {{0}}:
    print("Cannot divide by 0")`, a:["ZeroDivisionError"], d:["ValueError","TypeError","NameError"], o:"Cannot divide by 0",
w:"\"0\" is a valid number, so int() works. The division by 0 raises a ZeroDivisionError."},

{t:"Error types", q:"Skip the values that can't be divided by.",
c:`nums = [5, 0, 2]
for d in nums:
    try:
        print(10 // d)
    except {{0}}:
        print("skip")`, a:["ZeroDivisionError"], d:["ValueError","IndexError","TypeError"], o:"2\nskip\n5",
w:"Only 10 // 0 fails. Because the try is inside the loop, the program carries on with the next value."},

{t:"Error types", p:1, q:"Is there an error? What does this print?",
c:`print(int(4.9))`, a:["4"], d:["5","ValueError","4.9"],
w:"int() can convert a float: it cuts off the decimal part rather than rounding. Only a STRING like \"4.9\" causes a ValueError."},

{t:"Error types", p:1, q:"What does this print?",
c:`n = 5
n.append(6)
print(n)`, a:["AttributeError"], d:["[5, 6]","TypeError","56"],
w:"append() belongs to lists. An integer has no append, so Python raises an AttributeError."},

{t:"Error types", p:1, q:"Is there an error? What does this print?",
c:`print(int("12") + float("0.5"))`, a:["12.5"], d:["TypeError","12.0.5","ValueError"],
w:"Both strings are converted to numbers first, so they can be added. An int plus a float gives a float."},

{t:"Error types", q:"Catch a menu choice that doesn't exist.", i:["5"],
c:`items = ["pen", "pad"]
try:
    print(items[int(input())])
except {{0}}:
    print("No such item")`, a:["IndexError"], d:["ValueError","KeyError","ZeroDivisionError"], o:"No such item",
w:"5 is a valid number but not a valid position in the list, so Python raises an IndexError."},

{t:"Error types", p:1, q:"This should add 1 to 5. What does it print?",
c:`total = 0
for n in range(1, 5):
    total = total + n
print(total)`, a:["10"], d:["15","5","IndexError"],
w:"range(1, 5) stops at 4, so it adds 1 + 2 + 3 + 4. No error appears, but the answer is wrong: a logic error."},

{t:"Error types", p:1, q:"What does this print?",
c:`Score = 8
print(score + 1)`, a:["NameError"], d:["9","ValueError","TypeError"],
w:"Python is case-sensitive, so Score and score are different names. score has no value, which gives a NameError."},

{t:"Error types", p:1, q:"What does this print?",
c:`ages = [12, 15]
print(ages + 3)`, a:["TypeError"], d:["[15, 18]","[12, 15, 3]","IndexError"],
w:"+ can join two lists, but not a list and a number. That's the wrong type, so it's a TypeError."},

{t:"Error types", q:"Only print the number if no error happened.", i:["8"],
c:`try:
    n = int(input())
except ValueError:
    print("Bad")
{{0}}:
    print("Got", n)`, a:["else"], d:["elif","except","if"], o:"Got 8",
w:"The else block of a try runs only when no exception was raised. It keeps the risky line alone inside try."},

{t:"Error types", p:1, q:"A 10% discount was intended. What does this print?",
c:`price = 20
discount = 10
print(price - price * discount)`, a:["-180"], d:["18","18.0","10"],
w:"The code multiplies by 10 instead of 10/100. Python runs it without complaint, so this is a logic error, not a runtime error."},

{t:"Error types", p:1, q:"What does this print?",
c:`qty = ""
print(int(qty))`, a:["ValueError"], d:["0","TypeError","None"],
w:"An empty string isn't a number, so int(\"\") raises a ValueError. A presence check first would stop this crash."},

{t:"Error types", q:"Handle both possible errors.", i:["x","0"],
c:`for k in range(2):
    try:
        n = int(input())
        print(12 / n)
    except {{0}}:
        print("Not a number")
    except {{1}}:
        print("Can't be 0")`, a:["ValueError","ZeroDivisionError"], d:["TypeError","IndexError"], o:"Not a number\nCan't be 0",
w:"A try can have several except blocks. \"x\" fails int() with a ValueError; 0 passes int() but fails the division with a ZeroDivisionError."},

{t:"Error types", p:1, q:"What does this print?",
c:`word = "cat"
print(word[1] + word[5])`, a:["IndexError"], d:["a","at","TypeError"],
w:"\"cat\" only has indexes 0 to 2, so word[5] is out of range. Strings give an IndexError just like lists."},

// ---------- Test data ----------
{t:"Test data", q:"Return the right category for data outside 1 to 10.",
c:`def kind(n):
    if n < 1 or n > 10:
        return {{0}}
    if n == 1 or n == 10:
        return {{1}}
    return {{2}}
print(kind(-5), kind(10), kind(5))`, a:['"invalid"','"boundary"','"normal"'], d:['"erroneous"','"valid"'], o:"invalid boundary normal",
w:"OCR's terms: invalid data is the right type but outside the limits, boundary data is at the edge of the range, and normal data is safely inside it."},

{t:"Test data", q:"Usernames must be 3 to 12 letters. Spot the boundary lengths.",
c:`def kind(u):
    n = len(u)
    if n == 3 {{0}} n == 12:
        return "boundary"
    if 3 < n < 12:
        return "normal"
    return "invalid"
print(kind("Sam"), kind("Samuel"))`, a:["or"], d:["and","+"], o:"boundary normal",
w:"A length can only equal one limit at a time, so the boundary test needs or. 3 letters is exactly the minimum."},

{t:"Test data", p:1, q:"The range is 0 to 100. What does this print?",
c:`lo = 0
hi = 100
v = 250
if v < lo or v > hi:
    print("invalid")
elif v == lo or v == hi:
    print("boundary")
else:
    print("normal")`, a:["invalid"], d:["boundary","normal","erroneous"],
w:"250 is a whole number (the right type) but outside the limits, so it is invalid data, not erroneous."},

{t:"Test data", p:1, q:"Whole numbers 1 to 10 are allowed. What is printed for 7.5?", i:["7.5"],
c:`def kind(s):
    if not s.isdigit():
        return "erroneous"
    n = int(s)
    if n == 1 or n == 10:
        return "boundary"
    if 1 < n < 10:
        return "normal"
    return "invalid"
print(kind(input()))`, a:["erroneous"], d:["normal","invalid","boundary"],
w:"7.5 is a decimal, but the program wants a whole number. Data of the wrong type is erroneous data, even if it sits between the limits."},

{t:"Test data", q:"Count the normal values for a 1 to 20 range.",
c:`normal = []
for v in range(0, 22):
    if 1 < v < {{0}}:
        normal.append(v)
print(len(normal))`, a:["20"], d:["21","19","22"], o:"18",
w:"Normal data is inside the range but not on the edge, so 2 to 19. That's 18 values; 1 and 20 are boundary data."},

{t:"Test data", p:1, q:"Ages 18 to 65 are allowed. What does this print?",
c:`ages = [17, 18, 40, 65, 99]
b = []
for a in ages:
    if a == 18 or a == 65:
        b.append(a)
print(b)`, a:["[18, 65]"], d:["[17, 18, 65, 99]","[40]","[17, 99]"],
w:"The program picks out the values exactly at the limits, which are the accepted boundary values."},

{t:"Test data", q:"Ratings are 1 to 5. Classify text that isn't a number.",
c:`def kind(s):
    try:
        n = int(s)
    except ValueError:
        return {{0}}
    if n == 1 or n == 5:
        return "boundary"
    if 1 < n < 5:
        return "normal"
    return "invalid"
print(kind("three"))`, a:['"erroneous"'], d:['"invalid"','"normal"','"boundary"'], o:"erroneous",
w:"\"three\" can't be turned into an integer, so it is the wrong type of data. OCR calls this erroneous data."},

{t:"Test data", p:1, q:"Range 1 to 10. How many values are normal data?",
c:`data = [5, 1, 10, 0, 7]
n = 0
for d in data:
    if 1 < d < 10:
        n = n + 1
print(n)`, a:["2"], d:["3","4","5"],
w:"Only 5 and 7 are strictly inside. 1 and 10 are boundary data, and 0 is outside the range."},

{t:"Test data", p:1, q:"A month number 1 to 12 is wanted. What does this print?",
c:`v = "June"
if not v.isdigit():
    print("erroneous")
elif 1 <= int(v) <= 12:
    print("accepted")
else:
    print("invalid")`, a:["erroneous"], d:["invalid","accepted","boundary"],
w:"\"June\" is text, but the program expects a number. That is the wrong data type, so it is erroneous data."},

{t:"Test data", q:"Ages 13 to 19 are allowed. Finish the boundary test.",
c:`lo = 13
hi = 19
def on_edge(v):
    return v == lo or v == {{0}}
print(on_edge(19), on_edge(16))`, a:["hi"], d:["lo","v","hi + 1"], o:"True False",
w:"Boundary data sits exactly on each limit, so v must equal lo or hi."},

{t:"Test data", q:"Range 1 to 10. Classify each test value.",
c:`tests = [5, 1, 99, -4, "x"]
for t in tests:
    if type(t) != int:
        print(t, "erroneous")
    elif t == 1 or t == 10:
        print(t, "boundary")
    elif {{0}}:
        print(t, "normal")
    else:
        print(t, "invalid")`, a:["1 < t < 10"], d:["t > 1","t < 10","t >= 0"], o:"5 normal\n1 boundary\n99 invalid\n-4 invalid\nx erroneous",
w:"Normal data must be above the lower limit AND below the upper one. One-sided checks let 99 or -4 through as normal."},

{t:"Test data", p:1, q:"Whole numbers 1 to 10 are allowed. What does this print?",
c:`s = "15"
try:
    n = int(s)
    if 1 <= n <= 10:
        print("accepted")
    else:
        print("invalid")
except ValueError:
    print("erroneous")`, a:["invalid"], d:["erroneous","boundary","accepted"],
w:"\"15\" converts to an integer without trouble, so it is the right type. It is outside the limits, so it is invalid data."},

{t:"Test data", q:"Ages 18 to 65 are allowed. Pick a boundary value.",
c:`lo = 18
hi = 65
v = {{0}}
if v == lo or v == hi:
    print("boundary")`, a:["65"], d:["64","66","17"], o:"boundary",
w:"65 is the highest value that should be accepted, so it is on the boundary. 64 is normal data."},

{t:"Test data", q:"Pick an erroneous test value for a 1 to 10 range.",
c:`v = {{0}}
if type(v) != int:
    print("erroneous")
elif 1 <= v <= 10:
    print("accepted")
else:
    print("invalid")`, a:['"five"'], d:["5","50","0"], o:"erroneous",
w:"Erroneous data is the wrong type. 50 and 0 are integers outside the range, which makes them invalid, not erroneous."},

{t:"Test data", q:"A percentage must be 0 to 100. Pick invalid data.",
c:`def check(p):
    if p < 0 or p > 100:
        return "invalid"
    return "ok"
print(check({{0}}))`, a:["100.5"], d:["100","0","50.5"], o:"invalid",
w:"100.5 is a number (the right type) but just over the limit, so it is invalid data. 100 and 0 are boundary values."},

{t:"Test data", p:1, q:"A dice roll must be 1 to 6. What does this print?",
c:`def kind(n):
    if n < 1 or n > 6:
        return "invalid"
    if n == 1 or n == 6:
        return "boundary"
    return "normal"
print(kind(6), kind(3))`, a:["boundary normal"], d:["invalid normal","normal normal","boundary boundary"],
w:"6 is the top limit, so it is boundary data. 3 is safely inside the range, so it is normal data."},

{t:"Test data", q:"Passwords must be 8 to 16 characters. Test the top limit.",
c:`pw = "a" * 16
n = len(pw)
if n < 8 or n > 16:
    print("invalid")
elif n == 8 or n == {{0}}:
    print("boundary")
else:
    print("normal")`, a:["16"], d:["15","17","8"], o:"boundary",
w:"16 characters is the longest password allowed, so it is a boundary test. Testing both limits catches < vs <= mistakes."},

{t:"Test data", p:1, q:"A number is wanted. What is printed when the user types \"4 \"?", i:["4 "],
c:`s = input()
if s == "":
    print("missing")
elif not s.isdigit():
    print("erroneous")
else:
    print("number")`, a:["erroneous"], d:["number","missing","invalid"],
w:"The space after the 4 is not a digit, so isdigit() is False. Good test data includes tricky values like this."},

{t:"Test data", q:"Build a test plan with one value of each kind for 1 to 10.",
c:`plan = [5, {{0}}, 50, {{1}}]
for v in plan:
    print(v)`, a:["10",'"ten"'], d:["11","5.5"], o:"5\n10\n50\nten",
w:"The plan holds normal (5), boundary (10), invalid (50) and erroneous (\"ten\") data, one of each OCR category."},

{t:"Test data", p:1, q:"Range 1 to 10. What does this print?",
c:`plan = [1, 4, 10, 30]
b = 0
for v in plan:
    if v == 1 or v == 10:
        b = b + 1
print("Boundary tests:", b)`, a:["Boundary tests: 2"], d:["Boundary tests: 1","Boundary tests: 4","Boundary tests: 3"],
w:"1 and 10 are the limits, so the plan has two boundary tests. A good plan tests both ends of the range."},
]);
