// Theme: Functions & procedures (OCR J277 2.2.3 sub programs, random number generation). Validate with codeswipe/tools/validate.py
CodeSwipe.add("functions", [
// ---------- Procedures ----------
{t:"Procedures", q:"Define a procedure called greet.",
c:`{{0}} greet():
    print("Hello!")
greet()`, a:["def"], d:["function","procedure","define"], o:"Hello!",
w:"Python starts every sub program with def. OCR's reference language uses procedure greet() ... endprocedure instead."},

{t:"Procedures", q:"Call the procedure so the banner is shown.",
c:`def banner():
    print("== QUIZ ==")
{{0}}`, a:["banner()"], d:["banner","def banner()","call banner"], o:"== QUIZ ==",
w:"A procedure only runs when it is called, and the call needs brackets. Writing banner on its own just names it and does nothing."},

{t:"Procedures", q:"Show the menu twice.",
c:`def menu():
    print("1. Play")
    print("2. Quit")
menu()
{{0}}`, a:["menu()"], d:["menu","return menu","print(menu)"], o:"1. Play\n2. Quit\n1. Play\n2. Quit",
w:"Each call runs the whole body again. That is the point of a procedure: write the code once, use it many times."},

{t:"Procedures", q:"Finish the procedure header correctly.",
c:`def line(){{0}}
    print("-----")
line()`, a:[":"], d:[";","{","then"], o:"-----",
w:"A def line ends with a colon and the body is indented underneath it, just like if and for."},

{t:"Procedures", p:1, q:"What does this print?",
c:`def setup():
    x = 5
result = setup()
print(result)`, a:["None"], d:["5","0","x"],
w:"setup() has no return statement, so calling it gives back None. Storing a procedure's result is almost always a mistake."},

{t:"Procedures", p:1, q:"What does this print?",
c:`def show():
    print("A", end="")
print("B", end="")
show()
print("C")`, a:["BAC"], d:["ABC","BC","AC"],
w:"The def doesn't print anything by itself. B is printed first, then the call prints A, then C."},

{t:"Procedures", p:1, q:"What does this print?",
c:`def warn():
    print("Low battery")
print("Done")`, a:["Done"], d:["Low battery","Low battery Done","None"],
w:"Defining a procedure doesn't run it. warn() is never called, so only Done is printed."},

{t:"Procedures", q:"Print the receipt footer using the procedure.",
c:`def footer():
    print("Thank you!")
print("Total: 12")
{{0}}`, a:["footer()"], d:["footer","print(footer)","def footer()"], o:"Total: 12\nThank you!",
w:"footer() runs the procedure's body. print(footer) would show where the function is stored in memory, not its message."},

{t:"Procedures", q:"Draw a 3-row square of stars with the procedure.",
c:`def row():
    print("***")
for i in range({{0}}):
    row()`, a:["3"], d:["2","4","row"], o:"***\n***\n***",
w:"Procedures can be called inside a loop. range(3) runs the body 3 times, so row() is called 3 times."},

{t:"Procedures", q:"Count down using a procedure that prints.",
c:`def countdown():
    for n in range(3, 0, {{0}}):
        print(n)
countdown()`, a:["-1"], d:["1","0","-3"], o:"3\n2\n1",
w:"A step of -1 makes range count down. It stops before 0, so 3, 2, 1 are printed."},

{t:"Procedures", p:1, q:"What does this print?",
c:`def double_it(n):
    print(n * 2, end=" ")
x = double_it(4)
print(x)`, a:["8 None"], d:["8 8","8","None"],
w:"double_it prints 8 but has no return, so the value stored in x is None. Printing is not the same as returning."},

{t:"Procedures", q:"Make the procedure print the goal message.",
c:`def goal():
    {{0}}("GOAL!")
goal()`, a:["print"], d:["return","input","say"], o:"GOAL!",
w:"A procedure shows things on screen with print. return would hand the text back to the caller, which ignores it here, so nothing would appear."},

{t:"Procedures", q:"Show what calling a procedure gives back.",
c:`def log():
    pass
print(log() {{0}} None)`, a:["=="], d:["=","!=","<"], o:"True",
w:"log() has no return, so it gives None and None == None is True. A single = is assignment and can't be used inside print."},

{t:"Procedures", p:1, q:"What does this print?",
c:`def tick():
    print("tick", end=" ")
tick()
tick()
print("boom")`, a:["tick tick boom"], d:["tick boom","boom","tick tick"],
w:"Each call prints \"tick\" followed by a space instead of a new line, then boom finishes the line."},

{t:"Procedures", p:1, q:"What does this print?",
c:`beep()
def beep():
    print("beep")`, a:["NameError"], d:["beep","None","SyntaxError"],
w:"Python runs from the top. beep() is called before the def line has run, so the name beep doesn't exist yet."},

{t:"Procedures", q:"Pass a value to the procedure so it prints a 4-step ladder.",
c:`def ladder(n):
    for i in range(1, n + 1):
        print("#" * i)
ladder({{0}})`, a:["4"], d:["3","5","n"], o:"#\n##\n###\n####",
w:"range(1, n + 1) runs from 1 up to and including n, so ladder(4) prints 4 rows."},

{t:"Procedures", q:"Use the procedure to print a box border.",
c:`def border():
    print("+" + "-" * {{0}} + "+")
border()
print("| Hi |")
border()`, a:["4"], d:["3","5","6"], o:"+----+\n| Hi |\n+----+",
w:"The middle line \"| Hi |\" is 6 characters, so the border needs 4 dashes between the two + signs."},

{t:"Procedures", p:1, q:"What does this print?",
c:`def a():
    print("1", end="")
def b():
    print("2", end="")
b()
a()
b()`, a:["212"], d:["121","12","21"],
w:"The order the procedures are defined doesn't matter. They run in the order they are called: b, a, b."},

// ---------- Parameters ----------
{t:"Parameters", q:"Pass the name to the procedure.",
c:`def greet(name):
    print("Hi", name)
{{0}}`, a:["greet(\"Sam\")"], d:["greet()","greet = \"Sam\"","greet[\"Sam\"]"], o:"Hi Sam",
w:"The argument goes inside the brackets of the call. It is copied into the parameter name when the procedure starts."},

{t:"Parameters", q:"Add the parameter the procedure needs.",
c:`def square({{0}}):
    print(n * n)
square(6)`, a:["n"], d:["6","x","n * n"], o:"36",
w:"The body uses n, so the parameter must be called n. The value 6 passed in the call is stored in n."},

{t:"Parameters", q:"Call the procedure with two arguments.",
c:`def area(w, h):
    print(w * h)
area({{0}})`, a:["5, 3"], d:["5 3","5; 3","(5)(3)"], o:"15",
w:"Separate arguments with commas. 5 goes into w and 3 into h, giving 15."},

{t:"Parameters", q:"Pass the arguments in the right order.",
c:`def show(name, age):
    print(name, "is", age)
show({{0}})`, a:["\"Ali\", 14"], d:["14, \"Ali\"","name, age","Ali, 14"], o:"Ali is 14",
w:"Arguments are matched to parameters by position. Swapping them would print \"14 is Ali\". Without quotes, Ali would be an undefined variable."},

{t:"Parameters", q:"Call diff so that it prints 7.",
c:`def diff(a, b):
    print(a - b)
diff({{0}})`, a:["10, 3"], d:["3, 10","7","a, b"], o:"7",
w:"The first argument goes into a and the second into b. diff(3, 10) would work out 3 - 10, which is -7."},

{t:"Parameters", q:"Give the parameter a default value of 1.",
c:`def jump(times{{0}}):
    print("Jump " * times)
jump()`, a:["=1"], d:["==1",":1","=0"], o:"Jump",
w:"A default value is used when the call leaves that argument out. Here jump() uses times = 1."},

{t:"Parameters", p:1, q:"What does this print?",
c:`def power(base, exp=2):
    print(base ** exp)
power(3)`, a:["9"], d:["6","27","8"],
w:"exp wasn't given, so it uses its default of 2: 3 ** 2 = 9. In OCR's reference language ** is written ^."},

{t:"Parameters", p:1, q:"What does this print?",
c:`def power(base, exp=2):
    print(base ** exp)
power(2, 3)`, a:["8"], d:["4","9","6"],
w:"The second argument overrides the default, so exp is 3 and 2 ** 3 = 8."},

{t:"Parameters", p:1, q:"What does this print?",
c:`def add(a, b):
    print(a + b)
add(1)`, a:["TypeError"], d:["1","None","NameError"],
w:"add needs two arguments but the call only gives one, so Python raises a TypeError (missing argument)."},

{t:"Parameters", q:"Print the player's score using both parameters.",
c:`def report(player, score):
    print({{0}}, "scored", {{1}})
report("Mo", 42)`, a:["player","score"], d:["\"player\"","\"score\"","name"], o:"Mo scored 42",
w:"Use the parameter names without quotes. In quotes they become fixed text and would print the words player and score."},

{t:"Parameters", q:"Pass the variable's value into the procedure.",
c:`def shout(msg):
    print(msg.upper())
text = "go team"
shout({{0}})`, a:["text"], d:["msg","\"text\"","shout"], o:"GO TEAM",
w:"The argument can be a variable. Its value is copied into msg. msg only exists inside shout, so you can't pass it in from outside."},

{t:"Parameters", q:"Print the temperature with its unit.",
c:`def temp(value, unit):
    print(str(value) + unit)
temp({{0}}, {{1}})`, a:["21","\"C\""], d:["C","unit","value"], o:"21C",
w:"value is turned into a string with str() so it can be joined to unit. unit must be a string literal in quotes."},

{t:"Parameters", q:"Repeat the message the given number of times.",
c:`def say(msg, n):
    for i in range({{0}}):
        print(msg)
say("ok", 2)`, a:["n"], d:["msg","2 + 1","n - 1"], o:"ok\nok",
w:"Using the parameter n (not a fixed number) means the procedure works for any count the caller asks for."},

{t:"Parameters", q:"Make it print the words in the order \"right left\".",
c:`def f(x, y):
    print({{0}}, {{1}})
f("left", "right")`, a:["y","x"], d:["\"y\"","\"x\""], o:"right left",
w:"x gets \"left\" and y gets \"right\", matched by position. Printing y first swaps the words. In quotes, \"y\" would just print the letter y."},

{t:"Parameters", p:1, q:"What does this print?",
c:`def change(n):
    n = n + 10
x = 5
change(x)
print(x)`, a:["5"], d:["15","10","None"],
w:"n is a copy of x's value. Changing n inside the function doesn't change x, so x is still 5."},

{t:"Parameters", q:"Call with a named (keyword) argument.",
c:`def book(room, nights):
    print(room, nights)
book(nights=3, {{0}})`, a:["room=12"], d:["12","room==12","room: 12"], o:"12 3",
w:"Named arguments can be given in any order. Once you use a name, any arguments after it must be named too."},

{t:"Parameters", q:"Make the discount optional, defaulting to 0.",
c:`def price(cost, off{{0}}):
    print(cost - off)
price(20)
price(20, 5)`, a:["=0"], d:["=5","==0","=None"], o:"20\n15",
w:"With off=0 the first call uses the default, giving 20. The second call passes 5, giving 15."},

{t:"Parameters", p:1, q:"What does this print?",
c:`def greet(name, punc="!"):
    print("Hi " + name + punc)
greet("Jo", "?")`, a:["Hi Jo?"], d:["Hi Jo!","Hi Jo","Hi Jo!?"],
w:"\"?\" is passed for punc, so it replaces the default \"!\"."},

{t:"Parameters", p:1, q:"What does this print?",
c:`def show(a, b=1, c=2):
    print(a + b + c)
show(10, c=5)`, a:["16"], d:["17","13","15"],
w:"a is 10, b keeps its default 1 and c is named as 5: 10 + 1 + 5 = 16."},

{t:"Parameters", q:"Check the age passed in against the limit.",
c:`def can_vote(age):
    if age {{0}} 18:
        print("Yes")
    else:
        print("No")
can_vote(30)
can_vote(18)
can_vote(17)`, a:[">="], d:[">","<","=="], o:"Yes\nYes\nNo",
w:"18-year-olds can vote, so the test must include 18. With > the first call would print No."},

{t:"Parameters", q:"Pass the list into the procedure.",
c:`def show_all(items):
    for x in items:
        print(x)
show_all({{0}})`, a:["[\"pen\", \"ink\"]"], d:["\"pen\", \"ink\"","pen, ink"], o:"pen\nink",
w:"A whole list can be one argument. Without the square brackets it would be two separate arguments, which is too many."},

{t:"Parameters", q:"Pass the user's input into the procedure.",
c:`def welcome(user):
    print("Welcome,", user)
name = input("Name: ")
welcome({{0}})`, i:["Priya"], a:["name"], d:["user","\"name\"","input"], o:"Welcome, Priya",
w:"The value typed is stored in name, then passed as the argument. Inside welcome it is known as user."},

// ---------- Return values ----------
{t:"Return values", q:"Send the total back to the caller.",
c:`def total(a, b):
    {{0}} a + b
print(total(4, 5))`, a:["return"], d:["print","output","give"], o:"9",
w:"return hands the value back to wherever the function was called. With print inside, total would return None and print(None) would show None too."},

{t:"Return values", q:"Store the returned value and print it.",
c:`def triple(n):
    return n * 3
ans = {{0}}
print(ans)`, a:["triple(7)"], d:["triple","return 21","n * 3"], o:"21",
w:"Calling triple(7) gives back 21, which is stored in ans. In OCR's reference language a function ends with endfunction."},

{t:"Return values", p:1, q:"What does this print?",
c:`def half(n):
    print(n / 2, end=" ")
x = half(10)
print(x)`, a:["5.0 None"], d:["5.0 5.0","5.0","5 None"],
w:"half prints 5.0 but returns nothing, so x is None. Use return when the caller needs the value."},

{t:"Return values", q:"Return the larger of the two scores.",
c:`def bigger(a, b):
    if a > b:
        return {{0}}
    return {{1}}
print(bigger(12, 30))
print(bigger(30, 12))`, a:["a","b"], d:["a > b","print(a)"], o:"30\n30",
w:"The first return only runs if a is bigger. Otherwise the function carries on to the second return, which gives b."},

{t:"Return values", q:"Return True if the number is even.",
c:`def is_even(n):
    return n % 2 {{0}} 0
print(is_even(14))
print(is_even(9))`, a:["=="], d:["=","!=",">"], o:"True\nFalse",
w:"A comparison is already True or False, so you can return it directly. % is MOD in OCR's reference language."},

{t:"Return values", q:"Check whether a mark of 35 is a pass.",
c:`def passed(mark):
    return mark >= 40
if {{0}}:
    print("Pass")
else:
    print("Fail")`, a:["passed(35)"], d:["passed","passed(55)","mark >= 40"], o:"Fail",
w:"passed(35) returns False, so the else branch runs. Without brackets, passed is the function itself, which always counts as True. mark only exists inside the function, so mark >= 40 here causes a NameError."},

{t:"Return values", p:1, q:"What does this print?",
c:`def check(n):
    return n > 5
    print("checked")
print(check(8))`, a:["True"], d:["checked","False","checked True"],
w:"return ends the function straight away, so the print after it never runs. The code after a return is unreachable."},

{t:"Return values", q:"Stop searching as soon as the name is found.",
c:`def find(names, target):
    for n in names:
        if n == target:
            {{0}}
    return False
print(find(["Al", "Bo"], "Al"))`, a:["return True"], d:["print(True)","True","return False"], o:"True",
w:"return True exits the function at once, ending the loop early. Only if the loop finishes without a match does it reach return False."},

{t:"Return values", p:1, q:"What does this print?",
c:`def grade(m):
    if m >= 70:
        return "A"
    if m >= 50:
        return "B"
    return "C"
print(grade(85))`, a:["A"], d:["B","ABC","C"],
w:"85 >= 70, so the function returns \"A\" and stops. The later checks are never reached."},

{t:"Return values", q:"Return the average of the three marks.",
c:`def avg(a, b, c):
    return {{0}}
print(avg(6, 8, 10))`, a:["(a + b + c) / 3"], d:["a + b + c / 3","(a + b + c) // 4","print(a + b + c) / 3"], o:"8.0",
w:"Brackets make the addition happen first. Without them only c is divided by 3, because division comes before addition."},

{t:"Return values", q:"Convert Celsius to Fahrenheit and return the result.",
c:`def to_f(c):
    return c * 9 / 5 + {{0}}
print(to_f(100))`, a:["32"], d:["0","100","273"], o:"212.0",
w:"F = C x 9/5 + 32. The / operator always gives a float, so the result is 212.0, not 212."},

{t:"Return values", q:"Double the value that add() returns.",
c:`def add(a, b):
    return a + b
print(add(2, 3) {{0}} 2)`, a:["*"], d:["+","**","/"], o:"10",
w:"add(2, 3) returns 5, and the returned value can be used in a sum just like a number: 5 * 2 = 10."},

{t:"Return values", p:1, q:"What does this print?",
c:`def f():
    return 1
    return 2
print(f())`, a:["1"], d:["2","12","None"],
w:"The first return ends the function, so return 2 can never run."},

{t:"Return values", q:"Return a full name built from the parameters.",
c:`def full(first, last):
    return first + {{0}} + last
print(full("Ada", "King"))`, a:["\" \""], d:["\"\"","\",\"","\"  \""], o:"Ada King",
w:"Strings join with no gap, so you must add a space yourself between the two names."},

{t:"Return values", p:1, q:"What does this print?",
c:`def area(w, h):
    w * h
print(area(3, 4))`, a:["None"], d:["12","7","0"],
w:"The function works out 12 but never returns it. A function with no return statement gives back None."},

{t:"Return values", q:"Return the number of vowels in the word.",
c:`def vowels(w):
    n = 0
    for ch in w:
        if ch in "aeiou":
            n += 1
    {{0}}
print(vowels("banana"))`, a:["return n"], d:["print(n)","return w","return 0"], o:"3",
w:"return n is outside the loop, so it runs once after every letter has been checked. print(n) would show 3 then also print None."},

{t:"Return values", q:"Make the function give back two values.",
c:`def min_max(nums):
    return {{0}}
lo, hi = min_max([4, 9, 1])
print(lo, hi)`, a:["min(nums), max(nums)"], d:["max(nums), min(nums)","min(nums)","nums[0], nums[2]"], o:"1 9",
w:"Python can return several values separated by commas. They are unpacked in order into lo and hi."},

{t:"Return values", p:1, q:"What does this print?",
c:`def sign(n):
    if n < 0:
        return "neg"
    elif n == 0:
        return "zero"
print(sign(5))`, a:["None"], d:["neg","zero","pos"],
w:"5 matches neither condition, so the function reaches its end without a return and gives None."},

{t:"Return values", q:"Return whether the password is long enough.",
c:`def valid(pw):
    {{0}} len(pw) >= 8
print(valid("hunter2"))`, a:["return"], d:["print","if","return not"], o:"False",
w:"\"hunter2\" has 7 characters, so len(pw) >= 8 is False, and that boolean is returned."},

{t:"Return values", p:1, q:"What does this print?",
c:`def first_neg(nums):
    for n in nums:
        if n < 0:
            return n
    return 0
print(first_neg([3, -2, -8]))`, a:["-2"], d:["-8","0","3"],
w:"The loop returns as soon as it finds -2. It never gets as far as -8."},

// ---------- Local & global ----------
{t:"Local & global", p:1, q:"What does this print?",
c:`def setup():
    lives = 3
setup()
print(lives)`, a:["NameError"], d:["3","None","0"],
w:"lives is a local variable. It only exists while setup() is running, so the main program can't see it."},

{t:"Local & global", q:"Let the function change the global score.",
c:`score = 0
def win():
    {{0}} score
    score = score + 10
win()
print(score)`, a:["global"], d:["local","return","def"], o:"10",
w:"Without global, assigning to score inside win() creates a local variable (and here causes an error). In OCR's reference language you write global score = 0 in the main program."},

{t:"Local & global", p:1, q:"What does this print?",
c:`x = 5
def show():
    print(x)
show()`, a:["5"], d:["NameError","None","0"],
w:"A function can read a global variable as long as it doesn't assign to it."},

{t:"Local & global", p:1, q:"What does this print?",
c:`x = 5
def change():
    x = 99
change()
print(x)`, a:["5"], d:["99","None","NameError"],
w:"x = 99 inside the function makes a new local x, which shadows the global one. The global x is still 5."},

{t:"Local & global", p:1, q:"What does this print?",
c:`count = 1
def add():
    count = count + 1
add()
print(count)`, a:["UnboundLocalError"], d:["2","1","NameError"],
w:"Assigning to count makes it local in the whole function, so reading it on the right-hand side fails. You need global count, or a parameter and return."},

{t:"Local & global", q:"Return the local result so the main program can use it.",
c:`def make_total():
    t = 4 + 6
    {{0}}
t = make_total()
print(t)`, a:["return t"], d:["global t","print(t)","t"], o:"10",
w:"Returning the value is the clean way to get it out of a function. The main program's t is a different variable that receives the returned value."},

{t:"Local & global", p:1, q:"What does this print?",
c:`name = "Ann"
def rename():
    global name
    name = "Bea"
rename()
print(name)`, a:["Bea"], d:["Ann","None","NameError"],
w:"global name means the assignment changes the global variable rather than creating a local one."},

{t:"Local & global", p:1, q:"What does this print?",
c:`def f(n):
    n = n * 2
    return n
n = 3
f(n)
print(n)`, a:["3"], d:["6","None","12"],
w:"The returned 6 is thrown away because it isn't stored. The parameter n is local, so the global n is still 3."},

{t:"Local & global", q:"Store the returned value so it isn't lost.",
c:`def f(n):
    return n * 2
n = 3
{{0}}
print(n)`, a:["n = f(n)"], d:["f(n)","global n","f(n) = n"], o:"6",
w:"A returned value disappears unless you store it. n = f(n) replaces 3 with 6."},

{t:"Local & global", q:"Count the clicks in the global variable.",
c:`clicks = 0
def click():
    global clicks
    clicks {{0}} 1
click()
click()
print(clicks)`, a:["+="], d:["=","==","-="], o:"2",
w:"+= 1 adds one to the existing value each call. A plain = 1 would just set it to 1 every time."},

{t:"Local & global", p:1, q:"What does this print?",
c:`total = 0
def add(x):
    total = x
add(7)
print(total)`, a:["0"], d:["7","None","UnboundLocalError"],
w:"total = x creates a local total. It is a different variable from the global, which stays 0."},

{t:"Local & global", p:1, q:"What does this print?",
c:`def a():
    v = "local"
    return v
v = "global"
a()
print(v)`, a:["global"], d:["local","None","NameError"],
w:"v inside a() is local and separate. The global v was never changed."},

{t:"Local & global", q:"Use a parameter instead of a global.",
c:`def bonus({{0}}):
    return pts + 5
score = 20
score = bonus(score)
print(score)`, a:["pts"], d:["score","global pts","x"], o:"25",
w:"The parameter pts receives the value of score. Passing values in and returning them out avoids globals, which is good practice."},

{t:"Local & global", p:1, q:"What does this print?",
c:`x = 1
def outer():
    x = 2
    print(x, end=" ")
outer()
print(x)`, a:["2 1"], d:["2 2","1 1","1 2"],
w:"Inside outer, the local x (2) shadows the global. After the call, the global x is still 1."},

{t:"Local & global", q:"Reset the global level back to 1.",
c:`level = 7
def reset():
    {{0}}
    level = 1
reset()
print(level)`, a:["global level"], d:["level = 7","return level","local level"], o:"1",
w:"global level must come before the assignment, so that level = 1 changes the global level."},

{t:"Local & global", p:1, q:"What does this print?",
c:`def f():
    for i in range(3):
        pass
    return i
print(f())`, a:["2"], d:["3","0","NameError"],
w:"Loop variables stay set after the loop ends. range(3) finishes on 2, so i is 2 when it is returned."},

{t:"Local & global", p:1, q:"What does this print?",
c:`def f(a):
    b = a + 1
    return b
f(4)
print(b)`, a:["NameError"], d:["5","4","None"],
w:"b is local to f. Once f has finished, b no longer exists, so the main program gets a NameError."},

{t:"Local & global", q:"Read the global tax rate inside the function.",
c:`RATE = 0.2
def tax(price):
    return price * {{0}}
print(tax(50))`, a:["RATE"], d:["\"RATE\"","rate","0.02"], o:"10.0",
w:"A function can read a global without the global keyword. Python is case sensitive, so rate is a different (undefined) name."},

{t:"Local & global", q:"Each call should start the count afresh.",
c:`def count_a(word):
    {{0}}
    for ch in word:
        if ch == "a":
            n += 1
    return n
print(count_a("data"), count_a("cat"))`, a:["n = 0"], d:["global n","n += 0","return 0"], o:"2 1",
w:"n is local and set to 0 at the start of every call. Local variables are created fresh each time the function runs."},

{t:"Local & global", p:1, q:"What does this print?",
c:`n = 10
def show(n):
    print(n, end=" ")
show(3)
print(n)`, a:["3 10"], d:["10 10","3 3","10 3"],
w:"The parameter n is local to show and shadows the global n. The global n is still 10 afterwards."},

// ---------- Built-in functions ----------
{t:"Built-in functions", q:"Turn the typed age into a number before adding 1.",
c:`age = {{0}}(input("Age? "))
print(age + 1)`, i:["15"], a:["int"], d:["str","len","print"], o:"16",
w:"input() always returns a string. int() returns the whole-number version so you can do maths with it."},

{t:"Built-in functions", q:"Join the number onto the message.",
c:`lives = 3
print("Lives: " + {{0}}(lives))`, a:["str"], d:["int","len","float"], o:"Lives: 3",
w:"You can't + a string and an integer. str() returns the text \"3\", which can be joined on."},

{t:"Built-in functions", q:"Round the average to 1 decimal place.",
c:`avg = 7.46
print(round(avg, {{0}}))`, a:["1"], d:["0","2","10"], o:"7.5",
w:"round's second argument is the number of decimal places. round(7.46, 1) returns 7.5."},

{t:"Built-in functions", q:"Print the highest score.",
c:`scores = [12, 45, 33, 8]
print({{0}}(scores))`, a:["max"], d:["min","len","sum"], o:"45",
w:"max() returns the largest item in a list. min() would return 8."},

{t:"Built-in functions", q:"Print the coldest temperature.",
c:`temps = [4, -2, 7, 0]
print({{0}}(temps))`, a:["min"], d:["max","abs","len"], o:"-2",
w:"min() returns the smallest value. -2 is below 0, so it is the lowest."},

{t:"Built-in functions", q:"Work out the mean of the marks.",
c:`marks = [6, 8, 7, 9]
mean = {{0}} / {{1}}
print(mean)`, a:["sum(marks)","len(marks)"], d:["max(marks)","marks"], o:"7.5",
w:"sum() adds up the list (30) and len() counts the items (4), so the mean is 30 / 4 = 7.5."},

{t:"Built-in functions", q:"Print the distance between the two points.",
c:`a = 3
b = 10
print({{0}}(a - b))`, a:["abs"], d:["int","round","min"], o:"7",
w:"abs() returns the size of a number without its sign, so abs(-7) is 7. A distance can't be negative."},

{t:"Built-in functions", p:1, q:"What does this print?",
c:`print(round(2.5), round(3.5))`, a:["2 4"], d:["3 4","2 3","3 3"],
w:"Python rounds exact halves to the nearest even number (banker's rounding), so 2.5 gives 2 and 3.5 gives 4."},

{t:"Built-in functions", p:1, q:"What does this print?",
c:`print(int("7") + int("3"))`, a:["10"], d:["73","7 3","TypeError"],
w:"int() returns real numbers, so + adds them. Without int() the strings would join to make \"73\"."},

{t:"Built-in functions", p:1, q:"What does this print?",
c:`print(int(9.99))`, a:["9"], d:["10","9.99","9.0"],
w:"int() chops off the decimal part. It doesn't round, so 9.99 becomes 9."},

{t:"Built-in functions", p:1, q:"What does this print?",
c:`print(max("pear", "apple", "fig"))`, a:["pear"], d:["apple","fig","5"],
w:"With strings, max() compares alphabetically, not by length. \"p\" comes after \"a\" and \"f\", so \"pear\" is the biggest."},

{t:"Built-in functions", q:"Count the items in the basket.",
c:`basket = ["egg", "milk", "jam"]
n = {{0}}
print(n)`, a:["len(basket)"], d:["basket.len()","sum(basket)","count(basket)"], o:"3",
w:"len() returns the number of items in a list. In OCR's reference language you write basket.length."},

{t:"Built-in functions", q:"Make the typed price a decimal number.",
c:`price = {{0}}(input("Price? "))
print(price * 2)`, i:["2.5"], a:["float"], d:["int","str","round"], o:"5.0",
w:"float() keeps the decimal part. int(\"2.5\") would raise a ValueError, because the string isn't a whole number."},

{t:"Built-in functions", p:1, q:"What is printed when the user types 4?",
c:`n = input("Number? ")
print(n * 3)`, i:["4"], a:["444"], d:["12","4","TypeError"],
w:"input() returns the string \"4\", and a string times 3 repeats it. Wrap input in int() to get 12."},

{t:"Built-in functions", q:"Find the length of the typed name.",
c:`name = input("Name? ")
print({{0}})`, i:["Kofi Ade"], a:["len(name)"], d:["len(\"name\")","name","int(name)"], o:"8",
w:"len(name) measures what is stored in the variable. len(\"name\") would measure the 4-letter word name itself."},

{t:"Built-in functions", q:"Total the receipt and round it to 2 places.",
c:`items = [1.25, 0.99, 3.5]
print(round({{0}}, 2))`, a:["sum(items)"], d:["max(items)","len(items)","items"], o:"5.74",
w:"sum() returns the total, 5.74, and round(..., 2) keeps 2 decimal places, which is right for money."},

{t:"Built-in functions", q:"Check the PIN is exactly 4 digits.",
c:`pin = 7302
if len({{0}}) == 4:
    print("OK")`, a:["str(pin)"], d:["pin","int(pin)","pin[0]"], o:"OK",
w:"len() doesn't work on an integer, so str(pin) turns it into the text \"7302\" first."},

{t:"Built-in functions", q:"Print the range of the readings (highest minus lowest).",
c:`r = [14, 9, 22, 17]
print({{0}} - {{1}})`, a:["max(r)","min(r)"], d:["len(r)","sum(r)"], o:"13",
w:"The range is max - min: 22 - 9 = 13. The order matters, otherwise you get -13."},

{t:"Built-in functions", p:1, q:"What does this print?",
c:`print(int("3.5"))`, a:["ValueError"], d:["3","4","3.5"],
w:"int() can only convert strings that look like whole numbers. \"3.5\" needs float() first."},

// ---------- Random numbers ----------
{t:"Random numbers", q:"Load the random module.",
c:`{{0}} random
r = random.randint(1, 6)
print(1 <= r <= 6)`, a:["import"], d:["include","using","from"], o:"True",
w:"import random loads the library so you can use random.randint and friends."},

{t:"Random numbers", q:"Roll a fair six-sided dice.",
c:`import random
r = []
for i in range(600):
    r.append(random.randint({{0}}, {{1}}))
print(min(r), max(r))`, a:["1","6"], d:["0","7"], o:"1 6",
w:"randint includes BOTH ends, so randint(1, 6) gives 1 to 6. In OCR's reference language this is random(1, 6)."},

{t:"Random numbers", q:"Pick a random colour from the list.",
c:`import random
cols = ["red", "blue", "green"]
c = random.{{0}}(cols)
print(c in cols)`, a:["choice"], d:["randint","pick","random"], o:"True",
w:"random.choice() returns one item from a list. randint needs two numbers, not a list."},

{t:"Random numbers", p:1, q:"What does this print?",
c:`import random
n = random.randint(5, 5)
print(n)`, a:["5"], d:["4","6","ValueError"],
w:"Both ends are included, and 5 is the only number from 5 to 5, so it is always 5."},

{t:"Random numbers", q:"Make every random number two digits long.",
c:`import random
r = []
for i in range(2000):
    r.append(random.randint({{0}}, 99))
print(len(str(min(r))))`, a:["10"], d:["0","1","100"], o:"2",
w:"Two-digit numbers run from 10 to 99. Starting at 0 or 1 could give a one-digit number."},

{t:"Random numbers", q:"Make a random decimal between 0 and 1.",
c:`import random
x = random.{{0}}()
print(0 <= x < 1)`, a:["random"], d:["randint","choice","float"], o:"True",
w:"random.random() returns a float from 0.0 up to (but not including) 1.0. It takes no arguments."},

{t:"Random numbers", p:1, q:"What does this print?",
c:`import random
x = random.random()
print(type(x) == float)`, a:["True"], d:["False","0.5","None"],
w:"random.random() always returns a float, whatever its value."},

{t:"Random numbers", q:"Pick a random letter from the word.",
c:`import random
word = "ZEBRA"
ch = random.choice({{0}})
print(ch in word)`, a:["word"], d:["len(word)","word[5]","5"], o:"True",
w:"choice() works on a string too, returning one random character. It can't choose from an integer like len(word)."},

{t:"Random numbers", q:"Simulate rolling two dice many times.",
c:`import random
t = []
for i in range(2000):
    d1 = random.randint(1, {{0}})
    d2 = random.randint(1, 6)
    t.append({{1}})
print(min(t), max(t))`, a:["6","d1 + d2"], d:["7","12","d1 * d2"], o:"2 12",
w:"Each die gives 1 to 6, so the total of two dice runs from 2 to 12. Over 2000 rolls both extremes turn up."},

{t:"Random numbers", q:"Simulate a coin toss.",
c:`import random
side = random.choice({{0}})
print(side == "H" or side == "T")`, a:["[\"H\", \"T\"]"], d:["\"H\", \"T\"","H, T","[H, T]"], o:"True",
w:"choice() takes ONE argument: a list (or string). Without square brackets you pass two arguments, which is an error."},

{t:"Random numbers", q:"Generate a random multiple of 10 from 10 to 100.",
c:`import random
n = random.randint(1, 10) * {{0}}
print(n % 10 == 0, 10 <= n <= 100)`, a:["10"], d:["1","100","2"], o:"True True",
w:"randint(1, 10) gives 1 to 10, and multiplying by 10 gives 10, 20, ... 100. % is MOD in OCR's reference language."},

{t:"Random numbers", q:"Fill a list with 5 random dice rolls.",
c:`import random
rolls = []
for i in range(5):
    rolls.{{0}}(random.randint(1, 6))
print(len(rolls))`, a:["append"], d:["add","insert","push"], o:"5",
w:"append() adds each roll to the end of the list, so it ends up with 5 items whatever the values are."},

{t:"Random numbers", q:"Return a random dice roll from a function.",
c:`import random
def roll():
    {{0}} random.randint(1, 6)
r = roll()
print(r in range(1, 7))`, a:["return"], d:["print","global","import"], o:"True",
w:"The function must return the number. With print, roll() would return None and None isn't in the range."},

{t:"Random numbers", p:1, q:"What does this print?",
c:`import random
n = randint(1, 10)
print(n > 0)`, a:["NameError"], d:["True","False","ImportError"],
w:"After import random you must write random.randint. On its own, randint is an unknown name."},

{t:"Random numbers", q:"Use the shortcut import so randint works on its own.",
c:`{{0}} random import randint
n = randint(1, 4)
print(1 <= n <= 4)`, a:["from"], d:["import","use","with"], o:"True",
w:"from random import randint lets you call randint without the random. prefix."},

{t:"Random numbers", q:"Make a random 4-digit PIN as a string.",
c:`import random
pin = ""
for i in range({{0}}):
    pin += str(random.randint(0, 9))
print(len(pin))`, a:["4"], d:["3","5","9"], o:"4",
w:"The loop adds one random digit per pass, so 4 passes give 4 characters. Digits run from 0 to 9."},

{t:"Random numbers", q:"Shuffle the deck in place.",
c:`import random
deck = [1, 2, 3, 4]
random.{{0}}(deck)
print(sorted(deck))`, a:["shuffle"], d:["mix","sort","order"], o:"[1, 2, 3, 4]",
w:"shuffle() reorders the list itself. Sorting afterwards proves no cards were lost or added."},

{t:"Random numbers", q:"Pick a random index for the list.",
c:`import random
names = ["Al", "Bo", "Cy"]
top = {{0}}
for k in range(300):
    i = random.randint(0, top)
    x = names[i]
print("No errors")`, a:["len(names) - 1"], d:["len(names)","3"], o:"No errors",
w:"randint includes its top value, so the last valid index len(names) - 1 must be the limit. With len(names), index 3 is eventually picked and causes an IndexError."},

// ---------- Calling functions ----------
{t:"Calling functions", q:"Use square() inside the area function.",
c:`def square(n):
    return n * n
def circle_ish(r):
    return 3 * {{0}}
print(circle_ish(3))`, a:["square(r)"], d:["square(n)","square","r * 2"], o:"27",
w:"One function can call another. square(r) returns 9, then 3 * 9 = 27. n only exists inside square."},

{t:"Calling functions", q:"Pass one function's result straight into another.",
c:`def add(a, b):
    return a + b
def double(x):
    return x * 2
print(double({{0}}))`, a:["add(3, 4)"], d:["add","add(3)","3 + 4 * 2"], o:"14",
w:"Nested calls run from the inside out: add(3, 4) returns 7, which is then passed to double, giving 14."},

{t:"Calling functions", q:"Use the returned value in a bigger expression.",
c:`def vat(p):
    return p * 0.2
price = 50
total = price {{0}} vat(price)
print(total)`, a:["+"], d:["*","-","="], o:"60.0",
w:"vat(50) returns 10.0, which can be added like any number: 50 + 10.0 = 60.0."},

{t:"Calling functions", q:"Validate the input with a helper function.",
c:`def valid(n):
    return 1 <= n <= 10
n = int(input("1-10: "))
if {{0}}:
    print("Accepted")
else:
    print("Rejected")`, i:["12"], a:["valid(n)"], d:["not valid(n)","valid","n"], o:"Rejected",
w:"valid(12) returns False, so the else branch runs. Writing valid without brackets is the function itself, which always counts as True."},

{t:"Calling functions", q:"Call the helper from inside the procedure.",
c:`def stars(n):
    return "*" * n
def rating(name, n):
    print(name, {{0}})
rating("Pizza", 4)`, a:["stars(n)"], d:["stars","n","\"*\" + n"], o:"Pizza ****",
w:"rating calls stars(n), which returns \"****\". A procedure can use functions to build what it prints."},

{t:"Calling functions", q:"Find the biggest of three using max2 twice.",
c:`def max2(a, b):
    if a > b:
        return a
    return b
print(max2({{0}}, 9))`, a:["max2(4, 11)"], d:["max2(4)","4, 11","max2"], o:"11",
w:"max2(4, 11) returns 11, then max2(11, 9) returns 11. Nesting calls reuses one function to solve a bigger problem."},

{t:"Calling functions", q:"Loop over the list, calling the function on each item.",
c:`def is_pass(m):
    return m >= 50
marks = [62, 38, 75]
for m in marks:
    print({{0}})`, a:["is_pass(m)"], d:["is_pass(marks)","is_pass","m >= 70"], o:"True\nFalse\nTrue",
w:"Each pass of the loop calls is_pass with one mark. Passing the whole list would compare a list with 50, which is a TypeError."},

{t:"Calling functions", q:"Count the passes using the boolean function.",
c:`def is_pass(m):
    return m >= 50
n = 0
for m in [62, 38, 75, 50]:
    if is_pass(m):
        n {{0}} 1
print(n)`, a:["+="], d:["=","-=","=="], o:"3",
w:"is_pass returns True for 62, 75 and 50 (>= includes 50), so n goes up 3 times."},

{t:"Calling functions", q:"Convert, then round, using nested calls.",
c:`def to_km(miles):
    return miles * 1.609
print({{0}}(to_km(10), 1))`, a:["round"], d:["int","str","abs"], o:"16.1",
w:"to_km(10) returns 16.09, and round(..., 1) gives 16.1. Built-in and home-made functions can be nested together."},

{t:"Calling functions", q:"Get the area, then the volume, from two functions.",
c:`def area(w, d):
    return w * d
def volume(w, d, h):
    return {{0}} * h
print(volume(2, 3, 4))`, a:["area(w, d)"], d:["area(w, h)","area","w + d"], o:"24",
w:"volume reuses area: area(2, 3) is 6 and 6 * 4 = 24. Reusing functions avoids writing the same code twice."},

{t:"Calling functions", q:"Print the message only if the username is free.",
c:`def taken(u):
    return u in ["ada", "bob"]
user = "cy"
if {{0}} taken(user):
    print(user, "is free")`, a:["not"], d:["","!","is"], o:"cy is free",
w:"taken(\"cy\") returns False, and not False is True, so the message prints. Python uses not, where other languages use !."},

{t:"Calling functions", q:"Call the function with the right number of arguments.",
c:`def bmi(kg, m):
    return round(kg / m ** 2)
print(bmi({{0}}))`, a:["72, 1.8"], d:["1.8, 72","72","kg, m"], o:"22",
w:"kg comes first and m second. Swapping them gives a tiny value that rounds to 0."},

{t:"Calling functions", q:"Make main() run the program.",
c:`def hello():
    print("Hello")
def main():
    hello()
    print("Bye")
{{0}}`, a:["main()"], d:["hello()","main","def main()"], o:"Hello\nBye",
w:"main calls hello, then prints Bye. Many programs put the steps inside main() and call it once at the bottom."},

{t:"Calling functions", q:"Join the results of two function calls.",
c:`def first(s):
    return s[0]
def last(s):
    return s[-1]
w = "python"
print({{0}} + {{1}})`, a:["first(w)","last(w)"], d:["first","w[1]"], o:"pn",
w:"first(w) returns \"p\" and last(w) returns \"n\". Returned strings can be joined with + like any others."},

{t:"Calling functions", q:"Keep asking until the helper says the input is valid.",
c:`def ok(pw):
    return len(pw) >= 6
pw = input()
while {{0}}:
    pw = input()
print("Saved", pw)`, i:["cat","kitten"], a:["not ok(pw)"], d:["ok(pw)","not ok","len(pw) > 6"], o:"Saved kitten",
w:"The loop repeats while the password is NOT ok. \"cat\" fails, \"kitten\" passes, so the loop stops."},

{t:"Calling functions", q:"Use the function's result as a list index.",
c:`def best(scores):
    return scores.index(max(scores))
names = ["Raj", "Ann", "Li"]
scores = [4, 9, 7]
print(names[{{0}}])`, a:["best(scores)"], d:["best(names)","max(scores)","best"], o:"Ann",
w:"best returns 1, the position of the top score, so names[1] is \"Ann\". max(scores) is 9, which is too big for an index."},

{t:"Calling functions", q:"Apply the discount function twice.",
c:`def half(p):
    return p / 2
print({{0}})`, a:["half(half(80))"], d:["half(80) / 2 / 2","half(80, 2)","half * 2"], o:"20.0",
w:"half(80) gives 40.0, then half(40.0) gives 20.0. The inner call always runs first."},

{t:"Calling functions", p:1, q:"What does this print?",
c:`def inc(n):
    return n + 1
print(inc(inc(inc(0))))`, a:["3"], d:["1","0","inc(3)"],
w:"Work from the inside out: inc(0) is 1, inc(1) is 2, inc(2) is 3."},

{t:"Calling functions", q:"Add the two squares, as in Pythagoras.",
c:`def sq(n):
    return n * n
print(sq(3) {{0}} sq(4))`, a:["+"], d:["*","-"], o:"25",
w:"sq(3) is 9 and sq(4) is 16, so 9 + 16 = 25. Each call returns a value that is used in the sum."},

{t:"Calling functions", p:1, q:"What does this print?",
c:`def a():
    return "A" + b()
def b():
    return "B"
print(a())`, a:["AB"], d:["BA","NameError","A"],
w:"b is defined before a() is actually called, so a can use it. a returns \"A\" joined to b's \"B\"."},

// ---------- Trace the function ----------
{t:"Trace the function", p:1, q:"What does this print?",
c:`def f(x):
    return x * 2 + 1
print(f(f(1)))`, a:["7"], d:["3","5","9"],
w:"f(1) = 1 * 2 + 1 = 3, then f(3) = 3 * 2 + 1 = 7."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def total(nums):
    t = 0
    for n in nums:
        t = t + n
    return t
print(total([2, 5, 8]))`, a:["15"], d:["8","3","258"],
w:"t goes 0, 2, 7, 15. This is the classic running-total algorithm."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def mystery(s):
    r = ""
    for ch in s:
        r = ch + r
    return r
print(mystery("abc"))`, a:["cba"], d:["abc","bca","c"],
w:"Each character is put in FRONT of r: \"a\", \"ba\", \"cba\". The function reverses the string."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def count(nums, x):
    c = 0
    for n in nums:
        if n > x:
            c += 1
    return c
print(count([5, 9, 2, 9], 5))`, a:["2"], d:["3","1","4"],
w:"Only the two 9s are greater than 5. The 5 itself isn't counted, because > doesn't include equal values."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def fact(n):
    r = 1
    for i in range(1, n + 1):
        r = r * i
    return r
print(fact(4))`, a:["24"], d:["10","6","4"],
w:"r goes 1, 2, 6, 24. That is 4 factorial: 1 x 2 x 3 x 4."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def f(a, b):
    if a > b:
        return a - b
    return b - a
print(f(3, 8) + f(8, 3))`, a:["10"], d:["0","5","-10"],
w:"Both calls return the gap between the numbers, 5, so the sum is 10."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def g(n):
    while n > 10:
        n = n // 2
    return n
print(g(100))`, a:["6"], d:["12","3","50"],
w:"n goes 100, 50, 25, 12, 6. 6 isn't more than 10, so the loop stops. // is DIV in OCR's reference language."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`x = 1
def h():
    global x
    x = x * 3
h()
h()
print(x)`, a:["9"], d:["3","6","1"],
w:"Each call triples the global x: 1, then 3, then 9."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def check(pw):
    if len(pw) < 6:
        return "short"
    if pw.isalpha():
        return "weak"
    return "ok"
print(check("letmein"))`, a:["weak"], d:["short","ok","None"],
w:"\"letmein\" has 7 characters so it isn't short, but it is all letters, so the second return gives \"weak\"."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def f(n):
    print(n, end=" ")
    return n + 1
x = f(f(1))
print(x)`, a:["1 2 3"], d:["2 3","1 2","3"],
w:"The inner f(1) prints 1 and returns 2. Then f(2) prints 2 and returns 3, which is stored in x and printed."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def lowest(nums):
    lo = nums[0]
    for n in nums:
        if n < lo:
            lo = n
    return lo
print(lowest([8, 3, 6, 1, 4]))`, a:["1"], d:["8","3","4"],
w:"lo starts at 8 and is replaced by 3, then by 1. This is how min() works inside."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def f(n):
    if n % 3 == 0:
        return "Fizz"
    return str(n)
r = ""
for i in range(1, 5):
    r = r + f(i)
print(r)`, a:["12Fizz4"], d:["123Fizz4","Fizz","1234"],
w:"f returns \"Fizz\" for 3 and the number as text otherwise, so the pieces 1, 2, Fizz, 4 are joined."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def p(n):
    if n <= 0:
        return 0
    return n + p(n - 1)
print(p(4))`, a:["10"], d:["4","24","0"],
w:"The function calls itself (recursion): 4 + 3 + 2 + 1 + 0 = 10."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def f(nums):
    nums.append(0)
data = [1, 2]
f(data)
print(len(data))`, a:["3"], d:["2","0","None"],
w:"A list passed to a function isn't copied. append changes the same list that data refers to, so it now has 3 items."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def grade(m):
    if m >= 80:
        return "A"
    elif m >= 60:
        return "B"
    return "C"
print(grade(60) + grade(59))`, a:["BC"], d:["AB","CC","BB"],
w:"60 >= 60 is True, so the first call gives \"B\". 59 fails both tests, so the second gives \"C\"."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def digits(n):
    c = 0
    while n > 0:
        n = n // 10
        c += 1
    return c
print(digits(4096))`, a:["4"], d:["3","5","409"],
w:"Each // 10 removes one digit: 409, 40, 4, 0. That took 4 passes, so the number has 4 digits."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def m(a, b):
    return a % b
print(m(17, 5), m(5, 17))`, a:["2 5"], d:["2 2","3 5","2 0"],
w:"17 MOD 5 is 2. 5 MOD 17 is 5, because 17 goes into 5 zero times leaving 5."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def show(n):
    if n > 0:
        print(n, end="")
        show(n - 1)
show(3)
print()`, a:["321"], d:["123","3","3210"],
w:"show prints 3 then calls itself with 2, then 1. When n reaches 0 nothing more is printed."},

{t:"Trace the function", p:1, q:"What does this print?",
c:`def f(s):
    n = 0
    for ch in s:
        if ch == s[0]:
            n += 1
    return n
print(f("banana"), f("anna"))`, a:["1 2"], d:["3 2","1 1","0 2"],
w:"\"banana\" has only one \"b\". \"anna\" starts with \"a\" and has two of them."},
]);
