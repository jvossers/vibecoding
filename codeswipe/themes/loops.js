// Theme: Loops (OCR J277 2.2.1 iteration: count-controlled and condition-controlled). Validate with codeswipe/tools/validate.py
CodeSwipe.add("loops", [
// ---------- For & range ----------
{t:"For & range", q:"Print the numbers 1 to 5.",
c:`for i in range({{0}}):
    print(i)`, a:["1, 6"], d:["1, 5","0, 5","5"], o:"1\n2\n3\n4\n5",
w:"range(a, b) stops BEFORE b, so to reach 5 the end value must be 6. OCR's for i = 1 to 5 includes the 5."},

{t:"For & range", q:"Count down from 5 to 1.",
c:`for i in range({{0}}, {{1}}, -1):
    print(i)`, a:["5","0"], d:["1","6","-1"], o:"5\n4\n3\n2\n1",
w:"Counting down, range still stops before the end value, so to finish on 1 the end must be 0."},

{t:"For & range", q:"Print the even numbers from 2 to 10.",
c:`for n in range(2, 11, {{0}}):
    print(n)`, a:["2"], d:["1","-2","10"], o:"2\n4\n6\n8\n10",
w:"The third value in range() is the step. A step of 2 jumps 2, 4, 6, 8, 10. In OCR this is for n = 2 to 10 step 2."},

{t:"For & range", p:1, q:"What does this print?",
c:`for i in range(1, 4):
    print(i, end=" ")`, a:["1 2 3"], d:["1 2 3 4","0 1 2 3","0 1 2"],
w:"range(1, 4) starts at 1 and stops before 4, giving 1, 2 and 3."},

{t:"For & range", p:1, q:"What does this print?",
c:`print(list(range(0, 10, 3)))`, a:["[0, 3, 6, 9]"], d:["[3, 6, 9]","[0, 3, 6]","[0, 3, 6, 9, 10]"],
w:"Start at 0 and add 3 each time: 0, 3, 6, 9. The next value, 12, is past the end so it stops."},

{t:"For & range", p:1, q:"What does this print?",
c:`for i in range(5, 1, -1):
    print(i, end=" ")`, a:["5 4 3 2"], d:["5 4 3 2 1","4 3 2 1","1 2 3 4 5"],
w:"Counting down by 1 from 5, the loop stops before reaching the end value 1."},

{t:"For & range", q:"Print every score in the list using its index.",
c:`scores = [12, 7, 19]
for i in range({{0}}):
    print(scores[i])`, a:["len(scores)"], d:["scores","len(scores)-1","len(scores)+1"], o:"12\n7\n19",
w:"range(len(scores)) gives 0, 1, 2, the valid indexes. len(scores)-1 would miss the last item."},

{t:"For & range", q:"Cheer exactly 3 times.",
c:`for i in range({{0}}):
    print("Hip hip hooray!")`, a:["3"], d:["2","4","1, 3"], o:"Hip hip hooray!\nHip hip hooray!\nHip hip hooray!",
w:"range(3) gives 0, 1, 2: three passes. range(1, 3) only gives two."},

{t:"For & range", q:"Print the first five multiples of 7.",
c:`for n in range(1, {{0}}):
    print(n * 7)`, a:["6"], d:["5","7"], o:"7\n14\n21\n28\n35",
w:"n must take the values 1 to 5, so the end of the range is 6."},

{t:"For & range", p:1, q:"What does this print?",
c:`for i in range(2, 8, 2):
    print(i, end=" ")`, a:["2 4 6"], d:["2 4 6 8","2 3 4 5 6 7","4 6 8"],
w:"Start at 2, step 2. The next value would be 8, but range stops before the end value."},

{t:"For & range", p:1, q:"What does this print?",
c:`count = 0
for i in range(5, 5):
    count = count + 1
print(count)`, a:["0"], d:["1","5","IndexError"],
w:"range(5, 5) is empty because it starts at the end value. The loop body runs zero times."},

{t:"For & range", p:1, q:"What does this print?",
c:`n = 0
for i in range(1, 10):
    n = n + 1
print(n)`, a:["9"], d:["10","1","8"],
w:"range(1, 10) gives 1 to 9, which is 9 values. A classic off-by-one trap."},

{t:"For & range", q:"Print each number with its square.",
c:`for x in range(1, 4):
    print(x, {{0}})`, a:["x * x"], d:["x * 2","x ** x","2 ** x"], o:"1 1\n2 4\n3 9",
w:"Squaring means multiplying a number by itself. x * 2 doubles it instead."},

{t:"For & range", p:1, q:"What does this print?",
c:`for i in range(9, 0, -2):
    print(i, end=" ")`, a:["9 7 5 3 1"], d:["9 7 5 3","8 6 4 2","9 7 5 3 1 -1"],
w:"Start at 9 and take 2 each time. 1 is still above the end value 0, so it is included."},

{t:"For & range", q:"Count up in 5s from 0 to 20.",
c:`for n in range(0, {{0}}, 5):
    print(n)`, a:["21"], d:["20","19","5"], o:"0\n5\n10\n15\n20",
w:"The end value must be past 20 for 20 to be included. range(0, 20, 5) stops at 15."},

{t:"For & range", q:"Translate OCR's for i = 1 to 10 into Python.",
c:`t = 0
for i in range({{0}}):
    t = t + i
print(t)`, a:["1, 11"], d:["1, 10","10","0, 10"], o:"55",
w:"OCR's for i = 1 to 10 includes 10. Python's range excludes the end, so you need range(1, 11)."},

{t:"For & range", q:"Loop straight through the list of temperatures.",
c:`temps = [18, 21, 16]
for t in {{0}}:
    print(t)`, a:["temps"], d:["range(temps)","len(temps)","temps[t]"], o:"18\n21\n16",
w:"A for loop can visit each item of a list directly. range() needs a number, not a list."},

{t:"For & range", p:1, q:"What does this print?",
c:`s = ""
for i in range(4):
    s = s + str(i)
print(s)`, a:["0123"], d:["1234","123","01234"],
w:"range(4) starts at 0 and gives 0, 1, 2, 3. Each one is joined on to the string."},

{t:"For & range", q:"Print 10, 8, 6, 4, 2.",
c:`for n in range(10, {{0}}, {{1}}):
    print(n)`, a:["0","-2"], d:["2","-1","10"], o:"10\n8\n6\n4\n2",
w:"Count down with a step of -2. The end value 0 is not printed; 2 would stop the loop before printing 2."},

{t:"For & range", p:1, q:"What does this print?",
c:`for i in range(3):
    pass
print(i)`, a:["2"], d:["3","0","NameError"],
w:"range(3) gives 0, 1, 2. After the loop, i keeps its last value, which is 2, not 3."},

// ---------- While loops ----------
{t:"While loops", q:"Print 1 to 5 with a while loop.",
c:`n = 1
while n {{0}} 5:
    print(n)
    n = n + 1`, a:["<="], d:["<","==",">="], o:"1\n2\n3\n4\n5",
w:"The loop must still run when n is 5, so use <=. With < it stops after 4."},

{t:"While loops", q:"Count down from 10 in steps of 3.",
c:`n = 10
while n > 0:
    print(n)
    n = {{0}}`, a:["n - 3"], d:["n + 3","n","n - 1"], o:"10\n7\n4\n1",
w:"The loop variable must move towards the stop condition. n + 3 or plain n never reaches 0, so the loop runs forever."},

{t:"While loops", q:"Double x until it reaches at least 50.",
c:`x = 1
while x < 50:
    x = x {{0}} 2
print(x)`, a:["*"], d:["+","**","-"], o:"64",
w:"x goes 2, 4, 8, 16, 32, 64. 32 is still under 50 so it doubles once more, then 64 fails the test."},

{t:"While loops", p:1, q:"What does this print?",
c:`count = 0
n = 10
while n < 5:
    count = count + 1
    n = n + 1
print(count)`, a:["0"], d:["5","1","10"],
w:"A while loop checks its condition first. 10 < 5 is False straight away, so the body runs zero times."},

{t:"While loops", p:1, q:"What does this print?",
c:`num = 20
steps = 0
while num > 1:
    num = num // 2
    steps = steps + 1
print(steps)`, a:["4"], d:["5","3","10"],
w:"20 becomes 10, 5, 2, then 1. That is 4 halvings. // is integer division, OCR's DIV."},

{t:"While loops", q:"Count the years until the savings reach 190.",
c:`bal = 100
years = 0
while bal {{0}} 190:
    bal = bal + 30
    years = years + 1
print(years)`, a:["<"], d:["<=","==",">"], o:"3",
w:"130, 160, 190: once bal reaches 190 it should stop. With <= it would add one more year."},

{t:"While loops", q:"Fix the infinite loop.",
c:`i = 0
while i < 3:
    print("Hi")
    {{0}}`, a:["i = i + 1"], d:["i + 1","i == i + 1","i = 1"], o:"Hi\nHi\nHi",
w:"i + 1 works out a value but never stores it. You must assign it back to i or the condition never becomes False."},

{t:"While loops", p:1, q:"What does this print?",
c:`n = 5
while n > 0:
    n = n - 2
print(n)`, a:["-1"], d:["0","1","-2"],
w:"n goes 3, 1, then -1. The test is only checked at the top, so n can go past 0."},

{t:"While loops", q:"Add up the digits of the number.",
c:`n = 472
total = 0
while n > 0:
    total = total + n % 10
    n = n {{0}} 10
print(total)`, a:["//"], d:["/","%","*"], o:"13",
w:"n % 10 gives the last digit and n // 10 removes it. In OCR these are MOD and DIV."},

{t:"While loops", q:"Count down from 3, then print Go!",
c:`t = 3
while t {{0}} 0:
    print(t)
    t = t - 1
print("Go!")`, a:[">"], d:[">=","<","=="], o:"3\n2\n1\nGo!",
w:"The loop runs while t is above 0. With >= it would also print 0."},

{t:"While loops", p:1, q:"What does this print?",
c:`a = 0
b = 10
while a < b:
    a = a + 3
    b = b - 1
print(a, b)`, a:["9 7"], d:["6 8","12 6","9 8"],
w:"After each pass: (3, 9), (6, 8), (9, 7). Now 9 < 7 is False, so the loop ends."},

{t:"While loops", q:"Rewrite for i in range(2, 11, 3) as a while loop.",
c:`i = 2
while i {{0}} 11:
    print(i)
    i = i + {{1}}`, a:["<","3"], d:["<=","2","11"], o:"2\n5\n8",
w:"range(2, 11, 3) stops before 11, so the test is i < 11, and the step of 3 is added each time."},

{t:"While loops", q:"Keep playing while the player has lives left.",
c:`lives = 3
while lives {{0}} 0:
    print("Lost a life")
    lives = lives - 1
print("Game over")`, a:[">"], d:[">=","<","=="], o:"Lost a life\nLost a life\nLost a life\nGame over",
w:"With 3 lives the body should run 3 times. >= 0 would run a fourth time when lives is 0."},

{t:"While loops", p:1, q:"What does this print?",
c:`word = ""
while len(word) < 5:
    word = word + "ab"
print(word)`, a:["ababab"], d:["ababa","abab","ab"],
w:"Lengths go 2, 4, 6. At length 4 the test is still True, so \"ab\" is added once more."},

{t:"While loops", q:"Find the year the population first reaches 200.",
c:`pop = 50
year = 2024
while pop < 200:
    pop = pop * 2
    year = {{0}}
print(year)`, a:["year + 1"], d:["pop + 1","year","2025"], o:"2026",
w:"Each pass is one more year: 50 to 100 (2025), then 100 to 200 (2026). Then 200 < 200 is False."},

{t:"While loops", q:"Print every item in the list using a while loop.",
c:`items = ["pen", "pad", "ink"]
i = 0
while i < {{0}}:
    print(items[i])
    i = i + 1`, a:["len(items)"], d:["len(items)+1","items","len(items)-1"], o:"pen\npad\nink",
w:"Valid indexes are 0 to len(items) - 1, so loop while i < len(items)."},

{t:"While loops", q:"Print the sensor readings below 20.",
c:`temp = 14
while temp {{0}} 20:
    print(temp)
    temp = temp + 2`, a:["<"], d:["<=",">","=="], o:"14\n16\n18",
w:"Readings below 20 means a strict <. With <= the reading of 20 would be printed as well."},

{t:"While loops", q:"Repeat until the tank is full (100 litres).",
c:`tank = 0
fills = 0
while tank {{0}} 100:
    tank = tank + 25
    fills = fills + 1
print(fills)`, a:["<"], d:["<=",">=",">"], o:"4",
w:"25, 50, 75, 100: four fills. With <= 100 a fifth fill would overflow the tank."},

// ---------- Totals & counters ----------
{t:"Totals & counters", q:"Add up all the scores.",
c:`scores = [4, 9, 2, 7]
total = 0
for s in scores:
    total = {{0}}
print(total)`, a:["total + s"], d:["s","total + 1","total"], o:"22",
w:"A running total adds each item to what you have so far. total + 1 would count the items instead."},

{t:"Totals & counters", q:"Count the days hotter than 30 degrees.",
c:`temps = [28, 31, 30, 35]
hot = 0
for t in temps:
    if t {{0}} 30:
        hot = hot + 1
print(hot)`, a:[">"], d:[">=","<","=="], o:"2",
w:"Hotter than 30 means strictly greater, so 30 itself doesn't count. >= would give 3."},

{t:"Totals & counters", q:"Work out the mean mark after the loop.",
c:`marks = [6, 8, 10]
total = 0
for m in marks:
    total = total + m
print(total / {{0}})`, a:["len(marks)"], d:["total","len(total)","m"], o:"8.0",
w:"The mean is the total divided by how many there are, len(marks). Do it after the loop, once the total is complete."},

{t:"Totals & counters", p:1, q:"What does this print?",
c:`total = 0
for i in range(1, 5):
    total = total + i
print(total)`, a:["10"], d:["15","6","4"],
w:"1 + 2 + 3 + 4 = 10. range(1, 5) doesn't include 5."},

{t:"Totals & counters", p:1, q:"What does this print?",
c:`for n in [4, 5, 6]:
    total = 0
    total = total + n
print(total)`, a:["6"], d:["15","0","4"],
w:"total is reset to 0 inside the loop every time, so only the last item survives. Set it to 0 before the loop."},

{t:"Totals & counters", q:"Find the highest mark.",
c:`marks = [55, 72, 61, 48]
top = marks[0]
for m in marks:
    if m {{0}} top:
        top = m
print(top)`, a:[">"], d:["<","==","="], o:"72",
w:"Replace top whenever a bigger mark turns up. Using < would find the lowest instead."},

{t:"Totals & counters", q:"Count the even numbers.",
c:`count = 0
for x in [3, 8, 2, 9, 4]:
    if x % 2 {{0}} 0:
        count = count + 1
print(count)`, a:["=="], d:["!=","=",">"], o:"3",
w:"An even number leaves no remainder: x % 2 == 0 (x MOD 2 = 0 in OCR). 8, 2 and 4 are even."},

{t:"Totals & counters", q:"Work out 5 factorial (1 x 2 x 3 x 4 x 5).",
c:`f = {{0}}
for i in range(1, 6):
    f = f * i
print(f)`, a:["1"], d:["0","5"], o:"120",
w:"A running product must start at 1. Starting at 0 makes every product 0."},

{t:"Totals & counters", q:"Count the positive and negative readings.",
c:`nums = [3, -1, 4, -5, 2]
pos = 0
neg = 0
for n in nums:
    if n > 0:
        pos = pos + 1
    else:
        {{0}}
print(pos, neg)`, a:["neg = neg + 1"], d:["pos = pos - 1","neg = n","neg + 1"], o:"3 2",
w:"Each counter adds 1 when its case happens. neg + 1 works out a value but doesn't store it."},

{t:"Totals & counters", p:1, q:"What does this print?",
c:`nums = [4, 7, 10]
t = 0
for n in nums:
    t = t + n
print(t / len(nums))`, a:["7.0"], d:["7","21","3"],
w:"21 / 3 = 7.0. The / operator always gives a float in Python."},

{t:"Totals & counters", q:"Add up only the even numbers.",
c:`total = 0
for n in [5, 6, 7, 8]:
    if n % 2 == {{0}}:
        total = total + n
print(total)`, a:["0"], d:["1","2"], o:"14",
w:"An even number leaves remainder 0 when divided by 2 (n MOD 2 = 0 in OCR). 6 + 8 = 14."},

{t:"Totals & counters", p:1, q:"What does this print?",
c:`c = 0
for i in range(0, 20, 5):
    c = c + 1
print(c)`, a:["4"], d:["5","20","3"],
w:"The loop gives 0, 5, 10, 15: four values. 20 is the end value so it isn't included."},

{t:"Totals & counters", q:"Total the cost of the basket.",
c:`prices = [2, 5, 3]
qty = [4, 1, 2]
total = 0
for i in range(len(prices)):
    total = total + prices[i] * {{0}}
print(total)`, a:["qty[i]"], d:["qty","i","prices[i]"], o:"19",
w:"Use the same index i to pair each price with its quantity: 8 + 5 + 6 = 19."},

{t:"Totals & counters", q:"Count the words longer than 4 letters.",
c:`ws = ["ox", "zebra", "emu", "tiger"]
n = 0
for w in ws:
    if {{0}} > 4:
        n = n + 1
print(n)`, a:["len(w)"], d:["w","len(ws)","n"], o:"2",
w:"len(w) is the length of the current word. Only zebra and tiger have more than 4 letters."},

{t:"Totals & counters", q:"Count the products that need reordering (stock below 5).",
c:`stock = [12, 3, 0, 8, 4]
low = 0
for s in stock:
    if s < 5:
        low = {{0}}
print(low)`, a:["low + 1"], d:["low + s","s","1"], o:"3",
w:"A counter goes up by 1 for each match. low + s would add up the stock levels instead."},

{t:"Totals & counters", p:1, q:"What does this print?",
c:`total = 100
for i in range(4):
    total = total - 15
print(total)`, a:["40"], d:["55","25","85"],
w:"The loop runs 4 times, taking 15 each time: 100 - 60 = 40."},

{t:"Totals & counters", q:"Work out the mean, rounded to 1 decimal place.",
c:`times = [12, 15, 11]
total = 0
for t in times:
    total = total + t
avg = {{0}}(total / len(times), 1)
print(avg)`, a:["round"], d:["int","len","float"], o:"12.7",
w:"38 / 3 is 12.666..., and round(x, 1) gives 12.7. int() would chop off the decimals."},

{t:"Totals & counters", q:"Count the letter s in Mississippi.",
c:`n = 0
for ch in "Mississippi":
    if ch == {{0}}:
        n = n + 1
print(n)`, a:['"s"'], d:['"S"',"s",'"ss"'], o:"4",
w:"ch is one character at a time, so compare it with the string \"s\". Without quotes, s is a variable name."},

{t:"Totals & counters", q:"Count how many marks are passes (40 or more) and print the total.",
c:`marks = [35, 40, 62, 18]
passes = {{0}}
for m in marks:
    if m >= 40:
        passes = passes + 1
print(passes)`, a:["0"], d:["1","marks[0]","40"], o:"2",
w:"A counter must start at 0 before the loop. 40 and 62 are passes."},

{t:"Totals & counters", p:1, q:"What does this print?",
c:`total = 0
for n in [3, 4]:
    total = total + n
    print(total, end=" ")`, a:["3 7"], d:["7","3 4","7 7"],
w:"The print is inside the loop, so it shows the running total after each item: 3, then 7."},

// ---------- Loop with input ----------
{t:"Loop with input", q:"Add up numbers until the user types -1.", i:["5","8","3","-1"],
c:`total = 0
n = int(input())
while n {{0}} -1:
    total = total + n
    n = int(input())
print(total)`, a:["!="], d:["==","<","<="], o:"16",
w:"-1 is a sentinel value: it marks the end of the data and is not added. Keep looping while n is not -1."},

{t:"Loop with input", q:"Keep asking until the age is between 0 and 120.", i:["-5","150","16"],
c:`age = int(input())
while age < 0 {{0}} age > 120:
    age = int(input())
print(age)`, a:["or"], d:["and","not"], o:"16",
w:"An age is invalid if it is too low OR too high. No age can be below 0 and above 120 at once, so and never loops."},

{t:"Loop with input", q:"Allow 3 attempts at the password.", i:["tiger","Tiger","TIGER7","Tiger7"],
c:`tries = 0
ok = False
while tries {{0}} 3 and not ok:
    pw = input()
    tries = tries + 1
    if pw == "Tiger7":
        ok = True
print(ok, tries)`, a:["<"], d:["<=","==",">"], o:"False 3",
w:"tries < 3 allows attempts 1, 2 and 3. With <= the user gets a 4th go and gets in."},

{t:"Loop with input", q:"Count the numbers typed before the 0.", i:["4","9","2","0"],
c:`c = 0
n = int(input())
while n != 0:
    c = {{0}}
    n = int(input())
print(c)`, a:["c + 1"], d:["c + n","n","1"], o:"3",
w:"The rogue value 0 stops the loop without being counted. c + n would add the numbers instead of counting them."},

{t:"Loop with input", q:"Keep asking until the answer is y or n.", i:["maybe","Y","n"],
c:`ans = input()
while ans != "y" {{0}} ans != "n":
    ans = input()
print(ans)`, a:["and"], d:["or","not"], o:"n",
w:"The answer is bad if it is not y AND not n. With or, every answer is bad, because nothing equals both."},

{t:"Loop with input", q:"Cast each input so the numbers are added, not joined.", i:["5","8"],
c:`total = 0
for i in range(2):
    n = {{0}}(input())
    total = total + n
print(total)`, a:["int"], d:["str","len"], o:"13",
w:"input() always returns a string. Cast it with int() before doing maths. In OCR this is int(input())."},

{t:"Loop with input", q:"Ask for the PIN again after each wrong guess.", i:["1111","9999","1234"],
c:`pin = input()
while pin != "1234":
    print("Wrong")
    {{0}}
print("Unlocked")`, a:["pin = input()"], d:["input()","pin == input()","print(pin)"], o:"Wrong\nWrong\nUnlocked",
w:"The new input must be stored in pin, otherwise the condition never changes. A bare input() throws the answer away."},

{t:"Loop with input", q:"Find the mean of the numbers before \"done\".", i:["4","10","done"],
c:`total = 0
count = 0
x = input()
while x != "done":
    total = total + {{0}}
    count = count + 1
    x = input()
print(total / count)`, a:["int(x)"], d:["x","count","int(count)"], o:"7.0",
w:"Check for the text sentinel first, then cast. x is still a string, so adding it to a number would be a TypeError."},

{t:"Loop with input", p:1, q:"What is printed when the user types 3, 9, 7?", i:["3","9","7"],
c:`secret = 7
guess = 0
count = 0
while guess != secret:
    guess = int(input())
    count = count + 1
print(count)`, a:["3"], d:["2","7","1"],
w:"Each guess is counted, including the correct one, so 3 guesses are counted."},

{t:"Loop with input", p:1, q:"What is printed when the user types Al, Jo, Sam?", i:["Al","Jo","Sam"],
c:`name = input()
while len(name) < 3:
    name = input()
print(name)`, a:["Sam"], d:["Al","Jo","AlJoSam"],
w:"Al and Jo are too short, so the loop asks again. Sam has 3 letters, so the loop ends."},

{t:"Loop with input", q:"Read exactly 3 numbers and add them up.", i:["4","5","6"],
c:`total = 0
for i in range({{0}}):
    total = total + int(input())
print(total)`, a:["3"], d:["2","4","1, 3"], o:"15",
w:"When you know how many inputs there are, use a count-controlled for loop: range(3) runs 3 times."},

{t:"Loop with input", p:1, q:"What is printed when the user types 1, 2, 3?", i:["1","2","3"],
c:`s = ""
for i in range(3):
    s = s + input()
print(s)`, a:["123"], d:["6","1 2 3","3"],
w:"input() returns strings, and + joins strings. Nothing is cast to a number, so they are concatenated."},

{t:"Loop with input", q:"Stop reading lines when the user enters a blank line.", i:["red","blue",""],
c:`n = 0
line = input()
while line {{0}} "":
    n = n + 1
    line = input()
print(n)`, a:["!="], d:["==","="], o:"2",
w:"An empty string \"\" is the sentinel. Keep going while the line is not empty."},

{t:"Loop with input", q:"Count temperatures above 25 until -999 is typed.", i:["22","27","31","-999"],
c:`hot = 0
t = int(input())
while t != -999:
    if t > 25:
        hot = hot + 1
    t = {{0}}
print(hot)`, a:["int(input())"], d:["input()","t - 1","int(t)"], o:"2",
w:"Read the next value at the bottom of the loop, cast to int. Without int, \"-999\" != -999 is always True."},

{t:"Loop with input", q:"Find the largest number entered before 0.", i:["8","15","3","0"],
c:`big = 0
n = int(input())
while n != 0:
    if n > big:
        big = {{0}}
    n = int(input())
print(big)`, a:["n"], d:["big + n","big","0"], o:"15",
w:"When a bigger number arrives, remember it by storing n in big."},

{t:"Loop with input", p:1, q:"What is printed when the user types 7, abc, 9?", i:["7","abc","9"],
c:`total = 0
for i in range(3):
    total = total + int(input())
print(total)`, a:["ValueError"], d:["16","7abc9","TypeError"],
w:"int(\"abc\") can't turn letters into a number, so Python raises a ValueError before anything is printed."},

{t:"Loop with input", q:"Stop asking as soon as the code is right (max 3 goes).", i:["red","gold","blue"],
c:`code = "gold"
goes = 0
for go in range(3):
    goes = goes + 1
    if input() == code:
        {{0}}
print(goes)`, a:["break"], d:["continue","pass"], o:"2",
w:"break leaves the loop straight away, so the third go is never used. continue only skips to the next pass."},

{t:"Loop with input", q:"Keep asking until the user types a whole number.", i:["ten","4.5","12"],
c:`v = input()
while not v.{{0}}():
    v = input()
print(int(v) * 2)`, a:["isdigit"], d:["isalpha","isupper","lower"], o:"24",
w:"isdigit() is True only when every character is 0 to 9. \"4.5\" fails because of the dot."},

{t:"Loop with input", p:1, q:"What is printed when the user types 6, 2, 0?", i:["6","2","0"],
c:`total = 0
n = int(input())
while n != 0:
    n = int(input())
    total = total + n
print(total)`, a:["2"], d:["8","6","0"],
w:"The first input, 6, is read but never added, because the loop reads a new value before adding. Only 2 + 0 is added."},

{t:"Loop with input", q:"Show the menu until the user chooses Q.", i:["A","B","Q"],
c:`opt = ""
while opt {{0}} "Q":
    opt = input()
    print("You chose", opt)`, a:["!="], d:["==",">"], o:"You chose A\nYou chose B\nYou chose Q",
w:"Start opt as \"\" so the condition is True the first time. The loop ends after Q is entered."},

// ---------- Nested loops ----------
{t:"Nested loops", q:"Print a triangle of stars.",
c:`for r in range(3):
    line = ""
    for c in range({{0}}):
        line = line + "*"
    print(line)`, a:["r + 1"], d:["r","3","c + 1"], o:"*\n**\n***",
w:"r is 0, 1, 2, so the inner loop must run r + 1 times to give 1, 2 and 3 stars."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`count = 0
for i in range(4):
    for j in range(3):
        count = count + 1
print(count)`, a:["12"], d:["7","4","3"],
w:"The inner loop runs 3 times for each of the 4 outer passes: 4 x 3 = 12."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`s = ""
for a in "AB":
    for b in "12":
        s = s + a + b + " "
print(s)`, a:["A1 A2 B1 B2"], d:["A1 B2","A1 B1 A2 B2","AB 12"],
w:"The inner loop finishes all its values before the outer loop moves on: A1, A2, then B1, B2."},

{t:"Nested loops", q:"Print a 3 x 3 times table grid.",
c:`for i in range(1, 4):
    row = ""
    for j in range(1, 4):
        row = row + str({{0}}) + " "
    print(row)`, a:["i * j"], d:["i + j","j","i"], o:"1 2 3\n2 4 6\n3 6 9",
w:"Each cell is the row number times the column number. str() is needed to join it to the text."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`count = 0
for i in range(4):
    for j in range(i):
        count = count + 1
print(count)`, a:["6"], d:["16","12","10"],
w:"The inner loop runs 0, 1, 2 then 3 times as i grows: 0 + 1 + 2 + 3 = 6."},

{t:"Nested loops", q:"Print the total of each row.",
c:`grid = [[1, 2], [3, 4], [5, 6]]
for row in grid:
    total = 0
    for n in {{0}}:
        total = total + n
    print(total)`, a:["row"], d:["grid","range(row)","total"], o:"3\n7\n11",
w:"The inner loop goes through the numbers in the current row. total is reset before each row."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`grid = [[1, 2], [3, 4], [5, 6]]
total = 0
for row in grid:
    for n in row:
        total = total + n
    print(total, end=" ")`, a:["3 10 21"], d:["3 7 11","21","10 21"],
w:"total is set to 0 only once, before both loops, so it keeps growing instead of giving each row's total."},

{t:"Nested loops", q:"Print every value in the 2D list.",
c:`g = [[1, 2, 3], [4, 5, 6]]
for r in range({{0}}):
    for c in range({{1}}):
        print(g[r][c], end=" ")`, a:["len(g)","len(g[0])"], d:["len(g)-1","g"], o:"1 2 3 4 5 6",
w:"len(g) is the number of rows (2) and len(g[0]) is the number of columns (3). g[r][c] is row r, column c."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`for x in range(1, 3):
    for y in range(1, 3):
        print(x * y, end=" ")`, a:["1 2 2 4"], d:["1 2 3 4","1 4","2 4"],
w:"The pairs are (1,1), (1,2), (2,1), (2,2), so the products are 1, 2, 2, 4."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`c = 0
for i in range(3):
    for j in range(5):
        if j == 2:
            break
        c = c + 1
print(c)`, a:["6"], d:["2","15","9"],
w:"break only leaves the inner loop. Each outer pass counts j = 0 and 1, then breaks: 3 x 2 = 6."},

{t:"Nested loops", q:"Draw a 2 by 4 block of hashes.",
c:`for r in range(2):
    for c in range(4):
        print("#", end="")
    {{0}}`, a:["print()"], d:["print(r)","break","pass"], o:"####\n####",
w:"end=\"\" keeps the hashes on one line. An empty print() after the inner loop moves on to a new line."},

{t:"Nested loops", q:"Print the letters of each word.",
c:`for w in ["hi", "yo"]:
    for ch in {{0}}:
        print(ch, end="")`, a:["w"], d:["ch","range(w)","len(w)"], o:"hiyo",
w:"The inner loop goes through the letters of the current word w, chosen by the outer loop."},

{t:"Nested loops", q:"Print the seat labels A1, A2, B1, B2.",
c:`for row in "AB":
    for seat in range(1, 3):
        print(row + {{0}})`, a:["str(seat)"], d:["seat","row","int(seat)"], o:"A1\nA2\nB1\nB2",
w:"seat is an integer, so it must be cast with str() before it can be joined to the row letter."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`total = 0
for i in range(1, 3):
    for j in range(1, 4):
        total = total + j
print(total)`, a:["12"], d:["6","18","9"],
w:"Each outer pass adds 1 + 2 + 3 = 6. The outer loop runs twice, so the total is 12."},

{t:"Nested loops", q:"Print every half hour for 2 hours.",
c:`for h in range(2):
    for m in range(0, 60, {{0}}):
        print(h, m)`, a:["30"], d:["60","15","2"], o:"0 0\n0 30\n1 0\n1 30",
w:"A step of 30 gives minutes 0 and 30. The inner loop runs fully for each hour."},

{t:"Nested loops", q:"Print the countdown triangle.",
c:`for i in range(1, 4):
    line = ""
    for j in range(i, 0, {{0}}):
        line = line + str(j)
    print(line)`, a:["-1"], d:["1","-2","0"], o:"1\n21\n321",
w:"The inner loop counts down from i to 1, so it needs a step of -1."},

{t:"Nested loops", q:"Count the pairs of numbers that add up to 10.",
c:`nums = [3, 7, 5, 5, 2]
pairs = 0
for i in range(len(nums)):
    for j in range({{0}}, len(nums)):
        if nums[i] + nums[j] == 10:
            pairs = pairs + 1
print(pairs)`, a:["i + 1"], d:["i","0","1"], o:"2",
w:"Starting j at i + 1 checks each pair once and never pairs a number with itself."},

{t:"Nested loops", q:"Find the highest value in the 2D list.",
c:`g = [[4, 9], [12, 3], [7, 8]]
top = 0
for row in g:
    for v in row:
        if v > top:
            top = {{0}}
print(top)`, a:["v"], d:["row","top + v","g"], o:"12",
w:"Inside both loops, v is one single value. If it beats top, store it."},

{t:"Nested loops", p:1, q:"What does this print?",
c:`n = 0
for a in range(2):
    for b in range(3):
        for c in range(2):
            n = n + 1
print(n)`, a:["12"], d:["7","6","8"],
w:"Multiply the number of passes of each loop: 2 x 3 x 2 = 12."},

{t:"Nested loops", q:"Print a times table for 2 and 3, up to x 3.",
c:`for t in range(2, 4):
    for n in range(1, {{0}}):
        print(t, "x", n, "=", {{1}})`, a:["4","t * n"], d:["3","t + n","n"], o:"2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9",
w:"n must run 1 to 3, so the end is 4. The answer is the table number t times n."},

// ---------- Break & flags ----------
{t:"Break & flags", q:"Set up the flag before searching for Di.",
c:`names = ["Ali", "Bo", "Cy"]
found = {{0}}
for n in names:
    if n == "Di":
        found = True
print(found)`, a:["False"], d:["True","0","None"], o:"False",
w:"A found flag starts as False and only becomes True if a match turns up. Di isn't in the list."},

{t:"Break & flags", q:"Stop checking at the first frost.",
c:`temps = [3, 1, -2, 4]
for t in temps:
    if t < 0:
        print("Frost!")
        {{0}}
    print(t)`, a:["break"], d:["continue","pass","print(t)"], o:"3\n1\nFrost!",
w:"break ends the whole loop, so 4 is never checked. continue would skip only -2 and carry on."},

{t:"Break & flags", p:1, q:"What does this print?",
c:`for i in range(10):
    if i * i > 20:
        break
print(i)`, a:["5"], d:["4","9","25"],
w:"4 x 4 = 16 is not over 20, but 5 x 5 = 25 is, so the loop breaks with i still 5."},

{t:"Break & flags", q:"Record the position of the first 8.",
c:`nums = [5, 8, 2, 8]
pos = -1
for i in range(len(nums)):
    if nums[i] == 8:
        pos = {{0}}
        break
print(pos)`, a:["i"], d:["nums[i]","i + 1","len(nums)"], o:"1",
w:"i is the index (position); nums[i] is the value stored there, which is 8. Indexes start at 0."},

{t:"Break & flags", q:"Stop searching once the code is found.",
c:`codes = ["A1", "X9", "B2", "C3"]
found = False
i = 0
while i < len(codes) and {{0}}:
    if codes[i] == "X9":
        found = True
    i = i + 1
print(i)`, a:["not found"], d:["found","True","found == True"], o:"2",
w:"The loop carries on only while the item hasn't been found. Once found is True, not found is False and it stops."},

{t:"Break & flags", p:1, q:"What does this print?",
c:`total = 0
for n in [4, 6, 9, 2]:
    if n > 8:
        break
    total = total + n
print(total)`, a:["10"], d:["21","12","19"],
w:"4 and 6 are added. 9 triggers the break before it is added, and 2 is never reached."},

{t:"Break & flags", q:"Check whether 21 is prime.",
c:`n = 21
prime = True
for d in range(2, n):
    if n % d == 0:
        prime = {{0}}
        break
print(prime)`, a:["False"], d:["True","0","d"], o:"False",
w:"21 divides by 3, so it isn't prime. Set the flag to False and stop: there's no need to check further."},

{t:"Break & flags", p:1, q:"What does this print?",
c:`n = 13
prime = True
for d in range(2, n):
    if n % d == 0:
        prime = False
print(prime)`, a:["True"], d:["False","13","None"],
w:"Nothing from 2 to 12 divides 13 exactly, so the flag is never changed and stays True."},

{t:"Break & flags", p:1, q:"What does this print?",
c:`xs = [3, 1, 3, 2]
pos = -1
for i in range(len(xs)):
    if xs[i] == 3:
        pos = i
print(pos)`, a:["2"], d:["0","-1","1"],
w:"Without a break the loop keeps going, so pos is overwritten by the LAST 3, at index 2."},

{t:"Break & flags", q:"Check that every student passed (40 or more).",
c:`marks = [55, 38, 70]
all_pass = True
for m in marks:
    if m < 40:
        all_pass = {{0}}
print(all_pass)`, a:["False"], d:["True","m","None"], o:"False",
w:"Start by assuming everyone passed. One fail is enough to set the flag to False."},

{t:"Break & flags", q:"Print the words up to (not including) stop.",
c:`words = ["go", "on", "stop", "now"]
for w in words:
    if w == "stop":
        {{0}}
    print(w)`, a:["break"], d:["continue","pass","print(w)"], o:"go\non",
w:"break leaves the loop at stop, so now is never printed. The if comes before the print, so stop isn't printed either."},

{t:"Break & flags", q:"Stop both loops when 7 is found.",
c:`grid = [[1, 2], [7, 3], [9, 7]]
found = False
for row in grid:
    for v in row:
        if v == 7:
            found = True
    if {{0}}:
        break
print(row)`, a:["found"], d:["not found","v == 9"], o:"[7, 3]",
w:"break only leaves one loop. The flag lets the outer loop know it should stop too."},

{t:"Break & flags", p:1, q:"What does this print?",
c:`n = 0
while n < 10:
    n = n + 3
    if n % 2 == 0:
        break
print(n)`, a:["6"], d:["9","12","3"],
w:"n becomes 3 (odd, carry on), then 6, which is even, so the loop breaks."},

{t:"Break & flags", q:"Print the position of the first car over 70 mph.",
c:`speeds = [64, 70, 74, 81]
for i in range(len(speeds)):
    if speeds[i] {{0}} 70:
        print("Car", i)
        {{1}}`, a:[">","break"], d:["<","continue",">="], o:"Car 2",
w:"Over 70 means > 70. break stops after the first match, so car 3 isn't printed."},

{t:"Break & flags", q:"Say whether the username is taken.",
c:`users = ["amy", "raj", "zoe"]
taken = False
for u in users:
    if u == "raj":
        taken = True
if {{0}}:
    print("Taken")
else:
    print("Free")`, a:["taken"], d:["not taken","False","taken == False"], o:"Taken",
w:"Check the flag after the loop. A Boolean can be used on its own: if taken: means if taken == True."},

{t:"Break & flags", q:"Count the letters before the first n.",
c:`count = 0
for ch in "banana":
    if ch == "n":
        {{0}}
    count = count + 1
print(count)`, a:["break"], d:["continue","pass"], o:"2",
w:"break stops at the first n, after b and a. continue would skip each n but keep counting the rest."},

{t:"Break & flags", q:"Stop adding when the bag goes over 10 kg.",
c:`items = [3, 4, 3, 5, 1]
bag = 0
for w in items:
    bag = bag + w
    if bag {{0}} 10:
        break
print(bag)`, a:[">"], d:["<",">=","=="], o:"15",
w:"3, 7, 10 (not over 10 yet), then 15 is over, so it breaks. With >= it would stop at 10."},

{t:"Break & flags", p:1, q:"What does this print?",
c:`found = False
for n in [2, 4, 6]:
    if n % 2 == 1:
        found = True
        break
print(found)`, a:["False"], d:["True","6","None"],
w:"No number in the list is odd, so the if never runs and the flag stays False."},

{t:"Break & flags", q:"Use a flag to say whether any reading is above 100.",
c:`data = [87, 93, 104, 99]
alarm = False
for d in data:
    if d > 100:
        {{0}}
print(alarm)`, a:["alarm = True"], d:["alarm == True","alarm = d","break"], o:"True",
w:"Use = to set the flag. alarm == True only compares, so it would leave alarm as False."},

{t:"Break & flags", q:"Stop the loop when the stock runs out.",
c:`stock = 5
orders = [2, 2, 3, 1]
for o in orders:
    if o > stock:
        print("Out of stock")
        break
    stock = {{0}}
print(stock)`, a:["stock - o"], d:["stock + o","o","stock - 1"], o:"Out of stock\n1",
w:"Each order reduces stock: 5, 3, 1. The third order needs 3 but only 1 is left, so it breaks."},

// ---------- Trace the loop ----------
{t:"Trace the loop", p:1, q:"What does this print?",
c:`a = 1
b = 1
for i in range(4):
    t = a + b
    a = b
    b = t
print(b)`, a:["8"], d:["5","13","6"],
w:"Trace (a, b): (1, 2), (2, 3), (3, 5), (5, 8). These are Fibonacci numbers."},

{t:"Trace the loop", q:"Fill the gap so x ends up as 256.",
c:`x = 2
for i in range({{0}}):
    x = x * x
print(x)`, a:["3"], d:["4","8","2"], o:"256",
w:"Squaring each pass: 2, 4, 16, 256. That takes 3 passes."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`s = 0
for i in range(1, 6, 2):
    s = s + i
print(s)`, a:["9"], d:["15","6","4"],
w:"i takes 1, 3 and 5. 1 + 3 + 5 = 9."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`n = 5
f = 1
while n > 1:
    f = f * n
    n = n - 1
print(f)`, a:["120"], d:["24","720","5"],
w:"f becomes 5, 20, 60, 120. When n reaches 1 the loop stops."},

{t:"Trace the loop", q:"Build the word backwards.",
c:`word = ""
for ch in "loop":
    word = {{0}}
print(word)`, a:["ch + word"], d:["word + ch","ch","word"], o:"pool",
w:"Putting each letter on the FRONT gives l, ol, ool, pool. word + ch would rebuild loop."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`x = 10
y = 0
while x > y:
    x = x - 2
    y = y + 1
print(x, y)`, a:["2 4"], d:["4 3","0 5","2 3"],
w:"(8, 1), (6, 2), (4, 3), (2, 4). Now 2 > 4 is False, so the loop stops."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`n = 6
steps = 0
while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    steps = steps + 1
print(steps)`, a:["8"], d:["6","7","16"],
w:"6, 3, 10, 5, 16, 8, 4, 2, 1. Count the arrows: 8 steps."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`t = 0
for i in range(4):
    if i % 2 == 0:
        t = t + i
    else:
        t = t - i
print(t)`, a:["-2"], d:["2","6","-6"],
w:"0 + 0 - 1 + 2 - 3 = -2. Even values of i are added, odd ones taken away."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`n = 1234
r = 0
while n > 0:
    r = r * 10 + n % 10
    n = n // 10
print(r)`, a:["4321"], d:["1234","10","4"],
w:"Each pass takes the last digit (n MOD 10) and adds it to the end of r, which reverses the number."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`count = 0
for i in range(10, 0, -3):
    count = count + 1
print(count)`, a:["4"], d:["3","10","9"],
w:"i takes 10, 7, 4 and 1. The next value, -2, is past the end, so there are 4 passes."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`a = 3
for i in range(3):
    a = a + i
print(a)`, a:["6"], d:["9","5","3"],
w:"i is 0, 1 then 2, so a goes 3, 4, 6. It is i that is added, not 1 or 3."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`total = 0
i = 0
while total < 10:
    i = i + 1
    total = total + i
print(i)`, a:["4"], d:["10","3","5"],
w:"total goes 1, 3, 6, 10. When i is 4 the total reaches 10 and the loop ends. The question asks for i."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`s = "x"
for i in range(3):
    s = s + s
print(len(s))`, a:["8"], d:["6","4","3"],
w:"The string doubles in length each pass: 1, 2, 4, 8."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`n = 6
b = ""
while n > 0:
    b = str(n % 2) + b
    n = n // 2
print(b)`, a:["110"], d:["011","3","0110"],
w:"Remainders are 0, 1, 1, each put on the front, giving 110: 6 in binary."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`nums = [2, 5, 1]
for i in range(len(nums)):
    nums[i] = nums[i] * i
print(nums)`, a:["[0, 5, 2]"], d:["[2, 5, 1]","[4, 10, 2]","[2, 10, 3]"],
w:"Each item is multiplied by its index: 2 x 0, 5 x 1, 1 x 2."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`a = 0
b = 20
while a < b:
    a = a + 4
    b = b - 4
print(a)`, a:["12"], d:["8","10","16"],
w:"(4, 16), (8, 12), (12, 8). 12 < 8 is False, so a is 12."},

{t:"Trace the loop", p:1, q:"What does this print?",
c:`t = 0
for c in "2024":
    t = t + int(c)
print(t)`, a:["8"], d:["2024","26","4"],
w:"Each character is cast to an int and added: 2 + 0 + 2 + 4 = 8."},

{t:"Trace the loop", q:"Fill the gap so it prints 1 3 6 10.",
c:`t = 0
for i in range(1, 5):
    t = t + {{0}}
    print(t, end=" ")`, a:["i"], d:["1","t","2"], o:"1 3 6 10",
w:"Trace it: adding i gives 0 + 1, + 2, + 3, + 4. These are the triangle numbers."},

{t:"Trace the loop", q:"Fill the gap so it prints 3, 9, 27, 81.",
c:`x = 1
for i in range(4):
    x = x * {{0}}
    print(x)`, a:["3"], d:["9","x","i"], o:"3\n9\n27\n81",
w:"Each value is 3 times the one before, so multiply by 3 each pass."},

{t:"Trace the loop", q:"Fill the gaps so it prints 20 15 10 5.",
c:`n = {{0}}
while n > 0:
    print(n, end=" ")
    n = n - {{1}}`, a:["20","5"], d:["25","0","15"], o:"20 15 10 5",
w:"The first value printed is the starting value, 20, and each value is 5 less than the one before."},

// ---------- Do-until style ----------
{t:"Do-until style", q:"Repeat until the user types q.", i:["a","b","q"],
c:`count = 0
while {{0}}:
    cmd = input()
    count = count + 1
    if cmd == "q":
        break
print(count)`, a:["True"], d:["False","true","1 == 0"], o:"3",
w:"while True: loops forever until a break, which is how Python writes OCR's do ... until. True needs a capital T."},

{t:"Do-until style", q:"Keep guessing until the number is right.", i:["2","6","4"],
c:`secret = 4
tries = 0
while True:
    guess = int(input())
    tries = tries + 1
    if guess == secret:
        {{0}}
print(tries)`, a:["break"], d:["continue","pass","guess = 0"], o:"3",
w:"break is the until part: it ends the loop once the guess is right. Without it the loop never ends."},

{t:"Do-until style", p:1, q:"What does this print?",
c:`n = 10
count = 0
while True:
    count = count + 1
    n = n + 1
    if n > 5:
        break
print(count)`, a:["1"], d:["0","6","10"],
w:"The test comes at the end, so the body always runs at least once, even though n is already over 5."},

{t:"Do-until style", p:1, q:"What does this print?",
c:`n = 10
count = 0
while n <= 5:
    count = count + 1
    n = n + 1
print(count)`, a:["0"], d:["1","6","10"],
w:"A while loop tests first. 10 <= 5 is False, so the body never runs. A do ... until loop would run once."},

{t:"Do-until style", q:"Keep asking until the mark is from 0 to 100.", i:["-4","120","75"],
c:`while True:
    mark = int(input())
    if mark >= 0 {{0}} mark <= 100:
        break
print(mark)`, a:["and"], d:["or","not"], o:"75",
w:"The mark is valid only if both parts are true. With or, -4 passes because it is <= 100."},

{t:"Do-until style", q:"Translate OCR's until x > 50 into Python.",
c:`x = 1
while True:
    x = x * 3
    if x {{0}} 50:
        break
print(x)`, a:[">"], d:["<","==","<="], o:"81",
w:"The do ... until condition becomes the if before the break, unchanged: until x > 50 means if x > 50: break."},

{t:"Do-until style", q:"Add 7 until the total is a multiple of 5.",
c:`total = 0
while True:
    total = total + 7
    if total % 5 {{0}} 0:
        break
print(total)`, a:["=="], d:["!=",">","<"], o:"35",
w:"total goes 7, 14, 21, 28, 35. A remainder of 0 means it divides exactly by 5."},

{t:"Do-until style", q:"Print 2, 4, 6 with a do-until style loop.",
c:`n = 0
while True:
    n = n + 2
    print(n)
    if n {{0}} 6:
        break`, a:[">="], d:["<","!=",">"], o:"2\n4\n6",
w:"Stop once n has reached 6. With > it would print 8 before stopping."},

{t:"Do-until style", q:"Draw cards until the total is 17 or more.",
c:`cards = [5, 9, 4, 8]
total = 0
i = 0
while True:
    total = total + cards[i]
    i = i + 1
    if total {{0}} 17:
        break
print(total)`, a:[">="], d:["<","==","<="], o:"18",
w:"5, 14, then 18 reaches 17 or more. With == the total jumps past 17 and runs out of cards."},

{t:"Do-until style", q:"Allow at most 3 password attempts.", i:["cat","dog","fox","owl"],
c:`tries = 0
while True:
    pw = input()
    tries = tries + 1
    if pw == "owl" or tries {{0}} 3:
        break
print(tries)`, a:["=="], d:["<","!=",">"], o:"3",
w:"Stop when the password is right OR the 3rd go is used. owl is the 4th input, so it is never read."},

{t:"Do-until style", q:"Find the first whole number whose square is over 30.",
c:`n = 0
while True:
    n = n + 1
    if n * n {{0}} 30:
        break
print(n)`, a:[">"], d:["<","==","<="], o:"6",
w:"5 x 5 = 25 is not over 30, but 6 x 6 = 36 is. With == the loop would never stop."},

{t:"Do-until style", q:"Ask Play again? until the answer isn't y.", i:["y","y","n"],
c:`games = 0
while True:
    games = games + 1
    again = input()
    if again {{0}} "y":
        break
print(games)`, a:["!="], d:["==","=",">"], o:"3",
w:"Each game is played before the question, so at least one game always happens. Stop on anything but y."},

{t:"Do-until style", p:1, q:"What is printed when the user types 0?", i:["0"],
c:`count = 0
while True:
    x = int(input())
    count = count + 1
    if x == 0:
        break
print(count)`, a:["1"], d:["0","2","EOFError"],
w:"The body runs before the check, so the 0 is read and counted once before the loop ends."},

{t:"Do-until style", q:"Roll a dice until a 6 comes up.",
c:`import random
while True:
    d = random.randint(1, 6)
    if d == {{0}}:
        break
print(d)`, a:["6"], d:["7","0",'"6"'], o:"6",
w:"randint(1, 6) never gives 7 or 0, and an int never equals the string \"6\", so those loops never end."},

{t:"Do-until style", p:1, q:"What does this print?",
c:`n = 0
digits = 0
while True:
    digits = digits + 1
    n = n // 10
    if n == 0:
        break
print(digits)`, a:["1"], d:["0","10","2"],
w:"The number 0 still has one digit. Because the body runs once before the test, the count is right."},

{t:"Do-until style", q:"Show the menu until the user picks 3.", i:["1","2","3"],
c:`while True:
    opt = input()
    if opt == "1":
        print("Play")
    elif opt == "2":
        print("Scores")
    elif opt == {{0}}:
        break
print("Bye")`, a:['"3"'], d:["3",'"4"','"Q"'], o:"Play\nScores\nBye",
w:"input() returns a string, so compare with \"3\". The number 3 never equals the string \"3\"."},

{t:"Do-until style", q:"Keep halving until the value is below 1.",
c:`v = 16
halves = 0
while True:
    v = v / 2
    halves = halves + 1
    if v {{0}} 1:
        break
print(halves)`, a:["<"], d:[">","<=","=="], o:"5",
w:"8, 4, 2, 1, 0.5: it takes 5 halvings to go below 1. With <= it would stop at 1, after 4."},

{t:"Do-until style", p:1, q:"What is printed when the user types 5, 3, 0?", i:["5","3","0"],
c:`total = 0
while True:
    n = int(input())
    total = total + n
    if n == 0:
        break
print(total)`, a:["8"], d:["5","3","0"],
w:"5 and 3 are added, then 0 is added (making no difference) before the until test stops the loop."},

{t:"Do-until style", q:"Repeat the countdown at least once.",
c:`t = 0
while True:
    print("Tick", t)
    t = t - 1
    if t {{0}} 0:
        break`, a:["<="], d:[">","==",">="], o:"Tick 0",
w:"t starts at 0 but the body still runs once, as in OCR's do ... until t <= 0."},

{t:"Do-until style", q:"Choose the right loop to ask at least once.", i:["hello"],
c:`{{0}}
    word = input()
    if len(word) > 3:
        break
print(word)`, a:["while True:"], d:["while False:","for i in range(0):","if True:"], o:"hello",
w:"while True: always enters the loop, so the input is asked for at least once. while False: never runs."},
]);
