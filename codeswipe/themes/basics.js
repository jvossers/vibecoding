// Theme: Variables & data types (OCR J277 2.2.1 programming fundamentals, 2.2.2 data types). Validate with codeswipe/tools/validate.py
CodeSwipe.add("basics", [
// ---------- Variables ----------
{t:"Variables", q:"Store the score 10 in a variable called score.",
c:`{{0}}
print(score)`, a:["score = 10"], d:["10 = score","score == 10","score := 10"], o:"10",
w:"Assignment puts the variable name on the left and the value on the right. == compares; it doesn't store anything."},

{t:"Variables", q:"Add 5 bonus points to the score.",
c:`score = 20
score = {{0}}
print(score)`, a:["score + 5"], d:["5","score","score == 5"], o:"25",
w:"The right-hand side is worked out first using the old value (20), then the result 25 is stored back in score."},

{t:"Variables", p:1, q:"What does this print?",
c:`x = 4
x = 9
print(x)`, a:["9"], d:["4","13","4 9"],
w:"A variable holds one value at a time. The second assignment replaces 4 with 9."},

{t:"Variables", p:1, q:"What does this print?",
c:`a = 3
b = a
a = 8
print(b)`, a:["3"], d:["8","11","a"],
w:"b = a copies the value 3 into b at that moment. Changing a afterwards doesn't change b."},

{t:"Variables", q:"Swap the two values using a temporary variable.",
c:`a = "red"
b = "blue"
temp = a
a = {{0}}
b = {{1}}
print(a, b)`, a:["b","temp"], d:["a","temp + b"], o:"blue red",
w:"temp keeps a safe copy of a's old value. Without it, a = b would lose \"red\" for ever."},

{t:"Variables", q:"Swap x and y in one line.",
c:`x = 1
y = 2
{{0}}
print(x, y)`, a:["x, y = y, x"], d:["x = y","x, y = x, y","y = x"], o:"2 1",
w:"Python can swap with x, y = y, x because the right-hand side is worked out before anything is stored."},

{t:"Variables", p:1, q:"What does this print?",
c:`a = 5
b = 7
a = b
b = a
print(a, b)`, a:["7 7"], d:["7 5","5 7","5 5"],
w:"This is the classic broken swap. After a = b both hold 7, so b = a just copies 7 back."},

{t:"Variables", q:"Use a constant for the VAT rate.",
c:`{{0}} = 0.2
price = 50
print(price * VAT)`, a:["VAT"], d:["vat","Vat","\"VAT\""], o:"10.0",
w:"Constants are written in CAPITALS by convention. Python is case-sensitive, so vat and VAT are different names."},

{t:"Variables", q:"Use the constant to work out the area of the circle.",
c:`PI = 3.14
r = 10
area = {{0}} * r * r
print(area)`, a:["PI"], d:["pi","3.14 * PI","r"], o:"314.0",
w:"PI is a constant: a value set once and never changed. In OCR reference language you'd write const PI = 3.14."},

{t:"Variables", q:"Count three visitors arriving one at a time.",
c:`visitors = 0
visitors = visitors + 1
visitors = {{0}}
visitors += 1
print(visitors)`, a:["visitors + 1"], d:["1","visitors","visitors * 1"], o:"3",
w:"visitors += 1 is shorthand for visitors = visitors + 1. Both add one to the current count."},

{t:"Variables", q:"Pick a valid variable name for the high score.",
c:`{{0}} = 150
print("Best:", 150)`, a:["high_score"], d:["high score","2nd_score","high-score"], o:"Best: 150",
w:"Names can contain letters, digits and underscores but can't start with a digit or contain spaces or hyphens."},

{t:"Variables", p:1, q:"What does this print?",
c:`total = 0
total = total + 4
total = total * 3
total = total - 2
print(total)`, a:["10"], d:["12","2","6"],
w:"Trace it line by line: 0, then 4, then 12, then 10."},

{t:"Variables", p:1, q:"What does this print?",
c:`n = 2
n = n * n
n = n * n
print(n)`, a:["16"], d:["4","8","2"],
w:"Each line uses the newest value: 2 * 2 = 4, then 4 * 4 = 16."},

{t:"Variables", q:"Store the player's lives.",
c:`lives = 3
lives = lives - 1
print({{0}})`, a:["lives"], d:["\"lives\"","3","lives - 1"], o:"2",
w:"Without quotes, lives is the variable and its value 2 is printed. With quotes you'd print the word lives."},

{t:"Variables", p:1, q:"What does this print?",
c:`Name = "Sam"
name = "Jo"
print(Name)`, a:["Sam"], d:["Jo","name","NameError"],
w:"Python is case-sensitive, so Name and name are two separate variables."},

{t:"Variables", p:1, q:"What does this print?",
c:`print(count)
count = 5`, a:["NameError"], d:["5","0","None"],
w:"A variable must be assigned before it's used. Line 1 runs first, when count doesn't exist yet."},

{t:"Variables", q:"Keep a running total of the three marks.",
c:`total = {{0}}
total = total + 12
total = total + 7
total = total + 9
print(total)`, a:["0"], d:["1","12","total"], o:"28",
w:"A running total must start at 0 so it doesn't add anything extra. total = total would fail because total doesn't exist yet."},

{t:"Variables", q:"Rotate three values so each moves one place left.",
c:`a = 1
b = 2
c = 3
a, b, c = {{0}}
print(a, b, c)`, a:["b, c, a"], d:["c, a, b","a, b, c","c, b, a"], o:"2 3 1",
w:"a gets b's old value, b gets c's and c gets a's, all at once."},

{t:"Variables", p:1, q:"What does this print?",
c:`x = 10
y = x
x += 5
y -= 5
print(x, y)`, a:["15 5"], d:["15 10","10 5","5 15"],
w:"y gets a copy of 10. Then x becomes 15 and y becomes 5 separately."},

{t:"Variables", q:"Give both players the same starting score.",
c:`p1 = {{0}} = 100
print(p1, p2)`, a:["p2"], d:["100","p1","\"p2\""], o:"100 100",
w:"Chained assignment p1 = p2 = 100 stores 100 in both variables."},

// ---------- Input & output ----------
{t:"Input & output", q:"Ask for the user's name and greet them.", i:["Priya"],
c:`name = {{0}}("Name: ")
print("Hello", name)`, a:["input"], d:["print","read","int"], o:"Hello Priya",
w:"input() waits for the user to type something and returns it as a string. OCR reference language also uses input()."},

{t:"Input & output", q:"Print the two words with a single space between them.",
c:`print("Good"{{0}}"morning")`, a:[", "], d:[" + "," "], o:"Good morning",
w:"Commas in print() put a space between items. + joins strings with no space, giving Goodmorning."},

{t:"Input & output", q:"Print the date with slashes between the parts.",
c:`print(24, 11, 2026, sep={{0}})`, a:["\"/\""], d:["\" \"","\"\"","\",\""], o:"24/11/2026",
w:"sep= changes what print() puts between items. The default is a single space."},

{t:"Input & output", q:"Print both words on the same line.",
c:`print("Loading", end={{0}})
print("done")`, a:["\"...\""], d:["\" \"","\"\""], o:"Loading...done",
w:"end= replaces the newline that print() normally adds at the end, so the next print carries on the same line."},

{t:"Input & output", q:"Add one to the age the user types.", i:["14"],
c:`age = {{0}}(input("Age: "))
print(age + 1)`, a:["int"], d:["str","input","print"], o:"15",
w:"input() always returns a string, so cast it to int before doing maths. \"14\" + 1 would be a TypeError."},

{t:"Input & output", p:1, q:"What is printed when the user types 5?", i:["5"],
c:`n = input("Number: ")
print(n * 3)`, a:["555"], d:["15","5 5 5","TypeError"],
w:"n is the string \"5\". Multiplying a string by 3 repeats it, giving \"555\"."},

{t:"Input & output", p:1, q:"What is printed when the user types 4 then 6?", i:["4","6"],
c:`a = input()
b = input()
print(a + b)`, a:["46"], d:["10","4 6","TypeError"],
w:"Both inputs are strings, so + joins them. Cast with int() first to add them as numbers."},

{t:"Input & output", q:"Add the two numbers the user types.", i:["4","6"],
c:`a = int(input())
b = {{0}}
print(a + b)`, a:["int(input())"], d:["input()","int(a)","str(input())"], o:"10",
w:"Every input needs casting separately. If b stayed a string, int + str would raise a TypeError."},

{t:"Input & output", q:"Print the message with the score.",
c:`score = 42
print("You scored " + {{0}})`, a:["str(score)"], d:["score","int(score)","\"score\""], o:"You scored 42",
w:"+ can only join a string to a string. str(score) turns 42 into \"42\" first; score on its own gives a TypeError."},

{t:"Input & output", q:"Print the message and the score with a comma.",
c:`score = 42
print("You scored"{{0}}score)`, a:[", "], d:[" + "," "], o:"You scored 42",
w:"Commas let print() show a mix of types and add the space for you, so no casting is needed."},

{t:"Input & output", p:1, q:"What does this print?",
c:`print("A", "B", "C", sep="")`, a:["ABC"], d:["A B C","A,B,C","A B C sep"],
w:"sep=\"\" means nothing goes between the items, so they're printed touching."},

{t:"Input & output", p:1, q:"What does this print?",
c:`print("x", end="-")
print("y", end="-")
print("z")`, a:["x-y-z"], d:["x- y- z","x y z","x-y-z-"],
w:"Each end=\"-\" replaces the newline, so all three appear on one line separated by dashes."},

{t:"Input & output", q:"Print the price in pounds.",
c:`cost = 7.5
print({{0}}, cost, sep="")`, a:["\"£\""], d:["£","\"£ \""], o:"£7.5",
w:"Text must be in quotes. With sep=\"\" there's no space between the £ sign and the number."},

{t:"Input & output", q:"Read the user's height in metres.", i:["1.62"],
c:`h = {{0}}(input("Height: "))
print(h * 100)`, a:["float"], d:["int","str"], o:"162.0",
w:"1.62 has a decimal point, so cast it with float(). int(\"1.62\") raises a ValueError."},

{t:"Input & output", p:1, q:"What does this print?",
c:`x = 3
print("x", x)`, a:["x 3"], d:["3 3","x x","x3"],
w:"\"x\" in quotes is the letter x; x without quotes is the variable, whose value is 3."},

{t:"Input & output", p:1, q:"What is printed when the user types Ali?", i:["Ali"],
c:`name = input("Name? ")
print(name, "!", sep="")`, a:["Ali!"], d:["Name? Ali!","Ali !","name!"],
w:"The prompt isn't part of the program's output here, and sep=\"\" glues Ali and ! together."},

{t:"Input & output", q:"Print the total of the two prices typed in.", i:["2.5","1.25"],
c:`a = float(input())
b = float(input())
print("Total:", {{0}})`, a:["a + b"], d:["\"a + b\"","a, b","str(a) + str(b)"], o:"Total: 3.75",
w:"Both have been cast to float, so a + b adds them as numbers."},

{t:"Input & output", q:"Print an empty line between the two words.",
c:`print("Top")
{{0}}
print("Bottom")`, a:["print()"], d:["print(end=\"\")","print","Print()"], o:"Top\n\nBottom",
w:"print() with nothing inside outputs just a newline, giving a blank line. A bare print without brackets does nothing, and Python is case-sensitive so Print() is a NameError."},

{t:"Input & output", q:"Print the countdown on one line.",
c:`print(3, end=" ")
print(2, end=" ")
print(1, {{0}})
print("Go!")`, a:["end=\" \""], d:["sep=\" \"","end=\"\""], o:"3 2 1 Go!",
w:"end=\" \" stops print() moving to a new line. sep only affects the gap between items in one print()."},

{t:"Input & output", p:1, q:"What does this print?",
c:`print(1, 2, 3, sep=", ", end=".")`, a:["1, 2, 3."], d:["1 2 3.","1, 2, 3, .","123."],
w:"sep goes between the items and end goes once at the very end."},

// ---------- Arithmetic ----------
{t:"Arithmetic", q:"Work out the total cost of 4 tickets at £6 each.",
c:`tickets = 4
price = 6
print(tickets {{0}} price)`, a:["*"], d:["x","+","**"], o:"24",
w:"Python uses * for multiply, not x. ** would be a power: 4 to the power 6."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`print(2 + 3 * 4)`, a:["14"], d:["20","24","9"],
w:"Multiplication happens before addition (BIDMAS), so 3 * 4 = 12 first, then 2 + 12 = 14."},

{t:"Arithmetic", q:"Add the brackets so the answer is 20.",
c:`print({{0}} * 4)`, a:["(2 + 3)"], d:["2 + 3","(2) + 3","2 + (3)"], o:"20",
w:"Brackets are worked out first, so (2 + 3) * 4 = 20. Without them you'd get 2 + 12 = 14."},

{t:"Arithmetic", q:"Calculate the mean of the three test marks.",
c:`a = 6
b = 9
c = 9
mean = {{0}}
print(mean)`, a:["(a + b + c) / 3"], d:["a + b + c / 3","(a + b + c) // 2","a + b + c"], o:"8.0",
w:"Without brackets only c is divided by 3. The total 24 must be divided by 3, giving 8.0."},

{t:"Arithmetic", q:"Square the side length to get the area.",
c:`side = 7
area = side {{0}} 2
print(area)`, a:["**"], d:["^","*","//"], o:"49",
w:"Python's power operator is **. OCR reference language writes it as ^, but in Python ^ means something else."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`print(2 ** 3 ** 2)`, a:["512"], d:["64","36","12"],
w:"** works right to left: 3 ** 2 = 9 first, then 2 ** 9 = 512."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`print(10 - 4 - 3)`, a:["3"], d:["9","-3","7"],
w:"Subtraction works left to right: 10 - 4 = 6, then 6 - 3 = 3."},

{t:"Arithmetic", q:"Convert the temperature from Celsius to Fahrenheit.",
c:`c = 20
f = c * 9 / 5 {{0}} 32
print(f)`, a:["+"], d:["-","*"], o:"68.0",
w:"F = C × 9 / 5 + 32. The / makes the result a float, so 68.0 is printed."},

{t:"Arithmetic", q:"Work out the speed from distance and time.",
c:`dist = 150
time = 3
speed = {{0}}
print(speed)`, a:["dist / time"], d:["time / dist","dist * time","dist - time"], o:"50.0",
w:"Speed = distance ÷ time. Dividing 150 by 3 gives 50.0 (always a float with /)."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`x = 5
x = x * 2 + 1
print(x)`, a:["11"], d:["15","10","12"],
w:"Multiply first: 5 * 2 = 10, then add 1 to get 11."},

{t:"Arithmetic", q:"Take 15% off the price.",
c:`price = 80
off = price * {{0}}
print(price - off)`, a:["0.15"], d:["15","0.85","1.5"], o:"68.0",
w:"15% is 0.15 as a decimal. 80 * 0.15 = 12.0, and 80 - 12.0 = 68.0."},

{t:"Arithmetic", q:"Double the amount each year.",
c:`money = 5
money {{0}} 2
print(money)`, a:["*="], d:["+=","**=","=*"], o:"10",
w:"money *= 2 is shorthand for money = money * 2. +=2 gives 7 and **=2 squares it to 25."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`print(-3 ** 2)`, a:["-9"], d:["9","-6","6"],
w:"** is done before the minus sign, so this is -(3 ** 2) = -9. Write (-3) ** 2 to get 9."},

{t:"Arithmetic", q:"Calculate the perimeter of the rectangle.",
c:`w = 4
h = 3
print({{0}} * (w + h))`, a:["2"], d:["4","w","h"], o:"14",
w:"Perimeter is 2 × (width + height) = 2 × 7 = 14."},

{t:"Arithmetic", q:"Work out the cube of n.",
c:`n = 3
print(n {{0}} {{1}})`, a:["**","3"], d:["*","^","2"], o:"27",
w:"n ** 3 is n cubed: 3 × 3 × 3 = 27. n * 3 would only give 9."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`a = 7
b = 2
print(a * b - a / b)`, a:["10.5"], d:["10","3.5","5.0"],
w:"7 * 2 = 14 and 7 / 2 = 3.5, so 14 - 3.5 = 10.5."},

{t:"Arithmetic", q:"Work out how many seconds are in a day.",
c:`secs = {{0}}
print(secs)`, a:["24 * 60 * 60"], d:["24 * 60","24 + 60 + 60","60 ** 24"], o:"86400",
w:"24 hours × 60 minutes × 60 seconds = 86400."},

{t:"Arithmetic", p:1, q:"What does this print?",
c:`print((4 + 6) / 2 * 5)`, a:["25.0"], d:["1.0","25","2.5"],
w:"Brackets first gives 10. Then / and * go left to right: 10 / 2 = 5.0, 5.0 * 5 = 25.0."},

{t:"Arithmetic", q:"Calculate the area of the triangle.",
c:`base = 10
h = 6
area = {{0}} * base * h
print(area)`, a:["0.5"], d:["2","1/3","5"], o:"30.0",
w:"Area = ½ × base × height. 0.5 * 10 * 6 = 30.0."},

{t:"Arithmetic", q:"Subtract the cost from the balance.",
c:`balance = 50
cost = 18
balance {{0}} cost
print(balance)`, a:["-="], d:["=-","+=","=="], o:"32",
w:"balance -= cost means balance = balance - cost. Watch out: =- just sets balance to -18."},

// ---------- DIV & MOD ----------
{t:"DIV & MOD", q:"Convert 135 minutes into whole hours.",
c:`mins = 135
hours = mins {{0}} 60
print(hours)`, a:["//"], d:["/","%","*"], o:"2",
w:"// is integer division (DIV in OCR reference language). It drops the remainder, so 135 // 60 = 2."},

{t:"DIV & MOD", q:"Print 135 minutes as hours and minutes.",
c:`mins = 135
h = mins {{0}} 60
m = mins {{1}} 60
print(h, "h", m, "m")`, a:["//","%"], d:["/","*"], o:"2 h 15 m",
w:"// gives the whole hours (2) and % gives what's left over (15). OCR writes these as DIV and MOD."},

{t:"DIV & MOD", q:"Check whether the number is even.",
c:`n = 14
print(n % 2 {{0}} 0)`, a:["=="], d:["=","!=",">"], o:"True",
w:"An even number has remainder 0 when divided by 2. n MOD 2 == 0 is the classic even test."},

{t:"DIV & MOD", p:1, q:"What does this print?",
c:`print(17 % 5)`, a:["2"], d:["3","3.4","12"],
w:"17 = 3 × 5 + 2, so the remainder (MOD) is 2."},

{t:"DIV & MOD", p:1, q:"What does this print?",
c:`print(17 // 5)`, a:["3"], d:["3.4","2","4"],
w:"// rounds down to a whole number: 17 / 5 is 3.4, so 17 // 5 is 3."},

{t:"DIV & MOD", q:"Get the last digit of the number.",
c:`n = 4729
print(n {{0}} 10)`, a:["%"], d:["//","/","-"], o:"9",
w:"n % 10 is the remainder after dividing by 10, which is always the last digit."},

{t:"DIV & MOD", q:"Remove the last digit of the number.",
c:`n = 4729
print(n {{0}} 10)`, a:["//"], d:["%","/","-"], o:"472",
w:"n // 10 divides by 10 and drops the remainder, chopping off the last digit."},

{t:"DIV & MOD", q:"Get the tens digit of the number.",
c:`n = 4729
tens = (n {{0}} 10) {{1}} 10
print(tens)`, a:["//","%"], d:["/","-"], o:"2",
w:"4729 // 10 = 472, then 472 % 10 = 2. DIV removes digits from the right; MOD picks the last one."},

{t:"DIV & MOD", q:"Share the sweets equally and print how many are left over.",
c:`sweets = 23
kids = 4
print({{0}})`, a:["sweets % kids"], d:["sweets // kids","kids % sweets","sweets / kids"], o:"3",
w:"23 sweets between 4 children is 5 each with 3 left over. The leftover is 23 % 4."},

{t:"DIV & MOD", p:1, q:"What does this print?",
c:`print(3 % 8)`, a:["3"], d:["0","5","2"],
w:"8 goes into 3 zero times, leaving all 3 as the remainder."},

{t:"DIV & MOD", q:"Work out how many full boxes of 6 eggs you can fill.",
c:`eggs = 50
print(eggs {{0}} {{1}})`, a:["//","6"], d:["%","/","8"], o:"8",
w:"50 // 6 = 8 full boxes. 50 % 6 would give the 2 eggs left over."},

{t:"DIV & MOD", q:"Give change for 80p using as many 20p coins as possible.",
c:`change = 80
coins = change {{0}} 20
left = change {{1}} 20
print(coins, left)`, a:["//","%"], d:["/","-"], o:"4 0",
w:"80 // 20 = 4 coins and 80 % 20 = 0 left. Using / would give 4.0, a float."},

{t:"DIV & MOD", q:"Convert 200 seconds to minutes and seconds.",
c:`t = 200
print(t // {{0}}, t % {{1}})`, a:["60","60"], d:["100","10"], o:"3 20",
w:"There are 60 seconds in a minute: 200 // 60 = 3 and 200 % 60 = 20."},

{t:"DIV & MOD", q:"Check whether year is divisible by 4.",
c:`year = 2028
print(year {{0}} 4 == 0)`, a:["%"], d:["//","/"], o:"True",
w:"If the remainder is 0, 4 divides the year exactly. year // 4 == 0 is only True for years below 4."},

{t:"DIV & MOD", p:1, q:"What does this print?",
c:`n = 365
print(n // 7, n % 7)`, a:["52 1"], d:["52.1 1","52 2","1 52"],
w:"365 days is 52 full weeks (52 × 7 = 364) and 1 day left over."},

{t:"DIV & MOD", p:1, q:"What does this print?",
c:`print(7.0 // 2)`, a:["3.0"], d:["3","3.5","4.0"],
w:"// still rounds down, but if either number is a float the answer is a float too."},

{t:"DIV & MOD", q:"Find which seat in the row of 10 the ticket is.",
c:`ticket = 37
row = ticket // 10
seat = ticket {{0}} 10
print(row, seat)`, a:["%"], d:["//","-","/"], o:"3 7",
w:"// 10 gives the row number and % 10 gives the position within that row."},

{t:"DIV & MOD", p:1, q:"What does this print?",
c:`print(-7 // 2)`, a:["-4"], d:["-3","-3.5","3"],
w:"// always rounds down (towards minus infinity), so -3.5 becomes -4, not -3."},

{t:"DIV & MOD", q:"Add up the digits of the two-digit number.",
c:`n = 58
total = n // 10 + n {{0}} 10
print(total)`, a:["%"], d:["//","/","*"], o:"13",
w:"58 // 10 = 5 is the tens digit and 58 % 10 = 8 is the units digit. 5 + 8 = 13."},

{t:"DIV & MOD", q:"Find the day 10 days after Saturday (Monday is day 0).",
c:`today = 5
later = (today + 10) {{0}} 7
print(later)`, a:["%"], d:["//","/","-"], o:"1",
w:"MOD 7 wraps the count round the week: 15 % 7 = 1, which is Tuesday."},

{t:"DIV & MOD", q:"Print the total pence as pounds and pence.",
c:`p = 1265
pounds = p {{0}} 100
pence = p {{1}} 100
print("£", pounds, ".", pence, sep="")`, a:["//","%"], d:["/","-"], o:"£12.65",
w:"1265 // 100 = 12 pounds and 1265 % 100 = 65 pence."},

// ---------- Data types ----------
{t:"Data types", p:1, q:"What does this print?",
c:`print(type(42))`, a:["<class 'int'>"], d:["<class 'float'>","<class 'str'>","42"],
w:"A whole number with no decimal point is an integer (int)."},

{t:"Data types", p:1, q:"What does this print?",
c:`print(type("42"))`, a:["<class 'str'>"], d:["<class 'int'>","<class 'float'>","42"],
w:"Anything inside quotes is a string, even if it looks like a number."},

{t:"Data types", q:"Choose the operator that gives a float.",
c:`print(type(8 {{0}} 2))`, a:["/"], d:["//","*","%"], o:"<class 'float'>",
w:"The / operator always returns a float, even when the division is exact: 8 / 2 is 4.0."},

{t:"Data types", q:"Store the price as a real (decimal) number.",
c:`price = {{0}}
print(type(price))`, a:["3.99"], d:["\"3.99\"","3","True"], o:"<class 'float'>",
w:"Numbers with a decimal point are floats (called real in OCR). \"3.99\" in quotes would be a string."},

{t:"Data types", q:"Store whether the door is locked as a Boolean.",
c:`locked = {{0}}
print(type(locked))`, a:["True"], d:["\"True\"","true","1"], o:"<class 'bool'>",
w:"Booleans in Python are True and False with a capital letter and no quotes. true (lower case) is a NameError."},

{t:"Data types", q:"Pick the value that gives an integer.",
c:`x = {{0}}
print(type(x))`, a:["7 // 2"], d:["7 / 2","7.0 // 2","\"7\""], o:"<class 'int'>",
w:"// between two ints gives an int. / always gives a float, and 7.0 // 2 gives 3.0."},

{t:"Data types", p:1, q:"What does this print?",
c:`print(3 + 2.0)`, a:["5.0"], d:["5","32.0","TypeError"],
w:"Mixing an int and a float gives a float, so the answer is 5.0."},

{t:"Data types", p:1, q:"What does this print?",
c:`print("3" + "2")`, a:["32"], d:["5","3 2","TypeError"],
w:"Both are strings, so + concatenates (joins) them instead of adding."},

{t:"Data types", p:1, q:"What does this print?",
c:`print("3" + 2)`, a:["TypeError"], d:["5","32","ValueError"],
w:"Python won't add a str and an int. Cast one of them first: int(\"3\") + 2 or \"3\" + str(2)."},

{t:"Data types", q:"Choose the best data type for a phone number.",
c:`phone = {{0}}
print(phone[0])`, a:["\"07700900123\""], d:["07700900123","7700900123"], o:"0",
w:"Phone numbers are stored as strings: you never do maths on them, and an int can't keep the leading 0."},

{t:"Data types", p:1, q:"What does this print?",
c:`print(type(5 > 3))`, a:["<class 'bool'>"], d:["<class 'int'>","True","<class 'str'>"],
w:"A comparison always gives a Boolean value, True or False."},

{t:"Data types", q:"Name the data type that 2 ** 3 gives.",
c:`x = 2 ** 3
print(type(x) == {{0}})`, a:["int"], d:["float","str","bool"], o:"True",
w:"An int raised to a positive int power stays an int: 2 ** 3 is 8."},

{t:"Data types", p:1, q:"What does this print?",
c:`print(10 / 5)`, a:["2.0"], d:["2","2.5","0.5"],
w:"/ is real division and always gives a float, so 10 / 5 is 2.0, not 2."},

{t:"Data types", q:"Check that the user's answer is a string.",
c:`ans = "yes"
print(type(ans) == {{0}})`, a:["str"], d:["\"str\"","string","int"], o:"True",
w:"type() returns the class str itself, not the text \"str\". Python calls it str, not string."},

{t:"Data types", q:"Store the character for a grade.",
c:`grade = {{0}}
print(grade, len(grade))`, a:["\"A\""], d:["A","'AB'","1"], o:"A 1",
w:"Python has no separate char type; a single character is just a string of length 1. A on its own is a NameError."},

{t:"Data types", p:1, q:"What does this print?",
c:`print(True + True)`, a:["2"], d:["True","TrueTrue","TypeError"],
w:"In arithmetic Python treats True as 1 and False as 0, so True + True is 2."},

{t:"Data types", q:"Print the laugh three times.",
c:`laugh = "ha"
print(laugh {{0}} 3)`, a:["*"], d:["+","**","-"], o:"hahaha",
w:"A string times an int repeats the string that many times."},

{t:"Data types", q:"Make the mean an integer by using integer division.",
c:`total = 17
count = 4
print(total {{0}} count)`, a:["//"], d:["/","%"], o:"4",
w:"17 // 4 gives the int 4. 17 / 4 gives the float 4.25, and % gives the remainder 1."},

{t:"Data types", p:1, q:"What does this print?",
c:`x = 5
x = x / 1
print(x)`, a:["5.0"], d:["5","1","5.1"],
w:"Dividing with / turns the int into a float, even dividing by 1."},

{t:"Data types", p:1, q:"What does this print?",
c:`print(type(4.0 * 2))`, a:["<class 'float'>"], d:["<class 'int'>","8.0","<class 'str'>"],
w:"If either side is a float, the result of * is a float: 8.0."},

// ---------- Casting ----------
{t:"Casting", q:"Convert the string to an integer and double it.",
c:`s = "21"
n = {{0}}(s)
print(n * 2)`, a:["int"], d:["str","float","bool"], o:"42",
w:"int(\"21\") gives the number 21. Leaving it as a string would give \"2121\"."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(int(7.9))`, a:["7"], d:["8","7.9","ValueError"],
w:"int() of a float chops off the decimal part (truncates). It doesn't round, so 7.9 becomes 7."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(int("7.9"))`, a:["ValueError"], d:["7","8","7.9"],
w:"int() can't read a decimal point in a string. Use int(float(\"7.9\")) to get 7."},

{t:"Casting", q:"Turn the string \"7.9\" into the whole number 7.",
c:`s = "7.9"
n = int({{0}}(s))
print(n)`, a:["float"], d:["int","str","round"], o:"7",
w:"First float(\"7.9\") gives 7.9, then int() truncates it to 7."},

{t:"Casting", q:"Join the number onto the message.",
c:`n = 3
msg = "Level " + {{0}}(n)
print(msg)`, a:["str"], d:["int","float"], o:"Level 3",
w:"You can only + a string to a string, so cast the int with str() first."},

{t:"Casting", q:"Turn the whole number into a real number.",
c:`n = 5
print({{0}}(n))`, a:["float"], d:["int","str","round"], o:"5.0",
w:"float() turns the integer 5 into the real number 5.0."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(bool(0))`, a:["False"], d:["True","0","None"],
w:"0 is the only int that converts to False. Every other number gives True."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(bool("False"))`, a:["True"], d:["False","ValueError","None"],
w:"Any string that isn't empty is True, even the word \"False\". Only \"\" gives False."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(int("twelve"))`, a:["ValueError"], d:["12","TypeError","twelve"],
w:"int() can only convert strings made of digits. Words cause a ValueError."},

{t:"Casting", q:"Count the digits of the PIN number.",
c:`pin = 50731
print(len({{0}}))`, a:["str(pin)"], d:["pin","int(pin)","float(pin)"], o:"5",
w:"An int has no length; casting it to a string lets len() count its characters."},

{t:"Casting", q:"Subtract the stock sold from the stock held.",
c:`held = "30"
sold = "12"
print({{0}} - {{1}})`, a:["int(held)","int(sold)"], d:["held","sold"], o:"18",
w:"Both strings must be cast to int before doing maths. Subtracting one string from another is a TypeError."},

{t:"Casting", q:"Join the two digits to make 45.",
c:`a = 4
b = 5
print({{0}} + {{1}})`, a:["str(a)","str(b)"], d:["a","b"], o:"45",
w:"Both numbers are turned into strings, so + joins them rather than adding."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(int(-3.7))`, a:["-3"], d:["-4","-3.7","3"],
w:"int() truncates towards zero, so -3.7 becomes -3. It doesn't round down to -4."},

{t:"Casting", q:"Read a price and add delivery.", i:["4.50"],
c:`p = {{0}}(input())
print(p + 2)`, a:["float"], d:["int","str"], o:"6.5",
w:"\"4.50\" has a decimal point, so float() is needed. int(\"4.50\") would raise a ValueError."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(int("  8  ") * 2)`, a:["16"], d:["88","ValueError","  8    8  "],
w:"int() ignores spaces at the start and end of a string, so this is 8 * 2 = 16."},

{t:"Casting", q:"Make the result an integer instead of a float.",
c:`half = {{0}}(9 / 2)
print(half)`, a:["int"], d:["float","str","bool"], o:"4",
w:"9 / 2 is 4.5, and int() truncates it to 4."},

{t:"Casting", p:1, q:"What does this print?",
c:`x = "5"
y = int(x) + float(x)
print(y)`, a:["10.0"], d:["10","55","55.0"],
w:"int(\"5\") is 5 and float(\"5\") is 5.0. An int plus a float gives the float 10.0."},

{t:"Casting", q:"Check whether the user typed anything at all.", i:[""],
c:`name = input()
print({{0}}(name))`, a:["bool"], d:["str","int","len"], o:"False",
w:"bool(\"\") is False because the string is empty. int(\"\") would raise a ValueError."},

{t:"Casting", q:"Build a username from the name and birth year.",
c:`name = "kai"
year = 2011
user = name + {{0}}
print(user)`, a:["str(year % 100)"], d:["year % 100","str(year // 100)","str(year)"], o:"kai11",
w:"year % 100 gives the last two digits, 11. It must be cast with str() before it can be joined to the name."},

{t:"Casting", q:"Double the weight stored as a string.",
c:`s = "2.5"
print({{0}}(s) * 2)`, a:["float"], d:["int","str"], o:"5.0",
w:"float(\"2.5\") is the number 2.5, so doubling it gives 5.0."},

// ---------- Comparison operators ----------
{t:"Comparison operators", q:"Check whether the guess matches the secret number.",
c:`secret = 7
guess = 7
print(guess {{0}} secret)`, a:["=="], d:["=","!=","<"], o:"True",
w:"== asks \"are these equal?\" and gives True or False. A single = is assignment, which is a syntax error here."},

{t:"Comparison operators", q:"Check that the password is NOT the default.",
c:`pw = "admin"
print(pw {{0}} "admin")`, a:["!="], d:["==","=","<>"], o:"False",
w:"!= means \"not equal to\". OCR reference language also uses !=. The old <> doesn't work in Python 3."},

{t:"Comparison operators", q:"Check whether the player has passed the pass mark of 50.",
c:`mark = 50
print(mark {{0}} 50)`, a:[">="], d:[">","<","!="], o:"True",
w:"\"At least 50\" includes 50 itself, so >= is needed. 50 > 50 is False."},

{t:"Comparison operators", q:"Check whether the child is under 12.",
c:`age = 12
print(age {{0}} 12)`, a:["<"], d:["<=","==",">="], o:"False",
w:"\"Under 12\" means strictly less than 12, so a 12-year-old doesn't count. <= would wrongly give True."},

{t:"Comparison operators", p:1, q:"What does this print?",
c:`print(10 <= 10, 10 < 10)`, a:["True False"], d:["True True","False False","False True"],
w:"<= includes equality, < does not. 10 is equal to 10 but not less than it."},

{t:"Comparison operators", p:1, q:"What does this print?",
c:`print(5 == 5.0)`, a:["True"], d:["False","TypeError","5"],
w:"== compares values, and the int 5 has the same value as the float 5.0."},

{t:"Comparison operators", p:1, q:"What does this print?",
c:`print("5" == 5)`, a:["False"], d:["True","TypeError","ValueError"],
w:"A string is never equal to a number, so this is False. It doesn't cause an error."},

{t:"Comparison operators", q:"Check whether the typed age is 18 or over.", i:["9"],
c:`age = {{0}}(input())
print(age >= 18)`, a:["int"], d:["str","input"], o:"False",
w:"As a string, \"9\" >= 18 would be a TypeError. Casting to int compares the numbers properly: 9 >= 18 is False."},

{t:"Comparison operators", q:"Check whether the temperature is below freezing.",
c:`temp = -3
freezing = temp {{0}} 0
print(freezing)`, a:["<"], d:[">",">=","=="], o:"True",
w:"Below freezing means less than 0. The result of the comparison, True, is stored in a Boolean variable."},

{t:"Comparison operators", q:"Check the two scores to see if it's a draw.",
c:`home = 2
away = 2
draw = {{0}}
print(draw)`, a:["home == away"], d:["home = away","home != away","home > away"], o:"True",
w:"home == away compares the scores and gives True. home = away inside another assignment is a syntax error."},

{t:"Comparison operators", p:1, q:"What does this print?",
c:`print("apple" < "banana")`, a:["True"], d:["False","TypeError","apple"],
w:"Strings are compared alphabetically (by character code), and \"a\" comes before \"b\"."},

{t:"Comparison operators", p:1, q:"What does this print?",
c:`print("Zoe" < "adam")`, a:["True"], d:["False","TypeError","Zoe"],
w:"Capital letters have smaller character codes than lower-case letters, so \"Z\" (90) is less than \"a\" (97)."},

{t:"Comparison operators", q:"Check whether the reading is within the safe limit of 100.",
c:`reading = 100
print(reading {{0}} 100)`, a:["<="], d:["<",">","!="], o:"True",
w:"\"Within the limit\" includes the limit itself, so use <= (less than or equal to)."},

{t:"Comparison operators", q:"Check whether the sensor reading has changed.",
c:`old = 21.5
new = 21.5
print(old {{0}} new)`, a:["!="], d:["==","=",">="], o:"False",
w:"!= is True only when the values differ. Both readings are 21.5, so nothing has changed and the result is False."},

{t:"Comparison operators", q:"Check whether the number is odd.",
c:`n = 9
print(n % 2 {{0}} 0)`, a:["!="], d:["==","=","<"], o:"True",
w:"An odd number leaves a remainder of 1 when divided by 2, so n % 2 != 0 is True."},

{t:"Comparison operators", q:"Compare the usernames without worrying about capitals.",
c:`a = "Sam"
b = "SAM"
print(a.lower() == {{0}})`, a:["b.lower()"], d:["b","b.upper()","a"], o:"True",
w:"== is case-sensitive, so \"Sam\" == \"SAM\" is False. Converting both to lower case first makes them match."},

{t:"Comparison operators", p:1, q:"What does this print?",
c:`x = 4
print(x > 2 == True)`, a:["False"], d:["True","TypeError","4"],
w:"Python chains this as x > 2 and 2 == True. 2 isn't equal to True (which is 1), so the result is False."},

{t:"Comparison operators", q:"Store whether there's enough stock for the order.",
c:`stock = 12
order = 15
ok = stock {{0}} order
print(ok)`, a:[">="], d:["<","<=","!="], o:"False",
w:"There's enough if stock is at least the order. 12 >= 15 is False, so the order can't be filled."},

{t:"Comparison operators", q:"Check whether the length is between 8 and 12 inclusive.",
c:`n = 12
print(8 <= n {{0}} 12)`, a:["<="], d:["<",">","!="], o:"True",
w:"8 <= n <= 12 checks both ends at once. With < instead, a length of exactly 12 would fail."},

{t:"Comparison operators", q:"Check whether the first total is the smaller one.",
c:`a = 3 * 4
b = 2 ** 4
print(a {{0}} b, b - a)`, a:["<"], d:[">","==",">="], o:"True 4",
w:"a is 12 and b is 16, so a < b is True. Both sums are worked out before the comparison."},

// ---------- Rounding & maths ----------
{t:"Rounding & maths", q:"Round the average to 1 decimal place.",
c:`avg = 7.6666
print(round(avg, {{0}}))`, a:["1"], d:["0","2","10"], o:"7.7",
w:"The second argument of round() is the number of decimal places."},

{t:"Rounding & maths", q:"Round the price to 2 decimal places.",
c:`price = 3.14159
print({{0}}(price, 2))`, a:["round"], d:["int","float","abs"], o:"3.14",
w:"round(x, 2) keeps 2 decimal places. int() would throw the decimals away completely."},

{t:"Rounding & maths", q:"Round the rating to the nearest whole number.",
c:`x = 4.6
print({{0}}(x))`, a:["round"], d:["int","float","abs"], o:"5",
w:"round() with one argument rounds to the nearest whole number and gives an int."},

{t:"Rounding & maths", p:1, q:"What does this print?",
c:`print(round(4.6), int(4.6))`, a:["5 4"], d:["5 5","4 4","4 5"],
w:"round() goes to the nearest whole number; int() just chops the decimal part off."},

{t:"Rounding & maths", q:"Print the difference between the two heights as a positive number.",
c:`a = 152
b = 167
print({{0}}(a - b))`, a:["abs"], d:["round","int","max"], o:"15",
w:"abs() gives the absolute value, removing any minus sign: abs(-15) is 15."},

{t:"Rounding & maths", q:"Print the highest of the three scores.",
c:`a = 14
b = 21
c = 9
print({{0}}(a, b, c))`, a:["max"], d:["min","abs","round"], o:"21",
w:"max() returns the largest of its arguments."},

{t:"Rounding & maths", q:"Print the fastest lap time (the smallest).",
c:`t1 = 61.2
t2 = 59.8
print({{0}}(t1, t2))`, a:["min"], d:["max","round","abs"], o:"59.8",
w:"The fastest lap is the shortest time, so you need min()."},

{t:"Rounding & maths", q:"Stop the score going below zero.",
c:`score = 3
score = score - 5
score = {{0}}(score, 0)
print(score)`, a:["max"], d:["min","abs","round"], o:"0",
w:"max(score, 0) picks 0 whenever score is negative, so the score can't drop below zero."},

{t:"Rounding & maths", q:"Find the square root of 81.",
c:`import math
print(math.{{0}}(81))`, a:["sqrt"], d:["root","pow","floor"], o:"9.0",
w:"math.sqrt() returns the square root as a float. You must import math first."},

{t:"Rounding & maths", q:"Work out how many buses of 40 seats are needed for 130 pupils.",
c:`import math
buses = math.{{0}}(130 / 40)
print(buses)`, a:["ceil"], d:["floor","sqrt"], o:"4",
w:"130 / 40 = 3.25, but you can't leave anyone behind, so round up with math.ceil() to 4."},

{t:"Rounding & maths", q:"Round 9.99 down to the whole number below.",
c:`import math
print(math.{{0}}(9.99))`, a:["floor"], d:["ceil","sqrt","fabs"], o:"9",
w:"math.floor() always rounds down to the whole number below."},

{t:"Rounding & maths", p:1, q:"What does this print?",
c:`import math
print(math.ceil(2.01))`, a:["3"], d:["2","2.0","3.0"],
w:"math.ceil() always rounds up to the next whole number, however small the decimal part."},

{t:"Rounding & maths", p:1, q:"What does this print?",
c:`import math
print(math.floor(-2.5))`, a:["-3"], d:["-2","-2.5","2"],
w:"floor() rounds down towards minus infinity, and -3 is below -2.5."},

{t:"Rounding & maths", q:"Find the hypotenuse of a 3, 4 triangle.",
c:`import math
a = 3
b = 4
c = math.sqrt({{0}})
print(c)`, a:["a ** 2 + b ** 2"], d:["a + b","a * 2 + b * 2","(a + b) ** 2"], o:"5.0",
w:"Pythagoras: c = √(a² + b²) = √(9 + 16) = √25 = 5.0."},

{t:"Rounding & maths", q:"Print the result rounded to the nearest 10.",
c:`n = 347
print(round(n, {{0}}))`, a:["-1"], d:["1","10","0"], o:"350",
w:"A negative number of places rounds to the left of the decimal point: -1 rounds to the nearest 10."},

{t:"Rounding & maths", p:1, q:"What does this print?",
c:`print(abs(-7) + abs(3))`, a:["10"], d:["-4","4","-10"],
w:"abs(-7) is 7 and abs(3) is 3, so the total is 10."},

{t:"Rounding & maths", q:"Calculate the mean and round it to 2 decimal places.",
c:`total = 20
n = 3
print(round({{0}}, 2))`, a:["total / n"], d:["total // n","n / total","total % n"], o:"6.67",
w:"20 / 3 = 6.666…, which rounds to 6.67. total // n would give 6."},

{t:"Rounding & maths", q:"Keep the volume between 0 and 10.",
c:`vol = 14
vol = {{0}}(vol, 10)
print(vol)`, a:["min"], d:["max","abs","round"], o:"10",
w:"min(vol, 10) caps the value at 10: if vol is bigger, 10 is chosen."},

{t:"Rounding & maths", q:"Print the area of a circle of radius 2 to 1 decimal place.",
c:`import math
area = math.{{0}} * 2 ** 2
print(round(area, 1))`, a:["pi"], d:["PI","sqrt","e"], o:"12.6",
w:"math.pi is π (3.14159…). π × 4 = 12.566…, which rounds to 12.6."},

{t:"Rounding & maths", p:1, q:"What does this print?",
c:`print(max(3, 8, 5) - min(3, 8, 5))`, a:["5"], d:["0","3","-5"],
w:"The largest is 8 and the smallest is 3, so the range is 8 - 3 = 5."},
]);
