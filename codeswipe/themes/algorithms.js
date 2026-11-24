// Theme: Searching & sorting (OCR J277 2.1.2 designing and refining algorithms, 2.1.3 searching and sorting algorithms). Validate with codeswipe/tools/validate.py
CodeSwipe.add("algorithms", [
// ---------- Linear search ----------
{t:"Linear search", q:"Print the position where the item is found.",
c:`lst = [4, 9, 2, 7]
target = 2
for i in range(len(lst)):
    if lst[i] {{0}} target:
        print("Found at", i)`, a:["=="], d:["=","!=",">="], o:"Found at 2",
w:"A linear search checks each item in turn with ==. A single = is assignment and is a syntax error inside an if."},

{t:"Linear search", q:"Return the index if found, or -1 if not.",
c:`def search(lst, x):
    for i in range(len(lst)):
        if lst[i] == x:
            return {{0}}
    return {{1}}
print(search([5, 3, 8], 8))
print(search([5, 3, 8], 1))`, a:["i","-1"], d:["x","0","lst[i]"], o:"2\n-1",
w:"Return the index i as soon as the item matches. Only after the loop has checked every item do you know it is missing, so -1 goes after the loop."},

{t:"Linear search", q:"Set the flag when the name is found.",
c:`names = ["Ann", "Raj", "Zoe"]
found = False
for n in names:
    if n == "Raj":
        found = {{0}}
print(found)`, a:["True"], d:["False","n","1"], o:"True",
w:"A Boolean flag starts as False and is set to True when a match is found. It stays True for the rest of the loop."},

{t:"Linear search", p:1, q:"What does this print?",
c:`lst = [3, 8, 5]
msg = ""
for x in lst:
    if x == 8:
        msg = "Found"
    else:
        msg = "Not found"
print(msg)`, a:["Not found"], d:["Found","Found Not found"],
w:"The else branch runs for 5 after 8 was found and overwrites msg. A found flag should only ever be set to True inside the loop."},

{t:"Linear search", p:1, q:"How many items does the search check?",
c:`lst = [7, 1, 9, 4, 6]
comps = 0
for x in lst:
    comps = comps + 1
    if x == 4:
        break
print(comps)`, a:["4"], d:["3","5","1"],
w:"It checks 7, 1, 9 and then 4, which matches, so break stops the loop after 4 comparisons."},

{t:"Linear search", q:"Move along the list until 30 is reached.",
c:`lst = [12, 5, 30, 8]
i = 0
while i < len(lst) and lst[i] {{0}} 30:
    i = i + 1
print(i)`, a:["!="], d:["==","<=",">"], o:"2",
w:"The loop keeps going while the current item is not the target, so it stops at index 2. The i < len(lst) check stops it running off the end."},

{t:"Linear search", q:"Keep searching while there are items left.",
c:`lst = [2, 4, 6]
i = 0
found = False
while i {{0}} len(lst) and not found:
    if lst[i] == 9:
        found = True
    i = i + 1
print(found, i)`, a:["<"], d:["<=",">","=="], o:"False 3",
w:"The last valid index is len(lst) - 1, so the loop must use <. With <= it tries lst[3] and raises an IndexError."},

{t:"Linear search", p:1, q:"What does this print?",
c:`def find(lst, x):
    for i in range(len(lst)):
        if lst[i] == x:
            return i
    return -1
print(find([3, 7, 3, 7], 7))`, a:["1"], d:["3","-1","7"],
w:"return leaves the function straight away, so a linear search like this gives the position of the first match."},

{t:"Linear search", p:1, q:"What does this print?",
c:`lst = [5, 2, 5, 9]
pos = -1
for i in range(len(lst)):
    if lst[i] == 5:
        pos = i
print(pos)`, a:["2"], d:["0","-1","5"],
w:"There is no break, so the loop carries on and pos is overwritten by every match. It ends up holding the last position, 2."},

{t:"Linear search", q:"Search for the code the user types.",
c:`codes = [101, 205, 330]
x = {{0}}(input())
found = False
for c in codes:
    if c == x:
        found = True
print(found)`, i:["205"], a:["int"], d:["str","len","bool"], o:"True",
w:"input() always returns a string, and \"205\" == 205 is False. Casting with int() makes the comparison work."},

{t:"Linear search", q:"Print a message only if the user was not found.",
c:`users = ["amy", "bo", "cy"]
found = False
for u in users:
    if u == "dan":
        found = True
if {{0}}:
    print("Not found")`, a:["not found"], d:["found","found == True","found = False"], o:"Not found",
w:"After the loop, found is still False, so not found is True. Writing found = False in an if is a syntax error."},

{t:"Linear search", p:1, q:"How many comparisons are made?",
c:`def search(lst, x):
    count = 0
    for item in lst:
        count += 1
        if item == x:
            return count
    return count
print(search([8, 3, 6, 1], 9))`, a:["4"], d:["0","-1","5"],
w:"9 is not in the list, so every one of the 4 items is compared. That is the worst case for a linear search."},

{t:"Linear search", q:"Check every temperature in the list.",
c:`temps = [18, 21, 19, 25]
for i in range({{0}}):
    if temps[i] > 24:
        print("Hot day", i)`, a:["len(temps)"], d:["len(temps)-1","temps","len(temps)+1"], o:"Hot day 3",
w:"range(len(temps)) gives 0 to 3. With len(temps)-1 the last day is never checked, which is a classic off-by-one error."},

{t:"Linear search", p:1, q:"What does this print?",
c:`def search(lst, x):
    for i in range(len(lst)):
        if lst[i] == x:
            return i
        return -1
print(search([4, 6, 8], 6))`, a:["-1"], d:["1","0","None"],
w:"return -1 is indented inside the loop, so the function gives up after checking only the first item. It belongs after the loop."},

{t:"Linear search", q:"Print the stock level of ink.",
c:`stock = [["pen", 12], ["ink", 0]]
for item in stock:
    if item[{{0}}] == "ink":
        print(item[{{1}}])`, a:["0","1"], d:["2","item"], o:"0",
w:"Each record is [name, quantity], so the name is at index 0 and the quantity at index 1."},

{t:"Linear search", q:"Stop at the first 9.",
c:`lst = [3, 9, 4, 9]
i = 0
for x in lst:
    if x == 9:
        {{0}}
    i = i + 1
print(i)`, a:["break"], d:["continue","pass","return"], o:"1",
w:"break leaves the loop at once, so i still holds the index of the first 9. continue would skip that item and keep going."},

{t:"Linear search", p:1, q:"What does this print?",
c:`word = "binary"
pos = -1
i = 0
while i < len(word) and pos == -1:
    if word[i] == "a":
        pos = i
    i += 1
print(pos)`, a:["3"], d:["4","2","-1"],
w:"b, i, n are indexes 0 to 2 and a is index 3. The loop stops once pos is no longer -1."},

{t:"Linear search", p:1, q:"What does this print?",
c:`lst = [10, 20, 30, 40]
c = 0
found = False
for v in lst:
    if not found:
        c += 1
        if v == 30:
            found = True
print(found, c)`, a:["True 3"], d:["True 4","False 4","True 2"],
w:"Comparisons are only counted while found is False: 10, 20 and 30. After that the check is skipped."},

{t:"Linear search", q:"Return True if the item is in the list.",
c:`def has(lst, x):
    for v in lst:
        if v == x:
            return {{0}}
    return {{1}}
print(has([2, 5], 5), has([2, 5], 7))`, a:["True","False"], d:["v","x","None"], o:"True False",
w:"The function returns True on the first match. It can only return False once the whole list has been checked."},

{t:"Linear search", q:"Stop early once the sorted list passes the target.",
c:`lst = [2, 5, 8, 12, 15]
x = 8
i = 0
while i < len(lst) and lst[i] {{0}} x:
    i = i + 1
print(i, lst[i] == x)`, a:["<"], d:["<=",">","=="], o:"2 True",
w:"In a sorted list, once an item is not less than x, x can't be further on. It is either here or missing."},

// ---------- Binary search ----------
{t:"Binary search", q:"Work out the middle index.",
c:`lst = [3, 8, 12, 20, 31, 40, 52]
lo = 2
hi = 6
mid = {{0}}
print(mid, lst[mid])`, a:["(lo + hi) // 2"], d:["(lo + hi) / 2","lo + hi // 2","(hi - lo) // 2"], o:"4 31",
w:"Add lo and hi first, then use integer division. A plain / gives 4.0, and a float can't be used as an index. In OCR's reference language this is (lo + hi) DIV 2."},

{t:"Binary search", q:"Move lo or hi past the middle item.",
c:`def bs(lst, x):
    lo, hi = 0, len(lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if lst[mid] == x:
            return mid
        elif lst[mid] < x:
            lo = {{0}}
        else:
            hi = {{1}}
    return -1
lst = [2, 4, 7, 9, 13, 18]
for x in [18, 4, 3]:
    print(bs(lst, x), end=" ")`, a:["mid + 1","mid - 1"], d:["mid","mid + 2","mid - 2"], o:"5 1 -1",
w:"The middle item has already been checked, so the next search starts one past it. Using lo = mid can leave lo stuck and loop forever."},

{t:"Binary search", q:"Keep going while there is still a range to search.",
c:`lst = [6, 11, 17, 23]
lo, hi = 0, 3
pos = -1
while {{0}}:
    mid = (lo + hi) // 2
    if lst[mid] == 23:
        pos = mid
        break
    lo = mid + 1
print(pos)`, a:["lo <= hi"], d:["lo < hi","lo == hi","hi < lo"], o:"3",
w:"When lo equals hi there is still one item left to check. With lo < hi the loop stops before checking 23."},

{t:"Binary search", q:"Decide which half to search next.",
c:`lst = [1, 4, 6, 9, 12, 15, 20]
lo, hi = 0, 6
while lo <= hi:
    mid = (lo + hi) // 2
    if lst[mid] == 15:
        print("Found at", mid)
        break
    elif lst[mid] {{0}} 15:
        lo = mid + 1
    else:
        hi = mid - 1`, a:["<"], d:[">",">=","=="], o:"Found at 5",
w:"If the middle item is smaller than the target, the target must be in the upper half, so lo moves up."},

{t:"Binary search", p:1, q:"How many steps does the search take?",
c:`lst = [1, 3, 5, 7, 9, 11, 13]
lo, hi = 0, 6
steps = 0
while lo <= hi:
    mid = (lo + hi) // 2
    steps += 1
    if lst[mid] == 13:
        break
    elif lst[mid] < 13:
        lo = mid + 1
    else:
        hi = mid - 1
print(steps)`, a:["3"], d:["7","4","2"],
w:"It checks 7 (index 3), then 11 (index 5), then 13 (index 6). Each step halves what is left."},

{t:"Binary search", p:1, q:"Which item does the search check first?",
c:`lst = [4, 9, 15, 22, 30, 41, 56, 70]
lo = 0
hi = len(lst) - 1
mid = (lo + hi) // 2
print(lst[mid])`, a:["22"], d:["30","26","15"],
w:"hi is 7, so mid is 7 // 2 = 3 and lst[3] is 22. With an even number of items, // rounds down to the left of the two middle items."},

{t:"Binary search", p:1, q:"What does this print?",
c:`lst = [2, 6, 9, 14, 20, 25, 31]
lo, hi = 0, 6
while lo <= hi:
    mid = (lo + hi) // 2
    print(mid, end=" ")
    if lst[mid] == 6:
        break
    elif lst[mid] < 6:
        lo = mid + 1
    else:
        hi = mid - 1`, a:["3 1"], d:["3 1 0","3 2 1","1"],
w:"The first mid is 3 (14 is too big), so hi becomes 2. The next mid is (0 + 2) // 2 = 1, which holds 6."},

{t:"Binary search", q:"Make the data ready for a binary search.",
c:`lst = [42, 7, 19, 3, 25]
lst.{{0}}()
lo, hi = 0, len(lst) - 1
found = False
while lo <= hi and not found:
    mid = (lo + hi) // 2
    if lst[mid] == 7:
        found = True
    elif lst[mid] < 7:
        lo = mid + 1
    else:
        hi = mid - 1
print(found)`, a:["sort"], d:["reverse","copy","sorted"], o:"True",
w:"A binary search only works on sorted data. Without sorting, it throws away the half that actually holds 7."},

{t:"Binary search", p:1, q:"What does this print?",
c:`lst = [8, 2, 9, 5, 1]
lo, hi = 0, 4
found = False
while lo <= hi and not found:
    mid = (lo + hi) // 2
    if lst[mid] == 5:
        found = True
    elif lst[mid] < 5:
        lo = mid + 1
    else:
        hi = mid - 1
print(found)`, a:["False"], d:["True","3","IndexError"],
w:"The list isn't sorted. 9 is bigger than 5, so the search looks left and never reaches the 5 on the right."},

{t:"Binary search", q:"Set hi to the last valid index.",
c:`lst = [10, 20, 30, 40]
lo = 0
hi = {{0}}
while lo <= hi:
    mid = (lo + hi) // 2
    if lst[mid] == 99:
        break
    lo = mid + 1
print("Not found")`, a:["len(lst) - 1"], d:["len(lst)","len(lst) + 1"], o:"Not found",
w:"Indexes run from 0 to len(lst) - 1. Starting hi at len(lst) lets mid reach 4, which raises an IndexError."},

{t:"Binary search", q:"Return the position of the item.",
c:`def bs(lst, x):
    lo, hi = 0, len(lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if lst[mid] == x:
            return {{0}}
        elif lst[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
lst = [5, 15, 25, 35, 45, 55, 65]
print(bs(lst, 15))`, a:["mid"], d:["lst[mid]","x","lo"], o:"1",
w:"mid is the index of the matching item. lst[mid] and x would both give the value 15, not its position."},

{t:"Binary search", q:"Search the sorted names alphabetically.",
c:`names = ["Al", "Bo", "Cy", "Di", "Ed"]
lo, hi = 0, 4
while lo <= hi:
    mid = (lo + hi) // 2
    if names[mid] == "Bo":
        print("Found at", mid)
        break
    elif names[mid] {{0}} "Bo":
        lo = mid + 1
    else:
        hi = mid - 1`, a:["<"], d:[">","==","!="], o:"Found at 1",
w:"Strings compare alphabetically, so \"Cy\" < \"Bo\" is False and the search moves to the lower half."},

{t:"Binary search", p:1, q:"What are lo and hi after one step?",
c:`lst = [5, 10, 15, 20, 25, 30, 35]
lo, hi = 0, 6
x = 30
mid = (lo + hi) // 2
if lst[mid] < x:
    lo = mid + 1
else:
    hi = mid - 1
print(lo, hi)`, a:["4 6"], d:["3 6","0 2","4 5"],
w:"mid is 3 and lst[3] is 20, which is less than 30. So the bottom half is thrown away and lo becomes 4."},

{t:"Binary search", p:1, q:"What are lo and hi after one step?",
c:`lst = [3, 6, 9, 12, 15, 18]
lo, hi = 0, 5
mid = (lo + hi) // 2
if lst[mid] < 6:
    lo = mid + 1
else:
    hi = mid - 1
print(lo, hi)`, a:["0 1"], d:["0 2","3 5","0 5"],
w:"mid is 5 // 2 = 2 and lst[2] is 9. That is bigger than 6, so hi moves to mid - 1, which is 1."},

{t:"Binary search", q:"Search the left or right half recursively.",
c:`def bs(lst, x, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if lst[mid] == x:
        return mid
    if lst[mid] < x:
        return bs(lst, x, {{0}}, hi)
    return bs(lst, x, lo, {{1}})
lst = [1, 4, 6, 9, 12]
for x in [4, 12, 5]:
    print(bs(lst, x, 0, 4), end=" ")`, a:["mid + 1","mid - 1"], d:["mid","lo","hi"], o:"1 4 -1",
w:"Each call searches a smaller range. Skipping past mid on both sides makes sure the range shrinks and the recursion ends."},

{t:"Binary search", q:"Search for the number the user types.",
c:`lst = [11, 22, 33, 44, 55]
x = {{0}}(input())
lo, hi = 0, 4
while lo <= hi:
    mid = (lo + hi) // 2
    if lst[mid] == x:
        print("Found at", mid)
        break
    elif lst[mid] < x:
        lo = mid + 1
    else:
        hi = mid - 1`, i:["44"], a:["int"], d:["str","len","print"], o:"Found at 3",
w:"input() returns a string, and comparing a string with an int using < raises a TypeError. Cast with int() first."},

{t:"Binary search", p:1, q:"How many steps does the search take?",
c:`lst = [2, 4, 6, 8, 10, 12, 14]
lo, hi = 0, 6
steps = 0
while lo <= hi:
    mid = (lo + hi) // 2
    steps += 1
    if lst[mid] == 8:
        break
    elif lst[mid] < 8:
        lo = mid + 1
    else:
        hi = mid - 1
print(steps)`, a:["1"], d:["4","3","0"],
w:"8 is the exact middle item (index 3), so it is found on the very first check. That is the best case for a binary search."},

{t:"Binary search", p:1, q:"How many steps before it gives up?",
c:`lst = [10, 20, 30, 40, 50, 60, 70]
lo, hi = 0, 6
steps = 0
while lo <= hi:
    mid = (lo + hi) // 2
    steps += 1
    if lst[mid] == 5:
        break
    elif lst[mid] < 5:
        lo = mid + 1
    else:
        hi = mid - 1
print(steps)`, a:["3"], d:["7","2","4"],
w:"It checks 40, then 20, then 10. After that hi is -1, which is less than lo, so the search stops."},

{t:"Binary search", q:"Search the sorted high scores.",
c:`scores = [12, 25, 37, 48, 59, 66]
x = 66
lo, hi = 0, len(scores) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if scores[mid] == x:
        print("Rank", mid + 1)
        break
    elif scores[mid] < x:
        lo = {{0}}
    else:
        hi = mid - 1`, a:["mid + 1"], d:["mid","mid - 1","hi + 1"], o:"Rank 6",
w:"The middle item is too small, so search above it from mid + 1. With lo = mid the range stops shrinking and the loop never ends."},

{t:"Binary search", q:"Search for 4, which is not in the list.",
c:`lst = [3, 5, 8, 13, 21, 34, 55]
lo, hi = 0, 6
pos = -1
while lo <= hi and pos == -1:
    mid = (lo + hi) // 2
    if lst[mid] == 4:
        pos = mid
    elif lst[mid] < 4:
        lo = mid + 1
    else:
        hi = {{0}}
print(pos, lo, hi)`, a:["mid - 1"], d:["mid","mid + 1","hi"], o:"-1 1 0",
w:"13 is too big, so the target is below it. hi = mid - 1 drops the middle item and everything above it."},

// ---------- Bubble sort ----------
{t:"Bubble sort", q:"Compare each pair of neighbours to sort ascending.",
c:`lst = [5, 1, 4, 2]
n = len(lst)
for i in range(n - 1):
    for j in range(n - 1 - i):
        if lst[j] {{0}} lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
print(lst)`, a:[">"], d:["<","==","!="], o:"[1, 2, 4, 5]",
w:"If the left item is bigger than its neighbour they are out of order, so swap them. Using < would sort the list into descending order."},

{t:"Bubble sort", q:"Swap the two neighbours using a temporary variable.",
c:`lst = [8, 3, 6]
for j in range(2):
    if lst[j] > lst[j + 1]:
        tmp = {{0}}
        lst[j] = {{1}}
        lst[j + 1] = {{2}}
print(lst)`, a:["lst[j]","lst[j + 1]","tmp"], d:["j","lst[j - 1]"], o:"[3, 6, 8]",
w:"Save lst[j] in tmp first, copy the right item to the left, then put the saved value on the right. Without tmp the first value would be lost."},

{t:"Bubble sort", q:"Swap the two values with Python's tuple swap.",
c:`lst = [9, 4]
if lst[0] > lst[1]:
    lst[0], lst[1] = {{0}}
print(lst)`, a:["lst[1], lst[0]"], d:["lst[0], lst[1]","lst[1], lst[1]","lst[0], lst[0]"], o:"[4, 9]",
w:"Python works out the right-hand side first, then assigns both at once, so no temporary variable is needed."},

{t:"Bubble sort", q:"Make one pass without going off the end.",
c:`a = [7, 3, 9, 2]
for j in range({{0}}):
    if a[j] > a[j + 1]:
        a[j], a[j+1] = a[j+1], a[j]
print(a)`, a:["len(a) - 1"], d:["len(a)","len(a) - 2","len(a) + 1"], o:"[3, 7, 2, 9]",
w:"Each comparison looks at a[j + 1], so j must stop at len(a) - 2. range(len(a) - 1) does that; range(len(a)) raises an IndexError."},

{t:"Bubble sort", p:1, q:"What is the list after one pass?",
c:`a = [5, 3, 8, 1]
for j in range(3):
    if a[j] > a[j + 1]:
        a[j], a[j+1] = a[j+1], a[j]
print(a)`, a:["[3, 5, 1, 8]"], d:["[1, 3, 5, 8]","[3, 5, 8, 1]","[3, 1, 5, 8]"],
w:"5 and 3 swap, 5 and 8 stay, 8 and 1 swap. After one pass the largest item, 8, has bubbled to the end."},

{t:"Bubble sort", p:1, q:"What is the list after one pass?",
c:`a = [4, 9, 2, 7, 1]
for j in range(len(a) - 1):
    if a[j] > a[j + 1]:
        tmp = a[j]
        a[j] = a[j + 1]
        a[j + 1] = tmp
print(a)`, a:["[4, 2, 7, 1, 9]"], d:["[1, 2, 4, 7, 9]","[4, 2, 9, 1, 7]","[2, 4, 7, 1, 9]"],
w:"Once 9 is reached it is bigger than everything after it, so it gets swapped all the way to the end in this one pass."},

{t:"Bubble sort", q:"Set the flag that keeps the sort going.",
c:`lst = [4, 3, 2, 1]
swapped = True
while swapped:
    swapped = {{0}}
    for j in range(len(lst) - 1):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
            swapped = {{1}}
print(lst)`, a:["False","True"], d:["false","true","swapped"], o:"[1, 2, 3, 4]",
w:"Each pass starts by assuming no swaps; a swap sets the flag to True so another pass runs. Python's Booleans need capitals: true and false are NameErrors."},

{t:"Bubble sort", p:1, q:"How many passes does this sort make?",
c:`lst = [1, 2, 3, 4]
passes = 0
swapped = True
while swapped:
    swapped = False
    passes += 1
    for j in range(3):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
            swapped = True
print(passes)`, a:["1"], d:["0","3","4"],
w:"The list is already sorted, so the first pass makes no swaps and the flag stops the loop. That early stop is why the swapped flag is worth having."},

{t:"Bubble sort", p:1, q:"How many swaps does the sort make?",
c:`lst = [3, 2, 1]
swaps = 0
for i in range(2):
    for j in range(2):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
            swaps += 1
print(swaps)`, a:["3"], d:["2","4","1"],
w:"Pass 1 swaps 3 with 2 and then 3 with 1, giving [2, 1, 3]. Pass 2 swaps 2 with 1. That's 3 swaps in total."},

{t:"Bubble sort", q:"Sort the high scores from biggest to smallest.",
c:`s = [40, 75, 12, 90]
for i in range(len(s) - 1):
    for j in range(len(s) - 1):
        if s[j] {{0}} s[j + 1]:
            tmp = s[j]
            s[j] = s[j + 1]
            s[j + 1] = tmp
print(s)`, a:["<"], d:[">","==","!="], o:"[90, 75, 40, 12]",
w:"For descending order, swap when the left item is smaller than its neighbour, so the smaller values sink to the end."},

{t:"Bubble sort", q:"Sort the names alphabetically.",
c:`names = ["Zak", "Amy", "Kai"]
for i in range(2):
    for j in range(2):
        if names[j] > {{0}}:
            tmp = names[j]
            names[j] = names[j + 1]
            names[j + 1] = tmp
print(names)`, a:["names[j + 1]"], d:["names[j]","names[i]","names[j - 1]"], o:"['Amy', 'Kai', 'Zak']",
w:"Bubble sort always compares neighbours: item j and item j + 1. Strings compare alphabetically, so \"Zak\" > \"Amy\" is True."},

{t:"Bubble sort", p:1, q:"What is the list after two passes?",
c:`a = [6, 5, 4, 3]
for i in range(2):
    for j in range(3):
        if a[j] > a[j + 1]:
            tmp = a[j]
            a[j] = a[j + 1]
            a[j + 1] = tmp
print(a)`, a:["[4, 3, 5, 6]"], d:["[5, 4, 3, 6]","[3, 4, 5, 6]","[4, 5, 3, 6]"],
w:"Pass 1 moves 6 to the end: [5, 4, 3, 6]. Pass 2 moves 5 next to it: [4, 3, 5, 6]. Two more passes would be needed in the worst case."},

{t:"Bubble sort", q:"Make enough passes to sort any list of n items.",
c:`lst = [4, 3, 2, 1]
n = len(lst)
for i in range({{0}}):
    for j in range(n - 1):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
print(lst)`, a:["n - 1"], d:["1","n - 2","2"], o:"[1, 2, 3, 4]",
w:"Each pass fixes one more item at the end, so n - 1 passes are always enough. A reverse-ordered list is the worst case and needs them all."},

{t:"Bubble sort", p:1, q:"How many comparisons are in one pass?",
c:`lst = [8, 2, 7, 4, 9, 1]
comps = 0
for j in range(len(lst) - 1):
    comps += 1
    if lst[j] > lst[j + 1]:
        tmp = lst[j]
        lst[j] = lst[j + 1]
        lst[j + 1] = tmp
print(comps)`, a:["5"], d:["6","4","3"],
w:"With 6 items there are 5 neighbouring pairs, so one pass always makes 5 comparisons, whether or not it swaps."},

{t:"Bubble sort", p:1, q:"What does this print?",
c:`lst = [7, 2]
if lst[0] > lst[1]:
    lst[0] = lst[1]
    lst[1] = lst[0]
print(lst)`, a:["[2, 2]"], d:["[2, 7]","[7, 7]","[7, 2]"],
w:"The first line overwrites the 7 before it has been saved, so both items end up as 2. A swap needs a temp variable or a tuple swap."},

{t:"Bubble sort", q:"Sort the players by score, lowest first.",
c:`p = [["Ali", 30], ["Bea", 12]]
for j in range(len(p) - 1):
    if p[j]{{0}} > p[j + 1]{{1}}:
        p[j], p[j+1] = p[j+1], p[j]
print(p[0][0])`, a:["[1]","[1]"], d:["[0]","[2]"], o:"Bea",
w:"Each record is [name, score], so compare index [1] of each. The whole record is swapped so names stay with their scores."},

{t:"Bubble sort", q:"Each pass can stop one place earlier.",
c:`lst = [5, 4, 1, 3]
n = len(lst)
while n > 1:
    for j in range(n - 1):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
    n = {{0}}
print(lst)`, a:["n - 1"], d:["n + 1","n","n - 4"], o:"[1, 3, 4, 5]",
w:"After each pass the largest remaining item is in its final place, so the next pass can check one fewer pair. This makes the sort a bit faster."},

{t:"Bubble sort", p:1, q:"What does this print?",
c:`lst = [2, 4, 6, 8]
swapped = False
for j in range(3):
    if lst[j] > lst[j + 1]:
        tmp = lst[j]
        lst[j] = lst[j + 1]
        lst[j + 1] = tmp
        swapped = True
print(swapped)`, a:["False"], d:["True","3","None"],
w:"Every item is already smaller than its neighbour, so no swap happens and the flag stays False. A bubble sort can stop here."},

{t:"Bubble sort", q:"Stop as soon as a pass makes no swaps.",
c:`lst = [2, 1, 3, 4]
for i in range(3):
    swapped = False
    for j in range(3):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
            swapped = True
    print("Pass", i + 1)
    if {{0}}:
        break`, a:["not swapped"], d:["swapped","swapped == True","i == 3"], o:"Pass 1\nPass 2",
w:"Pass 1 swaps 2 and 1. Pass 2 makes no swaps, so the list must be sorted and break ends the sort early."},

{t:"Bubble sort", p:1, q:"How many passes does this sort make?",
c:`lst = [3, 1, 2, 4, 5]
passes = 0
swapped = True
while swapped:
    swapped = False
    passes += 1
    for j in range(4):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
            swapped = True
print(passes)`, a:["2"], d:["1","4","3"],
w:"Pass 1 gives [1, 2, 3, 4, 5] with swaps. Pass 2 makes no swaps, which confirms the list is sorted, so 2 passes are made."},

// ---------- Insertion sort ----------
{t:"Insertion sort", q:"Start comparing with the item to the left.",
c:`lst = [5, 2, 4, 1]
for i in range(1, len(lst)):
    key = lst[i]
    j = {{0}}
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:["i - 1"], d:["i","i + 1","0"], o:"[1, 2, 4, 5]",
w:"Everything to the left of position i is already sorted, so the search for the key's place starts at i - 1 and works leftwards."},

{t:"Insertion sort", q:"Pick the item to insert on each pass.",
c:`lst = [7, 3, 5]
for i in range(1, len(lst)):
    key = {{0}}
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:["lst[i]"], d:["lst[j]","i","lst[0]"], o:"[3, 5, 7]",
w:"The key is the next unsorted item, lst[i]. It is saved first because shifting items right will overwrite position i."},

{t:"Insertion sort", q:"Allow the key to move right to the front.",
c:`lst = [6, 8, 2]
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j {{0}} 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:[">="], d:[">","==","<"], o:"[2, 6, 8]",
w:"Index 0 is a real position, so the loop must still run when j is 0. With j > 0 the 2 can never get past the first item."},

{t:"Insertion sort", q:"Shift items while they are bigger than the key.",
c:`lst = [9, 4, 7, 1]
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] {{0}} key:
        lst[j + 1] = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:[">"], d:["<","==","<="], o:"[1, 4, 7, 9]",
w:"Larger items move one place right to make room. The loop stops at an item that is not bigger than the key, and the key goes just after it."},

{t:"Insertion sort", q:"Shift the bigger item one place to the right.",
c:`lst = [5, 3, 8, 2]
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        {{0}} = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:["lst[j + 1]"], d:["lst[j - 1]","lst[i]","key"], o:"[2, 3, 5, 8]",
w:"Copying lst[j] into lst[j + 1] moves it one place right. The key's old spot can be overwritten because the key is saved."},

{t:"Insertion sort", q:"Drop the key into the gap.",
c:`lst = [4, 1, 3]
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = j - 1
    {{0}} = key
print(lst)`, a:["lst[j + 1]"], d:["lst[j]","lst[i]","lst[j - 1]"], o:"[1, 3, 4]",
w:"The loop stops with j on the item just left of the gap (or -1), so the gap is at j + 1."},

{t:"Insertion sort", q:"Move left through the sorted part.",
c:`lst = [3, 9, 1]
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = {{0}}
    lst[j + 1] = key
print(lst)`, a:["j - 1"], d:["j + 1","i - 1","0"], o:"[1, 3, 9]",
w:"j steps left one place at a time. With j + 1 it would move the wrong way and copy the same item along."},

{t:"Insertion sort", p:1, q:"What is the list after the first pass?",
c:`lst = [8, 3, 5, 1]
for i in range(1, 2):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:["[3, 8, 5, 1]"], d:["[1, 3, 5, 8]","[3, 5, 8, 1]","[8, 3, 5, 1]"],
w:"Only i = 1 runs: the key 3 is inserted before 8. The rest of the list hasn't been looked at yet."},

{t:"Insertion sort", p:1, q:"What is the list after two passes?",
c:`lst = [8, 3, 5, 1]
for i in range(1, 3):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j = j - 1
    lst[j + 1] = key
print(lst)`, a:["[3, 5, 8, 1]"], d:["[3, 8, 5, 1]","[1, 3, 5, 8]","[3, 5, 1, 8]"],
w:"Pass 1 gives [3, 8, 5, 1]. Pass 2 inserts 5 between 3 and 8. The first three items are now sorted; 1 is still waiting."},

{t:"Insertion sort", p:1, q:"How many times is an item shifted?",
c:`lst = [4, 2, 3, 1]
shifts = 0
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        shifts += 1
        j -= 1
    lst[j + 1] = key
print(shifts)`, a:["5"], d:["3","6","4"],
w:"2 shifts past 4 (1), 3 shifts past 4 (1), and 1 shifts past 4, 3 and 2 (3). That's 1 + 1 + 3 = 5."},

{t:"Insertion sort", q:"Sort the times from highest to lowest.",
c:`t = [12, 30, 25, 8]
for i in range(1, len(t)):
    key = t[i]
    j = i - 1
    while j >= 0 and t[j] {{0}} key:
        t[j + 1] = t[j]
        j -= 1
    t[j + 1] = key
print(t)`, a:["<"], d:[">","==",">="], o:"[30, 25, 12, 8]",
w:"For descending order, smaller items are shifted right to make room, so the condition flips to <."},

{t:"Insertion sort", q:"Sort the fruit alphabetically.",
c:`f = ["pear", "kiwi", "fig", "date"]
for i in range(1, len(f)):
    key = f[i]
    j = i - 1
    while j >= 0 and f[j] > {{0}}:
        f[j + 1] = f[j]
        j -= 1
    f[j + 1] = key
print(f)`, a:["key"], d:["f[i]","f[0]","f[j]"], o:"['date', 'fig', 'kiwi', 'pear']",
w:"Compare with the saved key, not f[i]: once shifting starts, f[i] has been overwritten. Strings compare alphabetically."},

{t:"Insertion sort", p:1, q:"Which keys are inserted, in order?",
c:`lst = [6, 2, 9, 4]
for i in range(1, len(lst)):
    key = lst[i]
    print(key, end=" ")
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j -= 1
    lst[j + 1] = key`, a:["2 9 4"], d:["6 2 9 4","2 4 6 9","2 6 9"],
w:"The key is lst[i] for i = 1, 2, 3. The first item, 6, is never a key: on its own it already counts as sorted."},

{t:"Insertion sort", p:1, q:"How many shifts happen?",
c:`lst = [1, 4, 6, 9]
shifts = 0
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        shifts += 1
        j -= 1
    lst[j + 1] = key
print(shifts)`, a:["0"], d:["3","6","4"],
w:"The list is already sorted, so no item is bigger than the key that follows it. That is the best case for insertion sort."},

{t:"Insertion sort", q:"Insert 10 into the sorted list.",
c:`lst = [3, 8, 12, 20]
lst.append(10)
j = len(lst) - 2
while j >= 0 and lst[j] > 10:
    lst[j + 1] = {{0}}
    j -= 1
lst[{{1}}] = 10
print(lst)`, a:["lst[j]","j + 1"], d:["lst[j + 1]","j","10"], o:"[3, 8, 10, 12, 20]",
w:"20 and 12 each shift one place right. The loop stops at 8 (j = 1), so 10 goes into the gap at j + 1."},

{t:"Insertion sort", p:1, q:"Where does the loop stop?",
c:`lst = [2, 5, 7, 11, 4]
key = lst[4]
j = 3
while j >= 0 and lst[j] > key:
    lst[j + 1] = lst[j]
    j -= 1
print(j)`, a:["0"], d:["1","-1","3"],
w:"11, 7 and 5 are all bigger than 4 and shift right. lst[0] is 2, which is not, so the loop stops with j = 0 and 4 goes in at index 1."},

{t:"Insertion sort", q:"Return the sorted list from the function.",
c:`def ins(lst):
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j + 1] = lst[j]
            j -= 1
        lst[j + 1] = key
    {{0}}
print(ins([3, 1, 2]))`, a:["return lst"], d:["return key","print(lst)","return"], o:"[1, 2, 3]",
w:"Without return lst, the function returns None. The return must be after the for loop, at the function's indent level."},

{t:"Insertion sort", q:"Print the list after every pass.",
c:`lst = [4, 3, 1]
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j -= 1
    lst[j + 1] = key
    {{0}}`, a:["print(lst)"], d:["print(key)","print(j)","print(i)"], o:"[3, 4, 1]\n[1, 3, 4]",
w:"There are two passes for three items. After the first, the first two items are sorted; after the second, the whole list is."},

{t:"Insertion sort", p:1, q:"How many comparisons with the key are made?",
c:`lst = [5, 1, 4]
comps = 0
for i in range(1, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0:
        comps += 1
        if lst[j] <= key:
            break
        lst[j + 1] = lst[j]
        j -= 1
    lst[j + 1] = key
print(comps)`, a:["3"], d:["2","4","1"],
w:"Key 1 is compared with 5 (shift), then j is -1. Key 4 is compared with 5 (shift) and then 1 (stop). That's 1 + 2 = 3."},

{t:"Insertion sort", q:"Start from the second item.",
c:`lst = [9, 2, 6]
for i in range({{0}}, len(lst)):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        j -= 1
    lst[j + 1] = key
print(lst)`, a:["1"], d:["2","3","len(lst)"], o:"[2, 6, 9]",
w:"A single item on its own counts as sorted, so insertion sort starts with the key at index 1 and inserts it into the part to its left."},

// ---------- Merge sort ----------
{t:"Merge sort", q:"Take the smaller front item when merging.",
c:`a = [2, 5, 9]
b = [3, 4, 10]
res = []
i = j = 0
while i < len(a) and j < len(b):
    if a[i] {{0}} b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        j += 1
print(res + a[i:] + b[j:])`, a:["<"], d:[">","==","!="], o:"[2, 3, 4, 5, 9, 10]",
w:"Both lists are already sorted, so the smallest remaining item is always at the front of one of them. Compare the two fronts and take the smaller."},

{t:"Merge sort", q:"Keep merging while both lists still have items.",
c:`a = [1, 6]
b = [2, 3, 8]
res = []
i = j = 0
while i < len(a) {{0}} j < len(b):
    if a[i] < b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        j += 1
print(res + a[i:] + b[j:])`, a:["and"], d:["or","is","=="], o:"[1, 2, 3, 6, 8]",
w:"Once one list runs out there is nothing to compare with. With or, the loop carries on and a[i] goes past the end, raising an IndexError."},

{t:"Merge sort", q:"Add whatever is left over after merging.",
c:`a = [4, 7]
b = [1, 2, 9, 12]
res = []
i = j = 0
while i < len(a) and j < len(b):
    if a[i] < b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        j += 1
print(res + {{0}})`, a:["b[j:]"], d:["b[:j]","b[j]","b"], o:"[1, 2, 4, 7, 9, 12]",
w:"When a runs out, the rest of b (from index j to the end) is already sorted and bigger than everything in res, so it can be added as it is."},

{t:"Merge sort", q:"Move the right pointer on after taking from it.",
c:`a = [3, 8]
b = [5, 6]
res = []
i = j = 0
while i < len(a) and j < len(b):
    if a[i] < b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        {{0}}
print(res + a[i:] + b[j:])`, a:["j += 1"], d:["i += 1","j -= 1","j = 0"], o:"[3, 5, 6, 8]",
w:"Each pointer marks the next unused item in its own list. After taking b[j], only j moves on."},

{t:"Merge sort", p:1, q:"What is res when the loop ends?",
c:`a = [2, 5, 9]
b = [3, 4]
res = []
i = j = 0
while i < len(a) and j < len(b):
    if a[i] < b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        j += 1
print(res)`, a:["[2, 3, 4]"], d:["[2, 3, 4, 5, 9]","[2, 3, 4, 5]","[2, 3]"],
w:"After 4 is taken, b is used up and the loop stops. 5 and 9 are still waiting in a and must be added afterwards."},

{t:"Merge sort", p:1, q:"Which items are left over in a?",
c:`a = [6, 11, 15]
b = [1, 7, 9]
res = []
i = j = 0
while i < len(a) and j < len(b):
    if a[i] < b[j]:
        res.append(a[i])
        i += 1
    else:
        res.append(b[j])
        j += 1
print(a[i:])`, a:["[11, 15]"], d:["[15]","[]","[6, 11, 15]"],
w:"Merging takes 1, 6, 7, 9. Then b is empty, so i is still 1 and a[1:] is [11, 15]."},

{t:"Merge sort", q:"Split the list into two halves.",
c:`lst = [8, 3, 5, 1, 9, 2]
mid = len(lst) // 2
left = lst[{{0}}]
right = lst[{{1}}]
print(left, right)`, a:[":mid","mid:"], d:["mid","1:mid","mid+1:"], o:"[8, 3, 5] [1, 9, 2]",
w:"lst[:mid] takes indexes 0 to mid - 1 and lst[mid:] takes mid to the end, so every item goes into exactly one half."},

{t:"Merge sort", p:1, q:"What is the left half?",
c:`lst = [4, 7, 1, 8, 3, 6, 2]
mid = len(lst) // 2
left = lst[:mid]
right = lst[mid:]
print(left)`, a:["[4, 7, 1]"], d:["[4, 7, 1, 8]","[1, 3, 4, 7]","[4, 7]"],
w:"7 // 2 is 3, so the left half is indexes 0, 1 and 2. With an odd number of items the right half gets the extra one."},

{t:"Merge sort", p:1, q:"What is the right half?",
c:`lst = [10, 20, 30, 40, 50]
mid = len(lst) // 2
print(lst[mid:])`, a:["[30, 40, 50]"], d:["[40, 50]","[20, 30, 40, 50]","[30]"],
w:"mid is 5 // 2 = 2. The slice lst[2:] starts at index 2, which holds 30, and runs to the end."},

{t:"Merge sort", q:"Stop splitting when the list can't be split.",
c:`def msort(lst):
    if {{0}}:
        return lst
    mid = len(lst) // 2
    a = msort(lst[:mid])
    b = msort(lst[mid:])
    res = []
    while a and b:
        if a[0] < b[0]:
            res.append(a.pop(0))
        else:
            res.append(b.pop(0))
    return res + a + b
print(msort([6, 2, 9, 1]))`, a:["len(lst) <= 1"], d:["len(lst) == 2","len(lst) > 1","lst == []"], o:"[1, 2, 6, 9]",
w:"A list of 0 or 1 items is already sorted, so it is the base case. Without it, msort would keep calling itself forever."},

{t:"Merge sort", q:"Sort the right half by calling msort again.",
c:`def msort(lst):
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    a = msort(lst[:mid])
    b = msort({{0}})
    res = []
    while a and b:
        if a[0] < b[0]:
            res.append(a.pop(0))
        else:
            res.append(b.pop(0))
    return res + a + b
print(msort([5, 3, 8, 4]))`, a:["lst[mid:]"], d:["lst[:mid]","lst","lst[mid]"], o:"[3, 4, 5, 8]",
w:"Merge sort splits the list into halves, sorts each half the same way (recursion), then merges the two sorted halves."},

{t:"Merge sort", q:"Take the front item from the list it came from.",
c:`a = [1, 4, 7]
b = [2, 3]
res = []
while a and b:
    if a[0] < b[0]:
        res.append(a.{{0}}(0))
    else:
        res.append(b.{{1}}(0))
print(res + a + b)`, a:["pop","pop"], d:["remove","index","append"], o:"[1, 2, 3, 4, 7]",
w:"pop(0) removes the front item and gives it back, so it can be appended to res. remove(0) would look for the value 0 instead."},

{t:"Merge sort", p:1, q:"How many times is msort called?",
c:`calls = 0
def msort(lst):
    global calls
    calls += 1
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    a = msort(lst[:mid])
    return a + msort(lst[mid:])
msort([4, 3, 2, 1])
print(calls)`, a:["7"], d:["4","3","8"],
w:"One call for the whole list, two for the halves and four for the single items: 1 + 2 + 4 = 7."},

{t:"Merge sort", p:1, q:"How many times can the list be halved?",
c:`n = 8
levels = 0
while n > 1:
    n = n // 2
    levels += 1
print(levels)`, a:["3"], d:["4","8","2"],
w:"8 splits to 4, then 2, then 1. Merge sort splits a list of 8 into single items in 3 levels, and needs 3 levels of merging to rebuild it."},

{t:"Merge sort", q:"Merge into descending order.",
c:`a = [9, 4, 1]
b = [7, 6]
res = []
while a and b:
    if a[0] {{0}} b[0]:
        res.append(a.pop(0))
    else:
        res.append(b.pop(0))
print(res + a + b)`, a:[">"], d:["<","==","<="], o:"[9, 7, 6, 4, 1]",
w:"Both lists are sorted biggest first, so take the bigger front item each time."},

{t:"Merge sort", p:1, q:"How many comparisons does this merge make?",
c:`a = [1, 2, 3]
b = [4, 5, 6]
i = j = comps = 0
while i < len(a) and j < len(b):
    comps += 1
    if a[i] < b[j]:
        i += 1
    else:
        j += 1
print(comps)`, a:["3"], d:["6","5","9"],
w:"Every item in a is smaller than 4, so after 3 comparisons a is used up. The rest of b is added without comparing."},

{t:"Merge sort", p:1, q:"How many comparisons does this merge make?",
c:`a = [1, 5, 9]
b = [2, 6, 10]
i = j = comps = 0
while i < len(a) and j < len(b):
    comps += 1
    if a[i] < b[j]:
        i += 1
    else:
        j += 1
print(comps)`, a:["5"], d:["6","3","4"],
w:"The fronts take turns: 1, 2, 5, 6, 9 each need a comparison. Then a is empty and 10 is added without one, so 5 in all."},

{t:"Merge sort", q:"Merge the two sorted lists of names.",
c:`a = ["Ali", "Fay"]
b = ["Ben", "Cat", "Gus"]
res = []
while a and b:
    if a[0] < b[0]:
        res.append(a.pop(0))
    else:
        res.append(b.pop(0))
res = res + {{0}}
print(res[-2:])`, a:["a + b"], d:["a","[]","b[0]"], o:"['Fay', 'Gus']",
w:"One list is empty when the loop ends, but you don't know which, so add both. Here a is empty and b still holds \"Gus\"."},

{t:"Merge sort", q:"Add the rest of the list in one go.",
c:`res = [1, 2, 5]
b = [7, 8]
j = 0
res.{{0}}(b[j:])
print(res)`, a:["extend"], d:["append","insert","pop"], o:"[1, 2, 5, 7, 8]",
w:"extend() adds each item of the slice. append() would add the whole slice as one item, giving [1, 2, 5, [7, 8]]."},

{t:"Merge sort", p:1, q:"What does this print?",
c:`lst = [5, 2, 8, 1]
for k in range(0, len(lst), 2):
    print(lst[k:k + 2], end=" ")`, a:["[5, 2] [8, 1]"], d:["[5, 2, 8] [1]","[2, 5] [1, 8]","[5] [2] [8] [1]"],
w:"The step of 2 gives k = 0 and k = 2, so each slice is a pair. This is the second level of splitting a list of 4."},

{t:"Merge sort", p:1, q:"What is the list after merging the first pair?",
c:`lst = [6, 3, 9, 4]
if lst[0] > lst[1]:
    lst[0], lst[1] = lst[1], lst[0]
print(lst)`, a:["[3, 6, 9, 4]"], d:["[3, 4, 6, 9]","[6, 3, 4, 9]","[3, 6, 4, 9]"],
w:"Merging the single items 6 and 3 gives the sorted pair [3, 6]. The pair 9, 4 hasn't been merged yet."},

// ---------- Common algorithms ----------
{t:"Common algorithms", q:"Find the highest score.",
c:`scores = [34, 78, 51, 66]
big = scores[0]
for s in scores:
    if s {{0}} big:
        big = s
print(big)`, a:[">"], d:["<","==","="], o:"78",
w:"Keep the biggest value seen so far and replace it whenever a bigger one turns up. With < this would find the minimum."},

{t:"Common algorithms", q:"Find the coldest night.",
c:`temps = [14, 9, 17, 11]
low = {{0}}
for t in temps:
    if t < low:
        low = t
print(low)`, a:["temps[0]"], d:["0","-1","len(temps)"], o:"9",
w:"Start with the first item, not a made-up number. Starting at 0 gives 0, because no temperature is ever lower than it."},

{t:"Common algorithms", p:1, q:"What does this print?",
c:`lst = [12, 5, 19, 7]
small = lst[0]
for x in lst:
    if x < small:
        small = x
print(small)`, a:["5"], d:["12","7","19"],
w:"small starts at 12, drops to 5, and nothing later is smaller than 5."},

{t:"Common algorithms", q:"Add up the sales.",
c:`sales = [120, 45, 80]
total = 0
for s in sales:
    total = {{0}}
print(total)`, a:["total + s"], d:["s","total + 1","total * s"], o:"245",
w:"A running total adds each value to what it already holds. total + 1 would count the items instead."},

{t:"Common algorithms", p:1, q:"What does this print?",
c:`marks = [6, 9, 7, 8]
total = 0
for m in marks:
    total += m
print(total / len(marks))`, a:["7.5"], d:["7","30","7.0"],
w:"The total is 30 and there are 4 marks, so 30 / 4 = 7.5. In Python, / always gives a float."},

{t:"Common algorithms", p:1, q:"What does this print?",
c:`marks = [6, 9, 7, 8]
total = 0
for m in marks:
    total += m
print(total // len(marks))`, a:["7"], d:["7.5","8","30"],
w:"// is integer division (DIV in OCR's reference language), so 30 // 4 throws away the .5 and gives 7."},

{t:"Common algorithms", q:"Count how many students passed.",
c:`marks = [45, 62, 50, 38, 71]
passed = 0
for m in marks:
    if m {{0}} 50:
        passed = passed + 1
print(passed)`, a:[">="], d:[">","==","<"], o:"3",
w:"A pass mark of 50 includes 50 itself, so use >=. With > the student on exactly 50 wouldn't be counted."},

{t:"Common algorithms", q:"Swap the two values using a temporary variable.",
c:`a = 5
b = 9
tmp = {{0}}
a = {{1}}
b = {{2}}
print(a, b)`, a:["a","b","tmp"], d:["0","a + b"], o:"9 5",
w:"Save a first, then overwrite a with b, then give b the saved value. In OCR's reference language you'd write the same three assignments."},

{t:"Common algorithms", p:1, q:"What does this print?",
c:`a = 5
b = 9
a = b
b = a
print(a, b)`, a:["9 9"], d:["9 5","5 9","5 5"],
w:"a = b overwrites the 5 before it has been saved, so b = a just copies 9 back. A swap needs a third variable."},

{t:"Common algorithms", q:"Tally how many times each dice value was rolled.",
c:`rolls = [3, 1, 3, 6, 3, 1]
count = [0] * 7
for r in rolls:
    count[{{0}}] += 1
print(count[1], count[3], count[6])`, a:["r"], d:["r - 1","1","rolls[r]"], o:"2 3 1",
w:"Each roll is used as the index of its own counter, so count[3] counts the 3s. The list has 7 slots so that index 6 exists."},

{t:"Common algorithms", q:"Count the votes for each candidate.",
c:`votes = ["A", "B", "A", "C", "A"]
a = b = c = 0
for v in votes:
    if v == "A":
        a += 1
    elif v == {{0}}:
        b += 1
    else:
        c += 1
print(a, b, c)`, a:["\"B\""], d:["B","\"A\"","b"], o:"3 1 1",
w:"\"B\" in quotes is a string to compare with. B without quotes would be a variable name that doesn't exist, so Python raises a NameError."},

{t:"Common algorithms", q:"Find the position of the highest sensor reading.",
c:`r = [14, 31, 9, 22, 18]
pos = 0
for i in range(len(r)):
    if r[i] > r[pos]:
        pos = {{0}}
print(pos)`, a:["i"], d:["r[i]","i + 1","len(r)"], o:"1",
w:"pos stores the index of the biggest value so far, so it is set to i, not to the value r[i]."},

{t:"Common algorithms", p:1, q:"What does this print?",
c:`t = [17, 23, 11, 20]
hi = t[0]
lo = t[0]
for x in t:
    if x > hi:
        hi = x
    if x < lo:
        lo = x
print(hi - lo)`, a:["12"], d:["6","23","3"],
w:"The highest is 23 and the lowest is 11, so the range is 23 - 11 = 12. Both can be found in a single loop."},

{t:"Common algorithms", q:"Total only the even numbers.",
c:`nums = [3, 8, 5, 6, 10]
total = 0
for n in nums:
    if n {{0}} 2 == 0:
        total += n
print(total)`, a:["%"], d:["//","/","*"], o:"24",
w:"n % 2 gives the remainder after dividing by 2 (MOD in OCR's reference language). It is 0 for even numbers: 8 + 6 + 10 = 24."},

{t:"Common algorithms", q:"Average the three scores the user types.",
c:`total = 0
for k in range(3):
    total += {{0}}(input())
print(total / 3)`, i:["4","8","9"], a:["int"], d:["str","len","input"], o:"7.0",
w:"Each input is a string, so cast it with int() before adding. Adding a string to the integer total would raise a TypeError."},

{t:"Common algorithms", q:"Load boxes until the van is over 50 kg.",
c:`boxes = [12, 20, 18, 9, 7]
load = 0
n = 0
while load {{0}} 50:
    load += boxes[n]
    n += 1
print(n, load)`, a:["<="], d:["<",">=","=="], o:"4 59",
w:"The loop keeps adding while the load is 50 or less. 12 + 20 + 18 is exactly 50, which is not over, so one more box goes on. With < it would stop at 50."},

{t:"Common algorithms", p:1, q:"How many values are above the average?",
c:`lst = [2, 9, 4, 7, 8]
avg = sum(lst) / len(lst)
count = 0
for x in lst:
    if x > avg:
        count += 1
print(count)`, a:["3"], d:["2","5","6"],
w:"The total is 30, so the average is 6.0. Only 9, 7 and 8 are above it."},

{t:"Common algorithms", q:"Keep the lowest time entered.",
c:`best = int(input())
for k in range(2):
    t = int(input())
    if t < {{0}}:
        best = t
print(best)`, i:["58","49","53"], a:["best"], d:["t","58","k"], o:"49",
w:"Each new time is compared with the best so far. Comparing with the first time only (58) would let 53 replace 49."},

{t:"Common algorithms", p:1, q:"What does this print?",
c:`x = 3
y = 8
x, y = y, x
print(x, y)`, a:["8 3"], d:["3 8","8 8","3 3"],
w:"Python works out the right-hand side (8, 3) first and then assigns both, so the values swap without a temp variable."},

{t:"Common algorithms", q:"Reverse the list by swapping from both ends.",
c:`lst = [1, 2, 3, 4, 5]
n = len(lst)
for i in range(n // 2):
    tmp = lst[i]
    lst[i] = lst[{{0}}]
    lst[n - 1 - i] = tmp
print(lst)`, a:["n - 1 - i"], d:["n - i","i + 1","-i"], o:"[5, 4, 3, 2, 1]",
w:"The partner of index i is n - 1 - i: 0 swaps with 4 and 1 swaps with 3. Only half the list is looped over, or it would be swapped back."},

{t:"Common algorithms", q:"Count how many times the letter a appears.",
c:`word = "banana"
count = 0
for ch in word:
    if ch == {{0}}:
        count += 1
print(count)`, a:["\"a\""], d:["a","\"A\"","ch"], o:"3",
w:"The loop checks every character and adds 1 for each \"a\". Without quotes, a would be a variable name, and \"A\" doesn't match because case matters."},

// ---------- Trace tables ----------
{t:"Trace tables", q:"Complete the code so it prints this trace table.",
c:`x = 1
for i in range(4):
    x = x {{0}} 2
    print(i, x)`, a:["*"], d:["+","**","-"], o:"0 2\n1 4\n2 8\n3 16",
w:"x doubles on every pass: 1, 2, 4, 8, 16. Each row of the trace shows i and the new value of x."},

{t:"Trace tables", q:"Keep halving until n reaches 1.",
c:`n = 40
steps = 0
while n {{0}} 1:
    n = n // 2
    steps += 1
    print(steps, n)`, a:[">"], d:[">=","<","=="], o:"1 20\n2 10\n3 5\n4 2\n5 1",
w:"With >, the loop stops once n is 1. With >= it would run once more and n would become 0. Note 5 // 2 is 2, not 2.5."},

{t:"Trace tables", q:"Produce the Fibonacci trace.",
c:`a, b = 0, 1
for k in range(5):
    a, b = b, {{0}}
    print(a, b)`, a:["a + b"], d:["a","b + 1","a * b"], o:"1 1\n1 2\n2 3\n3 5\n5 8",
w:"Both new values are worked out from the old a and b before either changes, so b becomes the old a + b."},

{t:"Trace tables", q:"Choose the range that gives these values of i.",
c:`for i in range({{0}}):
    print(i, i * i)`, a:["1, 6, 2"], d:["1, 5, 2","0, 6, 2","1, 6"], o:"1 1\n3 9\n5 25",
w:"range(1, 6, 2) starts at 1 and goes up in 2s, stopping before 6: 1, 3, 5. With an end of 5, the 5 would be left out."},

{t:"Trace tables", q:"Add up 1, 2, 3 and 4.",
c:`total = 0
for i in range({{0}}):
    total = total + i
print(total)`, a:["1, 5"], d:["1, 6","0, 4","1, 4"], o:"10",
w:"range(1, 5) gives 1, 2, 3, 4, so total goes 1, 3, 6, 10. The 5 is not included."},

{t:"Trace tables", p:1, q:"What does this print?",
c:`n = 472
total = 0
while n > 0:
    total += n % 10
    n = n // 10
print(total)`, a:["13"], d:["472","7","2"],
w:"n % 10 takes the last digit and n // 10 removes it. The trace of total is 2, 9, 13 as n goes 47, 4, 0."},

{t:"Trace tables", q:"Peel off the last digit each time.",
c:`n = 385
while n > 0:
    d = {{0}}
    n = n // 10
    print(d, n)`, a:["n % 10"], d:["n // 10","n / 10","n"], o:"5 38\n8 3\n3 0",
w:"n % 10 is the remainder after dividing by 10, which is the last digit (n MOD 10 in OCR's reference language)."},

{t:"Trace tables", q:"Print the biggest value so far on each pass.",
c:`lst = [4, 9, 2, 11]
big = lst[0]
for x in lst:
    if x > big:
        big = {{0}}
    print(x, big)`, a:["x"], d:["big","lst[0]","x + big"], o:"4 4\n9 9\n2 9\n11 11",
w:"big only changes when a bigger value turns up, so the trace shows it staying at 9 while x is 2."},

{t:"Trace tables", q:"Build the string so it ends up reversed.",
c:`s = ""
for ch in "abc":
    s = {{0}}
print(s)`, a:["ch + s"], d:["s + ch","ch","s"], o:"cba",
w:"Each new character is put in front: s goes \"a\", \"ba\", \"cba\". This reverses the string."},

{t:"Trace tables", q:"Count down in 3s.",
c:`n = 10
while n > 0:
    print(n)
    n -= {{0}}`, a:["3"], d:["2","4","1"], o:"10\n7\n4\n1",
w:"Each pass takes 3 off: 10, 7, 4, 1. After that n is -2, so the loop condition is False."},

{t:"Trace tables", q:"Follow the 3n + 1 rule until n is 1.",
c:`n = 6
while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = {{0}}
    print(n, end=" ")`, a:["3 * n + 1"], d:["n * 3","n + 1","n // 2"], o:"3 10 5 16 8 4 2 1",
w:"Even numbers are halved and odd numbers become 3n + 1. Tracing it by hand shows n rising before it falls to 1."},

{t:"Trace tables", q:"Start the product at the right value.",
c:`p = {{0}}
for i in range(1, 5):
    p = p * i
    print(i, p)`, a:["1"], d:["0","i","-1"], o:"1 1\n2 2\n3 6\n4 24",
w:"Multiplying by 0 always gives 0, so a running product starts at 1. A running total is the one that starts at 0."},

{t:"Trace tables", p:1, q:"What is x after the third pass?",
c:`x = 50
for i in range(5):
    x = x - 10 * i
    if i == 2:
        print(x)`, a:["20"], d:["30","40","0"],
w:"The passes take off 0, 10 and 20, so x goes 50, 40, 20. The print only runs when i is 2, the third pass."},

{t:"Trace tables", p:1, q:"How many times does the inner line run?",
c:`count = 0
for i in range(3):
    for j in range(i, 3):
        count += 1
print(count)`, a:["6"], d:["9","3","5"],
w:"The inner loop runs 3 times when i is 0, 2 times when i is 1 and once when i is 2: 3 + 2 + 1 = 6."},

{t:"Trace tables", q:"Trace a linear search step by step.",
c:`lst = [7, 3, 8]
i = 0
while lst[i] != 8:
    print(i, lst[i])
    i = {{0}}
print("Found at", i)`, a:["i + 1"], d:["i - 1","lst[i]","1"], o:"0 7\n1 3\nFound at 2",
w:"i moves along by 1 each time. The row for index 2 is never printed, because lst[2] is 8 and the loop stops first."},

{t:"Trace tables", q:"Show the list after each comparison in one pass.",
c:`a = [3, 1, 2]
for j in range(2):
    if a[j] > a[j + 1]:
        a[j], a[j+1] = a[j+1], a[j]
    print(j, {{0}})`, a:["a"], d:["a[j]","j + 1","a[0]"], o:"0 [1, 3, 2]\n1 [1, 2, 3]",
w:"A trace of a sort records the whole list after each step. Here both comparisons cause a swap."},

{t:"Trace tables", q:"Make the trace stop when total passes 20.",
c:`total = 0
n = 0
while total {{0}} 20:
    n += 1
    total += n * n
    print(n, total)`, a:["<="], d:[">","==",">="], o:"1 1\n2 5\n3 14\n4 30",
w:"The loop runs while total is 20 or less. After the row 3 14 it runs once more, and 30 ends it."},

{t:"Trace tables", p:1, q:"What does this print?",
c:`a = 2
b = 5
for k in range(2):
    a = a + b
    b = a - b
print(a, b)`, a:["9 7"], d:["12 7","7 2","9 2"],
w:"Pass 1: a = 2 + 5 = 7, then b = 7 - 5 = 2. Pass 2: a = 7 + 2 = 9, then b = 9 - 2 = 7. Each line uses the newest values."},

{t:"Trace tables", q:"Print how much is left after each payment.",
c:`debt = 100
paid = [30, 25, 40]
for p in paid:
    debt = {{0}}
    print(p, debt)`, a:["debt - p"], d:["p - debt","debt - 30","100 - p"], o:"30 70\n25 45\n40 5",
w:"Each payment comes off what is still owed, not off the starting 100, so the trace column for debt keeps falling."},

{t:"Trace tables", p:1, q:"What is the final value of i?",
c:`i = 0
lst = [5, 8, 3, 9, 2]
while i < len(lst) and lst[i] < 9:
    i += 1
print(i)`, a:["3"], d:["4","5","2"],
w:"5, 8 and 3 are below 9, so i goes 1, 2, 3. At index 3 the value is 9 and the loop stops."},

// ---------- Comparing algorithms ----------
{t:"Comparing algorithms", p:1, q:"How many comparisons does the linear search make?",
c:`lst = list(range(1, 101))
comps = 0
for x in lst:
    comps += 1
    if x == 50:
        break
print(comps)`, a:["50"], d:["100","7","49"],
w:"A linear search checks 1, 2, 3 and so on in turn, so it needs 50 comparisons to reach 50."},

{t:"Comparing algorithms", p:1, q:"How many steps does the binary search take?",
c:`lst = list(range(1, 101))
lo, hi, steps = 0, 99, 0
while lo <= hi:
    mid = (lo + hi) // 2
    steps += 1
    if lst[mid] == 50:
        break
    elif lst[mid] < 50:
        lo = mid + 1
    else:
        hi = mid - 1
print(steps)`, a:["1"], d:["50","7","6"],
w:"The first mid is (0 + 99) // 2 = 49, and lst[49] is 50. A binary search can get lucky, while a linear search needs 50 checks here."},

{t:"Comparing algorithms", p:1, q:"Worst case: how many binary search steps?",
c:`n = 1000
steps = 0
while n > 0:
    n = n // 2
    steps += 1
print(steps)`, a:["10"], d:["1000","500","9"],
w:"Each step halves what is left: 1000, 500, 250 and so on. About 10 halvings reach nothing, so at most 10 checks are needed for 1000 items, against 1000 for a linear search."},

{t:"Comparing algorithms", q:"Count the worst-case comparisons for a linear search.",
c:`for n in [10, 100, 1000]:
    comps = 0
    for x in range(n):
        comps = comps + {{0}}
    print(n, comps)`, a:["1"], d:["x","n","2"], o:"10 10\n100 100\n1000 1000",
w:"An item that isn't there is compared with every item, so the worst case grows in step with the size of the list."},

{t:"Comparing algorithms", q:"Show that doubling the data adds about one binary step.",
c:`n = 8
for k in range(3):
    steps = 0
    m = n
    while m > 0:
        m = m // 2
        steps += 1
    print(n, steps)
    n = n * {{0}}`, a:["2"], d:["1","4","n"], o:"8 4\n16 5\n32 6",
w:"Each time the list doubles, one extra halving is needed. That's why binary search is so much faster on big lists."},

{t:"Comparing algorithms", p:1, q:"How many comparisons in total?",
c:`n = 5
comps = 0
for i in range(n - 1):
    for j in range(n - 1 - i):
        comps += 1
print(comps)`, a:["10"], d:["16","25","20"],
w:"Each bubble sort pass checks one pair fewer: 4 + 3 + 2 + 1 = 10."},

{t:"Comparing algorithms", q:"Count the comparisons when each pass gets shorter.",
c:`n = 6
comps = 0
for i in range(n - 1):
    for j in range({{0}}):
        comps += 1
print(comps)`, a:["n - 1 - i"], d:["n - 1","n - i","n"], o:"15",
w:"After pass i, the last i items are already in place, so they don't need checking: 5 + 4 + 3 + 2 + 1 = 15."},

{t:"Comparing algorithms", p:1, q:"How many swaps to sort the reversed list?",
c:`lst = [5, 4, 3, 2, 1]
swaps = 0
for i in range(4):
    for j in range(4 - i):
        if lst[j] > lst[j + 1]:
            tmp = lst[j]
            lst[j] = lst[j + 1]
            lst[j + 1] = tmp
            swaps += 1
print(swaps)`, a:["10"], d:["5","4","16"],
w:"A reversed list is the worst case: every comparison causes a swap, so there are 4 + 3 + 2 + 1 = 10 swaps."},

{t:"Comparing algorithms", p:1, q:"How many shifts to sort the reversed list?",
c:`lst = [4, 3, 2, 1]
shifts = 0
for i in range(1, 4):
    key = lst[i]
    j = i - 1
    while j >= 0 and lst[j] > key:
        lst[j + 1] = lst[j]
        shifts += 1
        j -= 1
    lst[j + 1] = key
print(shifts)`, a:["6"], d:["3","4","9"],
w:"Each key has to move past every item before it: 1 + 2 + 3 = 6. Insertion sort is slowest on reversed data."},

{t:"Comparing algorithms", q:"Count the passes with and without an early stop.",
c:`lst = [1, 2, 3, 4, 5]
passes = 0
for i in range(4):
    passes += 1
    swapped = False
    for j in range(4):
        if lst[j] > lst[j + 1]:
            swapped = True
    if {{0}}:
        break
print(passes)`, a:["not swapped"], d:["swapped","i == 4","passes > 4"], o:"1",
w:"On sorted data the first pass makes no swaps, so the flag ends the sort after 1 pass instead of 4."},

{t:"Comparing algorithms", p:1, q:"How many levels of splitting for 16 items?",
c:`n = 16
levels = 0
while n > 1:
    n = n // 2
    levels += 1
print(levels)`, a:["4"], d:["8","16","15"],
w:"16 splits to 8, 4, 2, 1: four levels. Each level of merging touches every item once, which is why merge sort is fast on big lists."},

{t:"Comparing algorithms", q:"Print which search used fewer comparisons.",
c:`lin = 37
bins = 6
if bins {{0}} lin:
    print("Binary")
else:
    print("Linear")`, a:["<"], d:[">","==",">="], o:"Binary",
w:"Fewer comparisons means less work. On a large sorted list, binary search almost always needs far fewer than linear search."},

{t:"Comparing algorithms", p:1, q:"What is the best case for this linear search?",
c:`lst = [8, 15, 4, 23]
comps = 0
for x in lst:
    comps += 1
    if x == 8:
        break
print(comps)`, a:["1"], d:["0","4","8"],
w:"The target is the first item, so it is found on the very first comparison. That is the best case for any linear search."},

{t:"Comparing algorithms", q:"Count the total comparisons for three searches.",
c:`lst = [5, 8, 2, 9]
total = 0
for x in [2, 9, 7]:
    for v in lst:
        total += 1
        if v == x:
            {{0}}
print(total)`, a:["break"], d:["continue","pass"], o:"11",
w:"2 takes 3 comparisons, 9 takes 4, and 7 isn't there so it takes all 4: 3 + 4 + 4 = 11. break stops each search once it finds its item."},

{t:"Comparing algorithms", q:"Count the steps for a binary search that fails.",
c:`lst = list(range(2, 32, 2))
lo, hi, steps = 0, len(lst) - 1, 0
while lo <= hi:
    mid = (lo + hi) // 2
    steps {{0}} 1
    if lst[mid] < 7:
        lo = mid + 1
    else:
        hi = mid - 1
print(len(lst), steps)`, a:["+="], d:["=","-=","*="], o:"15 4",
w:"15 items can be halved 4 times, so even a failed search makes only 4 checks. A linear search would make 15."},

{t:"Comparing algorithms", q:"Count the comparisons made by insertion sort.",
c:`lst = [3, 1, 2]
comps = 0
for i in range(1, 3):
    key = lst[i]
    j = i - 1
    while j >= 0:
        comps += 1
        if lst[j] <= key:
            break
        lst[j + 1] = lst[j]
        j -= 1
    lst[j + 1] = {{0}}
print(lst, comps)`, a:["key"], d:["lst[i]","lst[j]","j"], o:"[1, 2, 3] 3",
w:"Key 1 is compared with 3 once. Key 2 is compared with 3 and then 1. That's 3 comparisons for a list of 3."},

{t:"Comparing algorithms", q:"Count the comparisons for a full bubble sort without a flag.",
c:`n = 5
comps = 0
for i in range({{0}}):
    for j in range(n - 1):
        comps += 1
print(comps)`, a:["n - 1"], d:["n","n - 2","1"], o:"16",
w:"This simple version makes n - 1 passes of n - 1 comparisons each: 4 x 4 = 16, even if the list was already sorted."},

{t:"Comparing algorithms", p:1, q:"How many comparisons does merging two lists of 4 need at most?",
c:`a = [1, 3, 5, 7]
b = [2, 4, 6, 8]
i = j = comps = 0
while i < 4 and j < 4:
    comps += 1
    if a[i] < b[j]:
        i += 1
    else:
        j += 1
print(comps)`, a:["7"], d:["8","4","16"],
w:"The fronts take turns until a runs out after 7 is taken. 8 is added without a comparison, so 7 comparisons for 8 items."},

{t:"Comparing algorithms", q:"Compare linear and binary search on 64 items.",
c:`n = 64
lin = n
bins = 0
while n > 0:
    n = n // 2
    bins += 1
print(lin, {{0}})`, a:["bins"], d:["n","lin // 2","64"], o:"64 7",
w:"In the worst case a linear search checks all 64 items, but a binary search needs only 7 checks because it halves the list each time."},
]);
