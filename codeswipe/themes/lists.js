// Theme: Lists & 2D arrays (OCR J277 2.2.3 arrays (1D and 2D) and records). Validate with codeswipe/tools/validate.py
CodeSwipe.add("lists", [
// ---------- Creating lists ----------
{t:"Creating lists", q:"Start with an empty list of marks.",
c:`marks = {{0}}
print(marks)`, a:["[]"], d:["{}","()","[0]"], o:"[]",
w:"Square brackets with nothing inside make an empty list. Curly brackets make an empty dictionary, not a list."},

{t:"Creating lists", q:"Make a list of 5 zeros for the tally.",
c:`tally = [0] {{0}} 5
print(tally)`, a:["*"], d:["+","x"], o:"[0, 0, 0, 0, 0]",
w:"[0] * 5 repeats the list five times. In OCR pseudocode you would write array tally[5] and set each one to 0."},

{t:"Creating lists", p:1, q:"What does this print?",
c:`ages = [14, 15, 15, 16]
print(len(ages))`, a:["4"], d:["3","16","60"],
w:"len() counts the items in the list, not their total. Repeated values still count."},

{t:"Creating lists", q:"Print the coldest reading, 9.",
c:`temps = [12, 15, 9, 18]
print(temps[{{0}}])`, a:["2"], d:["3","1","-1"], o:"9",
w:"List indexes start at 0, so 12 is index 0, 15 is 1 and 9 is index 2."},

{t:"Creating lists", p:1, q:"What does this print?",
c:`team = ["Ava", "Ben", "Cal", "Dee"]
print(team[-1])`, a:["Dee"], d:["Ava","Cal","IndexError"],
w:"A negative index counts back from the end, so -1 is always the last item."},

{t:"Creating lists", p:1, q:"What does this print?",
c:`nums = [4, 8, 15]
print(nums[3])`, a:["IndexError"], d:["15","None","0"],
w:"A list of 3 items has indexes 0, 1 and 2. Index 3 doesn't exist, so Python raises an IndexError."},

{t:"Creating lists", q:"Print the last day using len().",
c:`days = ["Mon", "Tue", "Wed"]
print(days[len(days) {{0}} 1])`, a:["-"], d:["+","*"], o:"Wed",
w:"The last index is len(days) - 1, because counting starts at 0. In OCR pseudocode that's days.length - 1."},

{t:"Creating lists", q:"Store three names in a list.",
c:`names = {{0}}
print(names)`, a:["[\"Ann\", \"Bo\", \"Cy\"]"], d:["\"Ann\", \"Bo\", \"Cy\"","[\"Ann\" \"Bo\" \"Cy\"]","{\"Ann\", \"Bo\", \"Cy\"}"], o:"['Ann', 'Bo', 'Cy']",
w:"Items go inside square brackets, separated by commas. Without commas Python joins the strings into one item."},

{t:"Creating lists", p:1, q:"What does this print?",
c:`pair = [1, 2] * 3
print(len(pair))`, a:["6"], d:["2","3","5"],
w:"[1, 2] * 3 repeats the list three times, giving six items: [1, 2, 1, 2, 1, 2]."},

{t:"Creating lists", q:"Make a blank noughts and crosses board of 9 squares.",
c:`board = ["-"] * {{0}}
print(len(board))`, a:["9"], d:["8","3","10"], o:"9",
w:"A 3 by 3 board has 9 squares, and [\"-\"] * 9 makes 9 separate \"-\" items."},

{t:"Creating lists", q:"Print the second-to-last song.",
c:`s = ["Hey", "Run", "Fly", "Sky", "Up"]
print(s[{{0}}])`, a:["-2"], d:["-1","2","4"], o:"Sky",
w:"-1 is the last item and -2 is the one before it."},

{t:"Creating lists", p:1, q:"What does this print?",
c:`nums = [10, 20, 30]
print(nums[-4])`, a:["IndexError"], d:["10","30","None"],
w:"Negative indexes only go back as far as -3 for a 3-item list. -4 is out of range."},

{t:"Creating lists", q:"Only print the item if the index is valid.",
c:`stock = ["pen", "pad", "ink", "tape"]
for i in [2, 4]:
    if i {{0}} len(stock):
        print(stock[i])
    else:
        print("No item")`, a:["<"], d:["<=",">","=="], o:"ink\nNo item",
w:"Valid indexes are 0 to len - 1, so the check must be i < len(stock). Using <= would let 4 through and crash."},

{t:"Creating lists", p:1, q:"What does this print?",
c:`letters = list("cab")
print(letters)`, a:["['c', 'a', 'b']"], d:["['cab']","['a', 'b', 'c']","cab"],
w:"list() on a string makes a list with one item per character, in the original order."},

{t:"Creating lists", q:"Make the list [1, 2, 3, 4, 5].",
c:`nums = list(range({{0}}))
print(nums)`, a:["1, 6"], d:["1, 5","5","0, 5"], o:"[1, 2, 3, 4, 5]",
w:"range stops before its end value, so range(1, 6) gives 1 up to 5."},

{t:"Creating lists", q:"Print the drink the user picks by number.",
c:`menu = ["Tea", "Coffee", "Juice"]
n = {{0}}(input())
print(menu[n])`, a:["int"], d:["str","float"], i:["2"], o:"Juice",
w:"input() returns a string, and a list index must be an integer, so cast it with int()."},

{t:"Creating lists", p:1, q:"What is printed when the user types 1?",
c:`menu = ["Tea", "Coffee", "Juice"]
n = int(input())
print(menu[n - 1])`, a:["Tea"], i:["1"], d:["Coffee","Juice","IndexError"],
w:"Users count from 1 but lists count from 0, so subtracting 1 turns choice 1 into index 0."},

{t:"Creating lists", q:"Print the first and last planets.",
c:`p = ["Mercury", "Venus", "Mars"]
print(p[{{0}}], p[{{1}}])`, a:["0","-1"], d:["1","3"], o:"Mercury Mars",
w:"Index 0 is the first item and -1 is the last. Index 3 would be out of range for 3 items."},

// ---------- Changing lists ----------
{t:"Changing lists", q:"Add milk to the end of the basket.",
c:`basket = ["bread", "eggs"]
basket.{{0}}("milk")
print(basket)`, a:["append"], d:["add","insert","push"], o:"['bread', 'eggs', 'milk']",
w:"append() adds one item to the end of a list. Python lists have no add() or push() method."},

{t:"Changing lists", q:"Correct Ben's score to 9.",
c:`scores = [7, 4, 8]  # Ann, Ben, Cy
scores[{{0}}] = 9
print(scores)`, a:["1"], d:["2","0"], o:"[7, 9, 8]",
w:"Ben is the second item, which is index 1. Assigning to an index replaces the item there."},

{t:"Changing lists", q:"Put Zoe at the front of the queue.",
c:`queue = ["Ali", "Bea"]
queue.insert({{0}}, "Zoe")
print(queue)`, a:["0"], d:["1","-1"], o:"['Zoe', 'Ali', 'Bea']",
w:"insert(index, item) puts the item before whatever is at that index. Index 0 is the very front."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`stack = [4, 7, 1]
x = stack.pop()
print(x)`, a:["1"], d:["4","7","[4, 7]"],
w:"pop() with no index removes and returns the last item, just like taking the top off a stack."},

{t:"Changing lists", q:"Take the pen out of the pencil case by value.",
c:`case = ["ruler", "pen", "rubber"]
case.{{0}}("pen")
print(case)`, a:["remove"], d:["pop","delete","discard"], o:"['ruler', 'rubber']",
w:"remove() deletes by value. pop() expects an index number, so pop(\"pen\") would be a TypeError."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`v = [2, 5, 2, 8]
v.remove(2)
print(v)`, a:["[5, 2, 8]"], d:["[5, 8]","[2, 5, 8]","[2, 2, 8]"],
w:"remove() only deletes the first matching value. The second 2 stays in the list."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`pets = ["cat", "dog"]
pets.remove("fish")
print(pets)`, a:["ValueError"], d:["['cat', 'dog']","IndexError","None"],
w:"remove() raises a ValueError if the value isn't in the list. Check with in first to be safe."},

{t:"Changing lists", q:"Delete the first item by its index.",
c:`names = ["Old", "Ann", "Raj"]
{{0}} names[0]
print(names)`, a:["del"], d:["remove","pop","clear"], o:"['Ann', 'Raj']",
w:"del is a statement, not a method, so it goes in front: del names[0]."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`a = [1, 2]
a.append([3, 4])
print(len(a))`, a:["3"], d:["4","2","6"],
w:"append() adds its argument as ONE item, even if that argument is itself a list. So a is [1, 2, [3, 4]]."},

{t:"Changing lists", q:"Add 7 onto the end by joining lists.",
c:`nums = [1, 4]
nums = nums {{0}} [7]
print(nums)`, a:["+"], d:["*","-","and"], o:"[1, 4, 7]",
w:"+ joins (concatenates) two lists into a new one. That's why 7 must be inside brackets."},

{t:"Changing lists", q:"Take the most recent page off the history stack.",
c:`pages = ["home", "news"]
pages.append("sport")
last = pages.{{0}}()
print(last)`, a:["pop"], d:["remove","clear","reverse"], o:"sport",
w:"pop() removes and returns the last item added. A stack is last in, first out."},

{t:"Changing lists", q:"Serve the first customer in the queue.",
c:`q = ["Ann", "Bob", "Cy"]
served = q.pop({{0}})
print(served, q)`, a:["0"], d:["1","-1"], o:"Ann ['Bob', 'Cy']",
w:"A queue is first in, first out, so serve from the front with pop(0)."},

{t:"Changing lists", q:"Give player 2 a bonus point.",
c:`pts = [10, 12, 8]
pts[2] {{0}} 1
print(pts)`, a:["+="], d:["=","=="], o:"[10, 12, 9]",
w:"+= 1 adds 1 to what's already there. Plain = would replace the score with 1."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`x = ["a", "b", "c"]
del x[1]
print(x)`, a:["['a', 'c']"], d:["['a', 'b']","['b', 'c']","['a', None, 'c']"],
w:"del x[1] removes the item at index 1, and the items after it shuffle down."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`x = [1, 2]
x.insert(10, 3)
print(x)`, a:["[1, 2, 3]"], d:["IndexError","[1, 2]","[3, 1, 2]"],
w:"insert() with an index past the end just adds the item at the end. It doesn't crash."},

{t:"Changing lists", p:1, q:"What does this print?",
c:`x = [1, 2, 3]
x[3] = 4
print(x)`, a:["IndexError"], d:["[1, 2, 3, 4]","[1, 2, 4]","None"],
w:"You can't assign to an index that doesn't exist yet. Use append() to grow a list."},

{t:"Changing lists", q:"Add eggs, then remove milk from the list.",
c:`shop = ["milk", "jam"]
shop.{{0}}("eggs")
shop.{{1}}("milk")
print(shop)`, a:["append","remove"], d:["insert","pop"], o:"['jam', 'eggs']",
w:"append() adds to the end and remove() deletes by value. insert() needs an index too, and pop() takes an index, not a value."},

{t:"Changing lists", q:"Swap the first two runners.",
c:`r = ["Kim", "Lee", "Max"]
r[0], r[1] = {{0}}
print(r)`, a:["r[1], r[0]"], d:["r[0], r[1]","r[1], r[1]"], o:"['Lee', 'Kim', 'Max']",
w:"Python can assign two values at once, which swaps them in one line. In OCR pseudocode you'd use a temp variable."},

{t:"Changing lists", q:"Empty the list completely.",
c:`log = ["a", "b", "c"]
log.{{0}}()
print(log)`, a:["clear"], d:["pop","remove","reverse"], o:"[]",
w:"clear() removes every item. pop() would only remove the last one."},

// ---------- Looping lists ----------
{t:"Looping lists", q:"Add up all the scores.",
c:`scores = [12, 7, 9]
total = 0
for s {{0}} scores:
    total = total + s
print(total)`, a:["in"], d:["of","=","range"], o:"28",
w:"for s in scores visits each item in turn. OCR pseudocode loops over indexes instead: for i = 0 to scores.length - 1."},

{t:"Looping lists", q:"Total the marks using their indexes.",
c:`m = [4, 9, 6]
total = 0
for i in range(len(m)):
    total = total + {{0}}
print(total)`, a:["m[i]"], d:["i","len(m)","m"], o:"19",
w:"i is only the index (0, 1, 2). m[i] is the value stored there, which is what you want to add."},

{t:"Looping lists", q:"Print a numbered register starting at 1.",
c:`names = ["Ali", "Bo", "Cy"]
for i in range({{0}}):
    print(i + 1, names[i])`, a:["len(names)"], d:["names","len(names)-1","len(names)+1"], o:"1 Ali\n2 Bo\n3 Cy",
w:"range(len(names)) gives every valid index. The + 1 is only for display, so the register starts at 1."},

{t:"Looping lists", q:"Find the highest temperature without max().",
c:`temps = [14, 19, 11, 17]
best = temps[0]
for t in temps:
    if t {{0}} best:
        best = t
print(best)`, a:[">"], d:["<","=="], o:"19",
w:"Whenever an item beats the best so far, it becomes the new best. Starting with the first item avoids guessing a start value."},

{t:"Looping lists", q:"Find the cheapest price without min().",
c:`prices = [2.5, 1.2, 3.0]
low = {{0}}
for p in prices:
    if p < low:
        low = p
print(low)`, a:["prices[0]"], d:["0","prices","1"], o:"1.2",
w:"Start with a real item from the list. Starting at 0 fails because no price is ever less than 0."},

{t:"Looping lists", q:"Count the passes. The pass mark is 40 or more.",
c:`marks = [55, 40, 38, 71]
count = 0
for m in marks:
    if m {{0}} 40:
        count += 1
print(count)`, a:[">="], d:[">","<=","<"], o:"3",
w:"\"40 or more\" means >= 40. Using > would miss the student who scored exactly 40."},

{t:"Looping lists", q:"Work out the mean mark.",
c:`m = [6, 8, 10]
total = 0
for x in m:
    total += x
print(total / {{0}})`, a:["len(m)"], d:["m","total","x"], o:"8.0",
w:"The mean is the total divided by how many items there are, which is len(m). / always gives a float."},

{t:"Looping lists", p:1, q:"What does this print?",
c:`nums = [3, 5, 2]
for n in nums:
    total = 0
    total = total + n
print(total)`, a:["2"], d:["10","0","3"],
w:"total is reset to 0 inside the loop every time, so only the last item survives. Set totals to 0 BEFORE the loop."},

{t:"Looping lists", q:"Double every price in the list.",
c:`v = [3, 5, 8]
for i in range(len(v)):
    v[i] = {{0}}
print(v)`, a:["v[i] * 2"], d:["i * 2","v * 2","v[i] + v"], o:"[6, 10, 16]",
w:"To change the list you must assign back to v[i]. Each pass doubles the value at that index."},

{t:"Looping lists", p:1, q:"What does this print?",
c:`v = [1, 2, 3]
for x in v:
    x = x * 10
print(v)`, a:["[1, 2, 3]"], d:["[10, 20, 30]","30","[1, 2, 30]"],
w:"x is just a copy of each value. Changing x doesn't change the list; you need v[i] = ... with an index loop."},

{t:"Looping lists", q:"Search the list for the username.",
c:`users = ["amy1", "bk22", "cj7"]
found = False
for u in users:
    if u == "bk22":
        found = {{0}}
print(found)`, a:["True"], d:["False","u","\"bk22\""], o:"True",
w:"This is a linear search: start with False and switch the flag to True when a match turns up."},

{t:"Looping lists", q:"Find the position of Leeds.",
c:`c = ["York", "Hull", "Leeds"]
pos = -1
for i in range(len(c)):
    if c[i] == "Leeds":
        pos = {{0}}
print(pos)`, a:["i"], d:["c[i]","i + 1","len(c)"], o:"2",
w:"i holds the index of the current item, so storing i records where the match was found."},

{t:"Looping lists", q:"Count the votes for red.",
c:`votes = ["red", "blue", "red"]
n = 0
for v in votes:
    if v {{0}} "red":
        n += 1
print(n)`, a:["=="], d:["=","!="], o:"2",
w:"== compares values. A single = is assignment and isn't allowed inside an if condition."},

{t:"Looping lists", q:"Use a while loop to print each item.",
c:`x = ["A", "B", "C"]
i = 0
while i {{0}} len(x):
    print(x[i])
    i += 1`, a:["<"], d:["<=","=="], o:"A\nB\nC",
w:"The last valid index is len(x) - 1, so keep going while i < len(x). With <= the loop tries x[3] and crashes."},

{t:"Looping lists", q:"Print the words on one line with spaces.",
c:`words = ["to", "be", "or"]
for w in words:
    print(w, end={{0}})`, a:["\" \""], d:["\"\"","\",\""], o:"to be or",
w:"end=\" \" puts a space after each word instead of a new line."},

{t:"Looping lists", q:"Count the dry days (no rain).",
c:`rain = [0, 4, 0, 0, 2]
dry = {{0}}
for r in rain:
    if r == 0:
        dry += 1
print(dry)`, a:["0"], d:["1","[]","None"], o:"3",
w:"A counter must start at 0 before the loop. Starting at 1 would overcount by one."},

{t:"Looping lists", p:1, q:"What does this print?",
c:`x = [5, 1, 4, 2, 3]
t = 0
for i in range(0, len(x), 2):
    t += x[i]
print(t)`, a:["12"], d:["3","15","9"],
w:"The step of 2 gives indexes 0, 2 and 4, so it adds 5 + 4 + 3 = 12."},

{t:"Looping lists", q:"Record the best score and where it is.",
c:`s = [30, 85, 60]
best = s[0]
pos = 0
for i in range(len(s)):
    if s[i] > best:
        best = {{0}}
        pos = {{1}}
print(best, pos)`, a:["s[i]","i"], d:["best","pos"], o:"85 1",
w:"best stores the value and pos stores the index where it was found."},

{t:"Looping lists", q:"Print the countdown backwards through the list.",
c:`x = ["three", "two", "one"]
for i in range({{0}}, -1, -1):
    print(x[i])`, a:["len(x)-1"], d:["len(x)","0","-1"], o:"one\ntwo\nthree",
w:"Start at the last index, len(x) - 1, and step down by 1. The stop value -1 means 0 is the last index used."},

{t:"Looping lists", p:1, q:"What does this print?",
c:`count = 0
for n in [4, 9, 2, 7]:
    if n > 5:
        count += 1
print(count)`, a:["2"], d:["16","4","1"],
w:"Only 9 and 7 are bigger than 5, so the count reaches 2. The loop counts items; it doesn't add them."},

{t:"Looping lists", q:"Build a list of running totals.",
c:`steps = [3, 2, 5]
run = 0
totals = []
for s in steps:
    run += s
    totals.{{0}}(run)
print(totals)`, a:["append"], d:["insert","add","remove"], o:"[3, 5, 10]",
w:"Each running total is added to the end with append(), building a new list item by item."},

// ---------- List methods ----------
{t:"List methods", q:"Sort the scores into ascending order.",
c:`s = [42, 17, 30]
s.{{0}}()
print(s)`, a:["sort"], d:["sorted","order","reverse"], o:"[17, 30, 42]",
w:"sort() is a method that changes the list itself. sorted() is a function and isn't called with a dot."},

{t:"List methods", q:"Sort the times from slowest to fastest.",
c:`t = [12.4, 11.9, 13.1]
t.sort({{0}})
print(t)`, a:["reverse=True"], d:["reverse","True","desc=True"], o:"[13.1, 12.4, 11.9]",
w:"sort(reverse=True) sorts into descending order. The option must be named."},

{t:"List methods", p:1, q:"What does this print?",
c:`x = [3, 1, 2]
y = x.sort()
print(y)`, a:["None"], d:["[1, 2, 3]","[3, 1, 2]","TypeError"],
w:"sort() changes x in place and returns None. To get a new sorted list, use sorted(x)."},

{t:"List methods", q:"Get a sorted copy and keep the original order too.",
c:`nums = [9, 4, 6]
new = {{0}}(nums)
print(new, nums)`, a:["sorted"], d:["list","sort","reversed"], o:"[4, 6, 9] [9, 4, 6]",
w:"sorted() returns a new sorted list and leaves the original alone."},

{t:"List methods", q:"Reverse the order of the playlist.",
c:`songs = ["A", "C", "B"]
songs.{{0}}()
print(songs)`, a:["reverse"], d:["sort","reversed","pop"], o:"['B', 'C', 'A']",
w:"reverse() flips the list as it is; it doesn't sort it. sort() would give A, B, C."},

{t:"List methods", q:"Find which position Raj is in.",
c:`names = ["Lu", "Kai", "Raj"]
pos = names.{{0}}("Raj")
print(pos)`, a:["index"], d:["find","count","search"], o:"2",
w:"index() returns the position of the first match. Lists have no find() method; that's for strings."},

{t:"List methods", p:1, q:"What does this print?",
c:`rolls = [4, 2, 4, 6, 4]
print(rolls.count(4))`, a:["3"], d:["0","2","4"],
w:"count() returns how many times the value appears. 4 appears three times."},

{t:"List methods", q:"Check whether Sam has an account.",
c:`users = ["Ana", "Sam", "Tom"]
if "Sam" {{0}} users:
    print("Welcome")
else:
    print("Sign up")`, a:["in"], d:["==","not in"], o:"Welcome",
w:"in checks every item for a match. == would compare the string with the whole list, which is never equal."},

{t:"List methods", q:"Total the donations in one step.",
c:`gifts = [5, 10, 2]
total = {{0}}(gifts)
print(total)`, a:["sum"], d:["len","max","total"], o:"17",
w:"sum() adds up every number in a list. len() would only count how many there are."},

{t:"List methods", q:"Print the highest and then the lowest reading.",
c:`t = [7, 3, 9, 5]
print({{0}}(t), {{1}}(t))`, a:["max","min"], d:["sum","len"], o:"9 3",
w:"max() gives the largest item and min() the smallest, without writing the loop yourself."},

{t:"List methods", p:1, q:"What does this print?",
c:`fruit = ["pear", "apple", "fig"]
print(max(fruit))`, a:["pear"], d:["apple","fig","TypeError"],
w:"For strings, max() picks the one that comes last alphabetically, not the longest. p comes after a and f."},

{t:"List methods", p:1, q:"What does this print?",
c:`x = ["a", "b"]
print(x.index("c"))`, a:["ValueError"], d:["-1","None","IndexError"],
w:"index() raises a ValueError if the value isn't there. Check with in first."},

{t:"List methods", p:1, q:"What does this print?",
c:`print(sorted(["bob", "Cat", "amy"]))`, a:["['Cat', 'amy', 'bob']"], d:["['amy', 'bob', 'Cat']","['amy', 'Cat', 'bob']","['bob', 'Cat', 'amy']"],
w:"Strings sort by character code, and every capital letter comes before every lower-case one."},

{t:"List methods", q:"Only add the item if it isn't already there.",
c:`basket = ["tea", "jam"]
for item in ["jam", "egg"]:
    if item {{0}} basket:
        basket.append(item)
print(basket)`, a:["not in"], d:["in","=="], o:"['tea', 'jam', 'egg']",
w:"not in is True when the value is missing. jam is already there so it's skipped, but egg is added."},

{t:"List methods", q:"Count the yes votes.",
c:`votes = ["yes", "no", "yes", "yes"]
n = votes.{{0}}("yes")
print(n)`, a:["count"], d:["index","len","sum"], o:"3",
w:"count(value) counts matching items. index() would only give the position of the first yes."},

{t:"List methods", p:1, q:"What does this print?",
c:`print(sum([0.5, 1.5, 2]))`, a:["4.0"], d:["4","3.5","TypeError"],
w:"Once a float is involved the total is a float, so you get 4.0, not 4."},

{t:"List methods", q:"Find which lap was fastest (lowest time).",
c:`laps = [61, 63, 58]
fast = laps.{{0}}(min(laps))
print(fast + 1)`, a:["index"], d:["count","pop"], o:"3",
w:"min(laps) is 58, and index(58) is 2. Adding 1 gives the lap number, 3."},

{t:"List methods", q:"Make a ranked copy, highest first.",
c:`pts = [12, 30, 21]
r = {{0}}(pts, {{1}})
print(r)`, a:["sorted","reverse=True"], d:["sort","reverse=False"], o:"[30, 21, 12]",
w:"sorted() makes a new list, and reverse=True puts the biggest first."},

{t:"List methods", p:1, q:"What does this print?",
c:`print("3" in [1, 2, 3])`, a:["False"], d:["True","3","TypeError"],
w:"\"3\" is a string and 3 is an integer, so they don't match. This is why input() values often need int()."},

{t:"List methods", q:"Find the range (highest minus lowest).",
c:`h = [164, 150, 172]
print({{0}})`, a:["max(h) - min(h)"], d:["min(h) - max(h)","max(h) - h[0]","len(h) - 1"], o:"22",
w:"The range is the largest value minus the smallest: 172 - 150 = 22."},
// ---------- 2D arrays ----------
{t:"2D arrays", q:"Print the 6 from the grid.",
c:`g = [[1, 2, 3],
     [4, 5, 6]]
print(g[{{0}}][{{1}}])`, a:["1","2"], d:["0","3"], o:"6",
w:"The first index picks the row and the second picks the column, both from 0. 6 is row 1, column 2."},

{t:"2D arrays", p:1, q:"What does this print?",
c:`seats = [["Ann", "Bo"],
         ["Cy", "Di"],
         ["Ed", "Flo"]]
print(seats[2][0])`, a:["Ed"], d:["Cy","Bo","Flo"],
w:"seats[2] is the third row, [\"Ed\", \"Flo\"], and [0] picks the first seat in it."},

{t:"2D arrays", q:"Print how many columns the grid has.",
c:`g = [[0, 0, 0],
     [0, 0, 0]]
print(len({{0}}))`, a:["g[0]"], d:["g","g[0][0]"], o:"3",
w:"len(g) counts the rows. len(g[0]) counts the items in the first row, which is the number of columns."},

{t:"2D arrays", q:"Add up every number in the grid.",
c:`g = [[2, 4], [1, 3], [5, 5]]
total = 0
for row in g:
    for x in {{0}}:
        total += x
print(total)`, a:["row"], d:["g","x"], o:"20",
w:"The outer loop gives each row (a list) and the inner loop goes through the numbers in that row."},

{t:"2D arrays", q:"Loop over every cell using indexes.",
c:`g = [[1, 2, 3],
     [4, 5, 6]]
t = 0
for r in range(len(g)):
    for c in range({{0}}):
        t += g[r][c]
print(t)`, a:["len(g[0])"], d:["len(g)","len(g[r][c])","3 + 1"], o:"21",
w:"The inner loop runs over the columns, so it needs the length of a row. len(g) is the number of rows."},

{t:"2D arrays", q:"Print the total for the second row.",
c:`sales = [[3, 1, 2],
         [5, 0, 4],
         [2, 2, 2]]
print(sum(sales[{{0}}]))`, a:["1"], d:["2","0","-1"], o:"9",
w:"The second row is index 1. sales[1] is the whole row [5, 0, 4], and sum() adds it up."},

{t:"2D arrays", q:"Total the first column.",
c:`g = [[3, 1, 2],
     [5, 0, 4],
     [1, 2, 6]]
t = 0
for row in g:
    t += row[{{0}}]
print(t)`, a:["0"], d:["1","2","-1"], o:"9",
w:"Taking item 0 from every row walks down the first column: 3 + 5 + 1 = 9."},

{t:"2D arrays", q:"Put Sam in row 1, seat 2 (both counted from 0).",
c:`plan = [["", "", ""],
        ["", "", ""]]
plan[{{0}}][{{1}}] = "Sam"
print(plan[1])`, a:["1","2"], d:["0","3"], o:"['', '', 'Sam']",
w:"plan[1][2] is row 1, column 2. In OCR pseudocode the same cell is written plan[1,2]."},

{t:"2D arrays", p:1, q:"What does this print?",
c:`b = [["X", "O", "X"],
     ["-", "X", "O"],
     ["O", "-", "X"]]
print(b[1][2])`, a:["O"], d:["X","-","IndexError"],
w:"Row 1 is [\"-\", \"X\", \"O\"], and column 2 of that row is \"O\"."},

{t:"2D arrays", q:"Build a 3 by 3 grid of zeros.",
c:`g = []
for i in range(3):
    g.append({{0}})
print(g)`, a:["[0] * 3"], d:["0","[0, 0]","[0] + 3"], o:"[[0, 0, 0], [0, 0, 0], [0, 0, 0]]",
w:"Each pass adds a new row of three zeros. Making a fresh row each time keeps the rows separate."},

{t:"2D arrays", p:1, q:"What does this print?",
c:`g = [[0] * 2] * 2
g[0][0] = 1
print(g)`, a:["[[1, 0], [1, 0]]"], d:["[[1, 0], [0, 0]]","[[1, 1], [0, 0]]","[[0, 0], [0, 0]]"],
w:"* 2 on the outside copies a reference to the SAME row twice, so changing one row changes both. Build rows in a loop instead."},

{t:"2D arrays", q:"Print the board one row per line.",
c:`b = [["X", "O"], ["-", "X"]]
for row in b:
    for cell in row:
        print(cell, end={{0}})
    print()`, a:["\"\""], d:["\" \"","None"], o:"XO\n-X",
w:"end=\"\" stops print() moving to a new line after each cell. The empty print() then ends each row."},

{t:"2D arrays", q:"Check the diagonal from top left to bottom right.",
c:`b = [["X", "O", "O"],
     ["O", "X", "O"],
     ["O", "O", "X"]]
if b[0][0] == b[1][1] == b[2][{{0}}]:
    print("Win")
else:
    print("No win")`, a:["2"], d:["0","1","3"], o:"Win",
w:"The diagonal is where the row and column indexes are equal: [0][0], [1][1] and [2][2]."},

{t:"2D arrays", q:"Find where the treasure T is on the map.",
c:`m = [[".", ".", "."],
     [".", ".", "T"]]
for r in range(len(m)):
    for c in range(len(m[r])):
        if m[r][c] == "T":
            print({{0}})`, a:["r, c"], d:["c, r","m[r][c]","r + c"], o:"1 2",
w:"r is the row and c is the column of the cell being checked. Rows come first by convention."},

{t:"2D arrays", p:1, q:"What does this print?",
c:`g = [[1, 2, 3, 4],
     [5, 6, 7, 8],
     [9, 10, 11, 12]]
print(len(g))`, a:["3"], d:["4","12","2"],
w:"len(g) counts the rows, and there are three of them. Each row has 4 items, but that's len(g[0])."},

{t:"2D arrays", q:"Count the empty seats on the bus.",
c:`bus = [["Al", ""], ["", ""],
       ["Jo", "Mo"]]
n = 0
for row in bus:
    n += row.{{0}}("")
print(n)`, a:["count"], d:["index","remove"], o:"3",
w:"row.count(\"\") counts the empty seats in one row, and the loop adds them up across all rows."},

{t:"2D arrays", q:"Print each player's best round.",
c:`pts = [[4, 9, 2], [7, 3, 5]]
for row in pts:
    print({{0}})`, a:["max(row)"], d:["max(pts)","row[1]","max(row[0])"], o:"9\n7",
w:"max(row) finds the largest item in one row. max(pts) would compare whole rows instead."},

{t:"2D arrays", p:1, q:"What does this print?",
c:`g = [[1, 2, 3], [4, 5, 6]]
print(g[1])`, a:["[4, 5, 6]"], d:["4","[2, 5]","[1, 2, 3]"],
w:"One index on a 2D list gives you a whole row, which is itself a list."},

{t:"2D arrays", q:"Add 5 points to player 1 in round 0.",
c:`s = [[0, 0], [0, 0], [0, 0]]
s[{{0}}][{{1}}] += 5
print(s)`, a:["1","0"], d:["2","-1"], o:"[[0, 0], [5, 0], [0, 0]]",
w:"With s[player][round], player 1 is the second row and round 0 is its first item."},

{t:"2D arrays", q:"Total column c of the grid with an index loop.",
c:`g = [[1, 2, 3],
     [4, 5, 7]]
c = 2
t = 0
for r in range(len(g)):
    t += g[{{0}}][{{1}}]
print(t)`, a:["r","c"], d:["0","1"], o:"10",
w:"The row changes on each pass while the column stays fixed at c, so this goes down column 2: 3 + 7 = 10."},

{t:"2D arrays", p:1, q:"What does this print?",
c:`g = [[1, 2], [3, 4], [5, 6]]
print(g[3][0])`, a:["IndexError"], d:["5","None","1"],
w:"There are 3 rows, so the row indexes are 0, 1 and 2. g[3] is out of range."},

// ---------- Records ----------
{t:"Records", q:"Print the pupil's age from the record.",
c:`s = ["Ann", 15, "7B"]
print(s[{{0}}])`, a:["1"], d:["2","0","15"], o:"15",
w:"A record stores fields in a fixed order: name at 0, age at 1, form at 2. Index 1 gives the age."},

{t:"Records", q:"Print every pupil's name.",
c:`pupils = [["Ann", 15], ["Bo", 14]]
for p in pupils:
    print(p[{{0}}])`, a:["0"], d:["1","-1","p"], o:"Ann\nBo",
w:"Each p is one record (a small list). p[0] is the name field of that record."},

{t:"Records", q:"Find Bo's form group.",
c:`recs = [["Ann", 12, "7B"],
        ["Bo", 13, "8C"]]
for r in recs:
    if r[{{0}}] == "Bo":
        print(r[{{1}}])`, a:["0","2"], d:["1","-2"], o:"8C",
w:"Compare the name field (index 0) and, on a match, print the form field (index 2)."},

{t:"Records", q:"Add a new member's record to the club.",
c:`club = [["Ann", 15], ["Bo", 14]]
club.append({{0}})
print(len(club), club[-1][0])`, a:["[\"Dan\", 16]"], d:["\"Dan\", 16","[\"Dan\"], [16]","\"Dan\""], o:"3 Dan",
w:"The whole record must be one list, so it goes in brackets. append() only takes one argument."},

{t:"Records", p:1, q:"What does this print?",
c:`recs = [["Mo", 12, "A"],
        ["Li", 13, "B"]]
print(recs[1][0], recs[0][2])`, a:["Li A"], d:["Mo B","Li 12","13 A"],
w:"recs[1][0] is the name in the second record, Li. recs[0][2] is the last field of the first record, A."},

{t:"Records", q:"Total the ages in the records.",
c:`team = [["Kai", 14], ["Mia", 15],
        ["Raj", 14]]
total = 0
for p in team:
    total += {{0}}
print(total)`, a:["p[1]"], d:["p[0]","p","team[1]"], o:"43",
w:"p[1] is the age field of each record. Adding p[0] would try to add a name to a number."},

{t:"Records", q:"Print each name next to their score.",
c:`names = ["Ivy", "Jo"]
scores = [17, 12]
for i in range(len(names)):
    print(names[i], scores[{{0}}])`, a:["i"], d:["0","names[i]","-1"], o:"Ivy 17\nJo 12",
w:"Parallel lists keep related data at the same index, so index i links each name to its score."},

{t:"Records", q:"Print the name of the top scorer.",
c:`names = ["Eli", "Fay", "Gus"]
pts = [8, 15, 11]
pos = pts.index(max(pts))
print(names[{{0}}])`, a:["pos"], d:["max(pts)","pos + 1","0"], o:"Fay",
w:"Find the index of the highest score, then use that same index in the parallel names list."},

{t:"Records", p:1, q:"What does this print?",
c:`names = ["Ash", "Ben", "Cal"]
ages = [16, 14, 15]
print(names[ages.index(15)])`, a:["Cal"], d:["Ben","15","Ash"],
w:"ages.index(15) is 2, and names[2] is Cal. The two lists line up by index."},

{t:"Records", q:"Print only the pupils in form 7B.",
c:`recs = [["Ann", "7B"], ["Bo", "8C"],
        ["Cy", "7B"]]
for r in recs:
    if r[1] {{0}} "7B":
        print(r[0])`, a:["=="], d:["!=","="], o:"Ann\nCy",
w:"Check the form field with ==, then print the name field of each matching record."},

{t:"Records", q:"Print how many pads are in stock.",
c:`stock = {"pen": 4, "pad": 2}
print(stock[{{0}}])`, a:["\"pad\""], d:["1","pad","2"], o:"2",
w:"A dictionary is looked up by key, not by position. The key is a string, so it needs quotes."},

{t:"Records", q:"Add 3 more pens to the stock.",
c:`stock = {"pen": 4, "pad": 2}
stock["pen"] {{0}} 3
print(stock["pen"])`, a:["+="], d:["=","=="], o:"7",
w:"+= adds to the value already stored under that key. = would replace 4 with 3."},

{t:"Records", p:1, q:"What does this print?",
c:`ages = {"Ann": 15, "Bo": 14}
ages["Cy"] = 16
print(len(ages))`, a:["3"], d:["2","16","KeyError"],
w:"Assigning to a new key adds a new entry to a dictionary, so there are now 3."},

{t:"Records", q:"It's Cy's birthday. Add 1 to Cy's age.",
c:`recs = [["Bo", 14], ["Cy", 15]]
for r in recs:
    if r[0] == "Cy":
        r[1] = {{0}}
print(recs)`, a:["r[1] + 1"], d:["r + 1","15","r[0] + 1"], o:"[['Bo', 14], ['Cy', 16]]",
w:"Each r is the actual record inside recs, so changing r[1] updates the age in the main list."},

{t:"Records", q:"Count the pupils older than 14.",
c:`recs = [["Ann", 15], ["Bo", 14],
        ["Cy", 16]]
n = 0
for r in recs:
    if r[1] {{0}} 14:
        n += 1
print(n)`, a:[">"], d:[">=","<","=="], o:"2",
w:"Older than 14 means > 14, so Bo, who is exactly 14, isn't counted."},

{t:"Records", q:"Turn a line from a file into a record.",
c:`line = "Zak,13,9A"
rec = line.{{0}}(",")
print(rec[2])`, a:["split"], d:["strip","index","join"], o:"9A",
w:"split(\",\") cuts the line at each comma and gives a list of fields: [\"Zak\", \"13\", \"9A\"]."},

{t:"Records", p:1, q:"What does this print?",
c:`rec = "Ann,15".split(",")
print(rec[1] + 1)`, a:["TypeError"], d:["16","151","15"],
w:"split() gives strings, so rec[1] is \"15\". You need int(rec[1]) before doing maths with it."},

{t:"Records", q:"Find the oldest pupil's record.",
c:`recs = [["Al", 14], ["Bea", 16],
        ["Cal", 15]]
old = recs[0]
for r in recs:
    if r[1] > old[1]:
        old = {{0}}
print(old[0])`, a:["r"], d:["r[1]","r[0]","recs"], o:"Bea",
w:"Store the whole record, not just the age, so you can still print the name at the end."},

{t:"Records", q:"Say whether the username exists.",
c:`acc = [["kim3", 20], ["lee9", 5]]
found = False
for a in acc:
    if a[0] == "lee9":
        found = True
print({{0}})`, a:["found"], d:["a","False","a[1]"], o:"True",
w:"The flag records whether ANY record matched. Printing a would just show the last record checked."},

{t:"Records", p:1, q:"What does this print?",
c:`recs = [["Ann", 15], ["Bo", 14]]
print(recs[1])`, a:["['Bo', 14]"], d:["Bo","14","['Ann', 15]"],
w:"One index into a list of records gives a whole record, printed as a list."},

{t:"Records", q:"Add Eve, aged 16, keeping the parallel lists in step.",
c:`names = ["Ann", "Bo"]
ages = [15, 14]
names.append("Eve")
ages.{{0}}(16)
print(names[2], ages[2])`, a:["append"], d:["insert","remove","index"], o:"Eve 16",
w:"Parallel lists only work if every list grows together, so the age must go on the end too."},

{t:"Records", q:"Print each film's title and rating.",
c:`films = [["Up", 2009, 8],
         ["Cars", 2006, 7]]
for f in films:
    print(f[{{0}}], f[{{1}}])`, a:["0","2"], d:["1","3"], o:"Up 8\nCars 7",
w:"Title is field 0, year is field 1 and rating is field 2. Index 3 would be past the end of each record."},
// ---------- Slicing lists ----------
{t:"Slicing lists", q:"Print the first three scores.",
c:`s = [12, 9, 15, 7, 11]
print(s[{{0}}])`, a:[":3"], d:["0:2","1:3","3"], o:"[12, 9, 15]",
w:"A slice stops BEFORE its end index, so :3 gives indexes 0, 1 and 2."},

{t:"Slicing lists", q:"Print the last two readings.",
c:`r = [21, 23, 22, 25, 24]
print(r[{{0}}])`, a:["-2:"], d:[":-2","-2","-1:"], o:"[25, 24]",
w:"-2: starts two from the end and runs to the end. :-2 would give everything EXCEPT the last two."},

{t:"Slicing lists", q:"Print the items from index 1 up to and including index 3.",
c:`x = ["a", "b", "c", "d", "e"]
print(x[{{0}}:{{1}}])`, a:["1","4"], d:["3","0","5"], o:"['b', 'c', 'd']",
w:"The end of a slice is not included, so to include index 3 the end must be 4."},

{t:"Slicing lists", p:1, q:"What does this print?",
c:`a = [1, 2, 3]
b = a
b.append(4)
print(a)`, a:["[1, 2, 3, 4]"], d:["[1, 2, 3]","[4]","[1, 2, 3, [4]]"],
w:"b = a doesn't copy the list. Both names point to the same list, so a change through b shows up in a."},

{t:"Slicing lists", q:"Make a real copy so the original is safe.",
c:`a = [5, 6]
b = a{{0}}
b.append(9)
print(a, b)`, a:["[:]"], d:["[0]","[-1:]","[1:]"], o:"[5, 6] [5, 6, 9]",
w:"a[:] is a slice of the whole list, which makes a new list. Appending to the copy leaves a alone."},

{t:"Slicing lists", p:1, q:"What does this print?",
c:`a = [1, 2, 3]
b = a[:]
b[0] = 99
print(a)`, a:["[1, 2, 3]"], d:["[99, 2, 3]","[99]","[99, 1, 2, 3]"],
w:"a[:] made a separate copy, so changing b[0] doesn't touch a."},

{t:"Slicing lists", q:"Print every other day, starting with Monday.",
c:`d = ["Mo", "Tu", "We", "Th", "Fr"]
print(d[{{0}}])`, a:["::2"], d:["1::2",":2","::-2"], o:"['Mo', 'We', 'Fr']",
w:"The third number in a slice is the step. ::2 takes indexes 0, 2 and 4."},

{t:"Slicing lists", q:"Print the race results in reverse order.",
c:`res = ["Ann", "Bo", "Cy"]
print(res[{{0}}])`, a:["::-1"], d:["-1:","::1",":-1"], o:"['Cy', 'Bo', 'Ann']",
w:"A step of -1 walks backwards through the list and makes a reversed copy."},

{t:"Slicing lists", p:1, q:"What does this print?",
c:`x = [1, 2, 3]
print(x[1:10])`, a:["[2, 3]"], d:["IndexError","[2, 3, None]","[1, 2, 3]"],
w:"Slices don't crash when they go past the end; they just stop at the last item. Only single indexes raise IndexError."},

{t:"Slicing lists", q:"Show the top three scores.",
c:`s = [40, 75, 62, 88, 51]
s.sort(reverse=True)
print(s[{{0}}])`, a:[":3"], d:["-3:","3:",":2"], o:"[88, 75, 62]",
w:"After sorting high to low, the first three items are the top three."},

{t:"Slicing lists", q:"Drop the first and last readings (they're faulty).",
c:`r = [0, 14, 15, 13, 99]
print(r[{{0}}])`, a:["1:-1"], d:["1:","0:-1","1:4:2"], o:"[14, 15, 13]",
w:"1:-1 starts at index 1 and stops before the last item, removing both ends."},

{t:"Slicing lists", q:"Split the team into two halves.",
c:`t = ["A", "B", "C", "D", "E", "F"]
h = len(t) {{0}} 2
print(t[:h], t[h:])`, a:["//"], d:["/","%","-"], o:"['A', 'B', 'C'] ['D', 'E', 'F']",
w:"Slice positions must be integers, so use // (OCR's DIV). 6 / 2 gives 3.0, which can't be used in a slice."},

{t:"Slicing lists", q:"Print the first two cells of the top row.",
c:`g = [["a", "b", "c"],
     ["d", "e", "f"]]
print(g[0][{{0}}])`, a:[":2"], d:["0:1","1:","2"], o:"['a', 'b']",
w:"g[0] is the top row, and [:2] slices its first two items."},

{t:"Slicing lists", q:"Average the last three temperatures.",
c:`t = [11, 13, 18, 16, 23]
last = t[{{0}}]
print(sum(last) / len(last))`, a:["-3:"], d:[":3","-3","3:"], o:"19.0",
w:"-3: is the last three items: 18, 16 and 23. Their total is 57, and 57 / 3 = 19.0."},

{t:"Slicing lists", q:"Copy the list with the list() function.",
c:`a = [3, 1, 2]
b = {{0}}(a)
b.append(0)
print(a, b)`, a:["list"], d:["sorted","len","reversed"], o:"[3, 1, 2] [3, 1, 2, 0]",
w:"list(a) builds a new list with the same items, so a and b are now separate."},

{t:"Slicing lists", q:"Change b without changing a.",
c:`a = ["X", "Y"]
b = {{0}}
b[0] = "Z"
print(a)`, a:["a[:]"], d:["a","a[0]"], o:"['X', 'Y']",
w:"b = a only gives the same list a second name. a[:] copies it first, so a keeps \"X\"."},

{t:"Slicing lists", p:1, q:"What does this print?",
c:`x = [5, 6, 7, 8]
print(x[2:2])`, a:["[]"], d:["[7]","7","[6, 7]"],
w:"A slice from 2 up to (but not including) 2 has nothing in it, so you get an empty list."},

{t:"Slicing lists", q:"Remove the last item without changing the original.",
c:`q = ["a", "b", "c"]
short = q[{{0}}]
print(short, len(q))`, a:[":-1"], d:["-1:","-1",":-2"], o:"['a', 'b'] 3",
w:":-1 means everything up to but not including the last item. A slice makes a new list, so q still has 3 items."},

{t:"Slicing lists", q:"Pick the first half of the queue for group A.",
c:`q = ["Ali", "Bo", "Cy", "Di"]
a = q[:len(q) {{0}} 2]
print(a)`, a:["//"], d:["/","%","*"], o:"['Ali', 'Bo']",
w:"len(q) // 2 is 2, so the slice takes the first two names."},

{t:"Slicing lists", p:1, q:"What does this print?",
c:`n = [10, 20, 30, 40, 50]
print(n[-3:-1])`, a:["[30, 40]"], d:["[30, 40, 50]","[40, 50]","[]"],
w:"-3 is 30 and -1 is 50. The slice stops before the end index, so 50 is left out."},

// ---------- Trace the list ----------
{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [1, 2, 3]
x.append(x[0] + x[-1])
print(x)`, a:["[1, 2, 3, 4]"], d:["[1, 2, 3, 3]","[1, 2, 3, 6]","[4, 1, 2, 3]"],
w:"x[0] is 1 and x[-1] is 3, so 4 is added to the end."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`s = []
s.append(5)
s.append(8)
s.pop()
s.append(2)
print(s)`, a:["[5, 2]"], d:["[8, 2]","[5, 8, 2]","[2]"],
w:"After pushing 5 and 8, pop() removes the last one, 8. Then 2 goes on top: [5, 2]."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`q = ["a", "b"]
q.append("c")
q.pop(0)
print(q[0])`, a:["b"], d:["a","c","['b', 'c']"],
w:"pop(0) removes \"a\" from the front, so \"b\" is now at index 0."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [1, 2, 3, 4]
for i in range(1, len(x)):
    x[i] = x[i] + x[i - 1]
print(x)`, a:["[1, 3, 6, 10]"], d:["[1, 3, 5, 7]","[3, 5, 7, 4]","[1, 2, 3, 4]"],
w:"Each item adds the NEW value before it: 2 + 1 = 3, 3 + 3 = 6, 4 + 6 = 10. This makes running totals."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [4, 2, 3]
for i in range(2):
    if x[i] > x[i + 1]:
        t = x[i]
        x[i] = x[i + 1]
        x[i + 1] = t
print(x)`, a:["[2, 3, 4]"], d:["[2, 4, 3]","[4, 2, 3]","[3, 2, 4]"],
w:"This is one bubble sort pass. 4 swaps with 2, then 4 swaps with 3, so the largest bubbles to the end."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`def addZero(lst):
    lst.append(0)
n = [1]
addZero(n)
print(n)`, a:["[1, 0]"], d:["[1]","[0]","None"],
w:"The function gets the same list, not a copy, so append() changes n itself."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`a = [1, 2]
b = a
a = a + [3]
print(b)`, a:["[1, 2]"], d:["[1, 2, 3]","[3]","[1, 2, [3]]"],
w:"a + [3] builds a brand new list and points a at it. b still points to the old list, which is unchanged."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`g = [[1, 0], [0, 1], [1, 1]]
n = 0
for row in g:
    for x in row:
        if x == 1:
            n += 1
print(n)`, a:["4"], d:["3","6","2"],
w:"The nested loops check all 6 cells. Four of them hold a 1."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [1, 2, 2, 3]
for v in x:
    if v == 2:
        x.remove(v)
print(x)`, a:["[1, 2, 3]"], d:["[1, 3]","[1, 2, 2, 3]","ValueError"],
w:"Removing while looping shifts the items left, so the loop skips the second 2. Avoid changing a list you're looping over."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = ["b"]
x.insert(0, "a")
x.append("c")
x.insert(1, "z")
print(x)`, a:["['a', 'z', 'b', 'c']"], d:["['z', 'a', 'b', 'c']","['a', 'b', 'z', 'c']","['a', 'b', 'c', 'z']"],
w:"After the first two lines x is [a, b, c]. insert(1, \"z\") puts z before index 1, which is b."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [3, 1, 2]
y = sorted(x)
x.append(0)
print(y)`, a:["[1, 2, 3]"], d:["[0, 1, 2, 3]","[3, 1, 2, 0]","None"],
w:"sorted() made a separate new list, so adding to x later doesn't affect y."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`n = [5, 3, 8, 1]
i = 0
while n[i] != 8:
    i += 1
print(i)`, a:["2"], d:["3","8","1"],
w:"The loop stops when n[i] is 8, which is at index 2. It prints the index, not the value."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [10, 20, 30]
for i in range(len(x)):
    x[i] = x[i] // 10
print(sum(x))`, a:["6"], d:["60","3","[1, 2, 3]"],
w:"Each item is divided by 10 (DIV in OCR pseudocode), giving [1, 2, 3], and the sum is 6."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`out = []
for w in ["hi", "yo", "ok"]:
    out.insert(0, w)
print(out)`, a:["['ok', 'yo', 'hi']"], d:["['hi', 'yo', 'ok']","['ok']","['hi', 'ok', 'yo']"],
w:"Each word is inserted at the front, pushing the earlier ones back, so the list ends up reversed."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [1, 2, 3]
y = x
y[0] = x[2]
print(x)`, a:["[3, 2, 3]"], d:["[1, 2, 3]","[3, 2, 1]","[1, 2, 1]"],
w:"y and x are the same list, so setting y[0] to 3 changes x as well."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [2, 4, 6]
print(x[x[0]])`, a:["6"], d:["2","4","IndexError"],
w:"Work from the inside out: x[0] is 2, so this is x[2], which is 6."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`x = [7, 8, 9]
y = x.pop(1) + x[1]
print(y)`, a:["17"], d:["16","8","IndexError"],
w:"pop(1) returns 8 and removes it, so x becomes [7, 9]. Now x[1] is 9, and 8 + 9 = 17."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`t = [3, 7, 2, 9, 4]
hi = 0
for v in t:
    if v > hi:
        hi = v
    print(hi, end=" ")`, a:["3 7 7 9 9"], d:["3 7 2 9 4","9 9 9 9 9","3 7 9"],
w:"The print is inside the loop, so it shows the highest value SO FAR after each item."},

{t:"Trace the list", p:1, q:"What does this print?",
c:`g = [[1, 2], [3, 4]]
for row in g:
    row.append(sum(row))
print(g[1])`, a:["[3, 4, 7]"], d:["[3, 4]","[7]","[1, 2, 3]"],
w:"Each row gets its own total added to the end, so the second row becomes [3, 4, 7]."},
]);
