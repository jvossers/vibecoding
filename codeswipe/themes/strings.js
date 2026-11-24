// Theme: Strings (OCR J277 2.2.3 string manipulation). Validate with codeswipe/tools/validate.py
CodeSwipe.add("strings", [
// ---------- Length ----------
{t:"Length", q:"Print how many characters are in the password.",
c:`password = "secret99"
print({{0}}(password))`, a:["len"], d:["length","size","count"], o:"8",
w:"len() is a built-in function that returns the number of characters in a string. In OCR's reference language this is password.length."},

{t:"Length", q:"Store the length of the name in n.",
c:`name = "Ada Lovelace"
n = {{0}}
print(n)`, a:["len(name)"], d:["name.len()","name.length","length(name)"], o:"12",
w:"Python uses len(name), not name.length. The space counts as a character, so 3 + 1 + 8 = 12."},

{t:"Length", q:"Reject passwords shorter than 8 characters.",
c:`pw = "dragon"
if len(pw) {{0}} 8:
    print("Too short")
else:
    print("OK")`, a:["<"], d:[">=","==",">"], o:"Too short",
w:"\"dragon\" has 6 characters and 6 < 8, so the first branch runs."},

{t:"Length", q:"Print the last character using len().",
c:`word = "python"
print(word[{{0}}])`, a:["len(word)-1"], d:["len(word)","len(word)+1","word.len"], o:"n",
w:"Indexes start at 0, so the last index is always len(word) - 1. Using len(word) itself would cause an IndexError."},

{t:"Length", q:"Check whether the string is empty.",
c:`s = ""
print(len(s) {{0}} 0)`, a:["=="], d:["=",">","!="], o:"True",
w:"An empty string has length 0. Use == to compare; a single = is assignment and is a syntax error here."},

{t:"Length", q:"Count the characters with a loop instead of len().",
c:`text = "banana"
count = 0
for ch in text:
    count = {{0}}
print(count)`, a:["count + 1"], d:["count + ch","len(ch)","ch + 1"], o:"6",
w:"Each pass of the loop handles one character, so adding 1 each time counts them all."},

{t:"Length", p:1, q:"What does this print?",
c:`print(len("Hello World"))`, a:["11"], d:["10","2","12"],
w:"len() counts every character, including the space: 5 + 1 + 5 = 11."},

{t:"Length", p:1, q:"What does this print?",
c:`print(len("  "))`, a:["2"], d:["0","1","None"],
w:"Spaces are characters too. Two spaces give a length of 2."},

{t:"Length", q:"Count the digits in the number by casting it to a string.",
c:`num = 40961
digits = len({{0}}(num))
print(digits)`, a:["str"], d:["int","float","list"], o:"5",
w:"len() doesn't work on an integer, so cast it with str() first: str(40961) is \"40961\", which has 5 characters."},

// ---------- Indexing ----------
{t:"Indexing", q:"Print the first letter of the name.",
c:`name = "Grace"
print(name[{{0}}])`, a:["0"], d:["1","-1","5"], o:"G",
w:"String indexes start at 0, so name[0] is the first character."},

{t:"Indexing", q:"Print the last letter using a negative index.",
c:`name = "Grace"
print(name[{{0}}])`, a:["-1"], d:["0","5","-0"], o:"e",
w:"Negative indexes count from the end: -1 is the last character, -2 the one before it."},

{t:"Indexing", p:1, q:"What does this print?",
c:`s = "COMPUTER"
print(s[3])`, a:["P"], d:["M","U","C"],
w:"C is index 0, O is 1, M is 2 and P is 3."},

{t:"Indexing", p:1, q:"What does this print?",
c:`s = "keyboard"
print(s[-2])`, a:["r"], d:["a","d","e"],
w:"s[-1] is \"d\" and s[-2] is the character before it, \"r\"."},

{t:"Indexing", q:"Build the initials \"AT\".",
c:`first = "Alan"
last = "Turing"
initials = first[{{0}}] + last[{{1}}]
print(initials)`, a:["0","0"], d:["1","-1"], o:"AT",
w:"The first letter of each name is at index 0. The + operator joins (concatenates) them."},

{t:"Indexing", q:"Print the middle letter of the word.",
c:`word = "level"
mid = len(word) {{0}} 2
print(word[mid])`, a:["//"], d:["/","%","*"], o:"v",
w:"5 // 2 is 2 (integer division). A plain / gives 2.5, and a float can't be used as an index."},

{t:"Indexing", p:1, q:"What does this print?",
c:`s = "cat"
print(s[3])`, a:["IndexError"], d:["t","a","None"],
w:"\"cat\" has indexes 0, 1 and 2. Index 3 is out of range, so Python raises an IndexError."},

{t:"Indexing", q:"Print each character with its index.",
c:`word = "code"
for i in range({{0}}):
    print(i, word[i])`, a:["len(word)"], d:["word","len(word)-1","len(word)+1"], o:"0 c\n1 o\n2 d\n3 e",
w:"range(len(word)) gives 0, 1, 2, 3, which is exactly the set of valid indexes."},

{t:"Indexing", p:1, q:"What does this print?",
c:`print("hello world".split()[1][0])`, a:["w"], d:["e","h","world"],
w:"split() gives [\"hello\", \"world\"]. Index [1] is \"world\" and [0] of that is \"w\"."},

{t:"Indexing", q:"Print the first and last letters as a hint.",
c:`pw = "dolphin"
n = len(pw) - {{0}}
hint = pw[0] + "*" * n + pw[-1]
print(hint)`, a:["2"], d:["1","0"], o:"d*****n",
w:"Two characters are shown (the first and last), so len(pw) - 2 stars hide the rest."},

// ---------- Slicing ----------
{t:"Slicing", q:"Print the first 3 characters.",
c:`word = "Computer"
print(word[{{0}}])`, a:["0:3"], d:["1:3","0:2","3"], o:"Com",
w:"A slice [start:end] includes start but stops before end, so 0:3 gives indexes 0, 1 and 2."},

{t:"Slicing", q:"Print the last 3 characters.",
c:`word = "Computer"
print(word[{{0}}])`, a:["-3:"], d:[":-3","-3","5:7"], o:"ter",
w:"-3: starts 3 characters from the end and goes to the end of the string."},

{t:"Slicing", q:"Extract \"put\" from \"Computer\".",
c:`word = "Computer"
print(word[{{0}}:{{1}}])`, a:["3","6"], d:["2","5","7"], o:"put",
w:"p is at index 3. The slice stops before the end index, so you need 6 to include t (index 5)."},

{t:"Slicing", q:"Reverse the string.",
c:`word = "stressed"
print(word[{{0}}])`, a:["::-1"], d:["::1","-1:","::-2"], o:"desserts",
w:"A step of -1 walks through the string backwards, which reverses it."},

{t:"Slicing", q:"Print every second character, starting with the first.",
c:`s = "abcdefgh"
print(s[{{0}}])`, a:["::2"], d:["1::2","::-2",":2"], o:"aceg",
w:"The third part of a slice is the step. ::2 takes indexes 0, 2, 4 and 6."},

{t:"Slicing", p:1, q:"What does this print?",
c:`s = "Hello World"
print(s[6:])`, a:["World"], d:[" World","Hello","o World"],
w:"The space is at index 5, so index 6 is \"W\". s[6:] runs to the end."},

{t:"Slicing", p:1, q:"What does this print?",
c:`s = "programming"
print(s[:4])`, a:["prog"], d:["progr","pro","gram"],
w:"[:4] means indexes 0 to 3, which is 4 characters."},

{t:"Slicing", p:1, q:"What does this print?",
c:`s = "abcdef"
print(s[1:4])`, a:["bcd"], d:["abcd","bcde","bc"],
w:"Indexes 1, 2 and 3. The end index 4 is not included."},

{t:"Slicing", q:"Write OCR's left(n) in Python.",
c:`def left(s, n):
    return s[{{0}}]
print(left("Python", 2))`, a:[":n"], d:["n:","-n:","0:n-1"], o:"Py",
w:"s[:n] gives the first n characters. This matches OCR's string.left(n)."},

{t:"Slicing", q:"Write OCR's right(n) in Python.",
c:`def right(s, n):
    return s[{{0}}]
print(right("Python", 2))`, a:["-n:"], d:[":n","n:",":-n"], o:"on",
w:"s[-n:] gives the last n characters. This matches OCR's string.right(n)."},

{t:"Slicing", q:"Write OCR's substring(start, length) in Python.",
c:`def substring(s, start, length):
    return s[start:{{0}}]
print(substring("Computer", 3, 3))`, a:["start+length"], d:["length","start-length","start+length-1"], o:"put",
w:"A Python slice needs an end index, not a length. The end is start + length because the end itself is excluded."},

{t:"Slicing", q:"Make a username: first 3 letters of the first name and last 3 of the surname.",
c:`first = "Jasmine"
surname = "Patel"
user = first[{{0}}] + surname[{{1}}]
print(user.lower())`, a:[":3","-3:"], d:["3:",":-3"], o:"jastel",
w:"first[:3] is \"Jas\" and surname[-3:] is \"tel\". .lower() then makes it all lower case."},

{t:"Slicing", q:"Print the domain part of the email (after the @).",
c:`email = "sam@school.uk"
at = email.find("@")
print(email[{{0}}])`, a:["at+1:"], d:["at:",":at","at-1:"], o:"school.uk",
w:"find() gives the index of @. Start one character after it, at + 1, to leave the @ out."},

{t:"Slicing", q:"Print the username part of the email (before the @).",
c:`email = "sam@school.uk"
at = email.find("@")
print(email[{{0}}])`, a:[":at"], d:["at:",":at+1","0:at-1"], o:"sam",
w:"[:at] stops just before the @ because the end index is not included."},

{t:"Slicing", q:"Remove the first and last characters (the brackets).",
c:`s = "[data]"
print(s[{{0}}])`, a:["1:-1"], d:["1:","-1:1",":-1"], o:"data",
w:"Start at 1 to skip the first character, and end at -1 to stop before the last."},

{t:"Slicing", q:"Extract the year from the date.",
c:`date = "14/11/2026"
year = date[{{0}}]
print(year)`, a:["6:"], d:["6","5:","-5:"], o:"2026",
w:"Count the indexes: 1 4 / 1 1 / are 0 to 5, so the year starts at index 6."},

{t:"Slicing", q:"Extract the day and month.",
c:`date = "14/11/2026"
day = date[{{0}}]
month = date[{{1}}]
print(month, day)`, a:["0:2","3:5"], d:["1:3","2:4"], o:"11 14",
w:"The day is indexes 0 and 1 (0:2). The month is indexes 3 and 4 (3:5), after the first slash."},

{t:"Slicing", p:1, q:"What does this print?",
c:`s = "Python"
print(s[-3:])`, a:["hon"], d:["tho","Pyt","noh"],
w:"-3: means the last three characters."},

{t:"Slicing", p:1, q:"What does this print?",
c:`print("Python"[::-1])`, a:["nohtyP"], d:["Python","nohtyp","P"],
w:"A step of -1 reverses the string, and the capital P ends up last."},

{t:"Slicing", p:1, q:"What does this print?",
c:`print("Python"[1:4].upper())`, a:["YTH"], d:["PYT","YTHO","yth"],
w:"[1:4] is \"yth\", then .upper() makes it \"YTH\"."},

{t:"Slicing", q:"Cut long titles to 10 characters and add \"...\".",
c:`title = "Introduction to Algorithms"
if len(title) > 10:
    title = title[{{0}}] + "..."
print(title)`, a:[":10"], d:["10:","-10:"], o:"Introducti...",
w:"[:10] keeps the first 10 characters."},

// ---------- Immutability ----------
{t:"Slicing", q:"Strings can't be changed in place. Swap the first letter for \"J\".",
c:`word = "Mango"
word = {{0}} + word[{{1}}]
print(word)`, a:["\"J\"","1:"], d:["\"M\"","0:",":1"], o:"Jango",
w:"word[0] = \"J\" would give a TypeError because strings are immutable. Build a new string from \"J\" and word[1:] instead."},

{t:"Slicing", q:"Change \"cat\" into \"cut\".",
c:`s = "cat"
s = s[:1] + "u" + s[{{0}}]
print(s)`, a:["2:"], d:["1:",":2","1"], o:"cut",
w:"Keep everything before index 1, add \"u\", then keep everything from index 2."},

{t:"Slicing", q:"Insert the missing letter to fix the spelling.",
c:`s = "helo"
s = s[:3] + {{0}} + s[3:]
print(s)`, a:["\"l\""], d:["l","\"o\""], o:"hello",
w:"\"l\" must be in quotes to be a string. Without them Python looks for a variable called l."},

{t:"Slicing", p:1, q:"What does this print?",
c:`s = "hello"
s.replace("h", "j")
print(s)`, a:["hello"], d:["jello","None","jhello"],
w:"Strings are immutable. replace() returns a new string, but it was never stored, so s is unchanged."},

// ---------- Case ----------
{t:"Upper & lower", q:"Print the name in capitals.",
c:`name = "alice"
print(name.{{0}}())`, a:["upper"], d:["capitalize","title","lower"], o:"ALICE",
w:".upper() returns a copy with every letter in upper case. OCR writes this as name.upper."},

{t:"Upper & lower", q:"Capitalise just the first letter.",
c:`name = "bob"
name = name[0].{{0}}() + name[{{1}}]
print(name)`, a:["upper","1:"], d:["lower",":1","0:"], o:"Bob",
w:"Make index 0 upper case, then join on the rest of the string from index 1."},

{t:"Upper & lower", q:"Accept the answer whatever case it was typed in.",
c:`answer = "PaRiS"
if answer.{{0}}() == {{1}}:
    print("Correct")
else:
    print("Wrong")`, a:["lower","\"paris\""], d:["upper","\"Paris\""], o:"Correct",
w:"Convert the input to lower case, then compare it with an all-lower-case answer."},

{t:"Upper & lower", p:1, q:"What does this print?",
c:`print("GCSE cs".upper())`, a:["GCSE CS"], d:["gcse cs","Gcse cs","GCSE cs"],
w:"upper() changes every letter. Letters that are already upper case stay the same."},

{t:"Upper & lower", q:"Count the capital letters.",
c:`s = "Hello World From OCR"
caps = 0
for ch in s:
    if ch.{{0}}():
        caps = caps + 1
print(caps)`, a:["isupper"], d:["upper","islower","isalpha"], o:"6",
w:"isupper() returns True or False. upper() returns a string, which isn't a test. The capitals are H, W, F, O, C and R."},

{t:"Upper & lower", q:"Swap the case of each letter.",
c:`s = "aBc"
out = ""
for ch in s:
    if ch.isupper():
        out = out + ch.{{0}}()
    else:
        out = out + ch.{{1}}()
print(out)`, a:["lower","upper"], d:["isupper","islower"], o:"AbC",
w:"Upper-case letters become lower case, and the rest become upper case."},

{t:"Upper & lower", p:1, q:"What does this print?",
c:`print("the cat sat".title())`, a:["The Cat Sat"], d:["The cat sat","THE CAT SAT","the Cat Sat"],
w:"title() capitalises the first letter of every word."},

{t:"Upper & lower", q:"Capitalise each word yourself.",
c:`name = "ada lovelace"
out = ""
for w in name.split():
    out += w[0].{{0}}() + w[{{1}}] + " "
print(out.strip())`, a:["upper","1:"], d:["lower",":1"], o:"Ada Lovelace",
w:"Upper-case the first letter of each word, add the rest with w[1:], then strip() the extra space at the end."},

{t:"Upper & lower", p:1, q:"What does this print?",
c:`s = "CompSci"
print(s.lower().count("c"))`, a:["2"], d:["1","0","3"],
w:"After lower() the string is \"compsci\", which has two \"c\" characters."},

{t:"Upper & lower", p:1, q:"What does this print?",
c:`print("cat" == "Cat")`, a:["False"], d:["True","cat","TypeError"],
w:"Comparisons are case sensitive: \"c\" and \"C\" have different ASCII codes."},

// ---------- Concatenation & casting ----------
{t:"Concatenation", q:"Join the first name and surname with a space between them.",
c:`first = "Ada"
last = "Lovelace"
full = first {{0}} " " {{1}} last
print(full)`, a:["+","+"], d:[",","*","-"], o:"Ada Lovelace",
w:"+ concatenates (joins) strings. You can't subtract or multiply one string by another."},

{t:"Casting", q:"Join the number into the sentence.",
c:`age = 15
msg = "You are " + {{0}}(age)
print(msg + " years old")`, a:["str"], d:["int","float","len"], o:"You are 15 years old",
w:"You can't + a string and an integer. str(age) casts the number to a string first."},

{t:"Casting", q:"Add the two numbers stored as strings.",
c:`a = "5"
b = "3"
print({{0}}(a) + {{1}}(b))`, a:["int","int"], d:["str","str"], o:"8",
w:"\"5\" + \"3\" would give \"53\". Cast both with int() to add them as numbers."},

{t:"Casting", p:1, q:"What does this print?",
c:`a = "5"
b = "3"
print(a + b)`, a:["53"], d:["8","5 3","TypeError"],
w:"Both are strings, so + concatenates them instead of adding."},

{t:"Concatenation", p:1, q:"What does this print?",
c:`print("ha" * 3)`, a:["hahaha"], d:["ha3","ha ha ha","TypeError"],
w:"Multiplying a string by an integer repeats it."},

{t:"Casting", p:1, q:"What does this print?",
c:`print("5" + 5)`, a:["TypeError"], d:["10","55","5 5"],
w:"Python won't join a string to an integer automatically. Use str(5) or int(\"5\")."},

{t:"Casting", q:"Double the price stored as a string.",
c:`price = "2.50"
total = {{0}}(price) * 2
print(total)`, a:["float"], d:["int","str"], o:"5.0",
w:"\"2.50\" has a decimal point, so cast it with float(). int(\"2.50\") would give a ValueError."},

{t:"Concatenation", q:"Build a row of 5 stars with a loop.",
c:`stars = ""
for i in range(5):
    stars = stars {{0}} "*"
print(stars)`, a:["+"], d:["*","-",","], o:"*****",
w:"Start with an empty string and concatenate one \"*\" each time round the loop."},

{t:"Concatenation", q:"Print a line of 10 dashes.",
c:`print("-" {{0}} 10)`, a:["*"], d:["+","**","x"], o:"----------",
w:"string * number repeats the string. \"-\" + 10 would be a TypeError."},

{t:"Casting", q:"Add up the digits of the number.",
c:`num = "4096"
total = 0
for d in num:
    total = total + {{0}}
print(total)`, a:["int(d)"], d:["d","str(d)","len(d)"], o:"19",
w:"Each d is a one-character string, so cast it with int(d) before adding. 4 + 0 + 9 + 6 = 19."},

{t:"Casting", p:1, q:"What does this print?",
c:`x = 7
print("Score: " + str(x * 2))`, a:["Score: 14"], d:["Score: 77","Score: x*2","TypeError"],
w:"x * 2 is worked out first (14), then str() turns it into \"14\" so it can be joined."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(int("12") + int("8"))`, a:["20"], d:["128","12 8","TypeError"],
w:"int() turns both strings into integers, so + adds them."},

{t:"Concatenation", p:1, q:"What does this print?",
c:`print("Total:", 5)`, a:["Total: 5"], d:["Total:5","TypeError","Total:, 5"],
w:"print() with commas puts a space between the items. This works with numbers too, so no casting is needed."},

{t:"Casting", p:1, q:"What does this print?",
c:`print("A" + str(3 + 4))`, a:["A7"], d:["A34","A3+4","TypeError"],
w:"3 + 4 is worked out first, then str(7) is joined to \"A\"."},

{t:"Casting", p:1, q:"What does this print?",
c:`print(str(12) + str(3))`, a:["123"], d:["15","12 3","TypeError"],
w:"Both values are strings now, so + concatenates them."},

{t:"Concatenation", p:1, q:"What does this print?",
c:`s = "abc"
print(s * 2 + s[0])`, a:["abcabca"], d:["abcabc","aabbcc","abca"],
w:"s * 2 is \"abcabc\". Adding s[0] (\"a\") gives \"abcabca\"."},

{t:"Casting", q:"Make a username from the surname and year, like \"kha09\".",
c:`surname = "Khan"
year = 2009
short = surname[:3].lower()
user = short + {{0}}(year)[{{1}}]
print(user)`, a:["str","-2:"], d:["int",":2"], o:"kha09",
w:"You can't slice an integer. Cast it with str() first, then take the last two digits with [-2:]."},

{t:"Concatenation", q:"Pad the number with zeros to 3 digits.",
c:`num = "7"
while len(num) < 3:
    num = {{0}} + num
print(num)`, a:["\"0\""], d:["0","\" \""], o:"007",
w:"\"0\" is a string, so it can be concatenated. The plain number 0 would give a TypeError."},

{t:"Concatenation", q:"Hide all but the last 4 digits of the card number.",
c:`card = "1234567812345678"
masked = "*" * {{0}} + card[{{1}}]
print(masked)`, a:["12","-4:"], d:["16","4:",":4"], o:"************5678",
w:"16 digits minus the 4 shown is 12 stars. card[-4:] gives the last four digits."},

// ---------- find & in ----------
{t:"Searching", q:"Print the position of the first \"o\".",
c:`s = "hello world"
print(s.{{0}}("o"))`, a:["find"], d:["count","startswith","rfind"], o:"4",
w:"find() returns the index of the first match. h e l l o puts \"o\" at index 4."},

{t:"Searching", p:1, q:"What does this print?",
c:`s = "banana"
print(s.find("z"))`, a:["-1"], d:["0","None","ValueError"],
w:"find() returns -1 when the substring isn't there. index() would raise an error instead."},

{t:"Searching", p:1, q:"What does this print?",
c:`s = "banana"
print(s.find("an"))`, a:["1"], d:["2","3","0"],
w:"\"an\" first appears at index 1 (b=0, a=1, n=2)."},

{t:"Searching", q:"Check whether \"put\" appears in the word.",
c:`word = "computer"
if "put" {{0}} word:
    print("Found")`, a:["in"], d:["==","not in","is"], o:"Found",
w:"The in operator tests whether one string is a substring of another."},

{t:"Searching", q:"Count the vowels.",
c:`word = "education"
vowels = 0
for ch in word:
    if ch {{0}} "aeiou":
        vowels += 1
print(vowels)`, a:["in"], d:["==","not in"], o:"5",
w:"ch in \"aeiou\" is True when ch is any one of the vowels."},

{t:"Searching", q:"Remove all the vowels.",
c:`word = "programming"
out = ""
for ch in word:
    if ch {{0}} "aeiou":
        out = out + ch
print(out)`, a:["not in"], d:["in","=="], o:"prgrmmng",
w:"Only keep characters that are not in the vowel string."},

{t:"Searching", q:"Reject an email address without an @.",
c:`email = "jo.smith.net"
if "@" {{0}} email:
    print("Invalid email")`, a:["not in"], d:["in","=="], o:"Invalid email",
w:"not in is True when the substring is missing."},

{t:"Searching", q:"Print the first name only.",
c:`full = "Grace Hopper"
space = full.{{0}}(" ")
print(full[{{1}}])`, a:["find",":space"], d:["count","space:","len"], o:"Grace",
w:"find(\" \") gives the index of the space (5). [:space] takes everything before it."},

{t:"Searching", p:1, q:"What does this print?",
c:`s = "Mississippi"
print(s.count("ss"))`, a:["2"], d:["4","1","3"],
w:"\"ss\" appears twice: Mi-ss-i-ss-ippi."},

{t:"Searching", p:1, q:"What does this print?",
c:`print("x" in "Python")`, a:["False"], d:["True","-1","0"],
w:"in gives a Boolean. There's no \"x\" in \"Python\"."},

{t:"Searching", p:1, q:"What does this print?",
c:`print("banana".find("na"))`, a:["2"], d:["4","1","3"],
w:"The first \"na\" starts at index 2 (b=0, a=1, n=2)."},

{t:"Searching", q:"Print every position where \"a\" appears.",
c:`s = "banana"
for i in range(len(s)):
    if s[i] == "a":
        print({{0}}, end=" ")`, a:["i"], d:["s[i]","len(s)","ch"], o:"1 3 5",
w:"i is the index; s[i] is the character at that index. end=\" \" keeps the output on one line."},

{t:"Searching", q:"Find the position of the first space with a loop.",
c:`s = "Hi there"
for i in range(len(s)):
    if s[i] == " ":
        print({{0}})
        break`, a:["i"], d:["s[i]","len(s)","ch"], o:"2",
w:"Print the index i, not the character. break stops the loop at the first match."},

// ---------- replace ----------
{t:"Replace", q:"Change cats to dogs.",
c:`s = "I like cats"
print(s.replace({{0}}, {{1}}))`, a:["\"cats\"","\"dogs\""], d:["\"I\"","\"like\""], o:"I like dogs",
w:"replace(old, new): the text to find comes first, then the text to put in its place."},

{t:"Replace", p:1, q:"What does this print?",
c:`print("banana".replace("a", "o"))`, a:["bonono"], d:["bonana","banano","bnn"],
w:"replace() swaps every match, not just the first one."},

{t:"Replace", q:"Remove all spaces.",
c:`s = "a b c d"
print(s.replace(" ", {{0}}))`, a:["\"\""], d:["\" \"","None","\"_\""], o:"abcd",
w:"Replacing with the empty string \"\" deletes every match."},

{t:"Replace", q:"Convert British spelling to American.",
c:`s = "colour"
s = s.{{0}}("ou", "o")
print(s)`, a:["replace"], d:["find","swap","count"], o:"color",
w:"replace() returns a new string, so assign it back to s."},

{t:"Replace", q:"Censor the banned word with stars.",
c:`msg = "this is bad"
banned = "bad"
stars = "*" {{0}} len(banned)
print(msg.replace(banned, stars))`, a:["*"], d:["+","**"], o:"this is ***",
w:"\"*\" * 3 is \"***\": one star per letter of the banned word."},

// ---------- Methods: count / startswith / endswith ----------
{t:"String methods", q:"Detect a Word document from the file name.",
c:`filename = "essay.docx"
if filename.{{0}}(".docx"):
    print("Word file")`, a:["endswith"], d:["startswith","isalpha","lower"], o:"Word file",
w:"endswith() checks the last characters of a string and returns True or False."},

{t:"String methods", q:"Check the start of the postcode.",
c:`postcode = "SW1A 1AA"
if postcode.{{0}}("SW"):
    print("South West London")`, a:["startswith"], d:["endswith","isupper"], o:"South West London",
w:"startswith() checks the first characters. You could also write postcode[:2] == \"SW\"."},

{t:"String methods", q:"Count how many times \"at\" appears.",
c:`s = "the cat sat on the mat"
print(s.{{0}}("at"))`, a:["count"], d:["find","len","index"], o:"3",
w:"count() returns how many times a substring appears. find() would only give the first position."},

{t:"String methods", p:1, q:"What does this print?",
c:`print("hello".startswith("he"))`, a:["True"], d:["False","he","1"],
w:"startswith() returns a Boolean."},

{t:"String methods", q:"Remove the spaces around the answer before checking it.",
c:`answer = "  yes  "
if answer.{{0}}() == "yes":
    print("Confirmed")`, a:["strip"], d:["upper","split","lower"], o:"Confirmed",
w:"strip() removes spaces (and other whitespace) from both ends of a string."},

{t:"String methods", p:1, q:"What does this print?",
c:`print("  hi  ".strip() + "!")`, a:["hi!"], d:["  hi  !","hi  !","  hi!"],
w:"strip() removes the spaces at both ends, but not any spaces in the middle."},

// ---------- Loops over strings ----------
{t:"Loops", q:"Print each character on its own line.",
c:`word = "code"
for {{0}} in word:
    print(ch)`, a:["ch"], d:["word","i","range"], o:"c\no\nd\ne",
w:"for ch in word gives each character in turn, stored in the loop variable ch."},

{t:"Loops", q:"Reverse the string with a loop.",
c:`word = "abc"
rev = ""
for ch in word:
    rev = {{0}}
print(rev)`, a:["ch + rev"], d:["rev + ch","rev + word","ch"], o:"cba",
w:"Putting each new character in front of what you have so far builds the string backwards."},

{t:"Loops", q:"Reverse the string by stepping backwards through the indexes.",
c:`word = "abcd"
rev = ""
for i in range(len(word)-1, {{0}}, -1):
    rev = rev + word[i]
print(rev)`, a:["-1"], d:["0","1","len(word)"], o:"dcba",
w:"range stops before the stop value, so you need -1 to include index 0."},

{t:"Loops", q:"Count how many times \"l\" appears.",
c:`s = "hello world"
count = 0
for ch in s:
    if ch {{0}} "l":
        count = count + 1
print(count)`, a:["=="], d:["=","!=",">"], o:"3",
w:"== compares two values. = is for assignment and is a syntax error inside an if."},

{t:"Loops", q:"Take every other character with range().",
c:`s = "abcdefg"
out = ""
for i in range(0, len(s), {{0}}):
    out = out + s[i]
print(out)`, a:["2"], d:["1","3","-1"], o:"aceg",
w:"The third argument of range is the step, so 2 gives indexes 0, 2, 4 and 6."},

{t:"Loops", q:"Count the digits in the code.",
c:`code = "AB12C34"
digits = 0
for ch in code:
    if ch.{{0}}():
        digits += 1
print(digits)`, a:["isdigit"], d:["isalpha","isupper","lower"], o:"4",
w:"isdigit() is True for the characters 0 to 9."},

{t:"Loops", q:"Print each letter in capitals using a while loop.",
c:`s = "hello"
i = 0
while i {{0}} len(s):
    print(s[i].upper())
    i = i + 1`, a:["<"], d:["<=",">","=="], o:"H\nE\nL\nL\nO",
w:"The last valid index is len(s) - 1, so loop while i < len(s). Using <= would cause an IndexError."},

{t:"Loops", p:1, q:"What does this print?",
c:`s = "python"
out = ""
for i in range(len(s)):
    if i % 2 == 0:
        out += s[i].upper()
    else:
        out += s[i]
print(out)`, a:["PyThOn"], d:["pYtHoN","PYTHON","Python"],
w:"Even indexes (0, 2, 4) are made upper case, so p, t and o become capitals."},

{t:"Loops", q:"Count the words by counting spaces.",
c:`s = "the quick brown fox"
words = 1
for ch in s:
    if ch == {{0}}:
        words += 1
print(words)`, a:["\" \""], d:["\"\"","\"_\"","\" w\""], o:"4",
w:"There is one more word than there are spaces, so the count starts at 1."},

{t:"Loops", q:"Count the words longer than 3 letters.",
c:`s = "the quick brown fox"
count = 0
for w in s.split():
    if {{0}}(w) > 3:
        count += 1
print(count)`, a:["len"], d:["int","str","ord"], o:"2",
w:"split() breaks the sentence into words, and len(w) gives the length of each one."},

{t:"Loops", q:"Find the longest word (the first one if there's a tie).",
c:`words = "a quick brown fox".split()
longest = ""
for w in words:
    if len(w) {{0}} len(longest):
        longest = w
print(longest)`, a:[">"], d:["<",">=","=="], o:"quick",
w:"With >, a later word of the same length doesn't replace the first, so \"quick\" wins over \"brown\"."},

{t:"Loops", q:"Remove the punctuation but keep letters and spaces.",
c:`s = "Hi, there! OK?"
clean = ""
for ch in s:
    if ch.{{0}}() or ch == " ":
        clean += ch
print(clean)`, a:["isalpha"], d:["isdigit","isupper"], o:"Hi there OK",
w:"isalpha() is True only for letters, so commas, ! and ? are skipped."},

{t:"Loops", q:"Add up the ASCII codes of the letters (a simple hash).",
c:`word = "ab"
total = 0
for ch in word:
    total += {{0}}(ch)
print(total)`, a:["ord"], d:["chr","int","len"], o:"195",
w:"ord() gives the ASCII code: 97 + 98 = 195."},

// ---------- ASCII ----------
{t:"ASCII", q:"Print the ASCII code of \"A\".",
c:`print({{0}}("A"))`, a:["ord"], d:["chr","int","ascii"], o:"65",
w:"ord() turns a character into its code. OCR writes this as ASCII(\"A\")."},

{t:"ASCII", q:"Print the character with ASCII code 97.",
c:`print({{0}}(97))`, a:["chr"], d:["ord","str","int"], o:"a",
w:"chr() turns a code into its character. OCR writes this as CHR(97)."},

{t:"ASCII", p:1, q:"What does this print?",
c:`print(ord("B") - ord("A"))`, a:["1"], d:["B","66","0"],
w:"\"B\" is 66 and \"A\" is 65. Letters have consecutive codes."},

{t:"ASCII", p:1, q:"What does this print?",
c:`print(chr(ord("c") + 1))`, a:["d"], d:["c1","100","e"],
w:"ord(\"c\") is 99, plus 1 is 100, and chr(100) is \"d\"."},

{t:"ASCII", q:"Convert the capital letter to lower case using ASCII codes.",
c:`ch = "G"
low = chr(ord(ch) {{0}} 32)
print(low)`, a:["+"], d:["-","*","//"], o:"g",
w:"Lower-case letters come 32 places after upper-case ones (A is 65, a is 97)."},

{t:"ASCII", q:"Shift the letter 3 places (Caesar cipher).",
c:`letter = "D"
shift = 3
new = {{0}}(ord(letter) + shift)
print(new)`, a:["chr"], d:["ord","str","int"], o:"G",
w:"ord() gives a number, you add the shift, and chr() turns it back into a letter."},

{t:"ASCII", q:"Caesar shift that wraps from Z back round to A.",
c:`def shift(ch, k):
    pos = ord(ch) - ord("A")
    pos = (pos + k) {{0}} 26
    return chr(pos + {{1}})
print(shift("X", 5))`, a:["%","ord(\"A\")"], d:["//","ord(\"a\")","*"], o:"C",
w:"X is position 23. (23 + 5) % 26 = 2, and adding ord(\"A\") back gives \"C\"."},

{t:"ASCII", q:"Encrypt the word by shifting each letter by 1.",
c:`word = "CAT"
out = ""
for ch in word:
    out = out + chr(ord(ch) {{0}} 1)
print(out)`, a:["+"], d:["-","*"], o:"DBU",
w:"Each character goes to a code, the code goes up by 1, and the result goes back to a character."},

{t:"ASCII", q:"Report only the upper-case letters (codes 65 to 90).",
c:`for ch in "aQ7":
    if 65 <= ord(ch) <= {{0}}:
        print(ch, "upper")`, a:["90"], d:["122","97","26"], o:"Q upper",
w:"A is 65 and Z is 90. a is 97, so it falls outside the range."},

{t:"ASCII", p:1, q:"What does this print?",
c:`print(ord("a") - ord("A"))`, a:["32"], d:["0","1","26"],
w:"\"a\" is 97 and \"A\" is 65. The gap between cases is 32."},

{t:"ASCII", p:1, q:"What does this print?",
c:`print(chr(65) + chr(66))`, a:["AB"], d:["131","6566","A B"],
w:"chr() returns strings, so + joins them: \"A\" + \"B\"."},

{t:"ASCII", q:"Print the letter's position in the alphabet (a = 1).",
c:`letter = "e"
pos = ord(letter) - ord("a") {{0}} 1
print(pos)`, a:["+"], d:["-","*"], o:"5",
w:"ord(\"e\") - ord(\"a\") is 4, because a is 0 on that count. Add 1 so that a = 1."},

{t:"ASCII", p:1, q:"What does this print?",
c:`print(chr(ord("z") - 25))`, a:["a"], d:["b","y","A"],
w:"z is 25 letters after a, so taking 25 away lands on \"a\"."},

// ---------- Validation ----------
{t:"Validation", q:"Check that the PIN is 4 digits.",
c:`pin = "1234"
if pin.{{0}}() and len(pin) == 4:
    print("Valid PIN")
else:
    print("Invalid PIN")`, a:["isdigit"], d:["isalpha","islower","isspace"], o:"Valid PIN",
w:"isdigit() is True only if every character is a digit 0 to 9."},

{t:"Validation", q:"Check that the name is letters only.",
c:`name = "Bobby"
if name.{{0}}():
    print("Valid name")
else:
    print("Letters only please!")`, a:["isalpha"], d:["isdigit","isupper","islower"], o:"Valid name",
w:"isalpha() is True only if every character is a letter."},

{t:"Validation", q:"Count the capitals and the digits in the password.",
c:`pw = "Secret12"
ups = 0
digs = 0
for ch in pw:
    if ch.{{0}}():
        ups += 1
    if ch.{{1}}():
        digs += 1
print(ups, digs)`, a:["isupper","isdigit"], d:["upper","isalpha"], o:"1 2",
w:"isupper() and isdigit() return True or False for each character. upper() returns a string, so it can't be used as a test."},

{t:"Validation", q:"Accept passwords of 8 to 20 characters.",
c:`pw = "abc123"
if len(pw) >= 8 {{0}} len(pw) <= 20:
    print("OK")
else:
    print("Length must be 8-20")`, a:["and"], d:["or","&","not"], o:"Length must be 8-20",
w:"Both conditions must be true, so use and. With or, any short password would pass."},

{t:"Validation", p:1, q:"What does this print?",
c:`print("abc123".isalnum())`, a:["True"], d:["False","abc123","6"],
w:"isalnum() is True when every character is a letter or a digit."},

{t:"Validation", p:1, q:"What does this print?",
c:`print("-5".isdigit())`, a:["False"], d:["True","-5","ValueError"],
w:"The minus sign is not a digit, so isdigit() is False for negative numbers."},

{t:"Validation", q:"Check whether a string is binary (only 0s and 1s).",
c:`def isBinary(b):
    for ch in b:
        if ch {{0}} "01":
            return False
    return True
print(isBinary("1011"))
print(isBinary("1021"))`, a:["not in"], d:["in","=="], o:"True\nFalse",
w:"Return False as soon as you find a character that isn't 0 or 1."},

// ---------- split & join ----------
{t:"Split & join", q:"Count the words in the sentence.",
c:`sentence = "the cat sat"
words = sentence.{{0}}()
print(len(words))`, a:["split"], d:["strip","upper","find"], o:"3",
w:"split() with no argument splits on spaces and returns a list of words."},

{t:"Split & join", q:"Read the first name from a CSV line.",
c:`line = "Smith,Jo,15"
parts = line.split({{0}})
print(parts[{{1}}])`, a:["\",\"","1"], d:["\" \"","0","2"], o:"Jo",
w:"Splitting on \",\" gives [\"Smith\", \"Jo\", \"15\"], and \"Jo\" is at index 1."},

{t:"Split & join", p:1, q:"What does this print?",
c:`print("a-b-c".split("-"))`, a:["['a', 'b', 'c']"], d:["abc","['a-b-c']","a b c"],
w:"split() returns a list. The \"-\" separators themselves are removed."},

{t:"Split & join", q:"Join the words with spaces.",
c:`words = ["I", "love", "Python"]
print({{0}}.join(words))`, a:["\" \""], d:["\"\"","\",\"","\"_\""], o:"I love Python",
w:"separator.join(list) puts the separator between each item."},

{t:"Split & join", p:1, q:"What does this print?",
c:`print("-".join("abc"))`, a:["a-b-c"], d:["-abc-","abc-","a-b-c-"],
w:"A string is a sequence of characters, so join() puts \"-\" between each one."},

{t:"Split & join", q:"Print the first word.",
c:`s = "Hello there world"
print(s.split()[{{0}}])`, a:["0"], d:["1","-1",":1"], o:"Hello",
w:"split() makes a list, and index 0 is the first word."},

{t:"Split & join", q:"Print the last word.",
c:`s = "Hello there world"
print(s.split()[{{0}}])`, a:["-1"], d:["0","1","1:"], o:"world",
w:"Negative indexes work on lists too, so -1 is the last word."},

{t:"Split & join", q:"Build initials from the full name.",
c:`name = "Alan Mathison Turing"
initials = ""
for part in name.{{0}}():
    initials = initials + part[{{1}}]
print(initials)`, a:["split","0"], d:["strip","-1"], o:"AMT",
w:"Loop over the words that split() gives you and take index 0 of each one."},

{t:"Split & join", q:"Count the words in the course name.",
c:`s = "OCR GCSE Computer Science"
print(len(s.{{0}}()))`, a:["split"], d:["strip","lower"], o:"4",
w:"len() of the list from split() is the number of words."},

// ---------- Comparison ----------
{t:"Comparison", q:"Check which words are palindromes.",
c:`for word in ["level", "hello"]:
    if word == word[{{0}}]:
        print(word, "yes")
    else:
        print(word, "no")`, a:["::-1"], d:["::1","-1","1:"], o:"level yes\nhello no",
w:"A palindrome reads the same backwards, so compare the word with its reverse, word[::-1]."},

{t:"Comparison", p:1, q:"What does this print?",
c:`print("apple" < "banana")`, a:["True"], d:["False","apple","TypeError"],
w:"Strings compare character by character using character codes, and \"a\" comes before \"b\"."},

{t:"Comparison", p:1, q:"What does this print?",
c:`print("Zebra" < "apple")`, a:["True"], d:["False","Zebra","apple"],
w:"Upper-case letters have smaller codes than lower case (Z = 90, a = 97), so \"Zebra\" comes first."},

{t:"Comparison", p:1, q:"What does this print?",
c:`print("10" < "9")`, a:["True"], d:["False","10","TypeError"],
w:"These are strings, not numbers. \"1\" comes before \"9\", so \"10\" is less than \"9\"."},

{t:"Comparison", q:"Print whichever word comes first alphabetically.",
c:`a = "pear"
b = "apple"
if a {{0}} b:
    print(a, "comes first")
else:
    print(b, "comes first")`, a:["<"], d:[">",">=","="], o:"apple comes first",
w:"\"pear\" < \"apple\" is False, so the else branch prints apple."},

{t:"Comparison", q:"Check whether two words are anagrams.",
c:`def anagram(a, b):
    return {{0}}(a) == {{1}}(b)
print(anagram("listen", "silent"))
print(anagram("aab", "abb"))`, a:["sorted","sorted"], d:["len","set"], o:"True\nFalse",
w:"Sorting the letters puts them in the same order when the words are anagrams. Comparing len() or set() would wrongly accept \"aab\" and \"abb\"."},

// ---------- Functions ----------
{t:"Functions", q:"Return the number of matches.",
c:`def countChar(text, target):
    total = 0
    for ch in text:
        if ch == target:
            total += 1
    return {{0}}
print(countChar("banana", "a"))`, a:["total"], d:["ch","target","text"], o:"3",
w:"The function should return the running total once the loop has finished."},

{t:"Functions", q:"Write a function that tests for a vowel.",
c:`def isVowel(ch):
    return ch.lower() {{0}} "aeiou"
print(isVowel("E"))`, a:["in"], d:["==","not in"], o:"True",
w:"lower() makes \"E\" into \"e\", and in checks for it among the vowels."},

{t:"Functions", q:"Return the string reversed.",
c:`def reverse(s):
    return {{0}}
print(reverse("OCR"))`, a:["s[::-1]"], d:["s[-1]","s[::1]","reverse(s)"], o:"RCO",
w:"s[::-1] reverses a string. Calling reverse(s) inside itself would recurse forever."},

{t:"Functions", q:"Use an f-string to build the message.",
c:`name = "Sam"
score = 9
print({{0}}"{name} scored {score}")`, a:["f"], d:["r","s","str"], o:"Sam scored 9",
w:"An f before the quotes makes an f-string, which swaps each {variable} for its value."},

{t:"Functions", p:1, q:"What does this print?",
c:`x = "cat"
print(f"{x.upper()}!")`, a:["CAT!"], d:["cat!","{x.upper()}!","CAT"],
w:"In an f-string, the code inside { } runs and its result goes into the string."},
]);
