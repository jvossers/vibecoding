// Theme: File handling (OCR J277 2.2.3 basic file handling: open, read, write, close). Validate with codeswipe/tools/validate.py
CodeSwipe.add("files", [
{t:"Opening files", q:"Open the file so it can be read.", f:{"names.txt":"Ann\nBob\n"},
c:`f = open("names.txt", {{0}})
print(f.readline().strip())
f.close()`, a:["\"r\""], d:["\"w\"","\"a\"","\"x\""], o:"Ann",
w:"\"r\" opens a file for reading. \"w\" would wipe the file and then refuse to read it. In OCR's reference language this is open(\"names.txt\")."},

{t:"Opening files", q:"Close the file when you have finished writing.", f:{"log.txt":""},
c:`f = open("log.txt", "w")
f.write("start")
f.{{0}}()
print("saved")`, a:["close"], d:["end","stop","save"], o:"saved", fo:{"log.txt":"start"},
w:"close() finishes with the file and makes sure everything written is saved. OCR's reference language also uses f.close()."},

{t:"Opening files", q:"Complete the with statement.", f:{"msg.txt":"Hi there"},
c:`with open("msg.txt") {{0}} f:
    print(f.read())`, a:["as"], d:["to","in","="], o:"Hi there",
w:"with open(...) as f: gives the open file the name f, and closes it automatically when the indented block ends."},

{t:"Opening files", q:"Replace whatever is in the file with hello.", f:{"new.txt":"old"},
c:`f = open("new.txt", {{0}})
f.write("hello")
f.close()`, a:["\"w\""], d:["\"a\"","\"r\""], o:"", fo:{"new.txt":"hello"},
w:"\"w\" (write) mode empties the file first, so only hello is left. \"a\" would keep old and add to the end."},

{t:"Opening files", p:1, q:"What does this print?", f:{"pet.txt":"Rex"},
c:`f = open("pet.txt")
f.close()
print(f.closed)`, a:["True"], d:["False","Rex","None"],
w:"f.closed is True once close() has been called. The variable f still exists, but the file is no longer open."},

{t:"Opening files", p:1, q:"What does this print?", f:{"pet.txt":"Rex"},
c:`f = open("pet.txt")
f.close()
print(f.read())`, a:["ValueError"], d:["Rex","None","FileNotFoundError"],
w:"You can't read from a file after closing it. Python raises a ValueError (I/O operation on closed file)."},

{t:"Opening files", q:"Open the file whose name is stored in the variable.", f:{"scores.txt":"42"},
c:`name = "scores.txt"
f = open({{0}}, "r")
print(f.read())
f.close()`, a:["name"], d:["\"name\"","scores","name.txt"], o:"42",
w:"The variable name holds the string \"scores.txt\". Putting quotes round it would look for a file literally called name."},

{t:"Opening files", p:1, q:"What does this print?", f:{"a.txt":"hi"},
c:`with open("a.txt") as f:
    data = f.read()
print(f.closed)`, a:["True"], d:["False","hi","NameError"],
w:"A with block closes the file for you as soon as the indented code ends, so f.closed is True afterwards."},

{t:"Opening files", q:"Open the file and read all of it.", f:{"todo.txt":"Milk\nEggs\n"},
c:`f = {{0}}("todo.txt", "r")
print(f.{{1}}())
f.close()`, a:["open","read"], d:["openRead","readLine","file"], o:"Milk\nEggs",
w:"Python uses open() and read(). openRead() and readLine() are OCR reference language, not Python."},

{t:"Opening files", q:"Python has no openRead(). Open the file to read it.", f:{"hi.txt":"Hello"},
c:`f = {{0}}
print(f.readline())
f.close()`, a:["open(\"hi.txt\", \"r\")"], d:["openRead(\"hi.txt\")","open(hi.txt, \"r\")","open(\"hi.txt\", \"w\")"], o:"Hello",
w:"OCR's openRead(\"hi.txt\") becomes open(\"hi.txt\", \"r\") in Python. The file name must be a string in quotes."},

{t:"Opening files", q:"Open the file so print() can overwrite it.", f:{"out.txt":"Top score: 50\n"},
c:`f = open("out.txt", {{0}})
print("Top score: 99", file=f)
f.close()`, a:["\"w\""], d:["\"r\"","\"a\"","\"wr\""], o:"", fo:{"out.txt":"Top score: 99\n"},
w:"print(..., file=f) sends the text to the file instead of the screen, and adds a new line. \"w\" replaces the old score."},

{t:"Opening files", q:"Write the PIN using a with block.",
c:`{{0}} open("pin.txt", "w") {{1}} f:
    f.write("4821")
print("Saved")`, a:["with","as"], d:["open","for","in"], o:"Saved", fo:{"pin.txt":"4821"},
w:"The pattern is with open(name, mode) as variable: and the file is closed automatically at the end of the block."},

{t:"Opening files", p:1, q:"What does this print?",
c:`f = open("new.txt", "w")
f.close()
f = open("new.txt", "r")
print(len(f.read()))`, a:["0"], d:["FileNotFoundError","1","None"],
w:"Opening a file in \"w\" mode creates it if it doesn't exist. The new file is empty, so its length is 0."},

{t:"Opening files", p:1, q:"What does this print?", f:{"notes.txt":"Buy milk\n"},
c:`f = open("notes.txt", "w")
f.close()
f = open("notes.txt")
print(len(f.read()))`, a:["0"], d:["9","8","Buy milk"],
w:"\"w\" mode empties the file the moment it is opened, even if nothing is written. The old note is lost."},

{t:"Opening files", q:"Open the file using the default mode.", f:{"data.txt":"7 8 9"},
c:`f = open({{0}})
print(f.read())
f.close()`, a:["\"data.txt\""], d:["data.txt","\"data\"","data"], o:"7 8 9",
w:"With no mode given, open() reads. The file name is a string, so it needs quotes and the full name including .txt."},

{t:"Opening files", q:"Read the first line using the file variable.", f:{"city.txt":"Leeds\nYork\n"},
c:`inFile = open("city.txt", "r")
print({{0}}.readline().strip())
inFile.close()`, a:["inFile"], d:["\"city.txt\"","city","file"], o:"Leeds",
w:"Once a file is open you use its variable (here inFile) to read from it, not the file's name."},

{t:"Opening files", p:1, q:"What does this print?",
c:`with open("t.txt", "w") as f:
    f.write("A")
f.write("B")`, a:["ValueError"], d:["UnsupportedOperation","AB","A"],
w:"The with block closed the file when it ended, so the last write is on a closed file and raises a ValueError."},

{t:"Opening files", q:"Copy one file into another.", f:{"in.txt":"copy me","out.txt":"x"},
c:`src = open("in.txt", {{0}})
dst = open("out.txt", {{1}})
dst.write(src.read())
src.close()
dst.close()`, a:["\"r\"","\"w\""], d:["\"a\"","\"x\""], o:"", fo:{"out.txt":"copy me"},
w:"The source is read with \"r\" and the copy is written with \"w\", which replaces the x that was there."},

{t:"Opening files", q:"Close the log file properly.", f:{"log.txt":"Start "},
c:`log = open("log.txt", "a")
log.write("ok")
{{0}}`, a:["log.close()"], d:["close(log)","log.close","close()"], o:"", fo:{"log.txt":"Start ok"},
w:"close is a method of the file, so it's log.close() with brackets. Without the brackets nothing is called and the text may never be saved."},

{t:"Opening files", p:1, q:"What does this print?", f:{"a.txt":"apple","b.txt":"banana"},
c:`f = open("a.txt")
f = open("b.txt")
print(f.read())
f.close()`, a:["banana"], d:["apple","applebanana","ValueError"],
w:"The second open() replaces what f refers to, so f now reads b.txt. (The first file is left open, which is bad practice.)"},

{t:"Reading files", q:"Read the whole poem in one go.", f:{"poem.txt":"Roses are red\nViolets are blue\n"},
c:`f = open("poem.txt")
text = f.{{0}}()
print(text)
f.close()`, a:["read"], d:["readline","readLine","readAll"], o:"Roses are red\nViolets are blue",
w:"read() returns the whole file as one string. readline() would only give the first line."},

{t:"Reading files", q:"Read just the header line.", f:{"data.txt":"Name,Score\nAnn,12\n"},
c:`f = open("data.txt")
header = f.{{0}}()
print(header.strip())
f.close()`, a:["readline"], d:["read","readlines","readLine"], o:"Name,Score",
w:"readline() reads one line, including its newline. OCR writes this as readLine(), but Python's name is all lower case."},

{t:"Reading files", q:"Loop through every line of the file.", f:{"names.txt":"Ann\nBob\nCat\n"},
c:`f = open("names.txt")
for line in {{0}}:
    print(line.strip())
f.close()`, a:["f"], d:["f.readline()","\"names.txt\"","names"], o:"Ann\nBob\nCat",
w:"for line in f: gives one line per pass. Looping over f.readline() would go through the characters of the first line only."},

{t:"Reading files", p:1, q:"What does this print?", f:{"c.txt":"red\ngreen\nblue\n"},
c:`f = open("c.txt")
f.readline()
print(f.readline().strip())`, a:["green"], d:["red","blue","red green"],
w:"Each readline() moves on to the next line. The first call reads red (and throws it away), the second reads green."},

{t:"Reading files", p:1, q:"What does this print?", f:{"x.txt":"a\nb\nc\nd\n"},
c:`f = open("x.txt")
lines = f.readlines()
print(len(lines))`, a:["4"], d:["8","1","3"],
w:"readlines() returns a list with one item per line, so the length is the number of lines: 4."},

{t:"Reading files", p:1, q:"What does this print?", f:{"one.txt":"only\n"},
c:`f = open("one.txt")
f.readline()
print(len(f.readline()))`, a:["0"], d:["None","EOFError","4"],
w:"At the end of the file readline() returns an empty string \"\" rather than an error. This is how Python spots endOfFile()."},

{t:"Reading files", q:"Keep reading until the end of the file.", f:{"s.txt":"Mon\nTue\n"},
c:`f = open("s.txt")
line = f.readline()
while line {{0}} "":
    print(line.strip())
    line = f.readline()`, a:["!="], d:["==","<","="], o:"Mon\nTue",
w:"readline() gives \"\" at the end of the file, so loop while line != \"\". It does the same job as OCR's while NOT f.endOfFile()."},

{t:"Reading files", q:"Print the last name in the file.", f:{"team.txt":"Ali\nBea\nCal\n"},
c:`f = open("team.txt")
names = f.readlines()
print(names[{{0}}].strip())`, a:["-1"], d:["3","1","0"], o:"Cal",
w:"readlines() gives a list, and index -1 is the last item. Index 3 would be off the end of a 3-item list."},

{t:"Reading files", q:"Print the lines without blank gaps between them.", f:{"m.txt":"Ann\nBob\n"},
c:`f = open("m.txt")
for line in f:
    print({{0}})`, a:["line.strip()"], d:["line","line.split()","str(line)"], o:"Ann\nBob",
w:"Each line ends with a newline and print() adds another, giving blank gaps. strip() removes the newline from the line."},

{t:"Reading files", p:1, q:"What does this print?", f:{"h.txt":"hi\nyo\n"},
c:`f = open("h.txt")
print(len(f.read()))`, a:["6"], d:["4","2","5"],
w:"read() includes the newline characters. \"hi\" + newline + \"yo\" + newline is 6 characters."},

{t:"Reading files", p:1, q:"What does this print?", f:{"w.txt":"hello"},
c:`f = open("w.txt")
a = f.read()
b = f.read()
print(len(b))`, a:["0"], d:["5","10","None"],
w:"The first read() takes everything and leaves the file at its end. A second read() returns an empty string."},

{t:"Reading files", q:"Read the first line and print it in capitals.", f:{"city.txt":"york\nleeds\n"},
c:`with open("city.txt") as f:
    city = f.{{0}}().strip()
print(city.{{1}}())`, a:["readline","upper"], d:["read","readLine","capital"], o:"YORK",
w:"readline() gets just the first line and strip() removes its newline. upper() then gives capitals."},

{t:"Reading files", p:1, q:"What does this print?", f:{"ab.txt":"a\nb\n"},
c:`f = open("ab.txt")
print(f.readlines())`, a:["['a\\n', 'b\\n']"], d:["['a', 'b']","ab","a b"],
w:"readlines() keeps the newline on the end of every line, shown as \\n inside the list. You usually strip() each one."},

{t:"Reading files", q:"Number each line as it is printed.", f:{"q.txt":"Ann\nBob\nCy\n"},
c:`f = open("q.txt")
n = 1
for line in f:
    print(n, line.strip())
    n = {{0}}`, a:["n + 1"], d:["n","line + 1","1"], o:"1 Ann\n2 Bob\n3 Cy",
w:"Adding 1 to n on every pass of the loop counts up 1, 2, 3 alongside the lines."},

{t:"Reading files", p:1, q:"What does this print?", f:{"p.txt":"Name\nAnn\nBob\n"},
c:`f = open("p.txt")
f.readline()
for line in f:
    print(line.strip(), end=" ")`, a:["Ann Bob"], d:["Name Ann Bob","Name","Ann"],
w:"The first readline() uses up the header line. The for loop carries on from where reading stopped."},

{t:"Reading files", q:"Count the words in the whole file.", f:{"t.txt":"the cat\nsat on\nthe mat\n"},
c:`f = open("t.txt")
words = f.read().{{0}}()
print(len(words))`, a:["split"], d:["splitlines","strip","lower"], o:"6",
w:"split() with no argument splits on any spaces or newlines, giving a list of the 6 words."},

{t:"Reading files", p:1, q:"What does this print?", f:{"pet.txt":"cat\ndog\n"},
c:`f = open("pet.txt")
print(len(f.readline()))`, a:["4"], d:["3","1","8"],
w:"readline() keeps the newline at the end of the line, so \"cat\" plus the newline is 4 characters."},

{t:"Reading files", q:"Print Empty if the file has nothing in it.", f:{"e.txt":""},
c:`f = open("e.txt")
data = f.read()
if data == {{0}}:
    print("Empty")
else:
    print("Data")`, a:["\"\""], d:["None","0","\" \""], o:"Empty",
w:"read() on an empty file returns the empty string \"\", not None or 0."},

{t:"Reading files", q:"Read every line into a list.", f:{"m.txt":"Ann\nBob\n"},
c:`with open("m.txt") as f:
    lines = f.{{0}}()
print(lines[1].strip())`, a:["readlines"], d:["read","readline","list"], o:"Bob",
w:"readlines() returns a list of lines, so lines[1] is the second line. With read() or readline(), [1] would be a single character."},

{t:"Reading files", p:1, q:"What does this print?", f:{"d.txt":"Mon\nTue\nWed\n"},
c:`f = open("d.txt")
for line in f:
    last = line
print(last.strip())`, a:["Wed"], d:["Mon","Tue","Mon Tue Wed"],
w:"last is overwritten on every pass of the loop, so after the loop it holds the final line."},

{t:"Writing files", q:"Save the score to the file.",
c:`score = 87
f = open("s.txt", "w")
f.write({{0}}(score))
f.close()`, a:["str"], d:["int","print","float"], o:"", fo:{"s.txt":"87"},
w:"write() only accepts a string, so the integer must be cast with str() first. float() would save 87.0."},

{t:"Writing files", q:"Write each pet on its own line.",
c:`f = open("pets.txt", "w")
f.write("cat" {{0}} "\\n")
f.write("dog" + "\\n")
f.close()`, a:["+"], d:[",","*","-"], o:"", fo:{"pets.txt":"cat\ndog\n"},
w:"\"\\n\" is the newline character. Join it on with +, because write() takes only one argument."},

{t:"Writing files", q:"Write every name on a separate line.",
c:`names = ["Ann", "Bob"]
f = open("n.txt", "w")
for n in names:
    f.write({{0}})
f.close()`, a:["n + \"\\n\""], d:["n","names + \"\\n\"","\"\\n\" + names"], o:"", fo:{"n.txt":"Ann\nBob\n"},
w:"write() doesn't add a new line for you. Without \"\\n\" the file would hold AnnBob on one line."},

{t:"Writing files", p:1, q:"What does this print?",
c:`f = open("x.txt", "w")
f.write("Hi")
f.write("Yo")
f.close()
print(open("x.txt").read())`, a:["HiYo"], d:["Hi Yo","Yo","Hi"],
w:"Unlike print(), write() adds no space and no new line, so the two writes run straight together."},

{t:"Writing files", p:1, q:"What does this print?",
c:`f = open("x.txt", "w")
f.write(42)
f.close()`, a:["TypeError"], d:["42","ValueError","UnsupportedOperation"],
w:"write() must be given a string. Passing the integer 42 raises a TypeError; use f.write(str(42))."},

{t:"Writing files", q:"Send the greeting to the file instead of the screen.",
c:`f = open("hi.txt", "w")
print("Hello", {{0}})
f.close()`, a:["file=f"], d:["f","to=f","file"], o:"", fo:{"hi.txt":"Hello\n"},
w:"print(..., file=f) writes to the file and adds a newline just like on screen. Without file= it would print f on the screen."},

{t:"Writing files", p:1, q:"What does this print?",
c:`with open("s.txt", "w") as f:
    f.write("5")
with open("s.txt", "w") as f:
    f.write("9")
print(open("s.txt").read())`, a:["9"], d:["59","5","95"],
w:"Each time a file is opened with \"w\" it starts empty, so the 5 is wiped before the 9 is written."},

{t:"Writing files", q:"Save the name the user types.", i:["Zara"],
c:`name = input()
f = open("user.txt", "w")
f.write({{0}})
f.close()`, a:["name"], d:["\"name\"","input()","user"], o:"", fo:{"user.txt":"Zara"},
w:"Write the variable name, not the string \"name\" in quotes. Calling input() again would wait for more typing."},

{t:"Writing files", q:"Write the record as Ann,12.",
c:`name = "Ann"
score = 12
f = open("r.txt", "w")
f.write(name + {{0}} + str(score))
f.close()`, a:["\",\""], d:["\" \"","\"\"","\"+\""], o:"", fo:{"r.txt":"Ann,12"},
w:"A comma between fields makes a CSV record. The comma must be a string in quotes to be joined with +."},

{t:"Writing files", q:"Write the name and age, then end the line.",
c:`name = "Sam"
age = 15
f = open("a.txt", "w")
f.write(name + "," + {{0}}(age) + {{1}})
f.close()`, a:["str","\"\\n\""], d:["int","\"/n\"","chr"], o:"", fo:{"a.txt":"Sam,15\n"},
w:"age is a number, so str(age) makes it joinable. \"\\n\" is the newline character; \"/n\" is a common slip that writes a slash and the letter n."},

{t:"Writing files", p:1, q:"What does this print?",
c:`with open("a.txt", "w") as f:
    print("x", file=f)
    print("y", file=f)
print(len(open("a.txt").read()))`, a:["4"], d:["2","3","6"],
w:"print() adds a newline after each item, so the file holds x, newline, y, newline: 4 characters."},

{t:"Writing files", q:"Write the numbers 1 to 5, one per line.",
c:`f = open("n.txt", "w")
for i in range(1, {{0}}):
    f.write(str(i) + "\\n")
f.close()`, a:["6"], d:["5","4","7"], o:"", fo:{"n.txt":"1\n2\n3\n4\n5\n"},
w:"range(1, 6) stops before 6, so it gives 1 to 5. Each number is cast to a string before it is written."},

{t:"Writing files", q:"Save the score only if it beats the high score.", f:{"hs.txt":"70"},
c:`best = 70
score = 85
if score {{0}} best:
    f = open("hs.txt", "w")
    f.write(str(score))
    f.close()`, a:[">"], d:["<","==","="], o:"", fo:{"hs.txt":"85"},
w:"85 > 70, so the file is reopened in \"w\" mode and the old high score is replaced."},

{t:"Writing files", q:"Put each item on a new line using two writes.",
c:`f = open("shop.txt", "w")
for item in ["eggs", "ham"]:
    f.write(item)
    f.write({{0}})
f.close()`, a:["\"\\n\""], d:["\"/n\"","10","chr"], o:"", fo:{"shop.txt":"eggs\nham\n"},
w:"A separate write(\"\\n\") after each item ends the line. write(10) fails because 10 is a number, not a string."},

{t:"Writing files", q:"Write ab three times into the file.",
c:`f = open("c.txt", "w")
for i in range({{0}}):
    f.write("ab")
f.close()`, a:["3"], d:["2","6","4"], o:"", fo:{"c.txt":"ababab"},
w:"The file stays open for the whole loop, so all three writes are kept: ababab, which is 6 characters."},

{t:"Writing files", q:"Make sure the data is saved before reading it back.",
c:`f = open("x.txt", "w")
f.write("saved")
{{0}}
g = open("x.txt")
print(g.read())`, a:["f.close()"], d:["f.read()","g.close()","f.write()"], o:"saved",
w:"Written data can sit in memory until the file is closed. Closing f first makes sure the text is really in the file."},

{t:"Writing files", q:"Write the record with a comma between the values.",
c:`name = "Ann"
score = 12
f = open("r.txt", "w")
print(name, score, {{0}}, file=f)
f.close()`, a:["sep=\",\""], d:["\",\"","end=\",\"","sep=\" \""], o:"", fo:{"r.txt":"Ann,12\n"},
w:"sep=\",\" puts a comma between the values instead of a space. print() converts the number to text for you."},

{t:"Writing files", p:1, q:"What does this print?",
c:`with open("t.txt", "w") as f:
    f.write("a" + "\\n" + "b" + "\\n")
lines = open("t.txt").readlines()
print(len(lines))`, a:["2"], d:["1","4","3"],
w:"One write() can make several lines. Each newline ends a line, so readlines() finds 2 lines."},

{t:"Writing files", q:"Save three guest names typed by the user.", i:["Ann","Ben","Cat"],
c:`f = open("guests.txt", "w")
for i in range(3):
    name = input()
    f.write({{0}})
f.close()`, a:["name + \"\\n\""], d:["name","\"\\n\" + name","input() + \"\\n\""], o:"", fo:{"guests.txt":"Ann\nBen\nCat\n"},
w:"Add the newline after each name so every guest ends up on their own line."},

{t:"Writing files", q:"Write each temperature on its own line.",
c:`temps = [12, 15, 9]
with open("t.txt", "w") as f:
    for t in temps:
        print({{0}}, file=f)`, a:["t"], d:["temps","str(temps)","[t]"], o:"", fo:{"t.txt":"12\n15\n9\n"},
w:"print(t, file=f) turns the number into text and adds a newline, so no str() or \"\\n\" is needed here."},

{t:"Appending", q:"Add logout to the end of the log.", f:{"log.txt":"login\n"},
c:`f = open("log.txt", {{0}})
f.write("logout" + "\\n")
f.close()`, a:["\"a\""], d:["\"w\"","\"r\"","\"+\""], o:"", fo:{"log.txt":"login\nlogout\n"},
w:"\"a\" (append) mode keeps what is already there and writes at the end. \"w\" would lose login."},

{t:"Appending", p:1, q:"What does this print?", f:{"s.txt":"5"},
c:`f = open("s.txt", "a")
f.write("9")
f.close()
print(open("s.txt").read())`, a:["59"], d:["9","5","95"],
w:"Appending adds to the end of the existing text, with no space or new line unless you write one."},

{t:"Appending", p:1, q:"What does this print?",
c:`f = open("new.txt", "a")
f.write("hi")
f.close()
print(open("new.txt").read())`, a:["hi"], d:["FileNotFoundError","","None"],
w:"If the file doesn't exist yet, \"a\" mode creates it, just like \"w\". Only \"r\" fails on a missing file."},

{t:"Appending", q:"Add the user's name to the end of the log.", f:{"log.txt":"ann\n"}, i:["sam"],
c:`user = input()
f = open("log.txt", {{0}})
f.write(user + {{1}})
f.close()`, a:["\"a\"","\"\\n\""], d:["\"w\"","\"/n\"","\",\""], o:"", fo:{"log.txt":"ann\nsam\n"},
w:"Append mode keeps ann, and adding \"\\n\" ends sam's line so the next entry starts on a new line."},

{t:"Appending", p:1, q:"What does this print?",
c:`with open("x.txt", "w") as f:
    f.write("A")
with open("x.txt", "a") as f:
    f.write("B")
print(open("x.txt").read())`, a:["AB"], d:["B","A","BA"],
w:"\"w\" creates the file with A, then \"a\" adds B after it."},

{t:"Appending", p:1, q:"What does this print?", f:{"c.txt":"x"},
c:`for i in range(3):
    f = open("c.txt", "a")
    f.write("x")
    f.close()
print(open("c.txt").read())`, a:["xxxx"], d:["x","xxx","xxxxx"],
w:"The file already had one x, and each of the three appends adds another, giving 4."},

{t:"Appending", q:"Add the score without losing the old ones.", f:{"scores.txt":"12\n"},
c:`score = 15
with open("scores.txt", {{0}}) as f:
    print(score, file=f)`, a:["\"a\""], d:["\"w\"","\"r\"","\"ab\""], o:"", fo:{"scores.txt":"12\n15\n"},
w:"Append mode adds the new score after 12. A score table that uses \"w\" would only ever hold the latest score."},

{t:"Appending", p:1, q:"What does this print?", f:{"v.txt":"Ann\nBob\n"},
c:`f = open("v.txt", "a")
print("Cat", file=f)
f.close()
print(len(open("v.txt").readlines()))`, a:["3"], d:["1","2","4"],
w:"Appending Cat adds a third line to the two already there."},

{t:"Appending", q:"Add Dan on a new line of the register.", f:{"reg.txt":"Ann\nBob"},
c:`f = open("reg.txt", "a")
f.write({{0}})
f.close()`, a:["\"\\n\" + \"Dan\""], d:["\"Dan\" + \"\\n\"","\"Dan\"","\"\\n\""], o:"", fo:{"reg.txt":"Ann\nBob\nDan"},
w:"The file doesn't end with a newline, so appending Dan straight away would give BobDan. Write the newline first."},

{t:"Appending", q:"Make the log keep every message.",
c:`def log(msg):
    f = open("log.txt", {{0}})
    f.write(msg + "\\n")
    f.close()
log("start")
log("stop")`, a:["\"a\""], d:["\"w\"","\"r\""], o:"", fo:{"log.txt":"start\nstop\n"},
w:"Each call reopens the file. With \"w\" the second call would wipe start, leaving only stop."},

{t:"Appending", q:"Append the new high score record.", f:{"hs.txt":"Al,25\n"},
c:`name = "Mo"
pts = 30
f = open("hs.txt", "a")
f.write(name + {{0}} + {{1}}(pts) + "\\n")
f.close()`, a:["\",\"","str"], d:["\" \"","int","+"], o:"", fo:{"hs.txt":"Al,25\nMo,30\n"},
w:"The new record matches the old format: name, comma, score as a string, newline."},

{t:"Appending", p:1, q:"What does this print?", f:{"d.txt":"1"},
c:`for n in ["2", "3"]:
    f = open("d.txt", "w")
    f.write(n)
    f.close()
print(open("d.txt").read())`, a:["3"], d:["123","23","1"],
w:"\"w\" wipes the file every time it is opened, so only the last value survives. \"a\" would have given 123."},

{t:"Appending", q:"Wipe the file for new, otherwise add to it.", f:{"list.txt":"milk"}, i:["new","add"],
c:`for i in range(2):
    word = input()
    if word == "new":
        mode = {{0}}
    else:
        mode = {{1}}
    f = open("list.txt", mode)
    f.write(word)
    f.close()`, a:["\"w\"","\"a\""], d:["\"r\"","\"x\""], o:"", fo:{"list.txt":"newadd"},
w:"new chooses \"w\", which wipes milk. Then add chooses \"a\", which writes after what is there."},

{t:"Appending", q:"Append the event to the log file.", f:{"events.txt":"alarm on\n"},
c:`log = open("events.txt", "a")
print("door open", {{0}})
log.close()`, a:["file=log"], d:["file=f","log","file=events.txt"], o:"", fo:{"events.txt":"alarm on\ndoor open\n"},
w:"file= must name the open file variable, which here is log."},

{t:"Appending", q:"Add both new fruits to the end of the file.", f:{"fruit.txt":"apple\n"},
c:`new = ["kiwi", "plum"]
f = open("fruit.txt", "a")
for x in {{0}}:
    f.write(x + "\\n")
f.close()`, a:["new"], d:["\"new\"","fruit","x"], o:"", fo:{"fruit.txt":"apple\nkiwi\nplum\n"},
w:"Looping over the list new appends each fruit. Looping over \"new\" in quotes would append the letters n, e and w."},

{t:"Appending", p:1, q:"What does this print?", f:{"a.txt":"hi"},
c:`f = open("a.txt", "a")
print(f.read())`, a:["UnsupportedOperation"], d:["hi","","ValueError"],
w:"A file opened for appending can only be written to. Trying to read it raises UnsupportedOperation."},

{t:"Appending", q:"Add one to the visit counter. Don't append!", f:{"visits.txt":"41"},
c:`f = open("visits.txt")
n = int(f.read())
f.close()
f = open("visits.txt", {{0}})
f.write(str(n + 1))
f.close()`, a:["\"w\""], d:["\"a\"","\"r\""], o:"", fo:{"visits.txt":"42"},
w:"The counter should be replaced, not added to, so use \"w\". Appending would make the file say 4142."},

{t:"Appending", p:1, q:"What does this print?", f:{"m.txt":"Hi"},
c:`with open("m.txt", "a") as f:
    f.write(" there")
print(open("m.txt").read())`, a:["Hi there"], d:["there","Hi","Hithere"],
w:"The appended text starts with a space, so it joins onto Hi as Hi there."},

{t:"Appending", q:"Log each guess the player makes.", f:{"guesses.txt":"3\n"}, i:["7"],
c:`g = int(input())
f = open("guesses.txt", "a")
f.write({{0}} + "\\n")
f.close()`, a:["str(g)"], d:["g","int(g)","\"g\""], o:"", fo:{"guesses.txt":"3\n7\n"},
w:"g was cast to an integer, so it must go back to a string with str() before it can be joined and written."},

{t:"Appending", p:1, q:"What does this print?", f:{"log.txt":"a\nb\n"},
c:`f = open("log.txt", "w")
f.write("c")
f.close()
print(open("log.txt").read())`, a:["c"], d:["a b c","abc","a"],
w:"This was meant to be a log, but \"w\" wiped a and b. Logs should be opened with \"a\"."},

{t:"Processing lines", q:"Add up the numbers in the file.", f:{"n.txt":"4\n7\n9\n"},
c:`total = 0
for line in open("n.txt"):
    total = total + {{0}}(line)
print(total)`, a:["int"], d:["str","len","float"], o:"20",
w:"Everything read from a file is a string, so cast each line with int() before adding. float() would print 20.0."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"n.txt":"4\n7\n"},
c:`f = open("n.txt")
a = f.readline().strip()
b = f.readline().strip()
print(a + b)`, a:["47"], d:["11","4 7","TypeError"],
w:"a and b are the strings \"4\" and \"7\", so + joins them. Cast with int() to add them as numbers."},

{t:"Processing lines", q:"Count the lines in the file.", f:{"c.txt":"red\nblue\ngreen\n"},
c:`count = 0
for line in open("c.txt"):
    count = {{0}}
print(count)`, a:["count + 1"], d:["count + line","len(line)","line"], o:"3",
w:"Add 1 for every line the loop reads. len(line) would just give the length of the last line."},

{t:"Processing lines", q:"Print the mean temperature.", f:{"t.txt":"12\n15\n18\n"},
c:`total = 0
n = 0
for line in open("t.txt"):
    total = total + int(line)
    n = n + 1
print(total {{0}} n)`, a:["/"], d:["//","%","*"], o:"15.0",
w:"The mean is total / count. / always gives a float, so 45 / 3 prints 15.0. // would give the whole number 15."},

{t:"Processing lines", q:"Split the line at the commas and print the third value.", f:{"r.txt":"Ann,12,15\n"},
c:`line = open("r.txt").readline()
parts = line.strip().split({{0}})
print(parts[2])`, a:["\",\""], d:["\" \"","\"\"","\"r\""], o:"15",
w:"split(\",\") cuts the string at every comma, giving [\"Ann\", \"12\", \"15\"]. Index 2 is the third item."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"m.txt":"9,4,7,2\n"},
c:`data = open("m.txt").read()
print(len(data.split(",")))`, a:["4"], d:["7","8","1"],
w:"Three commas split the text into 4 pieces, so the list has 4 items."},

{t:"Processing lines", q:"Find the highest score in the file.", f:{"s.txt":"34\n81\n57\n"},
c:`best = 0
for line in open("s.txt"):
    n = int(line)
    if n {{0}} best:
        best = n
print(best)`, a:[">"], d:["<","==","<="], o:"81",
w:"Whenever a value is bigger than the best so far, it becomes the new best."},

{t:"Processing lines", q:"Count the marks of 50 or more.", f:{"m.txt":"45\n72\n50\n38\n90\n"},
c:`count = 0
for line in open("m.txt"):
    if int(line) {{0}} 50:
        count = count + 1
print(count)`, a:[">="], d:[">","==","<"], o:"3",
w:"\"50 or more\" includes 50, so use >=. With > the mark of exactly 50 would be missed."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"a.txt":"3\n4\n"},
c:`nums = open("a.txt").readlines()
print(int(nums[0]) * int(nums[1]))`, a:["12"], d:["34","TypeError","7"],
w:"int() ignores the newline at the end of each line, so this is 3 * 4."},

{t:"Processing lines", q:"Add up the comma-separated numbers.", f:{"d.txt":"3,8,5"},
c:`nums = open("d.txt").read().split(",")
total = 0
for x in nums:
    total = total + {{0}}
print(total)`, a:["int(x)"], d:["x","int(nums)","len(x)"], o:"16",
w:"split() gives strings such as \"3\", so each one is cast with int() before adding."},

{t:"Processing lines", q:"Skip the blank lines.", f:{"n.txt":"Ann\n\nBob\n"},
c:`for line in open("n.txt"):
    line = line.strip()
    if line {{0}} "":
        print(line)`, a:["!="], d:["==","<","="], o:"Ann\nBob",
w:"After strip(), a blank line becomes the empty string, so only print lines that are not equal to \"\"."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"x.txt":"ab\ncd\n"},
c:`n = 0
for line in open("x.txt"):
    n = n + len(line.strip())
print(n)`, a:["4"], d:["6","2","3"],
w:"strip() removes each newline before counting, so only the letters are counted: 2 + 2."},

{t:"Processing lines", q:"Find the longest word in the file.", f:{"w.txt":"cat\nzebra\nox\n"},
c:`longest = ""
for line in open("w.txt"):
    w = line.strip()
    if len(w) > len({{0}}):
        longest = w
print(longest)`, a:["longest"], d:["w","line","longest + w"], o:"zebra",
w:"Compare each word's length with the longest found so far, and keep the new word if it is longer."},

{t:"Processing lines", q:"Store the numbers from the file in a list.", f:{"n.txt":"5\n2\n8\n"},
c:`nums = []
for line in open("n.txt"):
    nums.{{0}}(int(line))
print(nums)`, a:["append"], d:["add","insert","extend"], o:"[5, 2, 8]",
w:"append() adds one item to the end of a list. Lists have no add() method."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"h.txt":"hi\n"},
c:`line = open("h.txt").readline()
line.strip()
print(len(line))`, a:["3"], d:["2","1","0"],
w:"strip() returns a new string; it doesn't change line. You need line = line.strip() to keep the result."},

{t:"Processing lines", q:"Print each day with the temperature one higher.", f:{"t.txt":"Mon 12\nTue 15\n"},
c:`for line in open("t.txt"):
    parts = line.{{0}}()
    print(parts[0], {{1}}(parts[1]) + 1)`, a:["split","int"], d:["strip","str","list"], o:"Mon 13\nTue 16",
w:"split() with no argument splits at spaces. The temperature is text, so int() is needed before adding 1."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"a.txt":"7\n8\n"},
c:`total = 0
for line in open("a.txt"):
    total = total + int(line)
print(total / 2)`, a:["7.5"], d:["7","7.0","78"],
w:"The total is 15, and / gives a float, so the mean is 7.5."},

{t:"Processing lines", q:"Count how many people voted yes.", f:{"v.txt":"yes\nno\nyes\nyes\n"},
c:`count = 0
for line in open("v.txt"):
    if line.strip() == {{0}}:
        count = count + 1
print(count)`, a:["\"yes\""], d:["yes","\"no\"","\"Yes\""], o:"3",
w:"Each line is stripped of its newline and compared with the string \"yes\". Comparisons are case sensitive."},

{t:"Processing lines", q:"Print the range (highest minus lowest).", f:{"t.txt":"4\n10\n7\n"},
c:`nums = []
for line in open("t.txt"):
    nums.append(int(line))
print({{0}}(nums) - {{1}}(nums))`, a:["max","min"], d:["len","sum"], o:"6",
w:"max() gives the biggest item and min() the smallest, so 10 - 4 = 6."},

{t:"Processing lines", p:1, q:"What does this print?", f:{"n.txt":"5\n5\n"},
c:`nums = open("n.txt").read().split()
print(nums)`, a:["['5', '5']"], d:["[5, 5]","['5\\n', '5\\n']","55"],
w:"split() removes the newlines, but the values are still strings until you cast them with int()."},

{t:"CSV records", q:"Print each pupil's house colour.", f:{"pupils.csv":"Ann,10,Red\nBob,11,Blue\n"},
c:`for line in open("pupils.csv"):
    r = line.strip().split(",")
    print(r[{{0}}])`, a:["2"], d:["3","1","-2"], o:"Red\nBlue",
w:"Each record splits into [name, year, house]. The house is the third field, which is index 2."},

{t:"CSV records", q:"Look up the phone number for the name typed in.", f:{"phone.csv":"Ann,0711\nBob,0722\n"}, i:["Bob"],
c:`name = input()
for line in open("phone.csv"):
    r = line.strip().split(",")
    if r[0] == {{0}}:
        print(r[1])`, a:["name"], d:["\"name\"","r[1]","line"], o:"0722",
w:"Compare the first field of each record with the variable name. The matching record's second field is the number."},

{t:"CSV records", q:"Set the flag when zoe is found.", f:{"users.csv":"amy,12\nzoe,15\n"},
c:`found = False
for line in open("users.csv"):
    r = line.strip().split(",")
    if r[0] == "zoe":
        found = {{0}}
print(found)`, a:["True"], d:["False","r","1"], o:"True",
w:"A Boolean flag starts as False and is set to True when the search finds a match."},

{t:"CSV records", p:1, q:"What does this print?", f:{"r.csv":"Sam,14,9B\n"},
c:`line = open("r.csv").readline()
r = line.split(",")
print(r[1] + r[1])`, a:["1414"], d:["28","14","TypeError"],
w:"Fields from split() are strings, so + joins \"14\" and \"14\". Use int(r[1]) to do arithmetic."},

{t:"CSV records", q:"Join the fields with commas and save the record.",
c:`r = ["Lee", "18", "7C"]
f = open("m.csv", "w")
f.write({{0}}.join(r))
f.close()`, a:["\",\""], d:["\" \"","\"\"","r"], o:"", fo:{"m.csv":"Lee,18,7C"},
w:"\",\".join(r) is the opposite of split(\",\"): it glues the list items together with a comma between each one."},

{t:"CSV records", q:"Add up the sales column.", f:{"sales.csv":"Mon,30\nTue,45\n"},
c:`total = 0
for line in open("sales.csv"):
    r = line.split(",")
    total = total + int(r[{{0}}])
print(total)`, a:["1"], d:["0","2","-2"], o:"75",
w:"The sales figure is the second field, index 1. int() copes with the newline still on the end."},

{t:"CSV records", p:1, q:"What does this print?", f:{"p.csv":"name,age\nAnn,15\n"},
c:`f = open("p.csv")
f.readline()
r = f.readline().strip().split(",")
print(r[0])`, a:["Ann"], d:["name","age","15"],
w:"The first readline() skips the header row, so the second one reads Ann's record."},

{t:"CSV records", q:"Print the name of the top scorer.", f:{"s.csv":"Ann,12\nBob,19\nCy,15\n"},
c:`best = 0
who = ""
for line in open("s.csv"):
    r = line.strip().split(",")
    if int(r[1]) > best:
        best = int(r[1])
        who = {{0}}
print(who)`, a:["r[0]"], d:["r[1]","r","line"], o:"Bob",
w:"When a new best score is found, remember the name in the same record, which is field 0."},

{t:"CSV records", q:"List the items with fewer than 5 in stock.", f:{"stock.csv":"pen,3\nruler,12\nglue,0\n"},
c:`for line in open("stock.csv"):
    r = line.strip().split(",")
    if {{0}}(r[1]) < 5:
        print(r[0])`, a:["int"], d:["str","len","list"], o:"pen\nglue",
w:"The quantity is read as text, so cast it with int() before comparing it with 5. len() would measure the text instead."},

{t:"CSV records", p:1, q:"What does this print?", f:{"r.csv":"Ann,12\n"},
c:`line = open("r.csv").readline()
print(line.split(","))`, a:["['Ann', '12\\n']"], d:["['Ann', '12']","Ann,12","['Ann,12']"],
w:"Without strip(), the newline stays on the last field. Use line.strip().split(\",\") to avoid it."},

{t:"CSV records", q:"Print Not found if the name isn't in the file.", f:{"c.csv":"Ann,1\nBob,2\n"}, i:["Dan"],
c:`target = input()
found = False
for line in open("c.csv"):
    r = line.strip().split(",")
    if r[0] == target:
        found = True
if {{0}} found:
    print("Not found")`, a:["not"], d:["is","!","=="], o:"Not found",
w:"not found is True when the flag is still False after the whole file has been searched. OCR writes this as NOT found."},

{t:"CSV records", q:"Build each record from the two lists.",
c:`nm = ["Ann", "Bob"]
ag = [15, 16]
f = open("a.csv", "w")
for i in range(2):
    rec = nm[i] + "," + {{0}}
    f.write(rec + "\\n")
f.close()`, a:["str(ag[i])"], d:["ag[i]","str(ag)","str(i)"], o:"", fo:{"a.csv":"Ann,15\nBob,16\n"},
w:"Item i of each list belongs to the same person. The age is an integer, so it needs str() before joining."},

{t:"CSV records", p:1, q:"What does this print?", f:{"x.csv":"Ann,,Red\n"},
c:`line = open("x.csv").readline()
r = line.strip().split(",")
print(len(r))`, a:["3"], d:["2","8","1"],
w:"Two commas always make three fields. The middle field is just an empty string."},

{t:"CSV records", q:"Print the mean temperature from the records.", f:{"t.csv":"Mon,10\nTue,14\nWed,9\n"},
c:`total = 0
n = 0
for line in open("t.csv"):
    r = line.strip().split(",")
    total = total + int(r[1])
    n = {{0}}
print(total / n)`, a:["n + 1"], d:["n","r[1]","total"], o:"11.0",
w:"n counts the records, so the mean is 33 / 3 = 11.0."},

{t:"CSV records", q:"Change Bob's score to 20 and save the file.", f:{"s.csv":"Ann,12\nBob,15\n"},
c:`lines = open("s.csv").readlines()
f = open("s.csv", {{0}})
for line in lines:
    r = line.strip().split(",")
    if r[0] == "Bob":
        r[1] = "20"
    print(r[0], r[1], sep={{1}}, file=f)
f.close()`, a:["\"w\"","\",\""], d:["\"a\"","\" \"","\"r\""], o:"", fo:{"s.csv":"Ann,12\nBob,20\n"},
w:"Read all the records first, then rewrite the whole file with \"w\". Appending would leave the old records in place too."},

{t:"CSV records", p:1, q:"What does this print?", f:{"p.csv":"cat,4\ndog,2\n"},
c:`for line in open("p.csv"):
    r = line.strip().split(",")
    if r[0] == "dog":
        print(int(r[1]) * 2)`, a:["4"], d:["22","2","8"],
w:"Only the dog record matches. Its count is cast to the integer 2 and doubled."},

{t:"CSV records", q:"Print each result as a sentence.", f:{"m.csv":"Ann,12\nBob,9\n"},
c:`for line in open("m.csv"):
    r = line.strip().split(",")
    print(r[0], "scored", {{0}})`, a:["r[1]"], d:["r[0]","r","line"], o:"Ann scored 12\nBob scored 9",
w:"Field 0 is the name and field 1 is the score. print() puts a space between each item."},

{t:"CSV records", q:"Copy the Red house records to a new file.", f:{"all.csv":"Ann,Red\nBob,Blue\nCy,Red\n"},
c:`out = open("red.csv", "w")
for line in open("all.csv"):
    r = line.strip().split(",")
    if r[1] == "Red":
        out.write({{0}})
out.close()`, a:["line"], d:["r","r[0]","line + line"], o:"", fo:{"red.csv":"Ann,Red\nCy,Red\n"},
w:"line is the whole original record, newline included, so writing it copies the record exactly."},

{t:"CSV records", p:1, q:"What does this print?", f:{"x.csv":"Ann,12\n"},
c:`line = open("x.csv").readline()
r = line.split(",")
print(r[2])`, a:["IndexError"], d:["12","Ann","None"],
w:"The record has only two fields, indexes 0 and 1. Index 2 doesn't exist."},

{t:"CSV records", q:"Count the pupils in year 10.", f:{"y.csv":"Ann,10\nBob,11\nCy,10\n"},
c:`n = 0
for line in open("y.csv"):
    r = line.strip().split(",")
    if {{0}}(r[1]) == {{1}}:
        n = n + 1
print(n)`, a:["int","10"], d:["\"10\"","len","2"], o:"2",
w:"Cast the year to an integer and compare it with the number 10. An int is never equal to the string \"10\"."},

{t:"File errors", q:"Fix the file name so the file can be found.", f:{"scores.txt":"9"},
c:`f = open({{0}})
print(f.read())
f.close()`, a:["\"scores.txt\""], d:["\"scores\"","\"score.txt\"","\"Scores.txt\""], o:"9",
w:"The name must match exactly, including the extension and capital letters. Anything else raises FileNotFoundError."},

{t:"File errors", p:1, q:"No files exist yet. What does this print?",
c:`f = open("missing.txt")
print(f.read())`, a:["FileNotFoundError"], d:["None","ValueError","EOFError"],
w:"Opening a file for reading that doesn't exist raises FileNotFoundError. Only \"w\" and \"a\" create a new file."},

{t:"File errors", q:"Catch the error when there is no save file.",
c:`try:
    f = open("save.txt")
    print(f.read())
except {{0}}:
    print("No save file")`, a:["FileNotFoundError"], d:["ValueError","TypeError","EOFError"], o:"No save file",
w:"except FileNotFoundError: catches the error raised when the file is missing, so the program can carry on."},

{t:"File errors", q:"This crashed with UnsupportedOperation. Fix the mode.", f:{"a.txt":"x"},
c:`f = open("a.txt", {{0}})
f.write("y")
f.close()`, a:["\"w\""], d:["\"r\"","\"rw\"","\"a\""], o:"", fo:{"a.txt":"y"},
w:"A file opened with \"r\" can only be read. To replace its contents with y, open it with \"w\"."},

{t:"File errors", p:1, q:"What does this print?", f:{"a.txt":"x"},
c:`f = open("a.txt")
f.write("y")
f.close()`, a:["UnsupportedOperation"], d:["ValueError","TypeError","FileNotFoundError"],
w:"With no mode the file is opened for reading only, so write() raises UnsupportedOperation."},

{t:"File errors", p:1, q:"What does this print?", f:{"n.txt":"5\n"},
c:`total = 0
for line in open("n.txt"):
    total = total + line
print(total)`, a:["TypeError"], d:["5","05","ValueError"],
w:"line is a string, and Python can't add a string to the integer 0. Cast it first: int(line)."},

{t:"File errors", q:"Fix the crash when adding the value from the file.", f:{"n.txt":"5\n"},
c:`total = 10
line = open("n.txt").readline()
total = total + {{0}}
print(total)`, a:["int(line)"], d:["line","str(line)","len(line)"], o:"15",
w:"int(line) turns \"5\" (with its newline) into the number 5. len(line) would give 2, the number of characters."},

{t:"File errors", p:1, q:"What does this print?", f:{"n.txt":"score\n7\n"},
c:`for line in open("n.txt"):
    print(int(line))`, a:["ValueError"], d:["7","TypeError","score"],
w:"The first line is the header word score, which can't be turned into an integer, so int() raises a ValueError."},

{t:"File errors", q:"Skip the header so the total works.", f:{"s.txt":"score\n7\n8\n"},
c:`f = open("s.txt")
{{0}}
total = 0
for line in f:
    total = total + int(line)
print(total)`, a:["f.readline()"], d:["f.read()","f.close()","line = 0"], o:"15",
w:"Reading one line first uses up the header, so the loop only sees the numbers. f.read() would use up everything."},

{t:"File errors", q:"Fix the TypeError when writing the total.",
c:`total = 30
f = open("t.txt", "w")
f.write("Total: " + {{0}})
f.close()`, a:["str(total)"], d:["total","int(total)","\"total\""], o:"", fo:{"t.txt":"Total: 30"},
w:"A string and an integer can't be joined with +. str(total) makes it text first."},

{t:"File errors", p:1, q:"What does this print?", f:{"d.csv":"Ann,5\n\n"},
c:`total = 0
for line in open("d.csv"):
    r = line.strip().split(",")
    total = total + int(r[1])
print(total)`, a:["IndexError"], d:["5","ValueError","0"],
w:"The blank last line splits into [\"\"], which has no index 1. Stray blank lines are a common cause of crashes."},

{t:"File errors", q:"Skip blank lines so the program doesn't crash.", f:{"d.csv":"Ann,5\n\nBob,3\n"},
c:`total = 0
for line in open("d.csv"):
    if line.strip() == "":
        {{0}}
    r = line.strip().split(",")
    total = total + int(r[1])
print(total)`, a:["continue"], d:["break","pass","exit"], o:"8",
w:"continue jumps straight to the next line of the file. break would stop reading before Bob."},

{t:"File errors", q:"Fix the TypeError in the comparison.", f:{"n.txt":"10\n"},
c:`n = open("n.txt").readline()
if {{0}}(n) > 9:
    print("big")`, a:["int"], d:["str","len","list"], o:"big",
w:"Text read from a file can't be compared with a number using >, which raises a TypeError. int() makes it a number first."},

{t:"File errors", p:1, q:"What does this print?", f:{"n.txt":"9\n10\n"},
c:`f = open("n.txt")
a = f.readline().strip()
b = f.readline().strip()
print(a > b)`, a:["True"], d:["False","TypeError","ValueError"],
w:"Without int(), these are strings compared letter by letter, and \"9\" comes after \"1\". So \"9\" > \"10\" is True."},

{t:"File errors", q:"Find the biggest number in the file.", f:{"n.txt":"9\n10\n3\n"},
c:`nums = []
for line in open("n.txt"):
    nums.append({{0}})
print(max(nums))`, a:["int(line)"], d:["line","line.strip()","str(line)"], o:"10",
w:"As strings, \"9\" is bigger than \"10\". Casting each line with int() makes max() compare numbers."},

{t:"File errors", q:"Open the file for the name typed in.", f:{"bob.txt":"hi"}, i:["bob"],
c:`name = input()
f = open(name + {{0}})
print(f.read())`, a:["\".txt\""], d:["\"txt\"","\".csv\"","\"\""], o:"hi",
w:"The file is called bob.txt, so .txt (with the dot) must be added to the name. Otherwise it's FileNotFoundError."},

{t:"File errors", p:1, q:"What does this print?",
c:`f = open("x.txt", "w")
print(f.readline())`, a:["UnsupportedOperation"], d:["None","FileNotFoundError","ValueError"],
w:"\"w\" mode creates the file but only allows writing. Reading from it raises UnsupportedOperation."},

{t:"File errors", q:"Use 0 as the high score if there's no file yet.",
c:`try:
    f = open("hs.txt")
    best = int(f.read())
{{0}} FileNotFoundError:
    best = {{1}}
print(best)`, a:["except","0"], d:["catch","else","None"], o:"0",
w:"Python uses try and except (not catch). If the file is missing, the except block sets a starting score."},

{t:"File errors", p:1, q:"What does this print?", f:{"p.txt":"7.5\n"},
c:`price = int(open("p.txt").read())
print(price)`, a:["ValueError"], d:["7","7.5","TypeError"],
w:"int() can't convert the text \"7.5\" because it has a decimal point. Use float() for prices."},

{t:"File errors", q:"Read the price and double it.", f:{"p.txt":"7.5\n"},
c:`price = {{0}}(open("p.txt").read())
print(price * 2)`, a:["float"], d:["int","str","round"], o:"15.0",
w:"float() converts \"7.5\" into the number 7.5. int() would crash and str() would just repeat the text."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"n.txt":"3\n5\n2\n"},
c:`total = 0
for line in open("n.txt"):
    total = total + int(line) * 2
print(total)`, a:["20"], d:["10","352","TypeError"],
w:"Each number is doubled before adding: 6 + 10 + 4 = 20."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"f.txt":"apple\nkiwi\nfig\n"},
c:`n = 0
for line in open("f.txt"):
    if len(line.strip()) > 3:
        n = n + 1
print(n)`, a:["2"], d:["3","1","0"],
w:"apple (5) and kiwi (4) are longer than 3 letters; fig is exactly 3, so it isn't counted."},

{t:"Trace the file", p:1, q:"What does this print?",
c:`f = open("c.txt", "w")
f.write("12")
f.close()
n = int(open("c.txt").read())
print(n + 1)`, a:["13"], d:["121","12","TypeError"],
w:"The file holds the text 12. int() turns it back into a number, so adding 1 gives 13."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"l.txt":"a\nb\nc\nd\n"},
c:`f = open("l.txt")
for i in range(2):
    line = f.readline()
print(line.strip())`, a:["b"], d:["a","c","d"],
w:"The loop calls readline() twice, reading a then b. line keeps the last one read."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"s.csv":"Ann,3\nBob,5\nAnn,4\n"},
c:`t = 0
for line in open("s.csv"):
    r = line.strip().split(",")
    if r[0] == "Ann":
        t = t + int(r[1])
print(t)`, a:["7"], d:["3","4","12"],
w:"Ann has two records, 3 and 4, so her total is 7. Bob's record is skipped."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"w.txt":"hello\n"},
c:`text = open("w.txt").read()
print(text[1])`, a:["e"], d:["h","hello","l"],
w:"read() returns one string, and index 1 is its second character."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"t.txt":"up\ndown\n"},
c:`lines = open("t.txt").readlines()
a = lines[1].strip()
b = lines[0].strip()
print(a + b)`, a:["downup"], d:["updown","down up","up"],
w:"lines[1] is down and lines[0] is up. + joins them with no space."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"n.txt":"1\n2\n3\n"},
c:`for line in open("n.txt"):
    print(line.strip(), end="-")`, a:["1-2-3-"], d:["1-2-3","1 2 3","123"],
w:"end=\"-\" replaces the usual new line, so a dash follows every number, including the last."},

{t:"Trace the file", p:1, q:"What does this print?",
c:`f = open("o.txt", "w")
for i in range(4):
    f.write(str(i) + "\\n")
f.close()
print(open("o.txt").read().split())`, a:["['0', '1', '2', '3']"], d:["['1', '2', '3', '4']","[0, 1, 2, 3]","0123"],
w:"range(4) writes 0 to 3, one per line. Read back and split, they are a list of strings."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"p.txt":"cat\ndog\nbat\n"},
c:`s = ""
for line in open("p.txt"):
    s = s + line[0]
print(s)`, a:["cdb"], d:["tgt","cat","CDB"],
w:"line[0] is the first letter of each line, and they are joined in order."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"a.csv":"Ann,15\nBob,12\nCy,18\n"},
c:`low = 100
for line in open("a.csv"):
    r = line.split(",")
    if int(r[1]) < low:
        low = int(r[1])
        who = r[0]
print(who, low)`, a:["Bob 12"], d:["Ann 15","Cy 18","Bob,12"],
w:"The lowest age is 12, which belongs to Bob. print() separates the two items with a space."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"g.txt":"x\n"},
c:`for w in ["y", "z"]:
    f = open("g.txt", "a")
    print(w, file=f)
    f.close()
print(open("g.txt").read().split())`, a:["['x', 'y', 'z']"], d:["['y', 'z']","['z']","['x', 'z']"],
w:"Both y and z are appended after the x that was already there."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"l.txt":"A\nB\nC\n"},
c:`f = open("l.txt")
first = f.readline().strip()
rest = f.read().split()
print(first, len(rest))`, a:["A 2"], d:["A 3","A 1","B 2"],
w:"readline() takes A, then read() gets only what is left: B and C."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"p.txt":"3\n*\n"},
c:`f = open("p.txt")
n = int(f.readline())
ch = f.readline().strip()
print(ch * n)`, a:["***"], d:["3*","*","TypeError"],
w:"n is the number 3 and ch is \"*\", so ch * n repeats the star 3 times."},

{t:"Trace the file", p:1, q:"How many passwords pass this check?", f:{"pw.txt":"letmein\npassword1\nabc\n"},
c:`ok = 0
for line in open("pw.txt"):
    if len(line) >= 8:
        ok = ok + 1
print(ok)`, a:["2"], d:["1","3","0"],
w:"The newline is counted because there's no strip(), so the 7-letter letmein measures 8 and wrongly passes."},

{t:"Trace the file", p:1, q:"What does this print?", f:{"s.csv":"item,qty\npen,4\npad,6\n"},
c:`f = open("s.csv")
f.readline()
total = 0
for line in f:
    r = line.split(",")
    total = total + int(r[1])
print(total)`, a:["10"], d:["4","6","ValueError"],
w:"The header is skipped by the first readline(), then 4 and 6 are added."}
]);
