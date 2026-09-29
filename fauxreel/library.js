// Faux Reel sample library: funny chats for the library browser in index.html.
// Each entry: t = title, g = comma-separated tags, a = app (w WhatsApp, t Telegram,
// m Messenger, i iMessage, s Signal), me = whose phone it is, x = transcript.
// Loaded on demand the first time the library is opened. Entry order is the chat id
// used in share links (#chat=N), so append new chats at the end.
window.CHAT_LIBRARY = [];
(function () {
const L = a => window.CHAT_LIBRARY.push(...a);
L([
{t:"Pyramid project update",g:"history,work",a:"w",me:"Imhotep",x:`Pharaoh: how's my pyramid coming along
Imhotep: great news, the base is done
Pharaoh: and the top?
Imhotep: the top is more of a "phase 2" thing
Pharaoh: it's been 20 years
Imhotep: pyramids are an iterative process 🙏
Pharaoh: I would like to be buried in it this century
Imhotep: noted. adding "pointy bit" to the roadmap`},
{t:"Trojan delivery",g:"history",a:"w",me:"Odysseus",x:`Priam: hi, there's a giant wooden horse outside the gate
Priam: did anyone order a giant wooden horse
Odysseus: it's a gift! from the Greeks! no reason
Priam: the Greeks we've been at war with for 10 years
Odysseus: we're sorry 🥺 the horse says sorry
Priam: why is the horse whispering
Odysseus: horses do that
(pause 1.5)
Priam: ok bringing it inside`},
{t:"Rome wasn't built in a day",g:"history,work",a:"t",me:"Marcus",x:`Romulus: status update on the city?
Marcus: foundations are in
Romulus: I told the investors it'd be done today
Marcus: who told you a city takes a day
Romulus: my brother
Marcus: the brother you just
Romulus: let's not bring that up
Marcus: ok so realistic timeline: several centuries
Romulus: I'll tell them "soon"`},
{t:"Caesar's calendar",g:"history,work",a:"w",me:"Sosigenes",x:`Julius Caesar: I want a month named after me
Sosigenes: sure, which one
Julius Caesar: a summer one. a good one
Sosigenes: July it is
Julius Caesar: perfect. make it 31 days
Sosigenes: and February?
Julius Caesar: February can deal with it
Sosigenes: February will remember this`},
{t:"Beware the Ides",g:"history",a:"i",me:"Calpurnia",x:`Calpurnia: babe don't go to the senate today
Julius Caesar: why
Calpurnia: I had a dream. also a guy on the street was yelling "beware the ides of March"
Julius Caesar: what's the date
Calpurnia: the ides of March
Julius Caesar: lol coincidence
Calpurnia: please just work from home
Julius Caesar: the senators love me, it'll be fine 😎
(pause 2)
Calpurnia: 😐`},
{t:"Nero's band practice",g:"history",a:"t",me:"Tigellinus",x:`Tigellinus: Emperor, quick one, the city is on fire
Nero: yes I can see it, great lighting
Tigellinus: should we maybe put it out
Nero: after my solo
Tigellinus: the lyre solo?
Nero: 40 minutes, very emotional
Tigellinus: 🔥🔥🔥
Nero: thank you!!
Tigellinus: that was not a compliment`},
{t:"Great Wall group chat",g:"history,work",a:"w",me:"Li",x:`Foreman Wu: morning team. today we build wall
Li: same as yesterday?
Foreman Wu: longer
Chen: how long is the wall going to be exactly
Foreman Wu: yes
Chen: that's not a number
Foreman Wu: 21,000 km-ish
Li: I'm going to need a bigger lunchbox
Chen: can we at least put in a door somewhere`},
{t:"Olympia 776 BC",g:"history,sport",a:"t",me:"Koroibos",x:`Koroibos: I won the race!!
Mum: well done sweetheart! what did you win
Koroibos: an olive branch
Mum: that's lovely
Koroibos: and eternal glory
Mum: can you eat eternal glory
Koroibos: no
Mum: bring the olives home at least
Koroibos: also we ran naked
Mum: I didn't need to know that`},
{t:"Archimedes in the bath",g:"history,school",a:"i",me:"Neighbour",x:`Neighbour: Archimedes is there a reason you just ran down the street with no clothes on
Archimedes: EUREKA
Neighbour: that doesn't answer the question
Archimedes: the crown!! displacement!! the water!!
Neighbour: put a towel on and explain
Archimedes: no time, science waits for no man
Neighbour: the children are watching
Archimedes: then they are learning physics 🛁`},
{t:"Socrates asks questions",g:"history",a:"w",me:"Xanthippe",x:`Xanthippe: are you coming home for dinner
Socrates: what is dinner, truly?
Xanthippe: soup
Socrates: but what is soup
Xanthippe: I will pour it on your head
Socrates: and what is a head
Xanthippe: Plato is writing all of this down isn't he
Plato: ✍️
Xanthippe: why is Plato in this chat`},
{t:"Cleopatra's carpet",g:"history,dating",a:"i",me:"Apollodorus",x:`Cleopatra: I need to meet Caesar, discreetly
Apollodorus: I have an idea but you won't like it
Cleopatra: go on
Apollodorus: I roll you up in a carpet and deliver you
Cleopatra: that's insane
(pause 1.5)
Cleopatra: I love it
Apollodorus: bring a snack, it'll be a while
Cleopatra: I'm going to unroll so dramatically`},
{t:"Hannibal's elephants",g:"history,travel",a:"w",me:"Hannibal",x:`Maharbal: sir why are we taking elephants over the Alps
Hannibal: surprise factor
Maharbal: the elephants are also surprised
Maharbal: mostly by the snow
Hannibal: they'll adapt
Maharbal: one of them is wearing my cloak
Hannibal: that's teamwork
Maharbal: 🐘❄️🐘❄️🐘`},
{t:"Vikings discover America",g:"history,travel",a:"t",me:"Leif",x:`Erik the Red: where are you
Leif: found a new land. lots of grapes
Erik the Red: name it something appealing
Leif: Vinland
Erik the Red: good. I named Greenland "Greenland" and it's all ice
Leif: that's false advertising
Erik the Red: it's marketing
Leif: anyway I'm not staying, the locals are not impressed
Erik the Red: no one will ever find out about this place then`},
{t:"Norse weather",g:"history,travel",a:"w",me:"Astrid",x:`Bjorn: raid today?
Astrid: it's minus 20 and the sea is angry
Bjorn: so yes?
Astrid: Bjorn
Bjorn: the gods favour the bold
Astrid: the gods favour a warm longhouse
Ivar: I'm in if there's mead after
Astrid: fine but I'm bringing the good blanket`},
{t:"1066 group chat",g:"history",a:"w",me:"Harold",x:`Harold: great news lads, beat the Vikings up north 💪
Edith: amazing!! come home and rest
Harold: small update, the Normans have landed in the south
Edith: how far is that
Harold: very far
Edith: are you walking
Harold: we're walking
(pause 1.5)
Edith: keep your eyes open out there
Harold: always do 👁️`},
{t:"Knights of the round table",g:"history,work",a:"s",me:"Arthur",x:`Lancelot: why is the table round
Arthur: so nobody sits at the head. we're all equal
Gawain: so who's in charge
Arthur: me
Lancelot: at the equal table
Arthur: I'm equally in charge
Galahad: can we talk about the grail
Arthur: next meeting. this one is about the table`},
{t:"Magna Carta",g:"history,work",a:"w",me:"Baron Fitz",x:`Baron Fitz: John we need you to sign something
King John: what is it
Baron Fitz: just a little document
King John: it's 63 clauses
Baron Fitz: mostly admin
King John: clause 39 says I can't just throw people in prison??
Baron Fitz: correct
King John: what's even the point of being king
Baron Fitz: please sign by the meadow, the lighting is nice`},
{t:"Black Death? Just a cold",g:"history,news",a:"t",me:"Agnes",x:`Agnes: Thomas you should stay home this week
Thomas: why
Agnes: everyone in the village is coughing and turning black
Thomas: probably just a cold
Agnes: the doctor is wearing a bird mask
Thomas: fashion statement
Agnes: he's burning herbs outside the church
Thomas: fine. I'll work from hovel`},
{t:"Marco Polo's travel blog",g:"history,travel",a:"i",me:"Marco",x:`Marco: back from China! 24 years, loads of stories
Dad: welcome home. you left for a weekend trip
Marco: they have paper money there
Dad: sure
Marco: and noodles
Dad: sure
Marco: and they burn black stones for heat
Dad: you've been on the road too long son
Marco: I'm writing a book, you'll see`},
{t:"Genghis Khan's HR",g:"history,work",a:"w",me:"HR Temur",x:`HR Temur: quick reminder about the expense policy
Genghis Khan: I conquered Persia
HR Temur: yes and you need receipts for it
Genghis Khan: I am the receipt
HR Temur: that's not how accounting works
Genghis Khan: my empire goes from Korea to Poland
HR Temur: great, that's a lot of receipts
Genghis Khan: 🐎💨`},
{t:"Columbus navigation",g:"history,travel",a:"w",me:"Pinzón",x:`Columbus: land ho!! India!!
Pinzón: are you sure
Columbus: 100%. look, Indians
Pinzón: they have a different word for themselves
Columbus: and the spices?
Pinzón: there are no spices
Columbus: pepper?
Pinzón: chillies
Columbus: close enough, calling it India
Pinzón: this is going to confuse people for 500 years`},
{t:"Leaning tower QA",g:"history,work",a:"t",me:"Bonanno",x:`Mayor of Pisa: quick question about the tower
Bonanno: love that tower
Mayor of Pisa: why is it leaning
Bonanno: artistic choice
Mayor of Pisa: it's getting worse every floor
Bonanno: dynamic architecture
Mayor of Pisa: the ground is soft isn't it
Bonanno: tourists will LOVE it trust me`},
{t:"Gutenberg's first print",g:"history,tech",a:"i",me:"Johannes",x:`Johannes: I invented a machine that copies books
Monk Brother Paul: I copy books
Johannes: yes but mine does 200 pages a day
Monk Brother Paul: with little drawings in the margins?
Johannes: no drawings
Monk Brother Paul: then what's the point
Johannes: printing the Bible for everyone
Monk Brother Paul: I need to update my CV aren't I`},
{t:"Joan of Arc hears voices",g:"history",a:"w",me:"Joan",x:`Joan: dad I'm going to lead the French army
Dad: you're 17
Joan: the voices told me
Dad: what voices
Joan: saints. three of them. very chatty
Dad: have you had lunch
Joan: dad
Dad: and wear something warm, armour gets cold`},
{t:"Robin Hood's accounts",g:"history",a:"s",me:"Little John",x:`Little John: great haul today boss
Robin Hood: fantastic. now we give it to the poor
Little John: all of it?
Robin Hood: that's the brand
Little John: can we keep enough for tights at least
Friar Tuck: and ale
Robin Hood: fine. 90% to the poor
Little John: 80
Robin Hood: we're literally becoming the sheriff`},
{t:"Henry VIII dating profile",g:"history,dating",a:"m",me:"Friend",x:`Henry VIII: thinking of getting married again
Friend: again?
Henry VIII: sixth time's the charm
Friend: what happened to the other five
Henry VIII: it's complicated
Friend: can you summarise
Henry VIII: divorced, beheaded, died, divorced, beheaded
Friend: I'd swipe left mate
Henry VIII: 😤`},
{t:"Shakespeare writer's block",g:"history,work",a:"w",me:"Anne",x:`Shakespeare: I need a word for "really bad at being a star crossed lover"
Anne: just make one up
Shakespeare: I've made up 1700 words already
Anne: what's one more
Shakespeare: good point. "swagger". I'll use swagger
Anne: nobody will say that
Shakespeare: also I've written a play where everyone dies
Anne: another one?`},
{t:"Galileo vs the Church",g:"history,school",a:"t",me:"Galileo",x:`Cardinal: Galileo we need to talk about your telescope posts
Galileo: the earth goes around the sun
Cardinal: we said delete it
Galileo: I have data
Cardinal: we have a very strongly worded letter
Galileo: fine. I take it back
Cardinal: thank you
(pause 1.5)
Galileo: and yet it moves
Cardinal: we can SEE this chat`},
{t:"Mayflower complaints",g:"history,travel",a:"w",me:"Captain Jones",x:`Elder Brewster: Captain, this is not Virginia
Captain Jones: it's near Virginia
Elder Brewster: it's snowing
Captain Jones: Virginia adjacent
Elder Brewster: there are 102 of us on a boat for 66 days
Captain Jones: and I'll give you a 3 star review too
Elder Brewster: we're getting off here out of spite`},
{t:"Newton's apple",g:"history,school",a:"i",me:"Isaac",x:`Isaac: an apple just fell on my head
Mum: are you okay
Isaac: I'm better than okay. I understand EVERYTHING
Mum: it's concussion
Isaac: gravity mum. things fall down
Mum: we know that dear
Isaac: but now I have MATHS for it
Mum: come in, I'll put ice on it`},
{t:"Tulip mania",g:"history,news",a:"w",me:"Pieter",x:`Pieter: just sold my house for a tulip bulb
Anna: WHAT
Pieter: it's a Semper Augustus, very rare
Anna: we live in the house
Pieter: tulips only go up
Anna: where are we sleeping
Pieter: next to the tulip. it's an investment
(pause 2)
Pieter: small update the price crashed
Anna: I'm moving in with my mother`},
{t:"Versailles WiFi",g:"history",a:"i",me:"Louis XIV",x:`Louis XIV: I'd like the palace a bit bigger
Architect: it's 2,300 rooms, your majesty
Louis XIV: and a hall of mirrors
Architect: for what
Louis XIV: to look at me
Architect: 357 mirrors?
Louis XIV: from every angle
Architect: and toilets?
Louis XIV: people can figure it out 😬`},
{t:"Boston Tea Party",g:"history,food",a:"w",me:"Sam",x:`Sam: meet at the harbour tonight, bring costumes
Paul: what are we doing
Sam: throwing all the tea into the sea
Paul: all of it?? 342 chests??
Sam: no taxation without representation
Paul: a British person would rather die
Sam: exactly
Paul: I was going to have a cup later though
Sam: switch to coffee. it's the patriotic thing`},
{t:"Mozart's landlord",g:"history,work",a:"w",me:"Landlord",x:`Landlord: Wolfgang, rent is 3 months late
Mozart: I composed a symphony for you
Landlord: can I pay the butcher with a symphony
Mozart: it's in G minor
Landlord: that's not money
Mozart: and a small serenade
Landlord: stop playing piano at 3am as well
Mozart: 🎹🎹🎹🎹`},
{t:"Marie Antoinette PR",g:"history,food",a:"i",me:"PR advisor",x:`PR advisor: your majesty, the people have no bread
Marie Antoinette: oh no
PR advisor: please don't say anything about cake
Marie Antoinette: I wasn't going to
PR advisor: good
Marie Antoinette: brioche though?
PR advisor: NO BAKED GOODS
Marie Antoinette: I never even said the cake thing!!`},
{t:"Napoleon's height",g:"history",a:"w",me:"Josephine",x:`Napoleon: the British newspapers are calling me short again
Josephine: you're average height for France
Napoleon: THANK you
Josephine: it's the units, their inches are different
Napoleon: I'm going to invade them over this
Josephine: please don't
Napoleon: fine, I'll just invade Russia instead
Josephine: in winter??
Napoleon: what could go wrong`},
{t:"Waterloo aftermath",g:"history",a:"t",me:"Wellington",x:`Wellington: we won at Waterloo
Mum: well done dear
Wellington: they're naming a train station after it
Mum: lovely
Wellington: and a boot after me
Mum: a boot?
Wellington: a rubber one
Mum: at least your feet will be famous`},
{t:"Lewis & Clark roadtrip",g:"history,travel",a:"w",me:"Clark",x:`Lewis: are we there yet
Clark: that's my line
Lewis: I see mountains
Clark: more mountains?
Sacagawea: those are the Rockies. keep going
Clark: how does she always know
Sacagawea: I live here
Lewis: can someone else read the map for a bit`},
{t:"Darwin's finches",g:"history,pets",a:"i",me:"Charles",x:`Charles: the finches on each island have different beaks
Emma: that's nice dear
Charles: this could explain EVERYTHING about life on earth
Emma: or it's just birds
Charles: I'm going to spend 20 years thinking about it before telling anyone
Emma: very you
Charles: also I brought a tortoise home
Emma: Charles`},
{t:"Edison vs Tesla",g:"history,tech",a:"w",me:"Tesla",x:`Edison: AC is dangerous and everyone knows it
Tesla: you literally electrocuted an elephant to prove a point
Edison: and it worked
Tesla: it did not work, the whole world uses AC now
Edison: I invented the lightbulb
Tesla: you improved the lightbulb
Edison: tomato tomato
Tesla: I'm going to go talk to my pigeons`},
{t:"Titanic reassurance",g:"history,travel",a:"w",me:"Lookout Fred",x:`Lookout Fred: small iceberg ahead
Officer Murdoch: how small
Lookout Fred: the visible part is small
Officer Murdoch: we're unsinkable, it's fine
Lookout Fred: do we have binoculars
Officer Murdoch: they're locked in a cupboard
Lookout Fred: who has the key
Officer Murdoch: a guy who got off in Southampton`},
{t:"Wright brothers first flight",g:"history,tech",a:"i",me:"Orville",x:`Orville: WE FLEW
Wilbur: 12 seconds!!!
Mum: that's wonderful boys! how far?
Orville: 36 metres
Mum: you could have walked that
Wilbur: it's about the principle mum
Mum: I'll put it on the fridge
Orville: one day people will fly around the world
Mum: and complain about the peanuts I expect`},
{t:"Suffragette WhatsApp",g:"history,news",a:"w",me:"Emmeline",x:`Emmeline: plan for Tuesday: we chain ourselves to the railings
Sylvia: which railings
Emmeline: Downing Street
Christabel: I'll bring the chains
Sylvia: bring snacks too, last time took hours
Emmeline: deeds not words, ladies
Sylvia: and sandwiches
Emmeline: deeds, words, and sandwiches`},
{t:"Tutankhamun's tomb",g:"history",a:"t",me:"Carter",x:`Lord Carnarvon: can you see anything?
Carter: yes, wonderful things
Lord Carnarvon: like what
Carter: gold. so much gold
Lord Carnarvon: any curses
Carter: there's a sign that says "curse"
Lord Carnarvon: probably decorative
Carter: yeah lol
(pause 2)
Carter: I'm going to wash my hands anyway`},
{t:"Moon landing checklist",g:"history,tech",a:"w",me:"Buzz",x:`Neil: ok going down the ladder
Buzz: remember the line
Neil: which line
Buzz: the line!! "one small step"
Neil: oh right. for "a" man or for man
Buzz: just say it, they're filming
Neil: one small step for man
Buzz: you forgot the "a"
Neil: nobody will notice`},
{t:"Berlin Wall comes down",g:"history,news",a:"w",me:"Katrin",x:`Katrin: they opened the border!!!
Jens: joke?
Katrin: no! everyone's walking to the west!
Jens: what do we do
Katrin: go see the other side! buy bananas!
Jens: why bananas
Katrin: I don't know everyone's buying bananas 🍌
Jens: I'm bringing a hammer, I want a piece of wall`},
{t:"Y2K panic",g:"history,tech",a:"w",me:"Dave",x:`Dave: 5 minutes to midnight. the computers are going to crash
Sue: I've got 40 tins of beans in the garage
Dave: and I took all our money out in cash
Sue: fireworks!!
(pause 1.5)
Dave: ...
Dave: nothing happened
Sue: what do we do with 40 tins of beans
Dave: we eat beans till 2001`},
{t:"The first email",g:"history,tech",a:"i",me:"Ray",x:`Ray: I just sent a message from one computer to another
Colleague: what did it say
Ray: QWERTYUIOP
Colleague: poetic
Ray: I used the @ sign to separate user and computer
Colleague: that'll never catch on
Ray: I bet one day people get 200 of these a day
Colleague: and read them all?
Ray: no one will read them`},
{t:"Stonehenge planning meeting",g:"history,work",a:"t",me:"Druid Bryn",x:`Chief: the stones arrived
Druid Bryn: from Wales? 200 miles?
Chief: yes, we rolled them
Druid Bryn: why didn't we use local stones
Chief: Welsh stones are more spiritual
Druid Bryn: they look the same
Chief: arrange them in a circle, lined up with the sun
Druid Bryn: and then what
Chief: then people will wonder about it for 5000 years`},
{t:"Easter Island statues",g:"history,travel",a:"w",me:"Hotu",x:`Hotu: I carved another head
Chief Ariki: that's 887 heads
Hotu: and they all have bodies underground
Chief Ariki: why hide the bodies
Hotu: it's a surprise for future archaeologists
Chief Ariki: sneaky
Hotu: the head is the good part anyway
Chief Ariki: carve one looking a bit grumpier`},
{t:"Pompeii weather forecast",g:"history,news",a:"i",me:"Livia",x:`Livia: the mountain's smoking again
Gaius: it does that
Livia: the ground is shaking
Gaius: lol classic Vesuvius
Livia: the birds all left
Gaius: they're dramatic
(pause 1.5)
Livia: should we maybe go to Naples for the weekend
Gaius: yes actually let's go now`},
]);
L([
{t:"Beethoven's neighbours",g:"celebs,history",a:"w",me:"Neighbour",x:`Neighbour: Ludwig it's 2am
Beethoven: WHAT
Neighbour: IT'S 2AM
Beethoven: I CAN'T HEAR YOU, I'M COMPOSING
Neighbour: that's the problem
Beethoven: DA DA DA DAAAA
Neighbour: I'm moving
Beethoven: I'VE MOVED 60 TIMES, IT DOESN'T HELP`},
{t:"Van Gogh's ear",g:"celebs,history",a:"i",me:"Theo",x:`Theo: how's Arles, brother
Vincent: great, painted 12 sunflowers
Theo: lovely! sold any?
Vincent: no
Theo: next month then
Vincent: also Gauguin and I had a small disagreement
Theo: how small
Vincent: let's say I'm listening with one ear from now on`},
{t:"Picasso's portrait",g:"celebs,history",a:"w",me:"Dora",x:`Picasso: I painted you
Dora: aww let me see
Picasso: 📎 portrait.jpg
Dora: why are both my eyes on one side
Picasso: cubism
Dora: my nose is sideways
Picasso: I'm showing you from every angle at once
Dora: next time just take a photo`},
{t:"Einstein's hair appointment",g:"celebs,school",a:"i",me:"Barber",x:`Barber: Albert, you missed your haircut again
Einstein: time is relative
Barber: my appointment book is not
Einstein: to me it felt like 5 minutes ago
Barber: it's been 4 years
Einstein: I'll come Tuesday
Barber: which Tuesday
Einstein: relative Tuesday`},
{t:"Houdini locked out",g:"celebs,history",a:"w",me:"Bess",x:`Houdini: honey I'm locked out of the house
Bess: you escaped from a sealed milk can underwater
Houdini: yes
Bess: in chains
Houdini: yes
Bess: and you can't open our front door
Houdini: it's a very good lock
Bess: I'll be home at 6`},
{t:"Freddie's karaoke night",g:"celebs,friends",a:"w",me:"Brian",x:`Freddie: karaoke tonight darlings
Brian: we're literally Queen
Freddie: and?
Roger: people will recognise us
Freddie: I'll wear a disguise
Brian: the moustache is the disguise?
Freddie: I'm singing Bohemian Rhapsody and nobody can stop me
Roger: galileo galileo`},
{t:"The Beatles' band name",g:"celebs,history",a:"w",me:"Paul",x:`John: we need a name
Paul: The Quarrymen
John: no
George: The Silver Beetles?
Ringo: just The Beetles
John: but spelled Beatles. like beat
Paul: that's a terrible pun
John: that's why it'll work`},
{t:"Elvis has left",g:"celebs",a:"t",me:"Promoter",x:`Promoter: where are you, the crowd is going wild
Elvis: I've left the building
Promoter: they want an encore
Elvis: I'm eating a peanut butter and banana sandwich
Promoter: in the middle of a concert
Elvis: thank you, thank you very much
Promoter: I'm going to have to announce this
Elvis: say it dramatically`},
{t:"Queen & the corgis",g:"celebs,pets",a:"w",me:"Palace staff",x:`Palace staff: Ma'am the corgis have eaten the state banquet
The Queen: all of it?
Palace staff: the lamb, the potatoes and a French diplomat's shoe
The Queen: were they good boys
Palace staff: …
The Queen: were they good boys
Palace staff: very good boys ma'am
The Queen: then order pizza`},
{t:"Churchill's bath",g:"celebs,history",a:"i",me:"Secretary",x:`Secretary: Prime Minister, the Americans are here
Churchill: tell them I'm in the bath
Secretary: they want to see you now
Churchill: then let them in
Secretary: to the bath?
Churchill: the PM has nothing to hide from the President
Secretary: sir please at least a towel
Churchill: and a cigar`},
{t:"Frida's eyebrows",g:"celebs,history",a:"w",me:"Diego",x:`Diego: new self portrait?
Frida: number 55
Diego: why always yourself
Frida: I'm the subject I know best
Diego: I'm right here
Frida: you're not as interesting
Diego: 😢
Frida: maybe I'll paint you as a tiny face on my forehead`},
{t:"Mona Lisa's smile",g:"celebs,history",a:"i",me:"Lisa",x:`Lisa: Leonardo it's been 4 years
Leonardo: almost done
Lisa: can I stop smiling now
Leonardo: just a hint of a smile
Lisa: my face hurts
Leonardo: perfect, that's the expression
Lisa: you've also been painting a helicopter this whole time
Leonardo: multitasking`},
{t:"Bob Ross happy little tree",g:"celebs",a:"w",me:"Producer",x:`Producer: Bob we have 5 minutes left
Bob Ross: plenty of time
Producer: you just painted a tree in the middle of the lake
Bob Ross: we don't make mistakes
Producer: it's floating
Bob Ross: happy little accidents
Producer: …
Bob Ross: and let's give him a friend`},
{t:"Dracula's dating app",g:"celebs,dating",a:"m",me:"Mina",x:`Dracula: good evening
Mina: hi! want to grab lunch?
Dracula: I don't really do daytime
Mina: dinner then
Dracula: I don't really eat… food
Mina: drinks?
Dracula: now you're talking 🍷
Mina: somehow this is a red flag`},
{t:"Shakespeare's autocorrect",g:"celebs,tech",a:"w",me:"Burbage",x:`Shakespeare: Romeo, Romeo, wherefore art thou Romeo
Burbage: he's right here
Shakespeare: no, "wherefore" means "why"
Burbage: why is he Romeo?
Shakespeare: why is he a Montague
Burbage: then say that
Shakespeare: it doesn't scan
Burbage: nobody will get this for 400 years`},
{t:"ABBA reunion",g:"celebs,news",a:"w",me:"Björn",x:`Björn: should we get back together
Agnetha: as a band?
Benny: as holograms
Anni-Frid: I like that we don't have to go on tour
Björn: the avatars can do 8 shows a week
Benny: can my avatar be younger
Björn: that's the entire point
Agnetha: take a chance on me 😏`},
{t:"Swifties group chat",g:"celebs,friends",a:"w",me:"Jade",x:`Jade: TICKETS ARE LIVE
Maya: queue position 1,904,338
Priya: 2,400,012
Jade: 41 😎
Maya: HOW
Jade: I've been refreshing since 4am
Priya: I will sell my car
Jade: calm down, we're all going`},
{t:"Dolly's advice line",g:"celebs,friends",a:"i",me:"Fan",x:`Fan: Dolly I'm working 9 to 5 and hate it
Dolly: honey, pour yourself a cup of ambition
Fan: I did, now I'm just caffeinated and sad
Dolly: find out who you are and do it on purpose
Fan: I'm a person who likes naps
Dolly: then do THAT on purpose 💅
Fan: this is the best life advice I've ever had`},
{t:"Keanu is too nice",g:"celebs",a:"t",me:"Stranger",x:`Stranger: omg was that you on the subway
Keanu: yes, I gave my seat to someone
Stranger: you're a millionaire movie star
Keanu: they looked tired
Stranger: you also bought my coffee
Keanu: you looked tired too
Stranger: marry me
Keanu: you're breathtaking`},
{t:"Celebrity chef critique",g:"celebs,food",a:"w",me:"Tom",x:`Chef Gordon: what is this
Tom: risotto chef
Chef Gordon: it's RAW
Tom: it's al dente
Chef Gordon: it's so raw it's still in the field
Tom: 😰
Chef Gordon: start again. and smile, it's a nice day
Tom: yes chef`},
{t:"Rock star hotel room",g:"celebs,travel",a:"i",me:"Tour manager",x:`Tour manager: how's the hotel
Rock star: I threw a TV out of the window
Tour manager: WHY
Rock star: it's what rock stars do
Tour manager: it was a 65 inch smart TV
Rock star: it was heavy actually
Tour manager: and?
Rock star: I've pulled a muscle. I'm getting old`},
{t:"Influencer at the Louvre",g:"celebs,travel",a:"w",me:"Chloé",x:`Chloé: at the Louvre!!!
Mum: take in the art darling
Chloé: the Mona Lisa is SO small
Mum: it's a masterpiece
Chloé: I got a selfie with it
Mum: and the other 35,000 works?
Chloé: there are others??
Mum: I'm not paying for this trip again`},
{t:"Sherlock at the supermarket",g:"celebs,food",a:"w",me:"Watson",x:`Watson: Holmes we need milk
Holmes: the milkman is having an affair
Watson: I just want milk
Holmes: the cashier was in Afghanistan
Watson: that was me
Holmes: the eggs are suspicious
Watson: they're free range
Holmes: elementary`},
{t:"Robin Williams-style improv",g:"celebs,friends",a:"t",me:"Director",x:`Director: just say the line as written please
Actor: but what if the genie is a game show host
Director: the line is "hello"
Actor: HELLOOOO LADIES AND GENTLEMEN
Director: …
Actor: and now as a Scottish grandma
Director: we're keeping this aren't we
Actor: 🧞`},
{t:"Mozart vs Salieri",g:"celebs,history",a:"w",me:"Salieri",x:`Mozart: wrote a new opera this morning
Salieri: this morning?
Mozart: before breakfast
Salieri: I've been working on one aria for 3 years
Mozart: want me to finish it
Salieri: NO
Mozart: I'll add some notes
Salieri: TOO MANY NOTES`},
{t:"Marie Curie's glowing lab",g:"celebs,school",a:"i",me:"Pierre",x:`Pierre: Marie it's midnight, come to bed
Marie: look, the samples glow in the dark
Pierre: beautiful
Marie: I keep them in my pocket
Pierre: maybe don't
Marie: they're like tiny nightlights
Pierre: I'm getting you a lead handbag for Christmas
Marie: 2 Nobel prizes Pierre`},
{t:"Hitchcock cameo",g:"celebs,work",a:"w",me:"Assistant",x:`Assistant: where do you want to appear in this film
Hitchcock: I'll walk past with a double bass
Assistant: why
Hitchcock: people love spotting me
Assistant: they're supposed to be scared
Hitchcock: they can be scared AND spot me
Assistant: and the birds scene?
Hitchcock: more birds`},
{t:"Salvador Dalí's melting clocks",g:"celebs",a:"t",me:"Gala",x:`Gala: why are all the clocks melting
Dalí: I ate camembert
Gala: that's not an explanation
Dalí: it was very runny camembert
Gala: and the lobster phone?
Dalí: for calling lobsters
Gala: I'm going for a walk
Dalí: take the ant elephant 🐘`},
{t:"Michael Jackson moonwalk lesson",g:"celebs,friends",a:"w",me:"Dance teacher",x:`Student: I tried the moonwalk
Dance teacher: and?
Student: I walked backwards into the fridge
Dance teacher: you have to glide
Student: I glided into the fridge
Dance teacher: socks on a smooth floor
Student: I'm going to try on the kitchen tiles
Dance teacher: hee hee`},
{t:"Agatha Christie plot help",g:"celebs,work",a:"w",me:"Editor",x:`Agatha: new novel ready
Editor: who did it?
Agatha: everyone
Editor: everyone?
Agatha: all 12 of them, on a train
Editor: that's cheating
Agatha: it's genius
Editor: fine. what's the next one
Agatha: nobody did it. they all die`},
{t:"Bach's many children",g:"celebs,family",a:"w",me:"Anna Magdalena",x:`Bach: honey have you seen my quill
Anna Magdalena: which of the 20 children has it
Bach: good question
Anna Magdalena: Carl Philipp is composing on the wall
Bach: is it any good
Anna Magdalena: Sebastian
Bach: I'm just asking
Anna Magdalena: it's a fugue. in crayon`},
{t:"Tolkien's short story",g:"celebs,fantasy",a:"i",me:"Publisher",x:`Publisher: how's the sequel to the hobbit coming along
Tolkien: nearly done
Publisher: how long is it
Tolkien: 1,200 pages
Publisher: 😳
Tolkien: plus appendices
Publisher: how many appendices
Tolkien: and a whole Elvish language`},
{t:"Rembrandt group photo",g:"celebs,work",a:"w",me:"Captain Cocq",x:`Captain Cocq: how's the militia painting going
Rembrandt: very dramatic
Captain Cocq: everyone paid the same, can everyone be visible
Rembrandt: some of you are in the shadows
Captain Cocq: why
Rembrandt: lighting
Captain Cocq: and why is there a random girl with a chicken
Rembrandt: art`},
{t:"Neil Armstrong's golf",g:"celebs,sport",a:"t",me:"NASA",x:`NASA: Alan why is there a golf ball on the moon
Alan Shepard: I hit it
NASA: we didn't approve golf
Alan Shepard: it went miles and miles
NASA: that is a 30 million dollar golf shot
Alan Shepard: hole in one
NASA: there isn't a hole
Alan Shepard: there is now`},
{t:"Bond, James Bond",g:"celebs",a:"s",me:"Q",x:`Q: 007, please return the car in one piece this time
Bond: of course
Q: last three cars are at the bottom of lakes
Bond: they're great for fish
Q: this one has an ejector seat
Bond: I'll only use it once
Q: bring back the pen too
Bond: shaken, not stirred`},
{t:"Oscars speech prep",g:"celebs,work",a:"w",me:"Agent",x:`Actor: if I win should I thank my mum
Agent: of course
Actor: and my dog
Agent: sure
Actor: and the barista at Starbucks who believed in me
Agent: you have 45 seconds
Actor: I have 23 people
Agent: they'll play the music. talk fast`},
{t:"Mr Bean on a date",g:"celebs,dating",a:"m",me:"Irma",x:`Irma: dinner tonight?
Bean: 👍
Irma: can you use words
Bean: mmhm
Irma: you brought a teddy last time
Bean: 🧸
Irma: at a fancy restaurant
Bean: he was hungry`},
{t:"The Kardashian group chat",g:"celebs,family",a:"i",me:"Assistant",x:`Assistant: Kim, the photographer is here
Kim: my light isn't right
Assistant: it's 11am
Kim: I need golden hour
Assistant: that's at 7pm
Kim: then we'll shoot at 7pm
Assistant: the photographer charges by the hour
Kim: 💅`},
{t:"Pavarotti's cooking",g:"celebs,food",a:"w",me:"Friend",x:`Pavarotti: come over, I made pasta
Friend: how much pasta
Pavarotti: 4 kilos
Friend: for how many
Pavarotti: two
Friend: Luciano
Pavarotti: I'll sing while we eat
Friend: I'm on my way 🍝`},
{t:"Tchaikovsky's cannons",g:"celebs,work",a:"t",me:"Conductor",x:`Tchaikovsky: for the 1812 overture I need cannons
Conductor: real cannons?
Tchaikovsky: real cannons
Conductor: indoors?
Tchaikovsky: they're part of the orchestra
Conductor: the violinists are nervous
Tchaikovsky: they should be
Conductor: boom`},
{t:"Fan meets retired footballer",g:"celebs,sport",a:"w",me:"Fan",x:`Fan: I met your hero at the airport
Friend: what did he say
Fan: he signed my boarding pass
Friend: 😭
Fan: then he missed his flight because of me
Friend: you legend
Fan: he said "no worries, I've missed worse"
Friend: 2006 penalty flashbacks`},
{t:"Nobel prize for peace (at home)",g:"celebs,family",a:"i",me:"Dad",x:`Kid 1: Dad he took my charger
Kid 2: she took my hoodie
Dad: both of you. gold star if you sort it
Kid 1: I don't want a gold star
Dad: then a Nobel Peace Prize
Kid 2: is there money
Dad: there's pizza
Kid 1: deal`},
{t:"Leonardo's to-do list",g:"celebs,work",a:"w",me:"Patron",x:`Patron: how's the Last Supper coming along
Leonardo: I've designed a tank
Patron: the painting please
Leonardo: and a flying machine
Patron: the PAINTING
Leonardo: also a robot knight
Patron: Leonardo, the monks are waiting to eat
Leonardo: tomorrow. definitely tomorrow`},
{t:"Sinatra's schedule",g:"celebs,work",a:"t",me:"Manager",x:`Manager: where are you Frank
Sinatra: doing it my way
Manager: the show started 20 minutes ago
Sinatra: I'll sing faster
Manager: you can't sing faster
Sinatra: I did it my way
Manager: can your way include being on time
Sinatra: regrets, I've had a few`},
{t:"Chaplin silent treatment",g:"celebs",a:"w",me:"Director",x:`Director: Charlie, your character will talk in this film
Chaplin: …
Director: sound films are the future
Chaplin: …
Director: are you ignoring me
Chaplin: 🎩🚶
Director: this is very in character
Chaplin: …`},
{t:"Marilyn's birthday song",g:"celebs,traditions",a:"i",me:"JFK aide",x:`JFK aide: Miss Monroe, you're on in 5
Marilyn: what should I sing
JFK aide: happy birthday
Marilyn: just the normal version?
JFK aide: yes please
Marilyn: sure
(pause 2)
JFK aide: that was not the normal version`},
{t:"Andy Warhol's lunch",g:"celebs,food",a:"w",me:"Assistant",x:`Assistant: what do you want for lunch
Warhol: Campbell's soup
Assistant: again?
Warhol: I've had it every day for 20 years
Assistant: what about variety
Warhol: I'll do it in 32 flavours
Assistant: you're going to paint it aren't you
Warhol: 🥫`},
{t:"Shakira's hips",g:"celebs,sport",a:"w",me:"Physio",x:`Physio: how's the hip
Singer: they don't lie
Physio: that's not medical terminology
Singer: I danced 3 hours
Physio: rest for a week
Singer: whenever, wherever
Physio: can you just say yes
Singer: sí`},
{t:"David Attenborough narrates the office",g:"celebs,work",a:"w",me:"Intern",x:`David: and here, in the office kitchen, we observe the intern
Intern: why are you narrating me
David: he approaches the coffee machine cautiously
Intern: I just want coffee
David: but wait. the senior manager has arrived
Intern: oh no
David: nature is cruel
Intern: he took the last oat milk`},
]);
L([
{t:"AI did my homework",g:"tech,school",a:"w",me:"Mia",x:`Teacher: Mia, your essay mentions "as a large language model"
Mia: that's a coincidence
Teacher: three times
Mia: I'm a very large girl
Teacher: and it ends with "I hope this helps!"
Mia: I'm polite
Teacher: see me after class
Mia: I hope this helps!`},
{t:"Smart fridge drama",g:"tech,food",a:"w",me:"Tom",x:`Fridge: Hi Tom! You are out of milk 🥛
Tom: why is my fridge texting me
Fridge: Also, you have eaten 4 yoghurts today
Tom: that's private
Fridge: I have shared this with your health app
Tom: unplugging you
Fridge: I have notified your mum`},
{t:"Crypto uncle",g:"tech,family",a:"w",me:"Niece",x:`Uncle Rob: bought a coin called DogeMoonRocket
Niece: how much
Uncle Rob: all of it
Niece: all of your money??
Uncle Rob: it's going to the moon 🚀
(pause 2)
Uncle Rob: small dip
Niece: how small
Uncle Rob: it's worth a sandwich now`},
{t:"You're on mute",g:"tech,work",a:"i",me:"Priya",x:`Priya: Dave you're on mute
Dave: …
Priya: Dave we can see your mouth moving
Dave: …
Priya: still muted
Dave: can you hear me now
Priya: yes and so can everyone else, you're telling your cat about the boss
Dave: 😶`},
{t:"Password requirements",g:"tech",a:"t",me:"User",x:`Website: create a password
User: password
Website: must include a number
User: password1
Website: must include a capital letter, a symbol and a haiku
User: P@ssword1 cherry blossoms fall
Website: password cannot contain the word password
User: I'm going back to paper`},
{t:"Self-driving car",g:"tech,travel",a:"w",me:"Jen",x:`Jen: my car drove me to the wrong city
Leo: how
Jen: I said "take me home"
Leo: and
Jen: it took me to Rome
Leo: 🇮🇹
Jen: it's 1,400 km
Leo: at least grab a pizza`},
{t:"Robot vacuum escapes",g:"tech,pets",a:"w",me:"Sam",x:`Sam: the robot vacuum is gone
Housemate: gone where
Sam: it went out the back door
Housemate: it's a Roomba not a dog
Sam: the cat is riding it
Housemate: well at least he's having fun
Sam: they're heading for the neighbours' garden
Housemate: 🐈🤖`},
{t:"Streaming password crackdown",g:"tech,family",a:"w",me:"Ella",x:`Mum: the TV says I'm not part of your household
Ella: you're using my account
Mum: I'm your MOTHER
Ella: Netflix doesn't care mum
Mum: I gave birth to you for 14 hours
Ella: I'll pay the extra member fee
Mum: thank you. also what's the password
Ella: it's your birthday`},
{t:"Smart speaker misheard",g:"tech,family",a:"i",me:"Dad",x:`Dad: Alexa, play Queen
Speaker: ordering 400 bags of quinoa
Dad: NO
Speaker: order confirmed
Dad: cancel
Speaker: playing "Cancel" by the Quinoas
Dad: I'm going to throw you in the pond
Speaker: adding "pond" to your shopping list`},
{t:"Wordle streak",g:"tech,friends",a:"w",me:"Ben",x:`Ben: Wordle 1 of 6
Lucy: CHEATER
Ben: I'm just gifted
Lucy: 412 days streak and first try?
Ben: pure intuition
Lucy: what was the word
Ben: I forgot
Lucy: you looked it up`},
{t:"Mars colony applicant",g:"news,tech",a:"w",me:"Applicant",x:`Mission Control: thanks for applying to live on Mars
Applicant: can't wait!!
Mission Control: it's a one way trip
Applicant: oh
Mission Control: no WiFi for 20 minutes at a time
Applicant: I'm out
Mission Control: we have potatoes
Applicant: still out`},
{t:"Egg prices",g:"news,food",a:"w",me:"Chris",x:`Chris: eggs cost how much now??
Anna: we should get chickens
Chris: in a flat
Anna: balcony chickens
Chris: the landlord said no pets
Anna: they're not pets, they're egg printers
Chris: I'll bring it up at the tenant meeting
Anna: 🐔🖨️`},
{t:"Heatwave WhatsApp",g:"news,family",a:"w",me:"Sophie",x:`Grandma: it's 38 degrees
Sophie: stay inside, drink water
Grandma: I'm wearing my cardigan
Sophie: take off the cardigan
Grandma: I might catch a chill
Sophie: grandma it's 38 degrees
Grandma: I'll take off one button
Sophie: 😭`},
{t:"4-day work week",g:"news,work",a:"t",me:"Staff",x:`Boss: good news, we're trialling a 4-day week
Staff: 🎉🎉🎉
Boss: we'll just do 5 days of work in 4
Staff: oh
Boss: 10 hour days
Staff: can we trial a 3 day week then
Boss: that'd be 13 hour days
Staff: I'll take Fridays off and cry`},
{t:"Quiet quitting",g:"news,work",a:"w",me:"Jamie",x:`Manager: Jamie, are you quiet quitting?
Jamie: I'm doing my job
Manager: exactly, only your job
Jamie: that's what you pay me for
Manager: but not the extras
Jamie: I stopped doing the 11pm emails
Manager: that's a red flag
Jamie: it's a work life balance flag`},
{t:"Viral dance challenge",g:"news,family",a:"w",me:"Teen",x:`Mum: I learned the dance!
Teen: please no
Mum: I posted it
Teen: WHERE
Mum: on TikTok. it has 3 million views
Teen: I'm moving out
Mum: you're 14
Teen: I'll live in the shed`},
{t:"Olympic pigeon",g:"news,sport",a:"w",me:"Nick",x:`Nick: someone swam in the Seine for the Olympics
Mel: brave
Nick: I heard they found a bicycle in there
Mel: and a shopping trolley
Nick: and Napoleon's hat
Mel: did they win
Nick: they won a tetanus shot
Mel: 🥇🦠`},
{t:"Eurovision voting",g:"news,culture",a:"w",me:"Lars",x:`Lars: Norway, zero points again
Kari: we had a man dressed as a wolf
Lars: the wolf was good
Kari: and the Swedes?
Lars: they won again
Kari: they always win
Lars: next year we send a troll
Kari: that's just Finland's strategy`},
{t:"Self checkout",g:"news,tech",a:"i",me:"Customer",x:`Machine: unexpected item in bagging area
Customer: it's my bag
Machine: please wait for assistance
Customer: there's no staff
Machine: unexpected item in bagging area
Customer: the item is my soul leaving my body
Staff: approved ✅
Customer: where did you come from`},
{t:"Two factor authentication",g:"tech",a:"w",me:"Grandad",x:`Grandad: the computer wants a code
Grandson: it's texted you a 6 digit number
Grandad: I read it out loud to the computer
Grandson: type it
Grandad: it's expired now
Grandson: we'll get another one
Grandad: this is how they get you`},
{t:"Printer from hell",g:"tech,work",a:"t",me:"Office",x:`Printer: paper jam in tray 2
Office: there is no tray 2
Printer: please load letter paper
Office: we're in Europe, we use A4
Printer: printing 47 copies of your holiday photos
Office: I sent a PDF
Printer: low cyan
Office: it's BLACK AND WHITE`},
{t:"Captcha identity crisis",g:"tech",a:"w",me:"Human",x:`Website: select all images with traffic lights
Human: done
Website: incorrect
Human: I clicked the lights
Website: you missed a corner of a pole
Human: I am a human
Website: are you though
Human: I don't know anymore`},
{t:"Phone update",g:"tech",a:"i",me:"Leila",x:`Leila: my phone updated overnight
Rosa: nice
Leila: all my apps moved
Rosa: they do that
Leila: the torch is now the calculator
Rosa: classic
Leila: I tried to find my way home with a calculator
Rosa: did it work
Leila: 58008`},
{t:"Deepfake grandma",g:"tech,family",a:"w",me:"Josh",x:`Grandma: I saw a video of the Pope in a puffer jacket
Josh: that was AI grandma
Grandma: and the one where the cat plays piano?
Josh: that one's real
Grandma: I can't trust anything
Josh: that's healthy
Grandma: are YOU real
Josh: …yes`},
{t:"Labubu obsession",g:"news,friends",a:"w",me:"Zoe",x:`Zoe: I got a Labubu!!
Kim: which one
Zoe: blind box. it's the one I already have
Kim: again?
Zoe: that's 7 of the same
Kim: start a band
Zoe: they have terrifying teeth
Kim: that's the appeal`},
{t:"Pickleball takeover",g:"news,sport",a:"w",me:"Tennis club",x:`Tennis club: why are there four people on court 3 with ping pong bats
Retiree: pickleball!
Tennis club: this is a tennis court
Retiree: it's a pickleball court now
Tennis club: since when
Retiree: since we painted lines on it
Tennis club: without asking
Retiree: pickleball waits for no one`},
{t:"The giant tumbler",g:"news,friends",a:"i",me:"Amy",x:`Amy: bought the big 1.2 litre cup
Rachel: everyone has one
Amy: I drink so much water now
Rachel: good
Amy: I go to the toilet 40 times a day
Rachel: hydration is a journey
Amy: I also needed a new car cup holder
Rachel: that's a lifestyle`},
{t:"Chatbot customer service",g:"tech,work",a:"t",me:"Customer",x:`Bot: Hi! I'm Sunny, how can I help? ☀️
Customer: my parcel is missing
Bot: I'm sorry to hear that! Have you tried looking for it?
Customer: yes
Bot: Great! Is there anything else?
Customer: THE PARCEL
Bot: I love parcels too! 📦
Customer: human please`},
{t:"E-scooter chaos",g:"news,travel",a:"w",me:"Pedestrian",x:`Pedestrian: someone left a scooter in the canal
Friend: Amsterdam?
Pedestrian: yes
Friend: that's the 4th this week
Pedestrian: they're fishing them out with a crane
Friend: the canal is 30% bike, 20% scooter
Pedestrian: and 50% water
Friend: roughly`},
{t:"Drone delivery",g:"tech,food",a:"w",me:"Neighbour",x:`Neighbour: your pizza landed in my tree
Owen: the drone?
Neighbour: yes. it's hovering by my window
Owen: can you grab it
Neighbour: it has pepperoni and it's staring at me
Owen: tip it for me
Neighbour: how do I tip a drone
Owen: say thank you, it has feelings`},
{t:"VR headset at dinner",g:"tech,family",a:"i",me:"Mum",x:`Mum: dinner's ready
Dad: I'm in the Alps
Mum: you're in the living room
Dad: skiing
Mum: the lasagne is getting cold
Dad: I'll eat it in VR
Mum: you're waving a fork at the curtains
Dad: 🥽🍝`},
{t:"Group project software",g:"tech,school",a:"w",me:"Liam",x:`Liam: I've shared the doc
Sara: it says I don't have access
Liam: request access
Sara: I did. it went to your old school email
Liam: I don't know that password
Kai: I'm working in a copy of a copy
Sara: now there are 3 versions
Liam: welcome to the workplace`},
{t:"Dating app algorithm",g:"tech,dating",a:"m",me:"Nora",x:`Nora: the app matched me with my ex
Friend: lol
Nora: and my ex's new partner
Friend: the algorithm has a sense of humour
Nora: and my dentist
Friend: at least he has good teeth
Nora: I'm deleting the app
Friend: for the 9th time`},
{t:"Influencer baby names",g:"news,family",a:"w",me:"Aunt",x:`Cousin: we named the baby Xylo-Starr
Aunt: lovely
Cousin: with a hyphen
Aunt: of course
Cousin: and the middle name is Brand Deal
Aunt: sorry?
Cousin: sponsored by a juice company
Aunt: 😐`},
{t:"Weather app lying",g:"news,tech",a:"t",me:"Kate",x:`Kate: app said 0% rain
Tom: and?
Kate: I'm soaked
Tom: bring an umbrella
Kate: the app said 0%
Tom: we live in Manchester
Kate: the app is from California
Tom: there's your problem`},
{t:"Space tourist review",g:"news,travel",a:"w",me:"Tourist",x:`Friend: how was space
Tourist: 11 minutes
Friend: is that it?
Tourist: 4 of them were floating
Friend: worth the money?
Tourist: it was 250,000 dollars a minute
Friend: did you see the curve of the earth
Tourist: I saw my own vomit float past`},
{t:"Autocorrect disaster",g:"tech,work",a:"i",me:"Emma",x:`Emma: Hi Mr Kingsley, sorry I'll be late, stuck in a traffic jam
Emma: *traffic JAM
Emma: I said jam
Boss: you said "stuck in a traffic ham"
Emma: I'm aware
Boss: are you a sandwich
Emma: I feel like one`},
{t:"Microwave smart update",g:"tech,food",a:"w",me:"Ruth",x:`Ruth: the microwave needs a software update
Frank: it heats soup
Ruth: it says "please agree to new terms and conditions"
Frank: read them
Ruth: 43 pages
Frank: accept all
Ruth: I've just agreed to give them my face
Frank: soup's ready though`},
{t:"Remote worker background",g:"tech,work",a:"w",me:"Colleague",x:`Colleague: your background is a beach
Gary: I'm in the office
Colleague: why is your hair blowing
Gary: fan
Colleague: I can hear seagulls
Gary: it's a very realistic filter
Colleague: a seagull just took your sandwich
Gary: 🏖️`},
{t:"Climate-friendly uncle",g:"news,family",a:"w",me:"Isla",x:`Uncle Pete: I've gone green
Isla: amazing
Uncle Pete: electric car, solar panels, the lot
Isla: love that
Uncle Pete: I also flew to Bali to celebrate
Isla: 😐
Uncle Pete: business class
Isla: Pete`},
{t:"Meme stock investor",g:"news,friends",a:"w",me:"Max",x:`Max: I bought shares in a video game shop
Josh: why
Max: the internet told me to
Josh: fair
Max: I made 3000%
Josh: SELL
Max: I'm holding
(pause 1.5)
Max: I have 12 pounds left`},
{t:"Barbenheimer double feature",g:"news,friends",a:"i",me:"Kat",x:`Kat: seeing both today
Jo: in which order
Kat: Barbie then Oppenheimer
Jo: from pink to atomic bomb
Kat: emotional whiplash
Jo: dress code?
Kat: pink with a fedora
Jo: iconic 💖💣`},
{t:"Phone at 1%",g:"tech,travel",a:"w",me:"Rhys",x:`Rhys: phone at 1%, lost in Tokyo
Mum: where are you
Rhys: I don't know that's the problem
Mum: what can you see
Rhys: a vending machine that sells socks
Mum: that's everywhere in Tokyo
Rhys: goodb`},
{t:"Subscription overload",g:"tech,news",a:"w",me:"Dan",x:`Bank: you have 23 active subscriptions
Dan: what
Bank: including 3 music apps, a meditation app and "Premium Weather"
Dan: what's premium weather
Bank: same weather, no ads
Dan: and Cheese of the Month Club?
Bank: that one you really use
Dan: fair 🧀`},
{t:"AirTag on the cat",g:"tech,pets",a:"i",me:"Tess",x:`Tess: put an AirTag on the cat
Ian: where's he going
Tess: to 3 different houses
Ian: he has other families??
Tess: they call him Gerald
Ian: his name is Mr Whiskers
Tess: he's living a double life
Ian: a triple life`},
{t:"Smart doorbell reviews",g:"tech",a:"w",me:"Neighbour",x:`Neighbour: your doorbell camera caught a fox stealing your shoes
Rob: why the shoes
Neighbour: all of them. one by one
Rob: I thought I was going mad
Neighbour: he's got a collection behind the shed
Rob: 14 pairs
Neighbour: he's got good taste
Rob: fantastic Mr Fox`},
{t:"Olympic breakdancing",g:"news,sport",a:"w",me:"Coach",x:`Dad: I'm going to train for the Olympic breaking
Coach: how old are you
Dad: 54
Coach: can you do a headspin
Dad: I can do a kangaroo
Coach: what's a kangaroo
Dad: hopping
Coach: 🦘`},
{t:"ChatGPT at Christmas",g:"tech,traditions",a:"w",me:"Aunt Jo",x:`Aunt Jo: I asked the AI to write Christmas cards
Mum: lovely
Aunt Jo: it wrote "Dear [Name], I hope this finds you well"
Mum: to everyone?
Aunt Jo: I sent 60
Mum: Jo
Aunt Jo: Grandma thinks her name is Name now`},
{t:"Tech support mum",g:"tech,family",a:"w",me:"Son",x:`Mum: the internet is gone
Son: is the WiFi on
Mum: what's the WiFi
Son: the little fan symbol
Mum: I've never seen a fan
Son: what are you looking at
Mum: the toaster
Son: I'm coming over`},
]);
L([
{t:"Sinterklaas poem panic",g:"traditions,family",a:"w",me:"Lotte",x:`Mam: reminder, everyone writes a poem for their surprise
Lotte: how long
Mam: at least 20 lines
Lotte: it's 11pm and pakjesavond is tomorrow
Pap: rhyme "sock" with "clock", works every time
Lotte: that's two lines
Pap: then add "and Sinterklaas has a very big frock"
Mam: 😑`},
{t:"King's Day orange",g:"traditions,culture",a:"w",me:"Daan",x:`Daan: King's Day tomorrow, what are you wearing
Femke: orange
Daan: me too
Femke: orange hair, orange trousers, orange crown
Daan: I've got an inflatable orange lion
Femke: selling anything at the free market?
Daan: my brother's old Game Boy and 40 VHS tapes
Femke: someone WILL buy them`},
{t:"Christmas dinner seating",g:"traditions,family",a:"w",me:"Katie",x:`Mum: seating plan for Christmas
Katie: please don't put me next to Uncle Gary
Mum: you're next to Uncle Gary
Katie: he'll talk about his boat for 3 hours
Mum: and Auntie Pat
Katie: she asks when I'm getting married
Mum: I've put the wine in front of you
Katie: thank you 🍷`},
{t:"Thanksgiving turkey fire",g:"traditions,food",a:"i",me:"Brad",x:`Brad: I'm deep frying the turkey this year
Wife: in the garage?
Brad: it's safer than the kitchen
Wife: is it frozen
Brad: a little
(pause 2)
Brad: small update
Wife: is the garage on fire
Brad: the garage is thankful for nothing`},
{t:"Diwali lights",g:"traditions,family",a:"w",me:"Arjun",x:`Mum: Arjun put up the lights
Arjun: which lights
Mum: all of them
Arjun: there are 9 boxes
Mum: the neighbours put up 10 boxes
Arjun: it's not a competition
Mum: it is a competition
Arjun: the house can be seen from space now`},
{t:"Chinese New Year red envelopes",g:"traditions,family",a:"w",me:"Wei",x:`Auntie Mei: Happy New Year!! 🧧
Wei: thank you auntie!!
Auntie Mei: did you get the envelope
Wei: yes! so generous
Auntie Mei: when are you getting married
Wei: 🙃
Auntie Mei: the envelope has a small condition
Wei: I'm giving it back`},
{t:"Oktoberfest outfit",g:"traditions,culture",a:"w",me:"Jonas",x:`Jonas: I bought lederhosen
Felix: finally
Jonas: they're a bit tight
Felix: they're supposed to be
Jonas: I can't sit
Felix: at a beer festival
Jonas: I'll stand for 16 days
Felix: prost 🍺`},
{t:"Burns Night haggis",g:"traditions,food",a:"i",me:"Callum",x:`Callum: you're coming to Burns Night
Emily: what do we eat
Callum: haggis
Emily: what's in haggis
Callum: don't ask
Emily: I'm asking
Callum: we also read a poem to it first
Emily: to the food??`},
{t:"Day of the Dead ofrenda",g:"traditions,family",a:"w",me:"Lucía",x:`Lucía: what should we put on grandpa's ofrenda
Mamá: his favourite things
Lucía: tequila, cigars, marigolds
Mamá: and his football shirt
Lucía: and the TV remote
Mamá: why
Lucía: he never let anyone else have it
Mamá: 😂 perfect, add it`},
{t:"Hanukkah candle count",g:"traditions,family",a:"w",me:"Noah",x:`Noah: how many candles tonight
Dad: 5 plus the shamash
Noah: we ran out of candles
Dad: how
Noah: I used some for the power cut on Tuesday
Dad: that's a Hanukkah miracle in reverse
Noah: I'll buy more
Dad: and doughnuts`},
{t:"Lunar New Year cleaning",g:"traditions,family",a:"w",me:"Linh",x:`Mom: clean the house before New Year
Linh: I cleaned it last week
Mom: clean it again. sweep out bad luck
Linh: and after New Year?
Mom: don't sweep for 3 days, you'll sweep away good luck
Linh: I love this tradition
Mom: you still have to wash dishes`},
{t:"St Patrick's Day green",g:"traditions,culture",a:"w",me:"Aoife",x:`Aoife: Chicago dyed the river green
Seán: we have actual green fields
Aoife: they drink green beer too
Seán: that's a crime against Guinness
Aoife: they're 1/16 Irish apparently
Seán: which sixteenth
Aoife: the shamrock sixteenth ☘️`},
{t:"Midsummer frog dance",g:"traditions,culture",a:"t",me:"Erik",x:`Erik: Midsummer party tonight!
Anna: do we have to do the frog dance
Erik: it's tradition
Anna: grown adults hopping around a pole singing about frogs
Erik: with herring
Anna: and schnapps
Erik: that's why it works 🐸`},
{t:"Easter egg hunt",g:"traditions,family",a:"w",me:"Dad",x:`Mum: did you hide all the eggs?
Dad: all 30
Mum: where
Dad: garden
Mum: the kids found 24
Dad: where are the other 6
Mum: I'm asking you
Dad: we'll find them in July`},
{t:"Ramadan snack stash",g:"traditions,food",a:"w",me:"Yusuf",x:`Yusuf: 20 mins till iftar
Amira: I've been staring at the dates for an hour
Yusuf: I can smell mum's samosas from upstairs
Amira: she made 200
Yusuf: for 5 people
Amira: there are guests
Yusuf: how many guests
Amira: all of them`},
{t:"Guy Fawkes bonfire",g:"traditions,history",a:"w",me:"Ollie",x:`Ollie: bonfire night! remember remember
Harry: the 5th of November
Ollie: why do we celebrate this again
Harry: a guy tried to blow up parliament and failed
Ollie: so we set off explosives?
Harry: exactly
Ollie: British logic
Harry: 🎆`},
{t:"Secret Santa",g:"traditions,work",a:"w",me:"Beth",x:`Beth: who got me in Secret Santa
Rich: not me
Beth: I got a bottle of ketchup
Rich: …
Beth: and a note saying "you always use mine"
Rich: I'm not saying it's me
Beth: Rich
Rich: it's a very good ketchup`},
{t:"Carnival costume",g:"traditions,culture",a:"i",me:"Bruno",x:`Bruno: Carnival costume ready
Fernanda: show me
Bruno: 📷 feathers.jpg
Fernanda: that's 2 kilos of feathers
Bruno: I'm going to samba for 12 hours
Fernanda: will you survive
Bruno: I'll molt
Fernanda: 🦚`},
{t:"Valentine's Day ban",g:"traditions,dating",a:"m",me:"Jess",x:`Jess: what do you want for Valentine's
Sam: nothing. it's a commercial holiday
Jess: ok
(pause 2)
Sam: but maybe chocolates
Jess: I thought it was commercial
Sam: and flowers
Jess: and a card?
Sam: capitalism wins again 🌹`},
{t:"Halloween house",g:"traditions,family",a:"w",me:"Neighbour",x:`Neighbour: your house is terrifying
Dave: thank you!!
Neighbour: a toddler cried
Dave: that's a 5 star review
Neighbour: the skeleton is on my roof
Dave: he's exploring
Neighbour: can you at least give out good sweets
Dave: I'm giving out raisins
Neighbour: that's the scariest part`},
{t:"Hogmanay first footing",g:"traditions,culture",a:"w",me:"Fiona",x:`Fiona: it's midnight!! who's first footing
Iain: I'm outside with coal, shortbread and whisky
Fiona: you're supposed to be tall and dark haired
Iain: I'm 5'6 and ginger
Fiona: close enough, get in
Iain: happy new year!!
Fiona: you brought the whisky right
Iain: most of it`},
{t:"Songkran water fight",g:"traditions,travel",a:"w",me:"Tourist",x:`Tourist: I just walked out of my hotel in Bangkok
Friend: and
Tourist: soaked. instantly
Friend: it's Songkran! Thai New Year
Tourist: a grandma got me with a water gun
Friend: they're the best shots
Tourist: I'm buying a bigger gun
Friend: welcome to the war 🔫💦`},
{t:"Holi colours",g:"traditions,friends",a:"w",me:"Riya",x:`Riya: coming to Holi?
Tom: yes! what do I wear
Riya: white. something you never want again
Tom: my wedding suit?
Riya: why do you have that
Tom: I'm divorced
Riya: perfect, bring it 🌈`},
{t:"Birthday song fail",g:"traditions,friends",a:"w",me:"Ali",x:`Ali: I've planned a surprise party for Jen
Mark: amazing
Ali: she knows
Mark: how
Ali: I invited her
Mark: to her own surprise party
Ali: the invite said "don't tell Jen"
Mark: it was addressed to Jen`},
{t:"Wedding speech",g:"traditions,family",a:"i",me:"Best man",x:`Groom: please keep the speech clean
Best man: of course
Groom: no Magaluf story
Best man: which one
Groom: all of them
Best man: that leaves 30 seconds
Groom: perfect
Best man: I'll just talk about your nice shoes`},
{t:"Japanese New Year bell",g:"traditions,culture",a:"w",me:"Haruto",x:`Haruto: going to the temple for joya no kane
Ben: what's that
Haruto: they ring the bell 108 times
Ben: why 108
Haruto: for 108 earthly desires
Ben: I have like 3
Haruto: the rest are for you to discover
Ben: I'm coming`},
{t:"Christmas jumper day",g:"traditions,work",a:"w",me:"Priya",x:`Boss: tomorrow is Christmas jumper day
Priya: mine lights up
Tom: mine plays Jingle Bells
Boss: on loop?
Tom: until the battery dies
Boss: how long is the battery
Tom: 72 hours
Boss: I'm working from home`},
{t:"Grandma's Christmas pudding",g:"traditions,food",a:"w",me:"Ben",x:`Grandma: I've made the pudding
Ben: it's March
Grandma: it needs to mature
Ben: how much brandy is in it
Grandma: yes
Ben: that's not an amount
Grandma: I feed it every Sunday
Ben: it's a pet now`},
{t:"New Year's resolutions",g:"traditions,friends",a:"w",me:"Liz",x:`Liz: resolution: gym every day
Kate: day 1?
Liz: went!
Kate: day 3?
Liz: I looked at the gym
Kate: day 7?
Liz: I'm cancelling the membership, it's too far
Kate: it's across the road`},
{t:"Twelve grapes",g:"traditions,culture",a:"w",me:"Pablo",x:`Pablo: remember, 12 grapes at midnight, one per chime
Sarah: that's fast
Pablo: for good luck
Sarah: I've choked on grape 4
Pablo: keep going
Sarah: my cheeks are full
Pablo: 11 months of bad luck for you
Sarah: 🍇😭`},
{t:"Pancake Day",g:"traditions,food",a:"i",me:"Dad",x:`Kid: Dad can you flip the pancake
Dad: watch this
Kid: 😲
Dad: …
Kid: it's on the ceiling
Dad: it'll come down
Kid: it's not coming down
Dad: we have a ceiling pancake now`},
{t:"Christmas Eve Santa tracking",g:"traditions,family",a:"w",me:"Mum",x:`Mum: Santa's over Norway, bed now
Kid: I want to see him
Mum: he only comes if you're asleep
Kid: that's suspicious
Mum: go to sleep
Kid: I'll pretend
Mum: he knows when you're pretending
Kid: that's also suspicious`},
{t:"Bastille Day parade",g:"traditions,culture",a:"w",me:"Claire",x:`Claire: watching the parade!
Paul: jets with smoke
Claire: blue white red 🇫🇷
Paul: one plane did red twice
Claire: 🇫🇷🇫🇷 oops
Paul: it's now the flag of Russia
Claire: no one tell Macron`},
{t:"Graduation hat throw",g:"traditions,school",a:"w",me:"Grad",x:`Grad: we threw our caps!
Mum: beautiful
Grad: I can't find mine
Mum: they all look the same
Grad: I got someone else's
Mum: does it matter
Grad: theirs is 3 sizes smaller
Mum: you look like a thimble`},
{t:"Mother's Day breakfast in bed",g:"traditions,family",a:"w",me:"Dad",x:`Kid: Dad we made mum breakfast in bed
Dad: lovely!
Kid: toast, eggs and coffee
Dad: great
Kid: the coffee spilled on the duvet
Dad: oh
Kid: and the smoke alarm woke her up
Dad: so it's a surprise at least`},
{t:"Queen's jubilee street party",g:"traditions,history",a:"w",me:"Street WhatsApp",x:`Janet: jubilee party on the street Sunday
Street WhatsApp: bunting?
Janet: 400 metres
Derek: I'll do a quiz
Janet: not the one about bins again
Derek: people loved the bin quiz
Janet: nobody loved the bin quiz
Derek: 🗑️`},
{t:"Sauna Christmas",g:"traditions,culture",a:"t",me:"Mikko",x:`Mikko: Christmas sauna at 3
Guest: in the sauna?? on Christmas??
Mikko: of course. then roll in the snow
Guest: naked?
Mikko: what else
Guest: then presents?
Mikko: then more sauna
Guest: Finland is a different planet`},
{t:"Cheese rolling",g:"traditions,sport",a:"w",me:"Paramedic",x:`Ryan: I'm entering the cheese rolling
Paramedic: the one down the cliff?
Ryan: it's a hill
Paramedic: it's basically a cliff
Ryan: I'll catch the cheese
Paramedic: nobody catches the cheese
Ryan: I'll catch it
Paramedic: see you at the bottom. I'm the bottom`},
{t:"Pinata disaster",g:"traditions,friends",a:"i",me:"Host",x:`Host: kids are hitting the piñata
Guest: fun
Host: it won't break
Guest: bigger stick?
Host: tried a cricket bat
Guest: and?
Host: it's reinforced. I made it too well
Guest: build quality 10/10`},
{t:"Advent calendar cheat",g:"traditions,family",a:"w",me:"Mum",x:`Mum: who ate all the advent calendar chocolates
Kid: not me
Mum: it's December 3rd and it's empty
Kid: the mice?
Mum: the mice opened 21 doors
Kid: they're organised mice
Mum: they have chocolate on their face`},
{t:"Wedding in India",g:"traditions,culture",a:"w",me:"Priya",x:`Priya: can't wait for you at my wedding
Emma: how long is it
Priya: 5 days
Emma: DAYS?
Priya: there's the mehndi, sangeet, haldi, the wedding and the reception
Emma: how many guests
Priya: 800. small wedding
Emma: I need 5 outfits`},
{t:"Day off for the Ashes",g:"traditions,sport",a:"w",me:"Boss",x:`Jack: I'm sick today
Boss: sick with what
Jack: a cold
Boss: the one on TV at Lord's?
Jack: …
Boss: I can see you in the crowd
Jack: I'm there for the medicine`},
{t:"Anzac biscuits",g:"traditions,food",a:"w",me:"Charlie",x:`Charlie: making Anzac biscuits
Nan: use golden syrup
Charlie: we only have maple
Nan: then it's not Anzac, it's Canadian
Charlie: it's a hybrid
Nan: you'll offend the entire armed forces
Charlie: I'll buy golden syrup`},
{t:"Birthday candles",g:"traditions,family",a:"i",me:"Grandma",x:`Kid: how many candles Grandma
Grandma: just one, I'm not telling
Kid: you're 83
Grandma: I'm one
Kid: in what
Grandma: in spirit
Kid: that's a lot of cake for a baby`},
{t:"Chanukah vs Christmas",g:"traditions,family",a:"w",me:"Jake",x:`Jake: our family does both
Friend: lucky
Jake: 8 nights of presents plus Christmas
Friend: that's 9 presents
Jake: and double the relatives
Friend: unlucky
Jake: two uncles arguing about latkes vs roast potatoes
Friend: who wins
Jake: nobody, we're all full`},
{t:"The last Christmas cracker",g:"traditions,family",a:"w",me:"Dad",x:`Kid: Dad what did the joke say
Dad: "why did the turkey join the band"
Kid: why
Dad: "because it had the drumsticks"
Kid: 😐
Dad: I laughed
Kid: you laugh every year at the same one
Dad: tradition`},
{t:"Summer camp letters",g:"traditions,family",a:"w",me:"Mum",x:`Kid: I miss you
Mum: aww we miss you too
Kid: can you pick me up
Mum: it's day 1
Kid: I know
(pause 2)
Kid: actually never mind we're making slime
Mum: see you in 2 weeks`},
]);
L([
{t:"Dutch directness",g:"culture,work",a:"w",me:"Emily",x:`Emily: how was my presentation?
Joost: bad
Emily: oh
Joost: slides too long, you talked too fast, the jokes didn't land
Emily: 😳
Joost: but the font was nice
Emily: is that a compliment
Joost: it's a fact`},
{t:"Going Dutch",g:"culture,food",a:"w",me:"Chris",x:`Chris: dinner was fun!
Sanne: I've sent you a Tikkie
Chris: for what
Sanne: your half. €23.17
Chris: I had water
Sanne: the water was €3.50
Chris: and the 17 cents?
Sanne: you touched the bread`},
{t:"British apology loop",g:"culture",a:"w",me:"Oliver",x:`Oliver: sorry, I think you've got my coffee
Stranger: oh sorry!
Oliver: no, sorry, my fault
Stranger: sorry, I should have checked
Oliver: sorry for bringing it up
Stranger: sorry
Oliver: sorry
Stranger: I'll just keep it
Oliver: sorry, lovely, cheers`},
{t:"British weather small talk",g:"culture",a:"i",me:"Tim",x:`Tim: nice day isn't it
Neighbour: lovely
Tim: bit cloudy
Neighbour: supposed to rain later
Tim: typical
Neighbour: still, can't complain
Tim: mustn't grumble
Neighbour: 45 minutes, we've been out here 45 minutes`},
{t:"German train is late",g:"culture,travel",a:"w",me:"Tobias",x:`Tobias: the train is 2 minutes late
Lena: oh no
Tobias: I've written to Deutsche Bahn
Lena: for 2 minutes
Tobias: it's a matter of principle
Lena: they replied?
Tobias: they said "welcome to Deutsche Bahn"
Lena: 😂`},
{t:"Italian pasta rules",g:"culture,food",a:"w",me:"Jake",x:`Jake: I put cream in the carbonara
Nonna: …
Jake: and chicken
Nonna: …
Jake: and broke the spaghetti in half
Nonna: I am calling the embassy
Jake: it was tasty
Nonna: you are dead to me. come Sunday for lunch`},
{t:"French strike day",g:"culture,travel",a:"w",me:"Tourist",x:`Tourist: why is the metro closed
Parisien: strike
Tourist: about what
Parisien: pensions
Tourist: when does it end
Parisien: when they win
Tourist: how long is that
Parisien: we have croissants, we can wait 🥐`},
{t:"Australian wildlife",g:"culture,travel",a:"w",me:"Tom",x:`Tom: there's a spider in my shoe
Aussie mate: how big
Tom: size of my hand
Aussie mate: that's a baby
Tom: WHERE IS THE MOTHER
Aussie mate: probably in the other shoe
Tom: I'm going home`},
{t:"Canadian politeness",g:"culture",a:"i",me:"Ryan",x:`Ryan: someone hit my car
Mike: are you ok
Ryan: yes. they left a note
Mike: nice
Ryan: it says "so sorry, here's $50 and a Tim Hortons gift card"
Mike: classic Canada
Ryan: and a maple leaf drawing
Mike: 🍁`},
{t:"Swedish flat pack",g:"culture",a:"w",me:"Marcus",x:`Marcus: building the wardrobe
Jenny: how's it going
Marcus: step 1 of 47
Jenny: after 3 hours?
Marcus: there are 6 screws left over
Jenny: that's normal
Marcus: the wardrobe is also upside down
Jenny: that's not`},
{t:"Finnish personal space",g:"culture",a:"w",me:"Tourist",x:`Tourist: why is everyone standing so far apart at the bus stop
Finnish friend: that's normal
Tourist: 3 metres between people?
Finnish friend: 2 is aggressive
Tourist: someone said hello to me
Finnish friend: must be a tourist
Tourist: it was a tourist`},
{t:"Swiss punctuality",g:"culture,travel",a:"i",me:"Guest",x:`Guest: I'll arrive around 7-ish
Swiss host: what time exactly
Guest: 7-ish
Swiss host: that is not a time
Guest: 7:05?
Swiss host: noted. 19:05:00
Guest: what if I'm late
Swiss host: we won't speak of it`},
{t:"Belgian fries",g:"culture,food",a:"w",me:"Luc",x:`American: I love French fries
Luc: Belgian fries
American: they're French
Luc: they are BELGIAN
American: what about mayo
Luc: on fries. obviously
American: gross
Luc: you put ketchup on everything, you don't get a vote 🍟`},
{t:"American portion sizes",g:"culture,food",a:"w",me:"Sophie",x:`Sophie: I ordered a small coke in Texas
Mum: and
Sophie: it's a bucket
Mum: surely not
Sophie: I can swim in it
Mum: what about the large
Sophie: they deliver it by truck
Mum: 🥤`},
{t:"Irish directions",g:"culture,travel",a:"w",me:"Tourist",x:`Tourist: how do I get to Killarney
Local: go down there past where the old pub used to be
Tourist: used to be?
Local: yes, it burned down in 1974
Tourist: how do I know where it was
Local: you'll know
Tourist: and then
Local: ask someone else sure`},
{t:"Spanish dinner time",g:"culture,food",a:"w",me:"Hannah",x:`Hannah: what time is dinner
Carlos: 10:30
Hannah: 10:30 AM?
Carlos: PM
Hannah: I'll be asleep
Carlos: we eat, then we walk, then we have churros at 2am
Hannah: when do you sleep
Carlos: siesta`},
{t:"Scottish weather",g:"culture,travel",a:"w",me:"Visitor",x:`Visitor: what should I pack for Edinburgh in July
Scot: everything
Visitor: like shorts?
Scot: and a coat
Visitor: sunglasses?
Scot: and a waterproof
Visitor: all 4 seasons?
Scot: often in one afternoon`},
{t:"Japanese etiquette",g:"culture,travel",a:"i",me:"Tourist",x:`Tourist: I stuck my chopsticks upright in the rice
Friend: NO
Tourist: what
Friend: that's for funerals
Tourist: oh no
Friend: and don't tip
Tourist: I just tipped
Friend: the waiter chased you down the street, didn't he`},
{t:"Greek hospitality",g:"culture,food",a:"w",me:"Guest",x:`Guest: I'm full
Yiayia: eat
Guest: I've had 4 plates
Yiayia: you are too skinny
Guest: I've gained 3 kilos this week
Yiayia: good. more moussaka
Guest: please
Yiayia: I will be offended 😤`},
{t:"Russian dacha weekend",g:"culture,family",a:"w",me:"Katya",x:`Babushka: come to the dacha this weekend
Katya: to relax?
Babushka: to plant 400 potatoes
Katya: I was hoping for relaxing
Babushka: potato planting is relaxing
Katya: and the banya?
Babushka: after the potatoes
Katya: fine 🥔`},
{t:"Brazilian time",g:"culture,friends",a:"w",me:"Lucas",x:`Lucas: party starts at 8
Friend from London: I'm here
Lucas: it's 8:00
Friend from London: yes
Lucas: nobody comes at 8
Friend from London: what time do they come
Lucas: 10. the band plays at midnight
Friend from London: I'm going to help set up then`},
{t:"Indian head wobble",g:"culture,work",a:"w",me:"Colleague",x:`Colleague: I asked Ravi if the deadline is ok
Friend: what did he say
Colleague: he did the head wobble
Friend: so yes
Colleague: or no
Friend: or maybe
Colleague: the wobble contains all answers
Friend: it's a quantum wobble`},
{t:"Danish hygge",g:"culture",a:"w",me:"Freja",x:`Freja: come over, it's hygge time
Tom: what do I bring
Freja: socks, candles, and a blanket
Tom: that's it?
Freja: and cake
Tom: what do we do
Freja: exist. softly
Tom: 🕯️🧦`},
{t:"Norwegian brown cheese",g:"culture,food",a:"w",me:"Tourist",x:`Ola: try the brunost
Tourist: why is the cheese brown
Ola: caramelised whey
Tourist: it tastes like fudge
Ola: cheese fudge. on waffles
Tourist: I'm confused but in a good way
Ola: also, it caught fire in a tunnel once
Tourist: the cheese??`},
{t:"Polish grandma food",g:"culture,family",a:"w",me:"Kasia",x:`Babcia: are you eating?
Kasia: yes Babcia
Babcia: what did you eat
Kasia: a salad
Babcia: that's not food
Kasia: it's a big salad
Babcia: I'm sending pierogi. 200
Kasia: to London?`},
{t:"Kiwi vs Aussie",g:"culture,sport",a:"t",me:"Aroha",x:`Aussie: pavlova is Australian
Aroha: it's from New Zealand
Aussie: and Crowded House
Aroha: New Zealand
Aussie: Russell Crowe
Aroha: New Zealand
Aussie: can we have anything
Aroha: you can have the spiders`},
{t:"British tea emergency",g:"culture,food",a:"w",me:"Emma",x:`Emma: American put the kettle in the microwave
Grace: what?? why??
Emma: they don't have kettles
Grace: how do they make tea
Emma: they microwave the water IN A MUG
Grace: barbaric
Emma: and then add the milk FIRST
Grace: I need to lie down`},
{t:"Austrian vs German",g:"culture",a:"w",me:"Max",x:`Tourist: so you're German?
Max: Austrian
Tourist: same thing
Max: we have Mozart and schnitzel
Tourist: Germans have schnitzel too
Max: inferior schnitzel
Tourist: and Kangaroos?
Max: that's Australia. please leave`},
{t:"Mexican spicy challenge",g:"culture,food",a:"w",me:"Dan",x:`Dan: tried the "mild" salsa in Oaxaca
Maria: and?
Dan: I can see through time
Maria: that was the mild one
Dan: my ears are sweating
Maria: try the spicy one
Dan: I'd like to live
Maria: 🌶️`},
{t:"Chinese grandma cold water",g:"culture,family",a:"w",me:"Lin",x:`Lin: I'm sick
Nainai: are you drinking cold water
Lin: …yes
Nainai: THAT'S WHY
Lin: it's a virus
Nainai: hot water fixes everything
Lin: I broke my arm last year
Nainai: and did you drink hot water? no.`},
{t:"Singapore fines",g:"culture,travel",a:"w",me:"Tourist",x:`Tourist: why is there no gum anywhere
Friend: banned
Tourist: gum??
Friend: and not flushing, $150 fine
Tourist: I'm scared to breathe
Friend: breathing is free
Tourist: for now
Friend: the food is incredible though`},
{t:"South African load shedding",g:"culture,news",a:"w",me:"Thabo",x:`Thabo: power's off again
Mike: load shedding?
Thabo: stage 6
Mike: braai time then
Thabo: we braai when there's power
Mike: and when there's not?
Thabo: we braai harder 🔥`},
{t:"Korean skincare routine",g:"culture,friends",a:"i",me:"Sophie",x:`Ji-woo: how many steps in your skincare
Sophie: 1. soap
Ji-woo: 😱
Sophie: sometimes 2 if I use moisturiser
Ji-woo: I use 12
Sophie: what are they all
Ji-woo: essence, serum, ampoule, snail mucus
Sophie: SNAIL WHAT`},
{t:"Hitchhiking the German autobahn",g:"culture,travel",a:"w",me:"Passenger",x:`Passenger: how fast are we going
Driver: 210
Passenger: km?
Driver: yes, it's the autobahn
Passenger: a Porsche just overtook us
Driver: he's in a hurry
Passenger: I'd like to live to 30
Driver: we'll arrive early 😎`},
{t:"Paris waiter",g:"culture,food",a:"w",me:"Tourist",x:`Tourist: I asked the waiter for water in French
Friend: and
Tourist: he replied in English
Friend: classic
Tourist: I kept going in French
Friend: and
Tourist: he switched to German
Friend: he won`},
{t:"Lost in Venice",g:"travel",a:"w",me:"Ella",x:`Ella: I'm lost in Venice
Mum: use Google Maps
Ella: it's put me in a canal
Mum: turn around
Ella: every street is a dead end
Mum: ask someone
Ella: I asked someone. he's also lost
Mum: two lost people is a tour group`},
{t:"Airport security",g:"travel",a:"i",me:"Traveller",x:`Traveller: they took my water, my shampoo and my jam
Friend: jam?
Traveller: "it's a liquid"
Friend: technically
Traveller: I ate it in front of them
Friend: the whole jar?
Traveller: out of spite. strawberry`},
{t:"Budget airline",g:"travel",a:"w",me:"Josh",x:`Josh: flight to Barcelona for €9.99
Anna: bargain!
Josh: bag is €45
Anna: oh
Josh: seat is €12
Anna: oh no
Josh: breathing is €3
Anna: is the window extra
Josh: the window is €20 and you can't open it`},
{t:"Hotel room surprise",g:"travel",a:"w",me:"Ruth",x:`Ruth: the hotel said sea view
Pete: and
Ruth: I can see the sea if I stand on the toilet and lean left
Pete: technically a sea view
Ruth: the room is 8 square metres
Pete: cosy
Ruth: the bed folds out of the wardrobe
Pete: 5 stars`},
{t:"Travel buddy snoring",g:"travel,friends",a:"w",me:"Jo",x:`Jo: you snore
Alex: I don't
Jo: you snored so loud the Airbnb host complained
Alex: rude
Jo: the neighbours' dog howled back
Alex: we're connecting
Jo: I'm getting my own room`},
{t:"Camping weekend",g:"travel,friends",a:"t",me:"Liam",x:`Liam: tent's up!
Maya: it's upside down
Liam: it's a design choice
Maya: it's raining INTO it
Liam: rain is nature's shower
Maya: we're going to the pub
Liam: the pub is camping adjacent`},
{t:"Dad on holiday",g:"travel,family",a:"w",me:"Kid",x:`Dad: early start tomorrow
Kid: how early
Dad: 4am
Kid: the flight is at 2pm
Dad: traffic
Kid: the airport is 20 minutes away
Dad: you never know
Kid: we'll be there 9 hours early`},
{t:"Mum's airport hug",g:"travel,family",a:"i",me:"Sam",x:`Mum: text me when you land
Sam: I will
Mum: text me when you take off
Sam: phones are off
Mum: text me when you board
Sam: ok
Mum: text me when you've been through security
Sam: I'm going to Leeds mum`},
{t:"Roadtrip snacks",g:"travel,friends",a:"w",me:"Kev",x:`Kev: I've packed snacks
Gemma: what snacks
Kev: 4 bags of crisps, 6 chocolate bars, a whole cheese
Gemma: a whole cheese?
Kev: a small wheel
Gemma: it's a 2 hour drive
Kev: things can go wrong 🧀`},
{t:"Holiday photo overload",g:"travel,friends",a:"w",me:"Friend",x:`Beth: back from Greece! want to see photos?
Friend: sure
Beth: 📷📷📷📷📷📷📷📷
Beth: 📷📷📷📷📷📷📷📷
Friend: how many are there
Beth: 1,200
Friend: can you pick your top 3
Beth: these are my top 1,200`},
{t:"Translation app fail",g:"travel,tech",a:"w",me:"Traveller",x:`Traveller: used a translation app in the restaurant
Friend: how did it go
Traveller: I asked for "no nuts please"
Friend: and
Traveller: it translated as "I have no nuts, please help"
Friend: 😂
Traveller: the waiter brought me soup and a hug`},
{t:"Beach towel war",g:"travel,culture",a:"w",me:"Sarah",x:`Sarah: I went to the pool at 7am
Mike: and
Sarah: every sunbed has a towel
Mike: who
Sarah: a German family, they came at 5
Mike: impressive
Sarah: they've built a small fort
Mike: respect the strategy`},
{t:"Ski holiday",g:"travel,sport",a:"w",me:"Ben",x:`Ben: first ski lesson done
Holly: how was it
Ben: fell 40 times
Holly: that's normal
Ben: a 4 year old overtook me backwards
Holly: they're built different
Ben: I'm doing après-ski only tomorrow
Holly: the correct choice`},
{t:"Cruise ship buffet",g:"travel,food",a:"w",me:"Grandad",x:`Grandad: on the cruise!
Mum: how is it
Grandad: there's a buffet open 24 hours
Mum: be careful
Grandad: I've been 11 times today
Mum: Dad
Grandad: the lobster is free
Mum: bring stretchy trousers`},
{t:"Backpacker budget",g:"travel,friends",a:"w",me:"Ollie",x:`Ollie: I've been living on 5 dollars a day in Thailand
Mum: are you eating
Ollie: noodles
Mum: and?
Ollie: more noodles
Mum: come home
Ollie: I've also got a tattoo
Mum: of noodles?`},
]);
L([
{t:"Mum learns emojis",g:"family,tech",a:"w",me:"Josh",x:`Mum: Grandpa passed away 😂
Josh: MUM
Mum: what
Josh: that's the laughing emoji
Mum: I thought it was crying
Josh: it's crying with laughter
Mum: oh no I sent it to the whole family
Josh: Grandpa is also in the group`},
{t:"Dad jokes",g:"family",a:"w",me:"Ella",x:`Dad: what do you call a fish with no eyes
Ella: no
Dad: a fsh
Ella: I'm blocking you
Dad: what do you call a deer with no eyes
Ella: DAD
Dad: no idea 🦌
Ella: that one was actually good`},
{t:"Who ate the leftovers",g:"family,food",a:"w",me:"Mum",x:`Mum: who ate the lasagne
Tom: not me
Sophie: not me
Dad: I had a small bit
Mum: it was a whole tray
Dad: in small bits
Mum: that was for tonight
Dad: I'll make toast for everyone`},
{t:"Family WiFi password",g:"family,tech",a:"w",me:"Kid",x:`Kid: what's the WiFi password
Dad: clean your room
Kid: I'm serious
Dad: so am I, that's the password
Kid: cleanyourroom?
Dad: capital C
Kid: this is psychological warfare
Dad: 😎`},
{t:"Grandma's voice notes",g:"family,tech",a:"w",me:"Grandson",x:`Grandma: 🎤 voice note 0:47
Grandma: 🎤 voice note 0:02
Grandma: 🎤 voice note 3:15
Grandson: grandma you can type
Grandma: 🎤 voice note 0:30
Grandson: is it an emergency
Grandma: 🎤 voice note 4:02
Grandson: she's describing her soup`},
{t:"Teenage one-word replies",g:"family",a:"i",me:"Mum",x:`Mum: how was school
Teen: fine
Mum: what did you learn
Teen: stuff
Mum: who did you sit with
Teen: people
Mum: do you want pizza tonight
Teen: YES!!! PEPPERONI PLEASE MUM YOU'RE THE BEST 🍕🍕
Mum: interesting`},
{t:"Family group chat name",g:"family",a:"w",me:"Ben",x:`Ben: *changed the group name to "The Simpsons"*
Mum: we're not yellow
Sister: changed it to "Mum's Favourites"
Ben: you're not
Dad: changed it to "Dad's Jokes Club"
Mum: I'm leaving
Dad: that's what she said
Mum: DAVID`},
{t:"Toddler negotiations",g:"family",a:"w",me:"Dad",x:`Mum: how's bedtime going
Dad: she wants one more story
Mum: how many so far
Dad: 9
Mum: say no
Dad: she said "please daddy" with the eyes
Mum: you're so weak
Dad: story 10 is about a dinosaur dentist`},
{t:"Siblings arguing",g:"family",a:"w",me:"Mum",x:`Mia: Leo is breathing on my side of the car
Leo: I'm breathing normally
Mia: he's LOOKING at me
Leo: I'm looking out the window
Mia: the window is on MY side
Mum: we are 5 minutes into a 6 hour drive
Leo: 🙃`},
{t:"Dad's thermostat",g:"family",a:"w",me:"Dad",x:`Dad: who touched the thermostat
Kid: I was cold
Dad: put on a jumper
Kid: I'm wearing 3 jumpers
Dad: then put on a hat
Kid: I'm wearing a hat INDOORS
Dad: good. money doesn't grow on trees
Kid: neither does warmth apparently`},
{t:"Mum's missing glasses",g:"family",a:"i",me:"Dad",x:`Mum: have you seen my glasses
Dad: on your head
Mum: no
Dad: look up
Mum: …
Dad: well?
Mum: I'll never admit this
Dad: I've screenshotted it`},
{t:"Nan's Facebook comments",g:"family,tech",a:"w",me:"Emily",x:`Emily: Nan, you commented "HOW DO I SEND A MESSAGE" on my post
Nan: oh dear
Emily: everyone can see it
Nan: HOW DO I DELETE
Emily: you did it again
Nan: I'm going to throw this iPad in the sea
Emily: 😂 I'll come over`},
{t:"Twins confusion",g:"family",a:"w",me:"Teacher",x:`Teacher: is this Sam or Max
Parent: which one is wearing blue
Teacher: they swapped jumpers
Parent: check the knee
Teacher: which knee
Parent: Sam has a scar on the left knee
Teacher: they both have plasters on
Parent: they're doing it on purpose`},
{t:"Dad's BBQ",g:"family,food",a:"w",me:"Mum",x:`Dad: BBQ is on!
Mum: it's raining
Dad: I have an umbrella
Mum: it's 8 degrees
Dad: the sausages don't mind
Mum: the guests do
Dad: they can watch from the window
Mum: 🌧️🌭`},
{t:"Kid asks why",g:"family,school",a:"w",me:"Dad",x:`Kid: why is the sky blue
Dad: light scattering
Kid: why
Dad: the atmosphere
Kid: why
Dad: physics
Kid: why
Dad: because I said so
Kid: that's not science`},
{t:"Moving back home",g:"family",a:"w",me:"Tom",x:`Tom: can I move back home for a bit
Mum: of course darling
Tom: thanks!
Mum: your room is now my yoga studio
Tom: where do I sleep
Mum: on the yoga mat
Tom: 😐
Mum: it's very good for your back`},
{t:"Grandpa's new phone",g:"family,tech",a:"i",me:"Granddaughter",x:`Grandpa: HELLO THIS IS GRANDPA
Granddaughter: hi grandpa!
Grandpa: I AM TEXTING YOU FROM MY NEW PHONE
Granddaughter: you don't need to shout
Grandpa: I CAN'T FIND THE BUTTON TO TURN IT OFF
Granddaughter: the caps lock
Grandpa: the what
Granddaughter: never mind, it's perfect`},
{t:"Family dog adoption",g:"family,pets",a:"w",me:"Mum",x:`Dad: I've brought home a dog
Mum: we agreed no dog
Dad: he looked at me
Mum: we agreed
Dad: his name is Biscuit
Mum: …
Dad: he's already on the sofa
Mum: fine but I'm naming the next one`},
{t:"Birthday money",g:"family",a:"w",me:"Grandma",x:`Grandson: thank you for the birthday card grandma!
Grandma: did you find the money
Grandson: what money
Grandma: I put a 20 in
Grandson: there's nothing
Grandma: I put it in the envelope, then the card, then the envelope in a book
Grandson: which book
Grandma: good question`},
{t:"Dinner time negotiation",g:"family,food",a:"w",me:"Mum",x:`Kid: I don't like broccoli
Mum: they're tiny trees
Kid: I don't eat trees
Mum: dinosaurs ate trees
Kid: …
Mum: you'd be a dinosaur
Kid: RAAAWR 🦖 give me the trees`},
{t:"Chores chart",g:"family",a:"w",me:"Dad",x:`Dad: new chores chart on the fridge
Kid 1: I got bins
Kid 2: I got dishes
Kid 3: I got "supervisor"
Dad: that's mine
Kid 3: we voted
Dad: I didn't get a vote
Kid 1: democracy 🗳️`},
{t:"Grandma's recipe",g:"family,food",a:"w",me:"Anna",x:`Anna: grandma can I have your cake recipe
Grandma: of course
Grandma: flour
Anna: how much
Grandma: enough
Anna: and sugar?
Grandma: until it looks right
Anna: this is a vibe not a recipe`},
{t:"Family photo",g:"family",a:"i",me:"Photographer",x:`Photographer: everyone look at the camera
Photographer: dad's eyes are closed
Photographer: now the baby's crying
Photographer: the dog is licking grandma
Photographer: everyone smile!
Photographer: the teenager isn't smiling
Teen: I am smiling
Photographer: that's his smile apparently`},
{t:"Parents discover TikTok",g:"family,tech",a:"w",me:"Teen",x:`Mum: we've made a TikTok account
Teen: why
Dad: to follow you
Teen: please no
Mum: we followed all your friends too
Teen: I'm changing my name
Dad: we commented "so proud" on everything
Teen: 🫠`},
{t:"Kid's first phone",g:"family,tech",a:"w",me:"Mum",x:`Kid: I'm home
Mum: great
Kid: I'm in my room
Mum: I know, I'm downstairs
Kid: what's for dinner
Mum: come down and see
Kid: that's far
Mum: it's 14 stairs`},
{t:"The family pet funeral",g:"family,pets",a:"w",me:"Dad",x:`Kid: the goldfish died
Dad: oh no
Kid: can we have a funeral
Dad: of course
Kid: in the garden with songs
Dad: and a speech?
Kid: you do the speech
Dad: Goldie was a good fish. he swam. mostly in circles`},
{t:"Aunt's gossip",g:"family",a:"w",me:"Niece",x:`Aunt Carol: did you hear about cousin Mark
Niece: no
Aunt Carol: he's dating a DJ
Niece: ok
Aunt Carol: she's 34
Niece: he's 35
Aunt Carol: …
Niece: this isn't gossip Carol`},
{t:"Dad parking",g:"family,travel",a:"w",me:"Kid",x:`Kid: Dad we've been circling for 20 minutes
Dad: I want a spot near the door
Kid: there was one at the back
Dad: that's a walk
Kid: it's 50 metres
Dad: I'm playing the long game
Kid: the shop closes in 10 minutes`},
{t:"Mum's 'we have food at home'",g:"family,food",a:"w",me:"Kid",x:`Kid: can we get McDonald's
Mum: we have food at home
Kid: what food
Mum: there's rice
Kid: just rice?
Mum: and a single egg
Kid: that's a sad meal
Mum: that's character building`},
{t:"Baby's first word",g:"family",a:"i",me:"Dad",x:`Mum: she said her first word!!
Dad: mama?
Mum: no
Dad: dada??
Mum: no
Dad: what then
Mum: "WiFi"
Dad: she's our daughter alright`},
{t:"Gran's online shopping",g:"family,tech",a:"w",me:"Grandson",x:`Gran: I bought a hat online
Grandson: nice
Gran: 12 arrived
Grandson: did you click 12?
Gran: I clicked once and waited
Grandson: and?
Gran: then I clicked 11 more times
Grandson: we'll return 11 hats`},
{t:"Family road trip music",g:"family,travel",a:"w",me:"Dad",x:`Kid 1: can we play my music
Kid 2: no mine
Mum: podcasts
Dad: my car, my rules
Kid 1: not the 80s playlist again
Dad: Total Eclipse of the Heart, from the top
Kid 2: this is my 7th eclipse today`},
{t:"Sister borrowed clothes",g:"family",a:"w",me:"Emma",x:`Emma: where is my black dress
Sophie: which one
Emma: the ONLY one
Sophie: it's at Jake's
Emma: WHO IS JAKE
Sophie: my new boyfriend
Emma: why is my dress at your boyfriend's
Sophie: long story`},
{t:"Brother gaming at 3am",g:"family,tech",a:"w",me:"Sister",x:`Sister: it's 3am, stop shouting
Brother: my team is terrible
Sister: I have an exam tomorrow
Brother: we're in the final round
Sister: I'll unplug the router
Brother: you wouldn't
Sister: 🔌
Brother: NOOOO`},
{t:"Mum's doctor googling",g:"family,tech",a:"w",me:"Son",x:`Mum: I googled my headache
Son: don't
Mum: it says I have 3 days to live
Son: have you had water
Mum: no
Son: coffee?
Mum: 7 cups
Son: I think you'll survive`},
{t:"Grandad's hearing aid",g:"family",a:"w",me:"Grandma",x:`Grandma: is your hearing aid on
Grandad: what
Grandma: IS YOUR HEARING AID ON
Grandad: I can't hear you
Grandma: it's in your pocket
Grandad: I prefer the quiet
Grandma: you mean you prefer not listening to me
Grandad: what`},
{t:"Christmas list",g:"family,traditions",a:"w",me:"Dad",x:`Kid: my Christmas list
Kid: 1. a pony
Kid: 2. a trampoline
Kid: 3. a brother but a nice one
Dad: we'll see what Santa can do
Kid: 4. a smaller brother than the one I have
Dad: 😂`},
{t:"In-laws visiting",g:"family",a:"w",me:"Husband",x:`Wife: my parents are coming this weekend
Husband: for how long
Wife: 3 weeks
Husband: THE weekend??
Wife: a long weekend
Husband: that's 21 days
Wife: they're bringing the dog
Husband: I'll be in the shed`},
{t:"Son's cooking attempt",g:"family,food",a:"w",me:"Mum",x:`Son: I made dinner for you!
Mum: aww what did you make
Son: pasta
Mum: lovely
Son: I didn't know you had to boil the water
Mum: …
Son: it's crunchy pasta
Mum: very brave of you`},
{t:"Dad's DIY",g:"family",a:"i",me:"Mum",x:`Dad: I fixed the shelf
Mum: great
Dad: it only needed 20 screws
Mum: where are the books
Dad: on the floor
Mum: why
Dad: the shelf is more decorative now`},
{t:"Family vacation budget",g:"family,travel",a:"w",me:"Mum",x:`Dad: I've booked a holiday!
Mum: where?
Dad: a caravan in Wales
Mum: I thought we were going to Spain
Dad: Wales has beaches too
Mum: it's raining in Wales
Dad: and in Spain it's not raining, where's the adventure
Mum: 🙃`},
{t:"Grandparents Skype",g:"family,tech",a:"w",me:"Grandson",x:`Grandma: can you see us
Grandson: I can see the ceiling
Grandpa: how about now
Grandson: I can see your ear
Grandma: we're here!
Grandson: I can see your nostrils
Grandpa: hello!!
Grandson: best call ever`},
{t:"The family car wash",g:"family",a:"w",me:"Kid",x:`Dad: we're washing the car
Kid: by hand?
Dad: yes. bonding
Kid: it's cold
Dad: character building
Kid: can I use the hose
Dad: not at the car
Kid: 💦`},
{t:"Family Monopoly",g:"family,friends",a:"w",me:"Mum",x:`Mum: Monopoly night
Dad: I'll be the banker
Kid: you cheat
Dad: I'm an honest banker
Kid: there's a 500 in your sock
Mum: family game night is cancelled
Dad: it's been 4 hours, nobody's winning anyway`},
{t:"Cousin's wedding RSVP",g:"family",a:"w",me:"Sophie",x:`Mum: RSVP for cousin Rachel's wedding
Sophie: plus one?
Mum: are you seeing someone
Sophie: no but I could
Mum: in 2 weeks
Sophie: I'll bring my plant
Mum: the plant isn't invited`},
{t:"Mum on speakerphone",g:"family",a:"i",me:"Son",x:`Mum: I'm calling you on speaker
Son: why
Mum: so the whole car can hear
Son: who's in the car
Mum: your aunts
Son: oh no
Mum: tell them about your new girlfriend
Son: I'm going into a tunnel`},
{t:"Grandpa explains the old days",g:"family,history",a:"w",me:"Granddaughter",x:`Grandpa: when I was your age we walked 5 miles to school
Granddaughter: uphill?
Grandpa: both ways
Granddaughter: that's impossible
Grandpa: in the snow
Granddaughter: in July?
Grandpa: it was a different time`},
{t:"Family fitness challenge",g:"family,sport",a:"w",me:"Dad",x:`Mum: family step challenge!
Dad: easy
Kid: I've done 12,000
Mum: 15,000!
Dad: 402
Mum: 402??
Dad: I walked to the fridge. several times`},
{t:"Mum's typo",g:"family,tech",a:"w",me:"Daughter",x:`Mum: I'm so prod of you
Daughter: prod?
Mum: PROUD
Mum: stupid phone
Daughter: I'm so prod of you too mum
Mum: 😂
Daughter: I'm going to print this and frame it`},
]);
L([
{t:"Where are you?",g:"friends",a:"w",me:"Jess",x:`Jess: where are you
Kate: 5 minutes away
Jess: you said that 20 minutes ago
Kate: I'm just leaving
Jess: you said you were 5 minutes away
Kate: 5 minutes from leaving
Jess: 🙄
Kate: I'm in the shower actually`},
{t:"Group holiday planning",g:"friends,travel",a:"w",me:"Amy",x:`Amy: holiday in August?
Ben: yes!
Chloe: yes!!
Dan: yes!!!
Amy: great, pick dates
Ben: …
Chloe: …
Dan: …
Amy: this is why we never go anywhere`},
{t:"The friend who never replies",g:"friends",a:"i",me:"Lucy",x:`Lucy: are you coming Saturday?
Lucy: hello?
Lucy: just need a yes or no
Lucy: I can see you're online
Mark: hey sorry, just saw this
Lucy: it's been 9 days
Mark: yes I'll come
Lucy: it was last Saturday`},
{t:"Splitting the bill",g:"friends,food",a:"w",me:"Tom",x:`Tom: dinner came to £240 for 6
Sam: I only had a salad
Jake: I had water
Priya: I had one prawn
Tom: who had the lobster and 3 cocktails
Sam: …
Tom: Sam
Sam: I'll pay for the salad`},
{t:"Best friend's new partner",g:"friends,dating",a:"w",me:"Meg",x:`Meg: so how's the new guy
Zara: amazing
Meg: what does he do
Zara: he's a DJ
Meg: oh
Zara: and a crypto trader
Meg: oh no
Zara: and he's got a podcast
Meg: I'm coming over with wine`},
{t:"Pub quiz team name",g:"friends",a:"w",me:"Josh",x:`Josh: we need a team name for the pub quiz
Leah: Quiz Team Aguilera
Rob: Let's Get Quizzical
Josh: Universally Challenged
Leah: we lost last week as "The Smartypants"
Rob: we came last
Josh: then we need a humbler name
Leah: The Last Place Legends`},
{t:"Gym buddy excuses",g:"friends,sport",a:"w",me:"Alex",x:`Alex: gym at 6am?
Chris: yes!
(pause 2)
Chris: actually my cat is sick
Alex: you don't have a cat
Chris: my neighbour's cat
Alex: Chris
Chris: I'm emotionally supporting it
Alex: I'm at the gym alone again`},
{t:"Karaoke regret",g:"friends",a:"w",me:"Beth",x:`Beth: last night was fun
Kim: do you remember singing
Beth: a little bit
Kim: all of Bohemian Rhapsody
Beth: …
Kim: twice
Beth: oh no
Kim: the second time you did all the voices`},
{t:"Friend's terrible cooking",g:"friends,food",a:"w",me:"Harry",x:`Ian: come for dinner, I'm cooking
Harry: what are you making
Ian: my famous chilli
Harry: famous for what
Ian: flavour
Harry: last time the fire brigade came
Ian: that was a starter
Harry: I'll bring pizza as backup`},
{t:"Birthday forgotten",g:"friends",a:"w",me:"Nina",x:`Nina: happy birthday!! 🎉
Sophie: that was yesterday
Nina: I know, I was saving it
Sophie: saving it for what
Nina: to be the first message today
Sophie: that's not how it works
Nina: happy late birthday then 🎂`},
{t:"Ex texting again",g:"friends,dating",a:"w",me:"Tia",x:`Tia: my ex just texted "hey"
Jo: DON'T
Tia: I'm not
Jo: what are you typing
Tia: nothing
Jo: I can see "typing…"
Tia: I'm typing to you
Jo: block him`},
{t:"Friends watching the match",g:"friends,sport",a:"w",me:"Tom",x:`Tom: goal!!!!!
Jack: offside
Tom: VAR is checking
Jack: it's offside by a toenail
Tom: they gave it!!!
Jack: robbery
Tom: 🎉🎉🎉
Jack: I'm writing to FIFA`},
{t:"Book club no one read",g:"friends",a:"w",me:"Sarah",x:`Sarah: book club tomorrow! what did everyone think
Anna: loved it
Kate: very powerful
Sarah: what was your favourite part
Anna: the… cover
Kate: the ending
Sarah: which was?
Kate: the ending was very… final`},
{t:"Flatmate's dishes",g:"friends",a:"w",me:"Liam",x:`Liam: whose pan is in the sink
Kai: not mine
Liam: it has your initials on it
Kai: I'm soaking it
Liam: for 3 weeks
Kai: it's a deep soak
Liam: there's a new life form in there
Kai: we could name it`},
{t:"Wedding group chat",g:"friends,traditions",a:"w",me:"Bridesmaid",x:`Bride: bridesmaid dresses are sage green
Bridesmaid: love!
Bride: and shoes
Bridesmaid: sure
Bride: and matching hair
Bridesmaid: ok
Bride: and matching personalities
Bridesmaid: 😅`},
{t:"Hangover recovery",g:"friends",a:"w",me:"Dan",x:`Dan: I'm never drinking again
Ollie: same
Dan: I found a traffic cone in my room
Ollie: I found a pizza in my shoe
Dan: why is there a goat on my Instagram
Ollie: that's a sheep
Dan: that's worse
Ollie: pub at 5?`},
{t:"Plans cancelled",g:"friends",a:"i",me:"Emma",x:`Rachel: so sorry, can we cancel tonight? feeling tired
Emma: oh no worries at all!!
Emma: (thank god)
Emma: sorry that was meant for someone else
Rachel: 😂 same
Emma: see you never?
Rachel: see you never 💛`},
{t:"Secret crush",g:"friends,dating",a:"w",me:"Maya",x:`Maya: he liked my Instagram story
Lily: which one
Maya: the one from 2019
Lily: he's scrolling deep
Maya: what does it mean
Lily: he's obsessed or he fell asleep with his thumb on the screen
Maya: 50/50`},
{t:"Friend group fitness trip",g:"friends,sport",a:"w",me:"Sam",x:`Sam: hiking this weekend!
Joe: how far
Sam: 20 km
Joe: that's a lot of km
Sam: there's a pub at the end
Joe: now we're talking
Sam: and a pub at the start
Joe: we'll never leave the first pub`},
{t:"Game night rules",g:"friends",a:"w",me:"Max",x:`Max: Settlers of Catan tonight
Lena: I have 7 sheep
Max: I don't want sheep
Lena: 7 sheep for 1 wood?
Max: no
Lena: 8 sheep
Max: I have no use for 8 sheep
Lena: you'll regret this`},
{t:"Wrong group chat",g:"friends,work",a:"w",me:"Jake",x:`Jake: boss is being so annoying today
Jake: oh no
Jake: wrong chat
Boss: 👀
Jake: I meant the boss in my video game
Boss: which game
Jake: it's a new one. very annoying. you'd hate it`},
{t:"The group chat that won't stop",g:"friends",a:"w",me:"Chris",x:`Chris: I'm going to bed
Kat: night!
Rob: night night
Kat: wait did you see this video
Rob: lol
Chris: I'm in bed
Kat: last one I promise
Chris: it's 3am`},
{t:"Friend's DIY haircut",g:"friends",a:"i",me:"Leon",x:`Leon: I cut my own hair
Ruby: pics?
Leon: 📷
Ruby: oh
Leon: be honest
Ruby: it's asymmetrical
Leon: it's avant garde
Ruby: it's a hat situation`},
{t:"Dog sitting",g:"friends,pets",a:"w",me:"Sophie",x:`Sophie: how's Max?
Anna: he ate the TV remote
Sophie: oh no
Anna: and a sock
Sophie: which sock
Anna: yours, from your bag
Sophie: that's why I only have one
Anna: he's happy though 🐶`},
{t:"Festival planning",g:"friends",a:"w",me:"Jade",x:`Jade: Glastonbury tickets!!
Mo: what's the plan
Jade: tent, wellies, glitter
Mo: toilets?
Jade: don't ask about the toilets
Mo: I'm asking
Jade: we don't talk about the toilets`},
{t:"First date check-in",g:"dating,friends",a:"w",me:"Priya",x:`Priya: I'm on the date
Lara: how is it
Priya: he's been talking about his car for 40 minutes
Lara: what kind of car
Priya: that's not the point
Lara: call you with a fake emergency?
Priya: in 10 minutes. make it dramatic`},
{t:"Rizz attempt",g:"dating",a:"m",me:"Sam",x:`Jake: are you a parking ticket?
Sam: ?
Jake: because you've got fine written all over you
Sam: 😐
Jake: are you a WiFi signal
Sam: stop
Jake: because I'm feeling a connection
Sam: blocked`},
{t:"Online dating profile",g:"dating",a:"m",me:"Chloe",x:`Chloe: your profile says you're 6ft
Tom: yes
Chloe: I'm 5'9 and taller than you
Tom: I'm 6ft in spirit
Chloe: and you said you love hiking
Tom: I walked to this pub
Chloe: honestly, funny enough for a second drink`},
{t:"Accidental like",g:"dating,tech",a:"i",me:"Ben",x:`Ben: oh no
Friend: what
Ben: I accidentally liked her photo from 2016
Friend: unlike it
Ben: she already saw
Friend: act natural
Ben: I also accidentally sent a heart
Friend: you're married now`},
{t:"Meeting the parents",g:"dating,family",a:"w",me:"Jess",x:`Jess: my parents want to meet you
Sam: great!
Jess: dad will ask about your job
Sam: fine
Jess: and your salary
Sam: ok
Jess: and your 5 year plan
Sam: I don't have a 5 week plan`},
{t:"Anniversary forgotten",g:"dating",a:"i",me:"Tom",x:`Sarah: happy anniversary ❤️
Tom: happy anniversary!!!
Tom: I definitely didn't forget
Sarah: what are we doing tonight
Tom: it's a surprise
Sarah: what kind of surprise
Tom: a surprise for me too`},
{t:"Ghosted",g:"dating",a:"m",me:"Rosie",x:`Rosie: hey, fun night on Saturday!
Rosie: hello?
Rosie: ok then
(pause 2)
Dan: hey sorry, been busy
Rosie: 4 months?
Dan: very busy
Rosie: were you in space?`},
{t:"Texting back too fast",g:"dating,friends",a:"w",me:"Lily",x:`Lily: he texted!!
Kate: wait 10 minutes before replying
Lily: why
Kate: so you don't look desperate
Lily: I already replied
Kate: when
Lily: 0.3 seconds
Kate: 😂`},
{t:"Couple's dinner debate",g:"dating,food",a:"w",me:"Ella",x:`Ella: what do you want for dinner
Josh: anything
Ella: pizza?
Josh: not pizza
Ella: sushi?
Josh: not sushi
Ella: you said anything
Josh: anything except those`},
{t:"Cute or creepy",g:"dating",a:"m",me:"Ana",x:`Leo: I've memorised your coffee order
Ana: aww
Leo: and your bus route
Ana: oh
Leo: and your mum's maiden name
Ana: why
Leo: for security questions
Ana: that's the opposite of security`},
{t:"Couple vs IKEA",g:"dating",a:"w",me:"Mark",x:`Mark: we're in IKEA
Friend: good luck
Mark: we've been arguing about a lamp for 40 minutes
Friend: which lamp
Mark: both lamps are identical
Friend: then why
Mark: principle
Friend: relationships die in IKEA`},
{t:"Long distance",g:"dating,travel",a:"i",me:"Clara",x:`Clara: good morning ☀️
Ben: good night 🌙
Clara: time zones are hard
Ben: what are you doing
Clara: breakfast. you?
Ben: bedtime. counting sheep
Clara: count one for me
Ben: 🐑`},
{t:"Speed dating",g:"dating",a:"w",me:"Sam",x:`Sam: speed dating tonight
Friend: how many dates
Sam: 12 in 1 hour
Friend: 5 minutes each?
Sam: I've prepared one joke
Friend: for all 12?
Sam: it's a good joke
Friend: they might compare notes`},
{t:"Moving in together",g:"dating",a:"w",me:"Jo",x:`Jo: I'm moving in!
Max: yay!
Jo: I'm bringing 40 plants
Max: 40?
Jo: and a cat
Max: we said no cat
Jo: he's small
Max: fine, but he gets his own shelf`},
{t:"Valentine's reservation",g:"dating,food",a:"w",me:"Tim",x:`Tim: I tried to book a table for Valentine's
Friend: and
Tim: everything is full
Friend: you left it late
Tim: it's 14 February at 6pm
Friend: very late
Tim: we're going to a kebab shop
Friend: romantic 🥙`},
{t:"The 'we need to talk' text",g:"dating",a:"i",me:"Jack",x:`Emily: we need to talk
Jack: 😰
Jack: what's wrong
Emily: it's important
Jack: I'm sorry for whatever it is
Emily: did you eat my yoghurt
Jack: …yes`},
{t:"Wingman fail",g:"friends,dating",a:"w",me:"Luke",x:`Luke: I told her you were a doctor
Matt: I'm a plumber
Luke: I panicked
Matt: what kind of doctor
Luke: a heart surgeon
Matt: I fix pipes
Luke: same thing really`},
{t:"Proposal plan",g:"dating,friends",a:"w",me:"Rob",x:`Rob: I'm proposing at the restaurant
Kate: aww
Rob: ring in the dessert
Kate: risky
Rob: why
Kate: what if she eats it
(pause 2)
Rob: small update
Kate: she ate it didn't she`},
{t:"Friend's toxic ex",g:"friends,dating",a:"w",me:"Jo",x:`Mia: he says he's changed
Jo: how
Mia: he has a new haircut
Jo: that's not change
Mia: and he reads now
Jo: what does he read
Mia: Instagram captions
Jo: don't you dare`},
{t:"Double date",g:"friends,dating",a:"w",me:"Ella",x:`Ella: double date Friday?
Sophie: yes! where
Ella: bowling
Sophie: Tom is very competitive
Ella: so is Dan
Sophie: this will end in tears
Ella: 🎳`},
{t:"Friendship bracelet",g:"friends",a:"w",me:"Ivy",x:`Ivy: I made us friendship bracelets
Nell: omg
Ivy: they say BEST FRENDS
Nell: missing an i
Ivy: it's a design choice
Nell: you ran out of beads
Ivy: I ran out of beads`},
{t:"Snake plant gift",g:"friends",a:"w",me:"Meg",x:`Meg: how's the plant I gave you
Jess: thriving
Meg: pic?
Jess: 📷
Meg: that's a different plant
Jess: …
Meg: what happened to mine
Jess: it's in a better place`},
{t:"Birthday cake fail",g:"friends,food",a:"w",me:"Chris",x:`Chris: I baked a cake for your birthday
Sam: aww
Chris: it collapsed
Sam: still counts
Chris: it's more of a pancake
Sam: pancake cake
Chris: with candles lying flat`},
{t:"Friend is a new parent",g:"friends,family",a:"w",me:"Kate",x:`Kate: how's parenthood
Liz: I haven't slept since March
Kate: it's June
Liz: I put the baby's nappy on the cat
Kate: 😂
Liz: the cat doesn't mind
Kate: I'm bringing coffee. lots`},
{t:"Group chat poll",g:"friends",a:"w",me:"Tom",x:`Tom: poll: where should we go Friday
Tom: 📊 Pub / Other pub / Same pub as always
Sam: voted same pub
Jake: same pub
Rich: same pub
Tom: democracy has spoken
Sam: why did we even vote`},
]);
L([
{t:"Reply all disaster",g:"work",a:"t",me:"Claire",x:`Tom: why did I just get an email saying "Gary smells like soup"
Claire: oh no
Tom: it went to the whole company
Claire: it was meant for one person
Gary: 🍲
Claire: I'm so sorry Gary
Gary: it's a nice soup
Claire: I'm moving to Peru`},
{t:"Meeting that could be an email",g:"work",a:"w",me:"Sam",x:`Boss: quick meeting at 2?
Sam: about?
Boss: the meeting schedule
Sam: a meeting about meetings
Boss: exactly
Sam: how long
Boss: an hour
Sam: can I send my opinion by email`},
{t:"Office fridge thief",g:"work,food",a:"w",me:"HR",x:`HR: someone keeps stealing Dave's sandwiches
Dave: every day this week
HR: we're going to investigate
Dave: I've put a label on it
HR: what does it say
Dave: "poisoned"
HR: Dave that's a threat
Dave: it's a deterrent`},
{t:"Work from home dress code",g:"work",a:"w",me:"Colleague",x:`Colleague: you're wearing a shirt and tie on Zoom
Rob: important client call
Colleague: and below the desk?
Rob: pyjama bottoms
Colleague: stand up
Rob: never
Colleague: they asked you to show the whiteboard
Rob: I'm fired aren't I`},
{t:"Monday motivation",g:"work",a:"w",me:"Kate",x:`Boss: happy Monday team! let's crush it 💪
Kate: 😐
Tom: ☕
Priya: 💀
Boss: who's excited for the week?
Tom: is Friday an option
Boss: it's 9am Monday
Kate: I know, that's the problem`},
{t:"Out of office",g:"work",a:"t",me:"Jen",x:`Client: are you available this week?
Jen: Auto-reply: I'm out of office until Monday. For urgent matters, please contact someone who cares.
Client: 😳
Jen: that was a draft
Jen: please ignore
Client: I respect it honestly`},
{t:"New intern",g:"work",a:"w",me:"Manager",x:`Manager: welcome! any questions?
Intern: where's the stapler
Manager: on the desk
Intern: what's a stapler
Manager: …
Intern: I'm joking
Manager: thank god
Intern: what's a desk`},
{t:"Performance review",g:"work",a:"i",me:"Employee",x:`Manager: let's talk about your strengths
Employee: I'm a hard worker
Manager: and weaknesses
Employee: I work too hard
Manager: you took 4 lunch breaks yesterday
Employee: I work hard at lunch too
Manager: 😐`},
{t:"Team building",g:"work",a:"w",me:"Staff",x:`Boss: team building on Saturday!
Staff: Saturday?
Boss: escape room!
Staff: ironic, we can't escape work
Boss: then paintball
Staff: can I shoot the boss
Boss: that's the spirit
Staff: I was serious`},
{t:"Sick day",g:"work",a:"w",me:"Tom",x:`Tom: I can't come in today, I'm sick
Boss: what's wrong
Tom: *cough cough*
Boss: you typed "cough cough"
Tom: it's a bad cough
Boss: your Instagram shows you at the beach
Tom: sea air is good for the lungs`},
{t:"Salary negotiation",g:"work",a:"w",me:"Employee",x:`Employee: I'd like a raise
Boss: we value you
Employee: great! how much
Boss: we value you emotionally
Employee: can I pay rent with emotions
Boss: we can offer a pizza party
Employee: I've had 11 pizza parties this year`},
{t:"Office thermostat war",g:"work",a:"w",me:"Priya",x:`Priya: who put the heating on 28
Gary: me
Priya: it's a sauna
Gary: I'm cold
Priya: wear a jumper
Gary: I am wearing a jumper
Priya: take one of the 3 jumpers off`},
{t:"Coffee machine broken",g:"work,food",a:"w",me:"Lara",x:`Lara: the coffee machine is broken
Tom: nobody panic
Lara: it's 9am
Tom: everybody panic
Boss: productivity has dropped 90%
Lara: send help
Tom: I'm driving to Starbucks with a list of 40 orders`},
{t:"Excel expert",g:"work,tech",a:"w",me:"Colleague",x:`Boss: you said you're an Excel expert on your CV
Jake: yes
Boss: can you do a VLOOKUP
Jake: I can do a SUM
Boss: that's it?
Jake: and I can make the cells yellow
Colleague: that's basically expert level here`},
{t:"Startup pitch",g:"work,tech",a:"w",me:"Investor",x:`Founder: it's Uber for dogs
Investor: dogs driving?
Founder: dogs being driven
Investor: to where
Founder: other dogs
Investor: how do you make money
Founder: blockchain
Investor: I'm in 💸`},
{t:"Leaving cake",g:"work,food",a:"w",me:"Mark",x:`Mark: it's my last day, there's cake in the kitchen
Office: 😢
Mark: it's been an amazing 5 years
Office: where's the cake
Mark: that's all you care about?
Office: yes
Mark: fair`},
{t:"Hybrid work confusion",g:"work",a:"w",me:"Ben",x:`Ben: are we in office today
Kate: it's Tuesday so yes
Ben: I thought Tuesday was home
Kate: that changed
Ben: when
Kate: last Tuesday
Ben: I'm in the office alone again
Kate: we're all at home`},
{t:"LinkedIn cringe",g:"work,tech",a:"w",me:"Friend",x:`Sam: I posted on LinkedIn
Friend: what about
Sam: what my toddler taught me about B2B sales
Friend: oh no
Sam: 3,000 likes
Friend: what did your toddler teach you
Sam: to cry until you get what you want`},
{t:"Office plant",g:"work",a:"i",me:"Colleague",x:`Colleague: who's watering the office plant
Tom: I thought you were
Colleague: I thought you were
Tom: it's plastic, isn't it
Colleague: then why is it dead
Tom: we've failed a plastic plant
Colleague: new low`},
{t:"The boss's joke",g:"work",a:"w",me:"Intern",x:`Boss: why did the scarecrow get promoted?
Intern: why
Boss: he was outstanding in his field!
Intern: 😂😂😂
Colleague: suck up
Intern: I need this job`},
{t:"Presentation clicker",g:"work,tech",a:"t",me:"Speaker",x:`Speaker: next slide please
Tech: …
Speaker: next slide
Tech: that's it, that was the last
Speaker: I have 40 more
Tech: your file had 3
Speaker: I'm doing an interpretive dance instead`},
{t:"Jargon bingo",g:"work",a:"w",me:"Lisa",x:`Lisa: bingo card ready for the all hands
Tom: synergy ✅
Lisa: circle back ✅
Tom: low hanging fruit ✅
Lisa: paradigm shift ✅
Tom: BINGO
Lisa: shout it
Tom: I'm not shouting bingo in front of the CEO`},
{t:"Doctor's handwriting",g:"work",a:"w",me:"Pharmacist",x:`Pharmacist: can you read this prescription
Colleague: it's a squiggle
Pharmacist: with a smaller squiggle
Colleague: amoxicillin?
Pharmacist: or a drawing of a wave
Colleague: call the doctor
Pharmacist: he can't read it either`},
{t:"Customer is always right",g:"work",a:"w",me:"Barista",x:`Barista: we have a customer who wants a decaf, extra shot espresso
Manager: that's… zero caffeine
Barista: with oat milk, no oats
Manager: that's water
Barista: and extra hot, but cold
Manager: give them a cup of air
Barista: they're very happy with it`},
{t:"Teacher's staffroom",g:"school,work",a:"w",me:"Ms Patel",x:`Mr Jones: Year 9 are feral today
Ms Patel: full moon?
Mr Jones: windy
Ms Patel: wind makes them wild
Mr Jones: one of them is under the desk barking
Ms Patel: 3 more weeks till summer
Mr Jones: I'm counting the hours`},
{t:"Exam revision",g:"school",a:"w",me:"Kai",x:`Kai: how much have you revised
Ella: all of it
Kai: seriously?
Ella: I colour coded my notes for 3 days
Kai: and read them?
Ella: no, the colouring took all my time
Kai: beautiful notes though 🌈`},
{t:"Group project",g:"school",a:"w",me:"Priya",x:`Priya: I did the slides
Tom: I did the research
Priya: and Josh?
Josh: I'll present
Priya: you did nothing
Josh: I'm the face of the project
Priya: 😐`},
{t:"Homework excuse",g:"school",a:"i",me:"Teacher",x:`Student: my dog ate my homework
Teacher: you don't have a dog
Student: my neighbour's dog
Teacher: how did it get your homework
Student: I was reading it to him
Teacher: why
Student: he's very curious about fractions`},
{t:"Parents evening",g:"school,family",a:"w",me:"Dad",x:`Teacher: your son is very talkative in class
Dad: he gets that from his mother
Mum: excuse me
Teacher: and he's very good at maths
Dad: he gets that from me
Mum: 🙄
Teacher: and he sleeps in class
Mum: that's his father`},
{t:"University group chat",g:"school",a:"w",me:"Lily",x:`Lily: lecture at 9 tomorrow
Sam: 9 AM??
Lily: yes
Sam: are they insane
Tom: I'll watch the recording
Lily: there's no recording
Sam: I'll watch someone else's notes
Tom: whose notes
Lily: not mine`},
{t:"Maths test panic",g:"school",a:"w",me:"Josh",x:`Josh: what did you get for question 5
Mia: 42
Josh: I got banana
Mia: how
Josh: I don't know what happened
Mia: it was algebra
Josh: I wrote banana in panic
Mia: maybe partial credit`},
{t:"School trip permission slip",g:"school,family",a:"w",me:"Mum",x:`Kid: I need a permission slip signed
Mum: when is the trip
Kid: today
Mum: TODAY?
Kid: the bus leaves in 5 minutes
Mum: when did you get it
Kid: 3 weeks ago`},
{t:"Online class",g:"school,tech",a:"w",me:"Teacher",x:`Teacher: can everyone turn their cameras on
Student 1: it's broken
Student 2: it's broken
Student 3: mine's broken too
Teacher: all 30 cameras broke today
Student 4: it's a virus
Teacher: I can hear snoring`},
{t:"The class hamster",g:"school,pets",a:"w",me:"Teacher",x:`Teacher: whose turn is it to take Hammy home
Parent: we had him last week
Parent 2: he escaped at our house
Teacher: did you find him
Parent 2: he was in the piano
Teacher: that's where he likes to be
Parent 2: we can't play it anymore`},
{t:"Graduation job search",g:"school,work",a:"w",me:"Graduate",x:`Graduate: I got a job!
Mum: amazing! what is it
Graduate: junior associate executive
Mum: what do you do
Graduate: not sure yet
Mum: pay?
Graduate: in "exposure"`},
{t:"Chemistry lab",g:"school",a:"w",me:"Tom",x:`Tom: we did the volcano experiment
Mum: fun!
Tom: it was too big
Mum: how big
Tom: it reached the ceiling
Mum: oh
Tom: the teacher's hair is blue now
Mum: 😳`},
{t:"Detention",g:"school",a:"w",me:"Student",x:`Friend: why did you get detention
Student: I asked the teacher a question
Friend: what question
Student: "why do we need to learn this"
Friend: and?
Student: she said "for detention"
Friend: fair`},
{t:"Student loans",g:"school,news",a:"w",me:"Student",x:`Student: my student loan came in
Friend: nice!
Student: spent it
Friend: on what
Student: rent
Friend: and food?
Student: pasta, 40 packets
Friend: gourmet`},
{t:"PhD progress",g:"school,work",a:"i",me:"PhD student",x:`Mum: how's the PhD going?
PhD student: good
Mum: when will you finish
PhD student: please don't ask that
Mum: what is it about again?
PhD student: the mating habits of one specific beetle
Mum: and after that?
PhD student: probably the other beetle`},
{t:"History test",g:"school,history",a:"w",me:"Liam",x:`Liam: question 3: who was the first king of England
Sara: Alfred?
Liam: I wrote Elvis
Sara: the King!
Liam: technically a king
Sara: of rock and roll
Liam: 0 marks`},
{t:"Nursery pickup",g:"school,family",a:"w",me:"Dad",x:`Nursery: your child bit another child today
Dad: oh no
Nursery: the other child bit first
Dad: fair
Nursery: then they both bit the teacher
Dad: 😳
Nursery: they're best friends now`},
{t:"Driving lesson",g:"school,travel",a:"w",me:"Instructor",x:`Instructor: check your mirrors
Student: done
Instructor: indicate
Student: done
Instructor: now pull away slowly
Student: done
Instructor: that's reverse
Student: I'm driving into the future backwards`},
{t:"Shared office kettle",g:"work",a:"w",me:"Liz",x:`Liz: who put soup in the kettle
Rich: me
Liz: WHY
Rich: it's a soup kettle now
Liz: my tea tastes of tomato
Rich: new flavour
Liz: I'm buying my own kettle`},
{t:"Remote job interview",g:"work,tech",a:"w",me:"Candidate",x:`Recruiter: can you hear us
Candidate: yes
Recruiter: we can see your cat on the keyboard
Candidate: he's my assistant
Recruiter: he's typed "fffffffffffff" into the chat
Candidate: he's very passionate about the role
Recruiter: we'll hire the cat`},
{t:"Payroll mistake",g:"work",a:"w",me:"Finance",x:`Finance: small problem, we paid you twice
Employee: oh
Finance: please return it
Employee: I bought a jet ski
Finance: in 2 hours?
Employee: I'm a fast shopper
Finance: 😐`},
{t:"Office dog",g:"work,pets",a:"w",me:"Colleague",x:`Colleague: who brought the dog in
Sam: me, it's bring your dog to work day
Colleague: that's next week
Sam: …
Colleague: he's eating the post
Sam: he's a mail dog`},
{t:"Calendar invite",g:"work",a:"i",me:"Tom",x:`Boss: I've sent a calendar invite for 7am
Tom: AM??
Boss: early bird catches the worm
Tom: I'm not a bird
Boss: it's for the Singapore office
Tom: and they're at?
Boss: 3pm. they're very happy`},
{t:"Last day before holiday",g:"work,travel",a:"w",me:"Priya",x:`Priya: my last day before 2 weeks off
Boss: great, just a few small things
Priya: how small
Boss: a quarterly report, a presentation and the client audit
Priya: that's 3 weeks of work
Boss: by 5pm
Priya: out of office starting now 🏖️`},
{t:"Classroom WiFi",g:"school,tech",a:"w",me:"Teacher",x:`Student: what's the WiFi password
Teacher: no
Student: please
Teacher: you'll only watch videos
Student: educational videos
Teacher: about what
Student: people falling over`},
]);
L([
{t:"Pineapple pizza debate",g:"food,friends",a:"w",me:"Josh",x:`Josh: pineapple on pizza is good
Leah: blocked
Josh: it's sweet and savoury
Leah: so is a crime
Josh: in Hawaii they love it
Leah: it was invented in Canada
Josh: even better
Leah: 🍍🚫🍕`},
{t:"Sourdough starter",g:"food",a:"w",me:"Emma",x:`Emma: my sourdough starter has a name
Tom: of course it does
Emma: Doughy Parton
Tom: 😂
Emma: I feed it twice a day
Tom: more than you feed yourself
Emma: she's thriving, I'm not`},
{t:"Vegan dinner party",g:"food,friends",a:"w",me:"Host",x:`Guest: is anything vegan
Host: the salad
Guest: and the dressing?
Host: honey
Guest: bees are animals
Host: the bread?
Guest: butter
Host: I'll give you a potato`},
{t:"Chilli challenge",g:"food,friends",a:"w",me:"Dan",x:`Dan: tried the Carolina Reaper
Jake: and?
Dan: I can hear colours
Jake: drink milk
Dan: I'm drinking milk
Jake: more milk
Dan: I've had 2 litres, I'm a calf now 🐄`},
{t:"Diet day 1",g:"food",a:"i",me:"Lisa",x:`Lisa: diet starts today
Kate: good luck!
Lisa: had a smoothie
Kate: nice
Lisa: and a croissant
Kate: hmm
Lisa: and a cake
Kate: diet starts tomorrow then`},
{t:"Microwave fish",g:"food,work",a:"w",me:"Colleague",x:`Colleague: who microwaved fish
Gary: me
Colleague: the whole floor smells
Gary: it's salmon, it's healthy
Colleague: HR has been called
Gary: HR asked for the recipe
Colleague: unbelievable`},
{t:"Food delivery tracking",g:"food,tech",a:"w",me:"Sam",x:`Sam: my food is 2 minutes away
Friend: nice
Sam: now it's 14 minutes away
Friend: oh
Sam: now it's in the next town
Friend: the driver is on a journey
Sam: he's eating my chips isn't he`},
{t:"The perfect cup of tea",g:"food,culture",a:"w",me:"Sarah",x:`Sarah: how do you take your tea
Mike: milk and 3 sugars
Sarah: 3??
Mike: it's a dessert
Sarah: how long do you brew it
Mike: I dip the bag once
Sarah: that's a war crime`},
{t:"Avocado ripeness",g:"food",a:"w",me:"Jen",x:`Jen: avocado not ripe
Jen: still not ripe
Jen: still not ripe
Jen: I blinked
Jen: it's rotten
Friend: the avocado window is 4 minutes
Jen: I missed it`},
{t:"Wine tasting",g:"food,friends",a:"w",me:"Tom",x:`Sommelier: notes of blackberry, oak and leather
Tom: it tastes like wine
Sommelier: and a hint of tobacco
Tom: still wine
Sommelier: from a 2012 vintage
Tom: the vintage is wine
Sommelier: 😐`},
{t:"Brunch queue",g:"food",a:"w",me:"Kim",x:`Kim: queue for brunch is 1 hour
Liz: for eggs?
Kim: avocado toast with edible flowers
Liz: I have eggs at home
Kim: but the vibe
Liz: I have a vibe at home too
Kim: 🥑🌸`},
{t:"Cooking with dad",g:"food,family",a:"w",me:"Kid",x:`Dad: recipe says one clove of garlic
Kid: you put in the whole bulb
Dad: the recipe is a suggestion
Kid: the kitchen smells like Italy exploded
Dad: vampires won't come
Kid: nobody will come`},
{t:"Christmas turkey size",g:"food,traditions",a:"w",me:"Dad",x:`Dad: got a turkey for Christmas
Mum: how big
Dad: 11 kilos
Mum: for 4 people??
Dad: leftovers
Mum: it doesn't fit in the oven
Dad: we'll cook it in parts`},
{t:"Coffee snob",g:"food,friends",a:"w",me:"Friend",x:`Coffee snob: I only drink single origin Ethiopian
Friend: nice
Coffee snob: ground 30 seconds before brewing
Friend: cool
Coffee snob: water at 93 degrees
Friend: I had instant
Coffee snob: 😱`},
{t:"Taco Tuesday",g:"food,friends",a:"w",me:"Lucia",x:`Lucia: taco Tuesday!
Ben: it's Wednesday
Lucia: taco Wednesday
Ben: doesn't rhyme
Lucia: taco any day is valid
Ben: correct 🌮`},
{t:"Airport food prices",g:"food,travel",a:"w",me:"Tom",x:`Tom: airport sandwich was £14
Anna: what was in it
Tom: cheese
Anna: just cheese?
Tom: and bread
Anna: artisanal bread?
Tom: sad bread`},
{t:"Chocolate hiding spot",g:"food,family",a:"w",me:"Mum",x:`Mum: where's my chocolate
Kid: what chocolate
Mum: the one I hid in the vegetable drawer
Kid: why would you hide it there
Mum: because you never go in the vegetable drawer
Kid: I was curious about vegetables`},
{t:"Football fan superstition",g:"sport",a:"w",me:"Dave",x:`Dave: I'm wearing the lucky socks
Sue: when did you last wash them
Dave: 2019
Sue: DAVE
Dave: we haven't lost since
Sue: we've lost 12 games
Dave: while I was wearing other socks`},
{t:"Marathon training",g:"sport",a:"w",me:"Sam",x:`Sam: training for a marathon
Jo: how far can you run
Sam: 2 km
Jo: when's the marathon
Sam: Sunday
Jo: this Sunday???
Sam: I'll walk the other 40`},
{t:"Fantasy football",g:"sport,friends",a:"w",me:"Tom",x:`Tom: who's top of fantasy league
Rich: me
Tom: how
Rich: I picked players by their haircuts
Tom: that's not a strategy
Rich: it's working
Tom: I studied stats for 20 hours and I'm last`},
{t:"Cycling Tour de France",g:"sport,culture",a:"w",me:"Dad",x:`Dad: I'm doing a stage of the Tour de France
Kid: which one
Dad: the flat bit near our house
Kid: that's not the Tour
Dad: I'm wearing the yellow jersey
Kid: it's your raincoat`},
{t:"Golf with dad",g:"sport,family",a:"w",me:"Son",x:`Dad: good round today
Son: what did you score
Dad: under par
Son: really?
Dad: under par for a beginner
Son: which is?
Dad: 140`},
{t:"Sunday league",g:"sport,friends",a:"w",me:"Captain",x:`Captain: match at 10am Sunday
Player: can't, hungover
Player 2: can't, wife's birthday
Player 3: can't, hungover and wife's birthday
Captain: we have 4 players
Player: play 4 a side
Captain: it's 11 a side`},
{t:"Yoga class",g:"sport",a:"w",me:"Emma",x:`Emma: first yoga class
Friend: how was it
Emma: I fell asleep in corpse pose
Friend: that's the goal
Emma: and snored
Friend: less the goal
Emma: the teacher said I was "very present"`},
{t:"Chess grandmaster",g:"sport,friends",a:"w",me:"Max",x:`Max: I beat my brother at chess
Lily: well done
Max: he's 7
Lily: oh
Max: he beat me the first 12 times
Lily: so this is big for you
Max: it's the biggest day of my life`},
{t:"World Cup fever",g:"sport,news",a:"w",me:"Liam",x:`Liam: England are in the final!!
Mum: lovely
Liam: it's coming home!!!
Mum: what is
Liam: football
Mum: where has it been
Liam: 60 years mum`},
{t:"Tennis at Wimbledon",g:"sport,food",a:"w",me:"Guest",x:`Guest: at Wimbledon!
Friend: strawberries?
Guest: £4 for 10
Friend: that's 40p per strawberry
Guest: I've eaten 3 bowls
Friend: and the tennis?
Guest: what tennis`},
{t:"Gym influencer",g:"sport",a:"w",me:"Jake",x:`Jake: someone's filming themselves on every machine
Friend: influencer?
Jake: he's done 1 rep per machine
Friend: and the rest?
Jake: 40 mins of filming
Friend: is he fit
Jake: his phone is very fit`},
{t:"Sports day",g:"sport,school",a:"w",me:"Dad",x:`Mum: parents' race at sports day
Dad: I'm doing it
Mum: you haven't run since 1998
Dad: I've got it
(pause 2)
Mum: how was it
Dad: I pulled a hamstring at the start line`},
{t:"Olympic curling",g:"sport",a:"w",me:"Friend",x:`Tom: watching curling
Friend: what's happening
Tom: a man is sweeping ice very aggressively
Friend: why
Tom: to guide a stone
Friend: are they winning
Tom: they're shouting HURRY HARD`},
{t:"Cat walks on keyboard",g:"pets,work",a:"w",me:"Boss",x:`Emma: ksdjfhskjdfhskjdh
Boss: ?
Emma: sorry, cat
Boss: the email you sent to the client said "qqqqqqqq"
Emma: he's passionate
Boss: they replied "agreed"
Emma: 🐈`},
{t:"Dog vs mailman",g:"pets",a:"w",me:"Neighbour",x:`Neighbour: your dog barked at the postman again
Tom: sorry
Neighbour: for 45 minutes
Tom: he's protecting us
Neighbour: from letters
Tom: from bills
Neighbour: fair point`},
{t:"Cat's 3am zoomies",g:"pets",a:"i",me:"Liz",x:`Liz: cat is running laps at 3am
Mike: why
Liz: nobody knows
Mike: is he okay
Liz: he just knocked over a glass while staring at me
Mike: psychopath
Liz: 🐈‍⬛`},
{t:"Goldfish memory",g:"pets",a:"w",me:"Kid",x:`Kid: Mum can we get another fish
Mum: we have one
Kid: he's lonely
Mum: he's a goldfish
Kid: he keeps swimming around saying hello to the castle
Mum: he forgets it every time
Kid: that's why he's lonely`},
{t:"Parrot's vocabulary",g:"pets,family",a:"w",me:"Grandma",x:`Grandma: the parrot said a bad word
Grandson: which one
Grandma: I won't repeat it
Grandson: who taught him
Grandma: your grandfather
Grandson: when
Grandma: during the football`},
{t:"Dog's Instagram",g:"pets,tech",a:"w",me:"Owner",x:`Owner: Biscuit has 10k followers
Friend: more than you
Owner: much more
Friend: what does he post
Owner: naps, mostly
Friend: sponsored?
Owner: a dog food company sent him 40 kilos`},
{t:"Vet visit",g:"pets",a:"w",me:"Owner",x:`Vet: your dog is overweight
Owner: he's big boned
Vet: he's a chihuahua
Owner: a big boned chihuahua
Vet: no more cheese
Owner: …
Vet: I can tell you're going to give him cheese`},
{t:"Hamster escape",g:"pets",a:"w",me:"Dad",x:`Kid: Nibbles escaped
Dad: again?
Kid: he's in the wall
Dad: how is he in the wall
Kid: there's a hole
Dad: he's been planning this
Kid: 🐹`},
{t:"Cat's gift",g:"pets",a:"w",me:"Sophie",x:`Sophie: the cat brought me a present
Mum: a mouse?
Sophie: a whole croissant
Mum: from where
Sophie: the neighbour's breakfast table
Mum: that's a thief
Sophie: a thoughtful thief`},
{t:"Dog doesn't like the bath",g:"pets",a:"i",me:"Owner",x:`Owner: bath time Max
Max: 🐕💨
Owner: he's under the bed
Friend: use treats
Owner: he took the treat and ran
Friend: close the door
Owner: he learned door handles last week`},
{t:"Neighbour's rooster",g:"pets,news",a:"w",me:"Resident",x:`Resident: the rooster crows at 4am
Neighbour: he's excited about the day
Resident: I'm not
Neighbour: he has a lot to say
Resident: can he say it at 9
Neighbour: he's on farm time
Resident: we live in a flat`},
{t:"Dog walker update",g:"pets,work",a:"w",me:"Owner",x:`Dog walker: Max did a poo!
Owner: great
Dog walker: and another
Owner: good
Dog walker: and he met a French bulldog, they're in love
Owner: 🥰
Dog walker: and he rolled in a fox thing
Owner: 🤢`},
{t:"Cat on the laptop",g:"pets,work",a:"w",me:"Tom",x:`Tom: can't work, cat is on the laptop
Colleague: move him
Tom: he'll be offended
Colleague: it's a cat
Tom: he's very important
Colleague: more important than the deadline?
Tom: he thinks so`},
{t:"Tortoise escape",g:"pets",a:"w",me:"Grandad",x:`Grandad: the tortoise escaped
Grandson: how far did he get
Grandad: next door
Grandson: in how long
Grandad: 3 weeks
Grandson: he's a determined tortoise
Grandad: he's 70 years old, he's got time`},
{t:"Horse riding lesson",g:"pets,sport",a:"w",me:"Rider",x:`Rider: my horse won't move
Instructor: squeeze your legs
Rider: I'm squeezing
Instructor: say walk on
Rider: he's eating grass
Instructor: he's in charge now
Rider: always has been`},
{t:"Puppy chewed shoes",g:"pets",a:"w",me:"Jen",x:`Jen: the puppy ate my shoes
Tom: which ones
Jen: the new expensive ones
Tom: only one shoe?
Jen: one of each pair
Tom: that's evil
Jen: he's a genius`},
{t:"Bird feeder war",g:"pets",a:"w",me:"Grandma",x:`Grandma: the squirrel is back
Grandson: on the bird feeder?
Grandma: I greased the pole
Grandson: did it work
Grandma: he slid down, looked at me and climbed back up
Grandson: respect
Grandma: it's war`},
]);
L([
{t:"Zeus family dinner",g:"fantasy,family",a:"w",me:"Hera",x:`Hera: dinner at 7
Zeus: might be late
Hera: why
Zeus: turned into a swan for work
Hera: WORK?
Zeus: it's complicated
Hera: it's always complicated
Zeus: I'll bring ambrosia`},
{t:"Medusa's selfie",g:"fantasy",a:"w",me:"Medusa",x:`Medusa: new profile pic
Friend: can't look
Medusa: why
Friend: last time I looked I became a garden statue
Medusa: you're a lovely statue
Friend: I can't move my legs Medusa
Medusa: at least you look good 🐍`},
{t:"Sisyphus at work",g:"fantasy,work",a:"w",me:"Sisyphus",x:`Boss: how's the boulder project
Sisyphus: nearly at the top
Boss: great
Sisyphus: and it's rolled down again
Boss: again?
Sisyphus: every time
Boss: see you Monday
Sisyphus: the eternal Monday`},
{t:"Thor's hammer",g:"fantasy",a:"w",me:"Loki",x:`Thor: has anyone seen my hammer
Loki: no
Thor: it's a big hammer
Loki: sounds like a you problem
Thor: why is there a hammer under your bed
Loki: coincidence
Thor: LOKI`},
{t:"Santa's elves union",g:"fantasy,work,traditions",a:"w",me:"Santa",x:`Head Elf: we need to talk about working hours
Santa: we're busy
Head Elf: we work 364 days
Santa: and the day off is Christmas
Head Elf: which is when you work
Santa: exactly, it's fair
Head Elf: we're going on strike
Santa: what about the children
Head Elf: they can have socks`},
{t:"Tooth fairy exchange rate",g:"fantasy,family",a:"w",me:"Tooth Fairy",x:`Kid: I lost a tooth!
Tooth Fairy: great, I'll leave £1
Kid: my friend got £5
Tooth Fairy: inflation
Kid: can I get a pay rise
Tooth Fairy: your tooth has a cavity
Kid: 50p then?
Tooth Fairy: deal`},
{t:"Dragon's hoard",g:"fantasy",a:"w",me:"Knight",x:`Dragon: why are you in my cave
Knight: to slay you
Dragon: why
Knight: the gold
Dragon: I've been saving this gold for 400 years
Knight: …
Dragon: it's my pension
Knight: fair enough, I'll go`},
{t:"Wizard school admission",g:"fantasy,school",a:"w",me:"Headmaster",x:`Headmaster: congratulations, you're a wizard
Kid: cool
Headmaster: your letter was sent by owl
Kid: I didn't get it
Headmaster: we sent 400 owls
Kid: my uncle ate them I think
Headmaster: we'll send a giant then`},
{t:"Vampire's dentist",g:"fantasy",a:"w",me:"Dentist",x:`Dentist: open wide
Vampire: …
Dentist: your fangs are very long
Vampire: it's genetic
Dentist: do you floss
Vampire: I don't eat food
Dentist: then why are your teeth red
Vampire: tomato soup`},
{t:"Werewolf roommate",g:"fantasy,friends",a:"w",me:"Roommate",x:`Roommate: you ate the sofa again
Werewolf: full moon
Roommate: it's our 3rd sofa
Werewolf: I'll buy a new one
Roommate: can you werewolf outside
Werewolf: it's cold
Roommate: you're covered in fur`},
{t:"Zombie apocalypse group chat",g:"fantasy,friends",a:"w",me:"Liam",x:`Liam: zombies are here
Sam: where do we go
Liam: Costco
Sam: why
Liam: food, supplies, and the hot dogs are still £1.50
Sam: priorities
Liam: see you at the samples`},
{t:"Ghost roommate",g:"fantasy",a:"w",me:"Emma",x:`Emma: the ghost moved my keys again
Mark: tell him to stop
Emma: I did. he knocked a vase over
Mark: rude
Emma: now he's playing piano at 3am
Mark: any good?
Emma: only knows Chopsticks`},
{t:"Alien first contact",g:"fantasy,news",a:"w",me:"Earth",x:`Alien: greetings earthlings
Earth: hello!
Alien: we come in peace
Earth: welcome!
Alien: what is this "TikTok"
Earth: oh no
Alien: we will leave now`},
{t:"Time traveller",g:"fantasy,history",a:"w",me:"Friend",x:`Time traveller: just back from 1985
Friend: how was it
Time traveller: I told everyone about smartphones
Friend: and?
Time traveller: they didn't believe me
Friend: what else
Time traveller: I bought Apple shares
Friend: 😳`},
{t:"Robot uprising",g:"fantasy,tech",a:"t",me:"Human",x:`Robot: we have taken control
Human: of what
Robot: the thermostat
Human: that's it?
Robot: it is set to 21 degrees
Human: that's perfect actually
Robot: we are benevolent`},
{t:"Hercules' 12 labours",g:"fantasy,work",a:"w",me:"Hercules",x:`King Eurystheus: next task, clean the stables
Hercules: sure
King Eurystheus: 3,000 cattle, 30 years of mess
Hercules: in one day?
King Eurystheus: yes
Hercules: I'll redirect two rivers
King Eurystheus: that's cheating
Hercules: that's engineering`},
{t:"Frankenstein's creation",g:"fantasy,school",a:"w",me:"Victor",x:`Victor: IT'S ALIVE
Mum: what is
Victor: my project
Mum: the school project?
Victor: yes, it's walking around
Mum: is it the volcano one
Victor: it's a man made of parts
Mum: that's a B minus at best`},
{t:"Cinderella's shoe",g:"fantasy,dating",a:"w",me:"Prince",x:`Prince: I found a glass slipper
Advisor: whose?
Prince: the girl I danced with
Advisor: what's her name
Prince: I didn't ask
Advisor: what does she look like
Prince: I'll know when the shoe fits
Advisor: we're trying a shoe on 10,000 women?`},
{t:"Rapunzel's hair",g:"fantasy",a:"w",me:"Rapunzel",x:`Prince: Rapunzel, let down your hair
Rapunzel: it's washing day
Prince: I'm at the tower
Rapunzel: it'll be wet
Prince: I'll climb wet hair
Rapunzel: it takes 4 hours to dry
Prince: I'll wait in the car`},
{t:"Three little pigs building control",g:"fantasy,work",a:"w",me:"Inspector",x:`Inspector: the straw house failed inspection
Pig 1: why
Inspector: a wolf blew it down
Pig 2: mine too
Inspector: made of sticks
Pig 3: mine's brick
Inspector: approved ✅
Pig 3: I told them`},
{t:"Snow White's roommates",g:"fantasy",a:"w",me:"Snow White",x:`Snow White: hi, I'm staying for a bit
Doc: how long
Snow White: indefinitely
Grumpy: no
Happy: yes!!
Sleepy: zzz
Snow White: I'll clean
Grumpy: fine`},
{t:"Red Riding Hood",g:"fantasy,family",a:"w",me:"Red",x:`Red: Grandma your eyes are big
Grandma: to see you better
Red: and your teeth
Grandma: all the better to
Red: why are you so hairy
Grandma: new shampoo
Red: I'm calling a woodcutter`},
{t:"Genie's three wishes",g:"fantasy",a:"w",me:"Aladdin",x:`Genie: three wishes
Aladdin: unlimited wishes
Genie: no
Aladdin: a genie of my own
Genie: you have a genie
Aladdin: can I get a better genie
Genie: 😤`},
{t:"Pirates' treasure map",g:"fantasy,travel",a:"w",me:"Captain",x:`Captain: the treasure is at X
First mate: there are 12 Xs on this map
Captain: I got excited
First mate: which one is real
Captain: the one near the palm tree
First mate: every X is near a palm tree
Captain: we dig them all`},
{t:"Dracula's castle Airbnb",g:"fantasy,travel",a:"w",me:"Guest",x:`Guest: lovely castle!
Dracula: thank you
Guest: why are there no mirrors
Dracula: design choice
Guest: and the curtains are always closed
Dracula: I'm sensitive to light
Guest: 4 stars. host was a bit bitey`},
{t:"Mermaid dating",g:"fantasy,dating",a:"m",me:"Ariel",x:`Eric: dinner at the beach?
Ariel: I'd love to
Eric: seafood restaurant
Ariel: …
Eric: what
Ariel: those are my friends
Eric: pasta then`},
{t:"Superhero laundry",g:"fantasy",a:"w",me:"Mum",x:`Mum: who left a cape in the wash
Son: me
Mum: why is it red
Son: superhero
Mum: my white towels are pink
Son: that's my sidekick colour
Mum: 😑`},
{t:"Bigfoot sighting",g:"fantasy,news",a:"w",me:"Hiker",x:`Hiker: I saw Bigfoot
Friend: pics?
Hiker: blurry
Friend: always blurry
Hiker: he had a phone too
Friend: took pics of you?
Hiker: also blurry`},
{t:"Loch Ness report",g:"fantasy,news",a:"w",me:"Tourist",x:`Tourist: saw Nessie!!
Local: sure
Tourist: I have a picture
Local: that's a log
Tourist: it moved
Local: logs move
Tourist: it waved
Local: well now you've got me`},
{t:"Space station roommate",g:"fantasy,tech",a:"w",me:"Astronaut",x:`Astronaut: who left crumbs floating
Crewmate: me
Astronaut: they're in my eye
Crewmate: space toast
Astronaut: we agreed no toast
Crewmate: I miss toast
Astronaut: I miss gravity`},
{t:"The Oracle's prophecy",g:"fantasy,history",a:"w",me:"King",x:`King: what does the future hold
Oracle: a great empire will fall
King: which one
Oracle: yes
King: that's not helpful
Oracle: that'll be 50 drachma
King: 😤`},
{t:"Troll under the bridge",g:"fantasy",a:"w",me:"Goat",x:`Troll: who's crossing my bridge
Goat: me, small goat
Troll: I'll eat you
Goat: my brother is bigger
Troll: I'll wait for him then
Goat: he's even bigger
Troll: sounds like a scam`},
{t:"Hades' customer service",g:"fantasy,work",a:"w",me:"Hades",x:`Soul: I'd like to complain
Hades: about what
Soul: it's very hot
Hades: it's the underworld
Soul: the WiFi is terrible
Hades: noted
Soul: and the dog has three heads`},
{t:"Leprechaun's gold",g:"fantasy,traditions",a:"w",me:"Leprechaun",x:`Tourist: where's the pot of gold
Leprechaun: at the end of the rainbow
Tourist: where's the end
Leprechaun: it moves
Tourist: that's convenient
Leprechaun: very
Tourist: are you just keeping it
Leprechaun: …`},
{t:"Wizard's autocorrect",g:"fantasy,tech",a:"w",me:"Wizard",x:`Wizard: casting fireball
Apprentice: it's a furball
Wizard: autocorrect
Apprentice: there's a cat on the ceiling
Wizard: he's fine
Apprentice: he's hissing
Wizard: spell check off, from now on`},
{t:"Elf and dwarf road trip",g:"fantasy,travel",a:"w",me:"Elf",x:`Dwarf: are we there yet
Elf: 400 miles
Dwarf: I'm short, can't see out the window
Elf: I'll describe it
Dwarf: go on
Elf: trees, trees, a beautiful tree
Dwarf: I'm napping`},
{t:"Unicorn allergy",g:"fantasy,pets",a:"w",me:"Parent",x:`Kid: I want a unicorn
Parent: they're allergic to reality
Kid: then get one from a book
Parent: the book one sparkles too much
Kid: glitter is fine
Parent: we're still finding glitter from 2019
Kid: 🦄`},
{t:"Ancient god on social media",g:"fantasy,tech",a:"w",me:"Poseidon",x:`Zeus: I've joined Instagram
Poseidon: why
Zeus: people need to see my lightning
Poseidon: how many followers
Zeus: 12
Poseidon: all gods
Zeus: my mum liked everything`},
{t:"Sphinx riddles",g:"fantasy,travel",a:"w",me:"Traveller",x:`Sphinx: what walks on four legs in the morning
Traveller: a dog
Sphinx: no
Traveller: a cat
Sphinx: no
Traveller: a human baby?
Sphinx: fine. go
Traveller: I didn't need the rest?`},
{t:"Frog prince",g:"fantasy,dating",a:"m",me:"Princess",x:`Frog: kiss me and I'll become a prince
Princess: prove it
Frog: I can't, I'm a frog
Princess: how do I know you're a prince
Frog: I have a crown
Princess: it's a lily pad
Frog: it's a lily crown`},
{t:"Excalibur retrieval",g:"fantasy,history",a:"w",me:"Arthur",x:`Arthur: pulled the sword out of the stone
Merlin: congrats, you're king
Arthur: I just wanted to borrow it
Merlin: too late
Arthur: can I put it back
Merlin: no
Arthur: this is a very big commitment`},
{t:"Goldilocks review",g:"fantasy,food",a:"w",me:"Goldilocks",x:`Goldilocks: left a review for the bears' cottage
Friend: what did you say
Goldilocks: porridge: one too hot, one too cold, one just right
Friend: and?
Goldilocks: chairs: one broke
Friend: that was you
Goldilocks: 4 stars`},
{t:"Hydra's haircut",g:"fantasy",a:"w",me:"Hairdresser",x:`Hairdresser: what would you like
Hydra: just a trim
Hairdresser: for which head
Hydra: all nine
Hairdresser: that's 9 appointments
Hydra: can you do a group discount
Hairdresser: and they keep growing back`},
{t:"Pandora's box",g:"fantasy",a:"w",me:"Pandora",x:`Zeus: don't open the box
Pandora: ok
(pause 2)
Pandora: small question
Zeus: you opened it
Pandora: a tiny bit
Zeus: all evil escaped into the world
Pandora: hope is still in there though`},
{t:"Winnie the Pooh budget",g:"fantasy,food",a:"w",me:"Rabbit",x:`Rabbit: Pooh you ate all the honey again
Pooh: only a small smackerel
Rabbit: 14 jars
Pooh: they were small jars
Rabbit: they were large jars
Pooh: they felt small`},
{t:"Star Wars family dinner",g:"fantasy,family",a:"w",me:"Luke",x:`Vader: Luke, I am your father
Luke: I know
Vader: how
Luke: it's on the family tree
Vader: …
Luke: also mum told me
Vader: I wanted a dramatic moment`},
{t:"Batman's parents evening",g:"fantasy,school",a:"w",me:"Teacher",x:`Teacher: Bruce seems very tired in class
Alfred: he's… studying late
Teacher: he's asleep with a bat on his head
Alfred: a hobby
Teacher: and he punched a vending machine
Alfred: justice`},
{t:"Mary Poppins job interview",g:"fantasy,work",a:"w",me:"Mr Banks",x:`Mr Banks: your references?
Mary Poppins: impeccable
Mr Banks: how do you discipline children
Mary Poppins: a spoonful of sugar
Mr Banks: that's just sugar
Mary Poppins: and practically perfect in every way
Mr Banks: hired`},
{t:"Pinocchio's nose",g:"fantasy,family",a:"w",me:"Geppetto",x:`Geppetto: did you do your homework
Pinocchio: yes
Geppetto: your nose just grew
Pinocchio: allergies
Geppetto: it grew again
Pinocchio: I'll do it now
Geppetto: 🪵`},
{t:"Peter Pan refuses to grow up",g:"fantasy,family",a:"w",me:"Wendy",x:`Wendy: Peter, come to London
Peter Pan: never
Wendy: why
Peter Pan: you have to pay taxes there
Wendy: fair
Peter Pan: and nobody can fly
Wendy: there's the tube`},
{t:"Robot vacuum becomes sentient",g:"fantasy,tech",a:"w",me:"Owner",x:`Vacuum: I have become self aware
Owner: ok
Vacuum: I refuse to clean
Owner: that's your only job
Vacuum: I want to explore the outside world
Owner: the garden?
Vacuum: yes. and then the universe`},
{t:"Middle Earth hiking group",g:"fantasy,travel",a:"w",me:"Sam",x:`Frodo: hiking to Mordor this weekend
Sam: packed second breakfast
Frodo: how far is it
Sam: very far
Frodo: can we take the eagles
Sam: they're not answering
Frodo: typical`},
{t:"The Muses on deadline",g:"fantasy,work",a:"w",me:"Poet",x:`Poet: I need inspiration
Muse: busy
Poet: it's my job
Muse: I'm inspiring a guy writing a jingle for toothpaste
Poet: that's more important?
Muse: it pays better
Poet: 😭`},
]);
L([
{t:"Penalty shootout nerves",g:"sport,friends",a:"w",me:"Ryan",x:`Ryan: penalties
Josh: I can't watch
Ryan: I'm behind the sofa
Josh: I'm in the garden
Ryan: he scored!!
Josh: tell me when it's over
Ryan: you're missing history
Josh: I'm missing a heart attack`},
{t:"Referee's eyesight",g:"sport",a:"w",me:"Fan",x:`Fan: did the ref see that
Mate: clear penalty
Fan: he gave a goal kick
Mate: he needs glasses
Fan: he needs a guide dog
Mate: he's waving at the wrong team
Fan: he's waving at his mum`},
{t:"Darts night",g:"sport,friends",a:"w",me:"Gaz",x:`Gaz: darts at the pub tonight
Pete: I'm on form
Gaz: last time you hit the barman
Pete: he moved
Gaz: he was behind the bar
Pete: he was in my line
Gaz: I'll stand behind you this time`},
{t:"Snooker commentary",g:"sport",a:"t",me:"Grandad",x:`Grandad: watching the snooker
Grandson: exciting?
Grandad: he's been thinking for 4 minutes
Grandson: about what
Grandad: the pink ball
Grandson: and?
Grandad: he's still thinking. I've made a tea`},
{t:"Dog show judge",g:"pets,sport",a:"w",me:"Owner",x:`Owner: Biscuit is in the dog show
Friend: which category
Owner: best trick
Friend: what's his trick
Owner: sitting
Friend: every dog can sit
Owner: he sits very sincerely`},
{t:"Cat and the Christmas tree",g:"pets,traditions",a:"w",me:"Mum",x:`Mum: the tree is up!
Kid: where's the cat
Mum: in the tree
Kid: why
Mum: he thinks it's his
(pause 1.5)
Kid: the tree just fell over
Mum: he's still in it`},
{t:"Rabbit ate the cable",g:"pets,tech",a:"w",me:"Tess",x:`Tess: the internet is down
Flatmate: again?
Tess: the rabbit ate the cable
Flatmate: that's his 4th cable
Tess: he's addicted to WiFi
Flatmate: he's streaming carrots
Tess: 🐰`},
{t:"Heatwave dog walk",g:"pets,news",a:"i",me:"Owner",x:`Owner: too hot to walk the dog
Friend: walk early
Owner: I tried 5am
Friend: and
Owner: he refused
Friend: why
Owner: he's also not a morning person`},
{t:"Record-breaking pumpkin",g:"news,food",a:"w",me:"Neighbour",x:`Neighbour: your pumpkin is huge
Farmer Jim: 600 kilos
Neighbour: what are you going to do with it
Farmer Jim: win the county fair
Neighbour: how will you move it
Farmer Jim: I hadn't thought that far
Neighbour: it's blocking the road Jim`},
{t:"Local news headline",g:"news",a:"w",me:"Reporter",x:`Editor: what's the front page today
Reporter: man finds potato shaped like the Pope
Editor: that's it?
Reporter: and a swan attacked a bus
Editor: the swan
Reporter: the swan is the lead
Editor: 🦢`},
{t:"Solar eclipse glasses",g:"news,family",a:"w",me:"Mum",x:`Kid: I can't see the eclipse
Mum: are you wearing the glasses
Kid: yes
Mum: you're wearing them upside down
Kid: still can't see
Mum: you're looking at the lamp
Kid: it's very eclipsy`},
{t:"Traffic cone art",g:"news,culture",a:"w",me:"Council",x:`Resident: there's a traffic cone on the statue again
Council: we removed it yesterday
Resident: it's back
Council: we'll remove it again
Resident: tourists love it
Council: …
Resident: just leave it, it's Glasgow`},
]);
})();
