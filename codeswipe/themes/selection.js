// Theme: Selection & Boolean logic (OCR J277 2.2.1 selection, 2.4 Boolean logic). Validate with codeswipe/tools/validate.py
CodeSwipe.add("selection", [
// ---------- If & else ----------
{t:"If & else", q:"Print \"Hot day\" when the temperature is over 30.",
c:`temp = 31
if temp {{0}} 30:
    print("Hot day")
else:
    print("Mild day")`, a:[">"], d:["<","==","<="], o:"Hot day",
w:"31 > 30 is True, so the if branch runs. The else branch only runs when the condition is False."},

{t:"If & else", q:"Finish the if statement so it runs.",
c:`age = 16
if age >= 18{{0}}
    print("Adult")
else:
    print("Minor")`, a:[":"], d:[";"," then",","], o:"Minor",
w:"Every if and else line in Python ends with a colon. OCR's reference language uses if ... then instead, but Python has no then."},

{t:"If & else", q:"Check whether the answer is right.",
c:`answer = "Paris"
if answer {{0}} "Paris":
    print("Correct")
else:
    print("Wrong")`, a:["=="], d:["=","!=","==="], o:"Correct",
w:"== compares two values. A single = is assignment, so if answer = \"Paris\" is a SyntaxError."},

{t:"If & else", q:"Decide whether n is even or odd.",
c:`n = 7
if n % 2 {{0}} 0:
    print("Even")
else:
    print("Odd")`, a:["=="], d:["!=",">","="], o:"Odd",
w:"7 % 2 is 1, not 0, so the else branch runs. % is MOD in OCR's reference language."},

{t:"If & else", p:1, q:"What does this print?",
c:`x = 5
if x > 10:
    x = x * 2
x = x + 1
print(x)`, a:["6"], d:["11","12","5"],
w:"Only the indented line belongs to the if. x > 10 is False, so the doubling is skipped, but x = x + 1 always runs."},

{t:"If & else", p:1, q:"What does this print?",
c:`x = 3
if x > 10:
    print("Big")
print("End")`, a:["End"], d:["Big","BigEnd","No output"],
w:"The condition is False, so \"Big\" is skipped. print(\"End\") is not indented, so it runs whatever happens."},

{t:"If & else", p:1, q:"What does this print?",
c:`x = 5
if x = 5:
    print("Five")`, a:["SyntaxError"], d:["Five","True","NameError"],
w:"A single = means assignment and is not allowed in a condition. Use == to compare."},

{t:"If & else", p:1, q:"What does this print?",
c:`x = 5
if x > 3:
print("Big")`, a:["IndentationError"], d:["Big","SyntaxError","No output"],
w:"The code inside an if must be indented. Python refuses to run it and reports an IndentationError."},

{t:"If & else", q:"Make the number positive.",
c:`n = -8
if n {{0}} 0:
    n = -n
print(n)`, a:["<"], d:[">","==",">="], o:"8",
w:"Only negative numbers need flipping, so test n < 0. Then -n turns -8 into 8."},

{t:"If & else", q:"Add the missing line before the second branch.",
c:`stock = 0
if stock > 0:
    print("In stock")
{{0}}
    print("Sold out")`, a:["else:"], d:["else","elif:","otherwise:"], o:"Sold out",
w:"else takes no condition but still needs a colon. elif always needs a condition after it."},

{t:"If & else", q:"Keep the bigger of the two numbers.",
c:`a = 14
b = 9
big = b
if a {{0}} b:
    big = a
print(big)`, a:[">"], d:["<","==","="], o:"14",
w:"big starts as b and is only replaced when a is bigger. 14 > 9 is True, so big becomes 14."},

{t:"If & else", q:"Work out the speeding fine: £10 per mph over the limit.",
c:`speed = 42
limit = 30
if speed > limit:
    fine = {{0}}
else:
    fine = 0
print(fine)`, a:["(speed - limit) * 10"], d:["speed - limit * 10","speed * 10","limit * 10"], o:"120",
w:"The brackets make the subtraction happen first: (42 - 30) * 10 = 120. Without them, * is done before -."},

{t:"If & else", p:1, q:"What does this print?",
c:`pw = "Secret"
if pw == "secret":
    print("Welcome")
else:
    print("Denied")`, a:["Denied"], d:["Welcome","Error"],
w:"String comparisons are case-sensitive. \"S\" and \"s\" are different characters, so the strings are not equal."},

{t:"If & else", p:1, q:"What does this print?",
c:`age = "18"
if age == 18:
    print("Match")
else:
    print("No match")`, a:["No match"], d:["Match","TypeError","SyntaxError"],
w:"\"18\" is a string and 18 is an integer. They are never equal, so == gives False and no error is raised."},

{t:"If & else", q:"Take £10 off orders of £50 or more.",
c:`total = 64
if total {{0}} 50:
    total = total - 10
print("Pay", total)`, a:[">="], d:["<","<=","=="], o:"Pay 54",
w:"\"£50 or more\" means >= 50. 64 >= 50 is True, so the discount is taken off."},

{t:"If & else", q:"End the game when there are no lives left.",
c:`lives = 0
if lives {{0}} 0:
    print("Game over")
else:
    print("Play on")`, a:["=="], d:["=",">","!="], o:"Game over",
w:"lives == 0 is True. Writing lives = 0 in a condition is a SyntaxError, because = stores a value."},

{t:"If & else", q:"Take 5 off when x is 10 or more.",
c:`x = 10
if x {{0}} 10:
    x = x - 5
else:
    x = x + 5
print(x)`, a:[">="], d:[">","<","!="], o:"5",
w:"10 >= 10 is True, so only the if branch runs. With > the boundary value 10 would go to else and give 15."},

{t:"If & else", p:1, q:"What does this print?",
c:`n = 12
if n > 5:
    n = n - 5
if n > 5:
    n = n - 5
print(n)`, a:["2"], d:["7","12","-3"],
w:"These are two separate if statements, so both are checked: 12 becomes 7, and 7 > 5 so it becomes 2."},

{t:"If & else", q:"Give guests limited access.",
c:`user = "guest"
if user {{0}} "admin":
    print("Limited access")
else:
    print("Full access")`, a:["!="], d:["==","=","<>"], o:"Limited access",
w:"!= means \"not equal to\". In OCR's reference language it is also written !=. Python does not accept <>."},

{t:"If & else", q:"Award a merit for 70% or more.",
c:`mark = 29
total = 40
pc = mark / total * 100
if pc {{0}} 70:
    print("Merit")
else:
    print("No merit")`, a:[">="], d:["<","<=","=="], o:"Merit",
w:"29 / 40 * 100 is 72.5, and 72.5 >= 70 is True."},

// ---------- Elif chains ----------
{t:"Elif chains", q:"Complete the grade checker.",
c:`mark = 72
if mark >= 70:
    print("A")
{{0}} mark >= 50:
    print("B")
else:
    print("C")`, a:["elif"], d:["else if","if","else"], o:"A",
w:"elif is only checked when the conditions above it were False. With a second if, 72 would print both A and B."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`mark = 85
if mark >= 40:
    print("Pass")
elif mark >= 70:
    print("Distinction")`, a:["Pass"], d:["Distinction","PassDistinction","Error"],
w:"85 >= 40 is True, so the first branch runs and the rest are skipped. Check the highest boundary first."},

{t:"Elif chains", q:"Charge pensioners (65 and over) £6.",
c:`age = 67
if age < 5:
    price = 0
elif age < 16:
    price = 4
elif age {{0}} 65:
    price = 6
else:
    price = 9
print(price)`, a:[">="], d:["<","<=","=="], o:"6",
w:"67 is not under 5 or under 16, and 67 >= 65 is True, so the price is 6."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`n = 10
if n % 3 == 0:
    print("Fizz")
elif n % 5 == 0:
    print("Buzz")
else:
    print(n)`, a:["Buzz"], d:["10","Fizz","FizzBuzz"],
w:"10 MOD 3 is 1, so the first test fails. 10 MOD 5 is 0, so \"Buzz\" is printed."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`n = 15
if n % 3 == 0:
    print("Fizz")
elif n % 5 == 0:
    print("Buzz")
elif n % 15 == 0:
    print("FizzBuzz")`, a:["Fizz"], d:["FizzBuzz","Buzz","Fizz Buzz"],
w:"15 divides by 3, so the first branch runs and the chain stops. The FizzBuzz test must come first to ever be reached."},

{t:"Elif chains", q:"Grade each mark: 70+ is A, 50+ is B, else U.",
c:`for m in [82, 55, 31]:
    if m >= 70:
        print("A")
    elif m >= {{0}}:
        print("B")
    else:
        print("U")`, a:["50"], d:["70","30","60"], o:"A\nB\nU",
w:"55 fails the first test but passes m >= 50. 31 fails both, so it falls through to else."},

{t:"Elif chains", q:"Print \"Stopped\" when speed is 0.",
c:`speed = 0
if speed > 0:
    print("Moving forward")
elif speed < 0:
    print("Reversing")
{{0}}
    print("Stopped")`, a:["else:"], d:["elif:","else","elif speed:"], o:"Stopped",
w:"If a value is not above 0 and not below 0 it must be 0, so else: catches it with no condition."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`age = 12
if age < 5:
    price = 0
elif age < 12:
    price = 5
elif age < 18:
    price = 8
else:
    price = 10
print(price)`, a:["8"], d:["5","10","0"],
w:"12 < 12 is False, so a 12-year-old misses the child price. 12 < 18 is True, giving 8."},

{t:"Elif chains", q:"Charge £5 for parcels up to 5 kg.",
c:`kg = 3.5
if kg <= 1:
    cost = 3
elif kg <= {{0}}:
    cost = 5
else:
    cost = 9
print(cost)`, a:["5"], d:["1","3","2"], o:"5",
w:"3.5 is more than 1, so the first test fails. 3.5 <= 5 is True, so cost is 5."},

{t:"Elif chains", q:"Saturday is a half day.",
c:`day = "Sat"
if day == "Sun":
    print("Closed")
elif day == {{0}}:
    print("Half day")
else:
    print("Open")`, a:["\"Sat\""], d:["Sat","\"sat\"","\"Sun\""], o:"Half day",
w:"Text values need quotes and the same case. Without quotes, Sat is treated as a variable name and gives a NameError."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`mark = 30
if mark >= 50:
    print("Pass")
else mark < 50:
    print("Fail")`, a:["SyntaxError"], d:["Fail","Pass","NameError"],
w:"else never has a condition. To test another condition, use elif mark < 50: instead."},

{t:"Elif chains", q:"Count hot days (over 30) and warm days (21 to 30).",
c:`temps = [12, 25, 31, 18]
hot = 0
warm = 0
for t in temps:
    if t > 30:
        hot += 1
    {{0}} t > 20:
        warm += 1
print(hot, warm)`, a:["elif"], d:["if","else","else if"], o:"1 1",
w:"With elif, 31 only counts as hot. A second if would count 31 as warm too, giving 1 2."},

{t:"Elif chains", q:"Describe the number.",
c:`x = -3
if x > 0:
    s = "positive"
elif x {{0}} 0:
    s = "negative"
else:
    s = "zero"
print(s)`, a:["<"], d:["==",">",">="], o:"negative",
w:"-3 is not above 0 but -3 < 0 is True. Anything that is neither above nor below 0 reaches the else."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`s = 8
if s >= 9:
    stars = 5
elif s >= 7:
    stars = 4
elif s >= 5:
    stars = 3
else:
    stars = 1
print("*" * stars)`, a:["****"], d:["*****","***","8"],
w:"8 >= 9 is False but 8 >= 7 is True, so stars is 4. \"*\" * 4 repeats the star 4 times."},

{t:"Elif chains", q:"Complete the traffic light program.",
c:`light = "red"
if light == "red":
    print("Stop")
{{0}} light == "amber":
    print("Get ready")
{{1}}
    print("Go")`, a:["elif","else:"], d:["if","else","elif:"], o:"Stop",
w:"elif and else: belong to the same chain, so only one branch runs. With a second if, red would print Stop and then Go."},

{t:"Elif chains", p:1, q:"What does this print?",
c:`qty = 25
if qty >= 100:
    each = 2
elif qty >= 20:
    each = 3
else:
    each = 4
print(qty * each)`, a:["75"], d:["100","50","25"],
w:"25 is not 100 or more, but it is 20 or more, so each item costs 3 and 25 * 3 = 75."},

{t:"Elif chains", q:"Label each score as high, mid or low.",
c:`for s in [9, 4, 6]:
    if s > 7:
        print(s, "high")
    elif s > {{0}}:
        print(s, "mid")
    else:
        print(s, "low")`, a:["5"], d:["7","6","9"], o:"9 high\n4 low\n6 mid",
w:"6 > 5 is True so 6 is mid. 4 fails both tests and lands in else."},

{t:"Elif chains", q:"Put the boundaries in the right order.",
c:`for m in [75, 64, 45]:
    if m >= {{0}}:
        print("A")
    elif m >= {{1}}:
        print("B")
    else:
        print("U")`, a:["70","50"], d:["40","90"], o:"A\nB\nU",
w:"Check the highest boundary first. If 50 came first, 75 would get a B, because the chain stops at the first True test."},
{t:"Elif chains", p:1, q:"What does this print?",
c:`wind = 39
if wind >= 64:
    print("Hurricane")
elif wind >= 39:
    print("Gale")
elif wind >= 19:
    print("Breezy")
else:
    print("Calm")`, a:["Gale"], d:["Breezy","Hurricane","Calm"],
w:"39 >= 39 is True, so the second branch runs. >= includes the boundary value itself."},

{t:"Elif chains", q:"A BMI of 25 or more is over the healthy range.",
c:`bmi = 27
if bmi < 18.5:
    print("Under")
elif bmi < {{0}}:
    print("Healthy")
else:
    print("Over")`, a:["25"], d:["30","28","35"], o:"Over",
w:"27 < 25 is False, so 27 falls through to else. Any of the bigger boundaries would wrongly call 27 healthy."},

// ---------- Nested if ----------
{t:"Nested if", q:"Only welcome the user if the password matches too.",
c:`user = "ana"
pw = "cat5"
if user == "ana":
    if pw {{0}} "cat5":
        print("Welcome")
    else:
        print("Wrong password")
else:
    print("Unknown user")`, a:["=="], d:["!=","=","==="], o:"Welcome",
w:"The inner if is only reached when the username is right. pw == \"cat5\" is True, so it prints Welcome."},

{t:"Nested if", p:1, q:"What does this print?",
c:`user = "bob"
pw = "x1"
if user == "ana":
    if pw == "x1":
        print("Welcome")
    else:
        print("Bad password")
else:
    print("Unknown user")`, a:["Unknown user"], d:["Bad password","Welcome","Welcome Unknown user"],
w:"The outer test is False, so the inner if is never checked, even though the password is right."},

{t:"Nested if", q:"Members aged 12 or over pay £3.",
c:`age = 15
member = True
if age >= 12:
    if {{0}}:
        price = 3
    else:
        price = 5
else:
    price = 1
print(price)`, a:["member"], d:["not member","member == False","age < 12"], o:"3",
w:"member already holds True or False, so if member: is enough. There's no need to write == True."},

{t:"Nested if", p:1, q:"What does this print?",
c:`x = 8
if x > 5:
    if x > 10:
        print("Huge")
else:
    print("Small")
print("Done")`, a:["Done"], d:["Small","Huge","Error"],
w:"The else lines up with the outer if, so it belongs to x > 5. That is True, the inner test is False, and nothing prints until Done."},

{t:"Nested if", q:"Only hand out cash if there is enough in the account.",
c:`pin = 1234
bal = 50
take = 80
if pin == 1234:
    if take {{0}} bal:
        print("Take cash")
    else:
        print("Not enough money")
else:
    print("Wrong PIN")`, a:["<="], d:[">",">=","!="], o:"Not enough money",
w:"The cash machine allows a withdrawal of up to the balance, so take <= bal. 80 <= 50 is False."},

{t:"Nested if", q:"Only describe positive numbers as odd or even.",
c:`n = -4
if n {{0}} 0:
    if n % 2 == 0:
        print("positive even")
    else:
        print("positive odd")
else:
    print("not positive")`, a:[">"], d:["<","!=","<="], o:"not positive",
w:"-4 is even, but -4 > 0 is False, so the inner if is skipped completely."},

{t:"Nested if", p:1, q:"What does this print?",
c:`y = 1900
if y % 4 == 0:
    if y % 100 == 0:
        if y % 400 == 0:
            print("Leap")
        else:
            print("Not leap")
    else:
        print("Leap")
else:
    print("Not leap")`, a:["Not leap"], d:["Leap","Error"],
w:"1900 divides by 4 and by 100 but not by 400, so it is not a leap year. Century years need the extra check."},

{t:"Nested if", q:"Lose a life when hit, unless the shield is up.",
c:`lives = 3
hit = True
shield = False
if hit:
    if {{0}}:
        lives = lives - 1
print(lives)`, a:["not shield"], d:["shield","shield == True","hit == False"], o:"2",
w:"not shield is True when the shield is down. The player was hit with no shield, so lives drops to 2."},

{t:"Nested if", p:1, q:"What does this print?",
c:`total = 20
member = True
if total >= 30:
    fee = 0
else:
    if member:
        fee = 2
    else:
        fee = 5
print(total + fee)`, a:["22"], d:["20","25","30"],
w:"20 is under 30, so delivery isn't free. The customer is a member, so the fee is 2 and the total is 22."},

{t:"Nested if", q:"Turn the heating on below 18 degrees when someone is home.",
c:`temp = 16
home = True
if home:
    if temp < {{0}}:
        print("Heating on")
    else:
        print("Heating off")
else:
    print("Away mode")`, a:["18"], d:["16","15","10"], o:"Heating on",
w:"16 < 18 is True. Using 16 would fail, because 16 < 16 is False."},

{t:"Nested if", p:1, q:"What does this print?",
c:`score = 75
bonus = True
if score >= 50:
    if bonus:
        score = score + 10
    print("Pass", score)
else:
    print("Fail")`, a:["Pass 85"], d:["Pass 75","Fail","85"],
w:"The bonus is added inside the inner if. The print is in the outer if, after the inner one, so it shows the new score."},

{t:"Nested if", q:"Test the right thing first.",
c:`logged_in = False
admin = True
if {{0}}:
    if admin:
        print("Admin panel")
    else:
        print("Home page")
else:
    print("Please log in")`, a:["logged_in"], d:["admin","not logged_in","True"], o:"Please log in",
w:"Being an admin only matters once you have logged in, so the outer if checks logged_in."},

{t:"Nested if", q:"Label the numbers above 5.",
c:`for n in [3, 8, 12]:
    if n > {{0}}:
        if n % 2 == 0:
            print(n, "big even")
    else:
        print(n, "small")`, a:["5"], d:["8","10","12"], o:"3 small\n8 big even\n12 big even",
w:"With n > 5, both 8 and 12 reach the inner test, and both are even. 3 goes to the else."},

{t:"Nested if", p:1, q:"What does this print?",
c:`x = 4
if x > 2:
    x = x * 3
    if x > 10:
        x = x - 10
print(x)`, a:["2"], d:["12","4","-6"],
w:"4 > 2, so x becomes 12. The inner test uses the new value: 12 > 10, so x becomes 2."},

{t:"Nested if", q:"Both papers need 40 or more to pass.",
c:`p1 = 45
p2 = 38
if p1 >= 40:
    if p2 {{0}} 40:
        print("Pass")
    else:
        print("Resit paper 2")
else:
    print("Resit paper 1")`, a:[">="], d:["<","<=","!="], o:"Resit paper 2",
w:"Paper 1 passes the outer test, but 38 >= 40 is False, so the inner else runs."},

{t:"Nested if", q:"Charge £4 for up to 3 hours, plus £1 per hour after that.",
c:`hours = 5
badge = False
if badge:
    cost = 0
else:
    if hours {{0}} 3:
        cost = 4
    else:
        cost = {{1}}
print(cost)`, a:["<=","hours + 1"], d:[">","hours"], o:"6",
w:"5 hours is over 3, so the else runs. £4 for 3 hours plus £1 for each of the 2 extra hours is 6, which is hours + 1."},

{t:"Nested if", p:1, q:"What does this print?",
c:`weather = "rain"
temp = 8
if weather == "rain":
    if temp < 5:
        print("Snow boots")
    else:
        print("Umbrella")
else:
    print("Sunglasses")`, a:["Umbrella"], d:["Snow boots","Sunglasses","Umbrella Sunglasses"],
w:"It is raining, so the inner if runs. 8 < 5 is False, so the inner else prints Umbrella."},

{t:"Nested if", q:"Rewrite \"if age >= 17: if licence:\" as one condition.",
c:`age = 17
licence = False
if age >= 17 {{0}} licence:
    print("Can drive")
else:
    print("Cannot drive")`, a:["and"], d:["or","not","&"], o:"Cannot drive",
w:"Two nested ifs both have to be True, which is exactly what and means. The licence is False, so the answer is Cannot drive."},

{t:"Nested if", q:"Only members get a discount.",
c:`member = False
spend = 120
if {{0}}:
    if spend > 100:
        off = 20
    else:
        off = 10
else:
    off = 0
print(spend - off)`, a:["member"], d:["not member","True","spend > 100"], o:"120",
w:"The discounts are all inside if member:. A non-member gets 0 off, however much they spend."},

{t:"Nested if", q:"Check the username, then the PIN.",
c:`name = "kai"
pin = 4321
if name == "kai":
    if pin {{0}} 1234:
        print("Locked out")
    else:
        print("Hello", name)`, a:["!="], d:["==","=","<"], o:"Locked out",
w:"4321 != 1234 is True, so the wrong PIN locks the user out."},

// ---------- AND, OR, NOT ----------
{t:"AND, OR, NOT", q:"Accept numbers from 1 to 10 only.",
c:`x = 15
if x >= 1 {{0}} x <= 10:
    print("Valid")
else:
    print("Invalid")`, a:["and"], d:["or","&&","and not"], o:"Invalid",
w:"Both tests must be True for a range check. With or, any number at all would count as valid."},

{t:"AND, OR, NOT", q:"Check the mark is between 0 and 100.",
c:`mark = 105
if 0 <= mark {{0}} 100:
    print("OK")
else:
    print("Out of range")`, a:["<="], d:[">=",">","!="], o:"Out of range",
w:"Python lets you chain comparisons: 0 <= mark <= 100 means 0 <= mark and mark <= 100."},

{t:"AND, OR, NOT", p:1, q:"What does this print?",
c:`colour = "green"
if colour == "red" or "blue":
    print("Match")
else:
    print("No match")`, a:["Match"], d:["No match","SyntaxError","TypeError"],
w:"This means (colour == \"red\") or \"blue\". A non-empty string counts as True, so it always matches. Write colour == \"blue\" in full."},

{t:"AND, OR, NOT", q:"Print \"Weekend\" on Saturday or Sunday.",
c:`day = "Sun"
if day == "Sat" {{0}} day == "Sun":
    print("Weekend")
else:
    print("Weekday")`, a:["or"], d:["and","+","and not"], o:"Weekend",
w:"A day can't be both Sat and Sun, so and would never be True. or needs just one test to be True."},

{t:"AND, OR, NOT", q:"Go outside when it is not raining.",
c:`raining = False
if {{0}} raining:
    print("Go outside")
else:
    print("Stay in")`, a:["not"], d:["!","==","is"], o:"Go outside",
w:"Python writes NOT as the word not. not False is True. The ! symbol on its own is not valid Python."},

{t:"AND, OR, NOT", p:1, q:"What does this print?",
c:`choice = 2
if choice != 1 or choice != 2:
    print("Invalid")
else:
    print("Valid")`, a:["Invalid"], d:["Valid","Error"],
w:"Every number is either not 1 or not 2, so this is always True. To reject anything except 1 and 2 you need and."},

{t:"AND, OR, NOT", q:"Reject choices that are not 1 or 2.",
c:`c = 2
if c != 1 {{0}} c != 2:
    print("Invalid")
else:
    print("Valid")`, a:["and"], d:["or","and not","not"], o:"Valid",
w:"\"Not 1 and not 2\" is the same as \"not (1 or 2)\". This swap of and/or when you add not is De Morgan's law."},

{t:"AND, OR, NOT", q:"Warn when x is outside 1 to 10.",
c:`x = 0
if x < 1 {{0}} x > 10:
    print("Out of range")`, a:["or"], d:["and","not","&"], o:"Out of range",
w:"A number can't be below 1 and above 10 at the same time, so an outside-the-range check uses or."},

{t:"AND, OR, NOT", q:"Accept usernames of 3+ characters with no spaces.",
c:`n = "jo smith"
if len(n) >= 3 {{0}} " " {{1}} n:
    print("OK")
else:
    print("Rejected")`, a:["and","not in"], d:["or","in"], o:"Rejected",
w:"Both rules must hold, so use and. \" \" not in n is False here because the name has a space."},

{t:"AND, OR, NOT", p:1, q:"What does this print?",
c:`x = 5
if 1 < x < 5:
    print("In")
else:
    print("Out")`, a:["Out"], d:["In","SyntaxError"],
w:"1 < x < 5 means 1 < x and x < 5. 5 < 5 is False, so the whole thing is False."},

{t:"AND, OR, NOT", q:"Let under-5s and over-80s in free.",
c:`age = 85
if age < 5 {{0}} age > 80:
    price = 0
else:
    price = 8
print(price)`, a:["or"], d:["and","and not"], o:"0",
w:"Only one of the two needs to be True. 85 > 80 is True, so or gives True and the price is 0."},

{t:"AND, OR, NOT", q:"Go to the beach only if it's warm and sunny.",
c:`temp = 22
sunny = False
if temp > 20 {{0}} sunny:
    print("Beach")
else:
    print("Cinema")`, a:["and"], d:["or","or not"], o:"Cinema",
w:"and needs both sides to be True. It's warm but not sunny, so the condition is False."},

{t:"AND, OR, NOT", q:"Welcome the user unless they are banned.",
c:`banned = ["bob", "eve"]
user = "ann"
if {{0}}:
    print("Welcome", user)`, a:["user not in banned"], d:["user in banned","not banned","banned not in user"], o:"Welcome ann",
w:"not in checks that an item is missing from a list. \"ann\" is not in the list, so she's welcome."},

{t:"AND, OR, NOT", q:"Finish the leap year rule.",
c:`y = 2000
a = y % 4 == 0 and y % 100 != 0
b = y % 400 == 0
if a {{0}} b:
    print("Leap year")
else:
    print("Not a leap year")`, a:["or"], d:["and","and not"], o:"Leap year",
w:"A leap year matches rule a or rule b. 2000 fails a (it is a century) but passes b, so it is a leap year."},

{t:"AND, OR, NOT", q:"Store whether t is in the range 16 to 25.",
c:`t = 30
ok = t >= 16 {{0}} t <= 25
print(ok)`, a:["and"], d:["or","and not"], o:"False",
w:"30 >= 16 is True but 30 <= 25 is False, so and gives False. The Boolean result is stored in ok."},

{t:"AND, OR, NOT", q:"A password is strong if it is 8+ long and has a digit.",
c:`pw = "sunshine"
digit = False
for ch in pw:
    if ch in "0123456789":
        digit = True
if len(pw) >= 8 {{0}} digit:
    print("Strong")
else:
    print("Weak")`, a:["and"], d:["or","or not"], o:"Weak",
w:"The password is long enough but has no digit. and needs both, so it is Weak; or would wrongly call it Strong."},

{t:"AND, OR, NOT", p:1, q:"What does this print?",
c:`a = 3
b = 8
print(not (a > 5 or b > 5))`, a:["False"], d:["True","None"],
w:"b > 5 is True, so the bracket is True, and not flips it to False. It equals (not a > 5) and (not b > 5)."},

{t:"AND, OR, NOT", q:"Sound the alarm if the door opens while armed, or on panic.",
c:`door = True
armed = False
panic = True
if (door and armed) {{0}} panic:
    print("ALARM")
else:
    print("Quiet")`, a:["or"], d:["and","and not"], o:"ALARM",
w:"The bracket is False because the system isn't armed, but the panic button is pressed, so False or True is True."},

{t:"AND, OR, NOT", q:"Check the square is on an 8 by 8 board (0 to 7).",
c:`x = 3
y = 9
if 0 <= x <= 7 {{0}} 0 <= y <= 7:
    print("On board")
else:
    print("Off board")`, a:["and"], d:["or","or not"], o:"Off board",
w:"Both coordinates must be in range. y is 9, so the second test is False and and gives False."},

{t:"AND, OR, NOT", q:"Let users in only if they are not banned.",
c:`logged_in = True
banned = True
if logged_in and {{0}}:
    print("Welcome")
else:
    print("Blocked")`, a:["not banned"], d:["banned","banned == True","logged_in"], o:"Blocked",
w:"not banned is False, so True and False is False. not is applied before and."},

// ---------- Truth tables ----------
{t:"Truth tables", p:1, q:"What does this print?",
c:`print(True and False)`, a:["False"], d:["True","None"],
w:"AND is only True when both inputs are True. In the truth table, the row 1 AND 0 gives 0."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(True or False)`, a:["True"], d:["False","None"],
w:"OR is True when at least one input is True. Only 0 OR 0 gives 0."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`A = True
print(not A)`, a:["False"], d:["True","-1","None"],
w:"NOT flips its input: NOT 1 is 0 and NOT 0 is 1."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`A = True
B = False
C = False
print((A and B) or not C)`, a:["True"], d:["False","None"],
w:"A AND B is False, but NOT C is True, and False OR True is True."},

{t:"Truth tables", q:"Print the truth table for AND.",
c:`for a in [False, True]:
    for b in [False, True]:
        print(a, b, a {{0}} b)`, a:["and"], d:["or","!=","=="], o:"False False False\nFalse True False\nTrue False False\nTrue True True",
w:"The AND column has a single True, on the row where both inputs are True."},

{t:"Truth tables", q:"Make an XOR: one input True but not both.",
c:`def xor(a, b):
    return (a or b) {{0}} not (a and b)

print(xor(True, False))
print(xor(True, True))`, a:["and"], d:["or","and not"], o:"True\nFalse",
w:"XOR is True when the inputs differ. \"a or b\" allows both, so you also need \"and not (a and b)\" to rule that row out."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(True or False and False)`, a:["True"], d:["False","None"],
w:"and is worked out before or, like * before +. So it is True or (False and False), which is True or False."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(not False and False)`, a:["False"], d:["True","None"],
w:"not is applied first, to False only: (not False) and False is True and False, which is False."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`A = True
B = True
print(not (A and B))`, a:["False"], d:["True","None"],
w:"This is a NAND gate. A AND B is True, and NOT turns it into False. NAND is only False when both inputs are 1."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(not (False or False))`, a:["True"], d:["False","None"],
w:"This is a NOR gate. False OR False is False, and NOT turns it into True."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`A = False
B = True
C = True
print((A and B) or not C)`, a:["False"], d:["True","None"],
w:"A AND B is False because A is False. NOT C is False too, so False OR False is False."},

{t:"Truth tables", q:"Make the expression print False.",
c:`A = True
B = False
C = True
print(A {{0}} (B {{1}} C))`, a:["and","and"], d:["or","not"], o:"False",
w:"B AND C is False because B is False, so A AND False is False. Using or anywhere here would give True."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`n = 0
for a in [True, False]:
    for b in [True, False]:
        if a or b:
            n = n + 1
print(n)`, a:["3"], d:["1","2","4"],
w:"The loops go through all 4 rows of the truth table. OR is True on every row except False, False, so n is 3."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`n = 0
for a in [True, False]:
    for b in [True, False]:
        for c in [True, False]:
            if (a and b) or not c:
                n += 1
print(n)`, a:["5"], d:["4","3","6"],
w:"There are 8 rows. NOT C is True on the 4 rows where C is False. A AND B adds one more row (A, B, C all True): 5."},

{t:"Truth tables", q:"Print the truth table for NOT.",
c:`for a in [False, True]:
    print(a, {{0}})`, a:["not a"], d:["!a","a == True","-a"], o:"False True\nTrue False",
w:"not a gives the opposite Boolean. -a would give numbers (0 and -1), and !a is not Python."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(False or not False)`, a:["True"], d:["False","None"],
w:"not False is True, and False OR True is True."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`x = True
y = False
print(x and not y)`, a:["True"], d:["False","None"],
w:"not y is True, so this is True AND True, which is True."},

{t:"Truth tables", q:"Make Q print False.",
c:`A = False
B = True
C = False
Q = (A or B) {{0}} C
print(Q)`, a:["and"], d:["or","or not"], o:"False",
w:"A OR B is True, but C is False, and True AND False is False."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(not True == False)`, a:["True"], d:["False","SyntaxError"],
w:"== is worked out before not, so this is not (True == False). True == False is False, and not False is True."},

{t:"Truth tables", p:1, q:"What does this print?",
c:`print(5 > 3 and 2 > 4)`, a:["False"], d:["True","None"],
w:"5 > 3 is True but 2 > 4 is False. True AND False is False."},

{t:"Truth tables", q:"Make a half adder: the carry is 1 only for 1 + 1.",
c:`a = True
b = False
s = a != b
c = a {{0}} b
print(s, c)`, a:["and"], d:["or","!="], o:"True False",
w:"A half adder's sum is XOR (a != b) and its carry is AND. 1 + 0 gives sum 1, carry 0."},

// ---------- Boolean variables ----------
{t:"Boolean variables", q:"Set the flag when the name is found.",
c:`names = ["Ali", "Bo", "Cy"]
found = False
for n in names:
    if n == "Bo":
        found = {{0}}
if found:
    print("Found")
else:
    print("Missing")`, a:["True"], d:["true","False","1 == 0"], o:"Found",
w:"Python's Boolean values start with a capital: True and False. Lower-case true is a NameError."},

{t:"Boolean variables", q:"Return True for even numbers.",
c:`def is_even(n):
    return n % 2 {{0}} 0

print(is_even(6))`, a:["=="], d:["!=","=",">"], o:"True",
w:"A comparison is already True or False, so the function can return it directly with no if needed."},

{t:"Boolean variables", q:"Return True for anyone aged 18 or over.",
c:`def is_adult(age):
    return age {{0}} 18

print(is_adult(18))`, a:[">="], d:[">","<","="], o:"True",
w:"age >= 18 is already True or False, so it can be returned directly. With > an 18-year-old would wrongly get False."},

{t:"Boolean variables", p:1, q:"What does this print?",
c:`found = "yes"
if found == True:
    print("A")
else:
    print("B")`, a:["B"], d:["A","TypeError"],
w:"The string \"yes\" is not equal to the Boolean True. Store True or False in flags, then just write if found:."},

{t:"Boolean variables", q:"Use the flag in the if statement.",
c:`found = False
if {{0}}:
    print("Found it")
else:
    print("Not found")`, a:["found"], d:["found = True","\"found\"","not found"], o:"Not found",
w:"if found: is the same as if found == True:. A string like \"found\" is never empty, so it would always count as True."},

{t:"Boolean variables", p:1, q:"What does this print?",
c:`ok = True
for m in [55, 32, 78]:
    if m < 40:
        ok = False
print(ok)`, a:["False"], d:["True","32"],
w:"32 < 40 sets ok to False, and nothing ever sets it back to True, so it stays False."},

{t:"Boolean variables", q:"Check whether every student passed.",
c:`passed_all = {{0}}
for m in [55, 62, 78]:
    if m < 40:
        passed_all = False
print(passed_all)`, a:["True"], d:["False","0","None"], o:"True",
w:"Start by assuming everyone passed, then change the flag to False if you find a fail. Nobody failed here."},

{t:"Boolean variables", p:1, q:"What does this print?",
c:`def valid(p):
    if len(p) != 4:
        return False
    return p.isdigit()

print(valid("12a4"))`, a:["False"], d:["True","12a4","None"],
w:"The length is 4, so the first return is skipped. \"12a4\" has a letter, so isdigit() returns False."},

{t:"Boolean variables", q:"Return True if the letter is a vowel.",
c:`def is_vowel(ch):
    return ch {{0}} "aeiou"

print(is_vowel("e"), is_vowel("z"))`, a:["in"], d:["==","not in","="], o:"True False",
w:"in checks whether one string appears inside another, and gives True or False."},

{t:"Boolean variables", p:1, q:"What does this print?",
c:`x = 5 > 2
print(type(x))`, a:["<class 'bool'>"], d:["<class 'int'>","True","bool"],
w:"A comparison gives a Boolean value, so x has the type bool. OCR calls this data type Boolean."},

{t:"Boolean variables", q:"Switch the light on and off each time.",
c:`light = False
for i in range(3):
    light = {{0}}
    print(light)`, a:["not light"], d:["True","False","light"], o:"True\nFalse\nTrue",
w:"light = not light toggles a flag: True becomes False and False becomes True."},

{t:"Boolean variables", p:1, q:"What does this print?",
c:`nums = [4, 9, 2]
big = False
for n in nums:
    big = n > 5
print(big)`, a:["False"], d:["True","9"],
w:"big is overwritten every time round the loop, so it only reflects the last number, 2. Set it to True inside an if instead."},

{t:"Boolean variables", q:"Keep looping until done is True.",
c:`done = False
count = 0
while {{0}}:
    count = count + 1
    if count == 3:
        done = True
print(count)`, a:["not done"], d:["done","done == True","True"], o:"3",
w:"while not done: keeps going while the flag is False. Once done becomes True the loop stops."},

{t:"Boolean variables", q:"The shop is open from 9 until 17 (closed at 17).",
c:`hour = 17
is_open = 9 <= hour {{0}} 17
print(is_open)`, a:["<"], d:["<=","==",">="], o:"False",
w:"The shop closes at 17, so 17 itself must be outside the range. 17 < 17 is False, and that is stored in is_open."},

{t:"Boolean variables", q:"Return True only for ages 0 to 120.",
c:`def valid_age(a):
    return {{0}}

print(valid_age(130))`, a:["0 <= a <= 120"], d:["a >= 0","a > 0","a != 0"], o:"False",
w:"A range check needs a lower and an upper limit. 130 passes a >= 0 but fails a <= 120."},

{t:"Boolean variables", q:"Is February 2023 in a leap year?",
c:`def is_leap(y):
    return y % 4 == 0

if {{0}}:
    print("29 days")
else:
    print("28 days")`, a:["is_leap(2023)"], d:["is_leap","is_leap(2024)","is_leap() == 2023"], o:"28 days",
w:"You must call the function with a year. The name is_leap on its own is the function itself, which always counts as True."},

{t:"Boolean variables", q:"Use the returned Boolean.",
c:`def check(n):
    return n > 10

result = check(4)
if {{0}}:
    print("Big")
else:
    print("Small")`, a:["result"], d:["not result","check","result == False"], o:"Small",
w:"check(4) returns False, so result is False. The name check on its own is the function, which always counts as True."},

{t:"Boolean variables", q:"Count the correct answers.",
c:`answers = [True, False, True, True]
score = 0
for a in answers:
    if {{0}}:
        score += 1
print(score)`, a:["a"], d:["not a","answers","a == False"], o:"3",
w:"Each item is already a Boolean, so if a: is enough. A non-empty list like answers always counts as True."},

{t:"Boolean variables", p:1, q:"What does this print?",
c:`done = "False"
if done:
    print("Finished")
else:
    print("Still going")`, a:["Finished"], d:["Still going","Error"],
w:"\"False\" in quotes is a string, not a Boolean. Any non-empty string counts as True."},

{t:"Boolean variables", q:"Return whether the string has a digit.",
c:`def has_digit(s):
    for ch in s:
        if ch.isdigit():
            return {{0}}
    return {{1}}

print(has_digit("a1"))
print(has_digit("abc"))`, a:["True","False"], d:["None","0"], o:"True\nFalse",
w:"Return True as soon as a digit is found. Only after checking every character can you return False."},

// ---------- Input decisions ----------
{t:"Input decisions", q:"What is printed when the user types 21?",
c:`age = {{0}}(input("Age: "))
if age >= 18:
    print("Adult")
else:
    print("Child")`, i:["21"], a:["int"], d:["str","len","bool"], o:"Adult",
w:"input() always gives a string, so cast it with int() before comparing it with a number."},

{t:"Input decisions", p:1, q:"What is printed when the user types 20?",
c:`age = input("Age: ")
if age >= 18:
    print("Adult")`, i:["20"], a:["TypeError"], d:["Adult","No output","ValueError"],
w:"age is the string \"20\", and Python can't use >= between a string and an integer. Cast with int(input())."},

{t:"Input decisions", p:1, q:"What is printed when the user types 9 then 10?",
c:`a = input()
b = input()
if a > b:
    print(a)
else:
    print(b)`, i:["9","10"], a:["9"], d:["10","TypeError"],
w:"Without int() these are strings, compared letter by letter. \"9\" comes after \"1\", so \"9\" > \"10\" is True."},

{t:"Input decisions", q:"What is printed when the user types pa55word?",
c:`pw = input("Password: ")
if len(pw) {{0}} 8:
    print("Too short")
else:
    print("OK")`, i:["pa55word"], a:["<"], d:["<=","==",">="], o:"OK",
w:"\"pa55word\" has exactly 8 characters, and 8 < 8 is False, so it is accepted."},

{t:"Input decisions", q:"What is printed when the user types 1?",
c:`choice = input("1, 2 or 3: ")
if choice == {{0}}:
    print("New game")
elif choice == "2":
    print("Load")
else:
    print("Quit")`, i:["1"], a:["\"1\""], d:["1","one","int(1)"], o:"New game",
w:"input() gives the string \"1\", so compare with \"1\" in quotes. The integer 1 is never equal to a string."},

{t:"Input decisions", p:1, q:"What is printed when the user types 2?",
c:`c = int(input())
if c == "2":
    print("Load")
else:
    print("Quit")`, i:["2"], a:["Quit"], d:["Load","TypeError"],
w:"c is the integer 2, but it is compared with the string \"2\". They are never equal, so else runs."},

{t:"Input decisions", p:1, q:"What is printed when the user types 7.5?",
c:`n = int(input("Number: "))
if n > 5:
    print("Big")`, i:["7.5"], a:["ValueError"], d:["Big","7","TypeError"],
w:"int() can't turn the text \"7.5\" into an integer, so it raises a ValueError. Use float() for decimals."},

{t:"Input decisions", q:"What is printed when the user types 38.2?",
c:`t = {{0}}(input("Temp: "))
if t > 37.5:
    print("Fever")
else:
    print("Normal")`, i:["38.2"], a:["float"], d:["int","str","len"], o:"Fever",
w:"The reading has a decimal point, so cast it with float(). int(\"38.2\") would raise a ValueError."},

{t:"Input decisions", q:"What is printed when the user guesses 4?",
c:`secret = 7
g = int(input("Guess: "))
if g {{0}} secret:
    print("Too low")
elif g > secret:
    print("Too high")
else:
    print("Correct")`, i:["4"], a:["<"], d:[">","==",">="], o:"Too low",
w:"4 < 7, so the guess is too low. The else catches the only case left, an exact match."},

{t:"Input decisions", p:1, q:"What is printed when the user types yes?",
c:`ans = input("Again? ")
if ans == "y" or ans == "Y":
    print("Restarting")
else:
    print("Bye")`, i:["yes"], a:["Bye"], d:["Restarting","Error"],
w:"\"yes\" is not exactly \"y\" or \"Y\". == checks the whole string, so neither test is True."},

{t:"Input decisions", q:"What is printed when the user types 0?",
c:`n = int(input("1-10: "))
if n < 1 {{0}} n > 10:
    print("Invalid")
else:
    print("Thanks")`, i:["0"], a:["or"], d:["and","not"], o:"Invalid",
w:"Input is invalid if it is too low or too high. 0 < 1 is True, so or gives True."},

{t:"Input decisions", p:1, q:"What is printed when the user types 9 then 10?",
c:`a = int(input())
b = int(input())
if a > b:
    print(a, "is bigger")
else:
    print(b, "is bigger")`, i:["9","10"], a:["10 is bigger"], d:["9 is bigger","TypeError"],
w:"Both inputs are cast to integers, so they are compared as numbers and 9 > 10 is False."},

{t:"Input decisions", q:"What is printed when the user types 14?",
c:`n = int(input("Number: "))
if n {{0}} 2 == 0:
    print("Even")
else:
    print("Odd")`, i:["14"], a:["%"], d:["//","/","*"], o:"Even",
w:"% gives the remainder (MOD in OCR's reference language). 14 MOD 2 is 0, so 14 is even."},

{t:"Input decisions", q:"What is printed when the user types 65?",
c:`age = int(input("Age: "))
if age < 16:
    price = 5
elif age {{0}} 65:
    price = 9
else:
    price = 6
print("Pay", price)`, i:["65"], a:["<"], d:["<=","==",">="], o:"Pay 6",
w:"65 < 65 is False, so 65 falls through to the else and gets the pensioner price. Boundary values are worth testing."},

{t:"Input decisions", q:"What is printed when the user types sam and 1234?",
c:`u = input("User: ")
p = input("PIN: ")
if u == "sam" {{0}} p == "1066":
    print("Logged in")
else:
    print("Try again")`, i:["sam","1234"], a:["and"], d:["or","or not"], o:"Try again",
w:"Both the username and the PIN must be right. With or, a correct username alone would log in."},

{t:"Input decisions", p:1, q:"What is printed when the user types 1 then 2?",
c:`a = input()
b = input()
if a + b == "12":
    print("Joined")
else:
    print("Added")`, i:["1","2"], a:["Joined"], d:["Added","TypeError"],
w:"input() returns strings, and + joins strings: \"1\" + \"2\" is \"12\"."},

{t:"Input decisions", q:"What is printed for a height of 2 m and weight of 80 kg?",
c:`h = float(input("Height m: "))
w = float(input("Weight kg: "))
bmi = w / (h * h)
if bmi {{0}} 25:
    print("Above healthy range")
else:
    print("Healthy")`, i:["2","80"], a:[">"], d:["<","<=","!="], o:"Healthy",
w:"80 / (2 * 2) is 20.0, and 20.0 > 25 is False, so the else branch runs."},

{t:"Input decisions", q:"What is printed when the user types 15?",
c:`s = input("Age: ")
if s.{{0}}():
    print("Age is", int(s))
else:
    print("Numbers only")`, i:["15"], a:["isdigit"], d:["isalpha","isupper","islower"], o:"Age is 15",
w:"isdigit() checks every character is 0-9 before you cast, so int() won't crash on bad input."},

{t:"Input decisions", q:"What is printed when the users type 3 then 5?",
c:`x = int(input())
y = int(input())
if x == y:
    print("Draw")
elif x {{0}} y:
    print("Player 1 wins")
else:
    print("Player 2 wins")`, i:["3","5"], a:[">"], d:["<","!=","<="], o:"Player 2 wins",
w:"Player 1 wins only with the higher number. 3 > 5 is False, so else runs."},

{t:"Input decisions", q:"What is printed when the user types - (minus)?",
c:`op = input("+ or -: ")
a = 10
b = 4
if op == "+":
    print(a + b)
{{0}} op == {{1}}:
    print(a - b)`, i:["-"], a:["elif","\"-\""], d:["else","\"+\"","-"], o:"6",
w:"elif adds a second test, and the symbol typed is a string, so it goes in quotes: \"-\"."},

// ---------- Match & lookup ----------
{t:"Match & lookup", q:"Accept YES in any case.",
c:`ans = "YES"
if ans.{{0}}() == "yes":
    print("Confirmed")
else:
    print("Cancelled")`, a:["lower"], d:["upper","title","strip"], o:"Confirmed",
w:"lower() turns every letter into lower case, so \"YES\", \"Yes\" and \"yes\" all match \"yes\"."},

{t:"Match & lookup", q:"Run the load command.",
c:`cmd = "load"
if cmd == "save":
    print("Saving")
elif cmd == {{0}}:
    print("Loading")
else:
    print("Unknown command")`, a:["\"load\""], d:["load","\"Load\"","\"LOAD\""], o:"Loading",
w:"Text needs quotes, and the case must match exactly. load without quotes is a variable name, which causes a NameError."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`cmd = "Quit"
if cmd == "quit":
    print("Bye")
elif cmd.lower() == "quit":
    print("Bye for now")`, a:["Bye for now"], d:["Bye","No output"],
w:"\"Quit\" == \"quit\" is False because of the capital Q. After lower() it matches."},

{t:"Match & lookup", q:"Check whether the colour is in the list.",
c:`ans = "blue"
if ans {{0}} ["red", "blue"]:
    print("Primary")
else:
    print("Not sure")`, a:["in"], d:["==","not in","="], o:"Primary",
w:"in checks every item in the list. That's neater than writing ans == \"red\" or ans == \"blue\"."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`c = "Red"
if c in ["red", "blue"]:
    print("Found")
else:
    print("Not found")`, a:["Not found"], d:["Found","Error"],
w:"in compares each item exactly, and \"Red\" is not the same as \"red\". Use c.lower() to ignore case."},

{t:"Match & lookup", q:"Print Wed for day 3.",
c:`d = 3
if d == 1:
    print("Mon")
elif d == 2:
    print("Tue")
elif d == {{0}}:
    print("Wed")`, a:["3"], d:["\"3\"","2","4"], o:"Wed",
w:"d holds the integer 3, so compare with 3, not the string \"3\"."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`code = "b2"
if code == "A1":
    item = "Crisps"
elif code == "B2":
    item = "Water"
else:
    item = "None"
print(item)`, a:["None"], d:["Water","Crisps","Error"],
w:"\"b2\" doesn't match \"B2\" because of the lower-case b, so the else branch sets item to \"None\"."},

{t:"Match & lookup", q:"Find the price of a medium drink.",
c:`s = "Medium"
s = s.{{0}}()
if s == "small":
    p = 2
elif s == "medium":
    p = 3
else:
    p = 4
print(p)`, a:["lower"], d:["upper","title","strip"], o:"3",
w:"Converting the input to lower case once, before the chain, means every test can use lower-case text."},

{t:"Match & lookup", q:"Rock (r) beats scissors (s).",
c:`p1 = "r"
p2 = "s"
if p1 == p2:
    print("Draw")
elif p1 == "r" and p2 == {{0}}:
    print("P1 wins")
else:
    print("P2 wins")`, a:["\"s\""], d:["\"p\"","\"r\"","s"], o:"P1 wins",
w:"Rock beats scissors, so P1 wins when p1 is \"r\" and p2 is \"s\"."},

{t:"Match & lookup", q:"Convert kilometres to metres.",
c:`unit = "km"
d = 5
if unit == "km":
    print(d * {{0}}, "m")
elif unit == "cm":
    print(d / 100, "m")`, a:["1000"], d:["100","10","0.001"], o:"5000 m",
w:"unit matches \"km\", so the first branch runs. There are 1000 metres in a kilometre."},

{t:"Match & lookup", q:"Work out the area of a triangle.",
c:`shape = "tri"
b = 6
h = 4
if shape == "rect":
    area = b * h
elif shape == {{0}}:
    area = {{1}}
print(area)`, a:["\"tri\"","b * h / 2"], d:["tri","b * h"], o:"12.0",
w:"The triangle branch needs the text \"tri\" in quotes. A triangle's area is half base times height, and / gives a float."},

{t:"Match & lookup", q:"Look up the name of day n (1 is Mon).",
c:`days = ["Mon", "Tue", "Wed"]
n = 2
if n >= 1 and n <= 3:
    print(days[{{0}}])`, a:["n - 1"], d:["n","n + 1"], o:"Tue",
w:"Lists start at index 0, so day 1 is days[0] and day n is days[n - 1]."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`a = "YES"
if a.lower() in ["y", "yes"]:
    print("Continue")
else:
    print("Stop")`, a:["Continue"], d:["Stop","Error"],
w:"\"YES\".lower() is \"yes\", which is in the list."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`cmd = "quit "
if cmd == "quit":
    print("Bye")
else:
    print("Unknown")`, a:["Unknown"], d:["Bye","Error"],
w:"There's a space at the end of \"quit \", so the strings differ. strip() removes spaces from both ends."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`cur = "EUR"
if cur == "GBP":
    sym = "£"
elif cur == "USD":
    sym = "$"
elif cur == "EUR":
    sym = "€"
else:
    sym = "?"
print(sym + "5")`, a:["€5"], d:["?5","£5","€ 5"],
w:"The third test matches. + joins the two strings with no space between them."},

{t:"Match & lookup", q:"Multiply when the operator is *.",
c:`op = "*"
a = 6
b = 3
if op == "+":
    r = a + b
elif op == {{0}}:
    r = a * b
else:
    r = a / b
print(r)`, a:["\"*\""], d:["*","\"x\"","\"+\""], o:"18",
w:"op holds the string \"*\", so compare it with \"*\" in quotes. Without quotes, * is the multiply operator."},

{t:"Match & lookup", q:"Spot vowels in either case.",
c:`ch = "E"
if ch{{0}} in "aeiou":
    print("Vowel")
else:
    print("Consonant")`, a:[".lower()"], d:[".upper()","[0]",".strip()"], o:"Vowel",
w:"\"E\" is not in \"aeiou\", but \"e\" is. Converting to lower case first makes the check work for capitals."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`a = "Zoo"
b = "apple"
if a < b:
    print(a)
else:
    print(b)`, a:["Zoo"], d:["apple","TypeError"],
w:"Strings compare by character code, and every capital letter comes before every lower-case letter. So \"Z\" < \"a\" is True."},

{t:"Match & lookup", q:"Stop the menu when q is chosen.",
c:`for c in ["a", "x", "q"]:
    if c == "a":
        print("Add")
    elif c == {{0}}:
        print("Quit")
        break
    else:
        print("Unknown")`, a:["\"q\""], d:["\"x\"","q","\"Q\""], o:"Add\nUnknown\nQuit",
w:"\"x\" matches neither option, so it falls through to else. \"q\" triggers Quit and break ends the loop."},

{t:"Match & lookup", p:1, q:"What does this print?",
c:`team = "Red"
if team.upper() == "Red":
    print("Home")
else:
    print("Away")`, a:["Away"], d:["Home","Error"],
w:"\"Red\".upper() is \"RED\", which is not \"Red\". Compare with text in the same case you converted to."},
]);
