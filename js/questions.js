/*
 * Daylit question bank.
 * Authoring rule: the CORRECT option is always written first (o[0]).
 * Options are shuffled at runtime with a seeded shuffle, so every player
 * sees the same order on the same day.
 *
 * c = category key (see i18n "cat.*"), q = question, o = options, e = short explanation.
 * Keep wording simple: most players read English as a second language.
 */
(function (root) {
  const BANK = [
    // ── Meaning ─────────────────────────────────────────────
    { c: 'meaning', q: 'What does “rapid” mean?', o: ['Very fast', 'Very slow', 'Very loud', 'Very old'], e: '“Rapid” means very fast. A rapid train is a fast train.' },
    { c: 'meaning', q: 'What does “ancient” mean?', o: ['Very old', 'Very new', 'Very small', 'Very cheap'], e: '“Ancient” means very old, like an ancient temple.' },
    { c: 'meaning', q: 'What does “fragile” mean?', o: ['Easy to break', 'Very heavy', 'Very strong', 'Hard to find'], e: 'A fragile glass breaks easily. Handle it with care.' },
    { c: 'meaning', q: 'What does “generous” mean?', o: ['Happy to give', 'Afraid of people', 'Always late', 'Very quiet'], e: 'A generous person likes to share and give to others.' },
    { c: 'meaning', q: 'What does “enormous” mean?', o: ['Very big', 'Very thin', 'Very short', 'Very kind'], e: '“Enormous” means very, very big. An elephant is enormous.' },
    { c: 'meaning', q: 'What does “tidy” mean?', o: ['Clean and in order', 'Dirty and messy', 'Wet and cold', 'Old and broken'], e: 'A tidy room is clean, with everything in its place.' },
    { c: 'meaning', q: 'What does “brave” mean?', o: ['Not afraid', 'Very tired', 'Very hungry', 'Not honest'], e: 'A brave person does hard things even when they feel fear.' },
    { c: 'meaning', q: 'What does “arrive” mean?', o: ['Reach a place', 'Leave a place', 'Forget a place', 'Clean a place'], e: 'The bus will arrive at 9. It will reach the stop at 9.' },
    { c: 'meaning', q: 'What does “borrow” mean?', o: ['Take and give back later', 'Buy for yourself', 'Throw away', 'Make by hand'], e: 'When you borrow a pen, you return it later.' },
    { c: 'meaning', q: 'What does “purchase” mean?', o: ['Buy', 'Sell', 'Repair', 'Lose'], e: '“Purchase” is a formal word for “buy”.' },

    // ── Opposite ────────────────────────────────────────────
    { c: 'opposite', q: 'What is the opposite of “early”?', o: ['Late', 'Soon', 'Quick', 'First'], e: 'Early ↔ late. “I came early, he came late.”' },
    { c: 'opposite', q: 'What is the opposite of “cheap”?', o: ['Expensive', 'Free', 'Small', 'Easy'], e: 'Cheap ↔ expensive. Expensive things cost a lot.' },
    { c: 'opposite', q: 'What is the opposite of “empty”?', o: ['Full', 'Open', 'Clean', 'Light'], e: 'Empty ↔ full. A full bottle has no space left.' },
    { c: 'opposite', q: 'What is the opposite of “heavy”?', o: ['Light', 'Thick', 'Strong', 'Hard'], e: 'Heavy ↔ light. A feather is light.' },
    { c: 'opposite', q: 'What is the opposite of “accept”?', o: ['Refuse', 'Agree', 'Allow', 'Receive'], e: 'Accept ↔ refuse. To refuse is to say no.' },
    { c: 'opposite', q: 'What is the opposite of “increase”?', o: ['Decrease', 'Improve', 'Add', 'Grow'], e: 'Increase ↔ decrease. Prices can go up or come down.' },
    { c: 'opposite', q: 'What is the opposite of “polite”?', o: ['Rude', 'Kind', 'Calm', 'Shy'], e: 'Polite ↔ rude. A rude person does not show respect.' },
    { c: 'opposite', q: 'What is the opposite of “wide”?', o: ['Narrow', 'Long', 'Tall', 'Deep'], e: 'Wide ↔ narrow. A narrow road has little space.' },
    { c: 'opposite', q: 'What is the opposite of “success”?', o: ['Failure', 'Victory', 'Effort', 'Luck'], e: 'Success ↔ failure.' },
    { c: 'opposite', q: 'What is the opposite of “remember”?', o: ['Forget', 'Repeat', 'Notice', 'Learn'], e: 'Remember ↔ forget. “I forgot my keys.”' },

    // ── Fill the gap ────────────────────────────────────────
    { c: 'gap', q: 'She ___ to school every day.', o: ['goes', 'go', 'going', 'gone'], e: 'With he / she / it in the present, add “-s”: she goes.' },
    { c: 'gap', q: 'I have lived here ___ 2019.', o: ['since', 'for', 'from', 'at'], e: 'Use “since” with a starting point in time: since 2019.' },
    { c: 'gap', q: 'They ___ watching TV when I called.', o: ['were', 'was', 'are', 'is'], e: '“They” takes “were” in the past.' },
    { c: 'gap', q: 'This is ___ best tea in town.', o: ['the', 'a', 'an', 'some'], e: 'Use “the” before “best”: the best tea.' },
    { c: 'gap', q: 'He is good ___ cricket.', o: ['at', 'in', 'on', 'for'], e: 'We say “good at” something.' },
    { c: 'gap', q: 'Can you ___ me the salt, please?', o: ['pass', 'passing', 'passed', 'to pass'], e: 'After “can you”, use the base verb: can you pass…' },
    { c: 'gap', q: 'I ___ my phone yesterday.', o: ['lost', 'lose', 'losing', 'loses'], e: '“Yesterday” is the past, so use “lost”.' },
    { c: 'gap', q: 'There are ___ apples in the box.', o: ['some', 'much', 'a', 'an'], e: 'Use “some” with plural things you can count.' },
    { c: 'gap', q: 'She is taller ___ her brother.', o: ['than', 'then', 'that', 'as'], e: 'To compare, use “than”: taller than.' },
    { c: 'gap', q: 'We will meet ___ Monday.', o: ['on', 'in', 'at', 'by'], e: 'Use “on” with days: on Monday.' },

    // ── Spelling ────────────────────────────────────────────
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Necessary', 'Neccessary', 'Necesary', 'Neccesary'], e: 'One “c”, two “s”: neCeSSary.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Beautiful', 'Beautifull', 'Beutiful', 'Beatiful'], e: 'B-E-A-U-tiful, with one “l” at the end.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Receive', 'Recieve', 'Receeve', 'Recive'], e: 'After “c”, write “ei”: receive.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Tomorrow', 'Tommorow', 'Tomorow', 'Tommorrow'], e: 'One “m”, two “r”: tomorrow.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Business', 'Bussiness', 'Busness', 'Buisness'], e: 'Busi-ness: “busi” then “ness”.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Different', 'Diffrent', 'Differant', 'Diferent'], e: 'Two “f”, and “-ent” at the end.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Government', 'Goverment', 'Governmant', 'Govenment'], e: 'It comes from “govern” + “ment”.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Address', 'Adress', 'Addres', 'Adres'], e: 'Two “d” and two “s”: address.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Calendar', 'Calender', 'Calandar', 'Calander'], e: 'It ends in “-dar”: calendar.' },
    { c: 'spelling', q: 'Which spelling is correct?', o: ['Separate', 'Seperate', 'Separete', 'Seprate'], e: 'Remember: there is “a rat” in sep-A-RAT-e.' },

    // ── Odd one out ─────────────────────────────────────────
    { c: 'odd', q: 'Which word does not belong?', o: ['Carrot', 'Apple', 'Mango', 'Banana'], e: 'Carrot is a vegetable. The others are fruits.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Table', 'Red', 'Blue', 'Green'], e: 'Table is a thing. The others are colours.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Hospital', 'Doctor', 'Teacher', 'Farmer'], e: 'Hospital is a place. The others are jobs.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Happy', 'Run', 'Jump', 'Swim'], e: 'Happy is a feeling. The others are actions.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['March', 'Monday', 'Friday', 'Sunday'], e: 'March is a month. The others are days.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Sparrow', 'Cow', 'Goat', 'Horse'], e: 'A sparrow is a bird. The others are farm animals.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Spoon', 'Pen', 'Pencil', 'Marker'], e: 'You eat with a spoon. You write with the others.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Stone', 'Rain', 'Snow', 'Wind'], e: 'Stone is not weather. The others are.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Bucket', 'Shirt', 'Trousers', 'Kurta'], e: 'A bucket is not clothing.' },
    { c: 'odd', q: 'Which word does not belong?', o: ['Many', 'Two', 'Seven', 'Ten'], e: '“Many” is not an exact number.' },

    // ── Quick math ──────────────────────────────────────────
    { c: 'math', q: '12 + 15 = ?', o: ['27', '25', '28', '37'], e: '12 + 15 = 27.' },
    { c: 'math', q: 'A pen costs ₹8. How much do 5 pens cost?', o: ['₹40', '₹13', '₹35', '₹45'], e: '8 × 5 = 40, so ₹40.' },
    { c: 'math', q: '100 − 37 = ?', o: ['63', '73', '67', '53'], e: '100 − 37 = 63.' },
    { c: 'math', q: 'What is half of 90?', o: ['45', '40', '50', '35'], e: '90 ÷ 2 = 45.' },
    { c: 'math', q: 'You have ₹50 and spend ₹18. How much is left?', o: ['₹32', '₹28', '₹42', '₹38'], e: '50 − 18 = 32, so ₹32.' },
    { c: 'math', q: '9 × 6 = ?', o: ['54', '56', '45', '63'], e: '9 × 6 = 54.' },
    { c: 'math', q: 'What is 25% of 200?', o: ['50', '25', '75', '40'], e: '25% is one quarter. 200 ÷ 4 = 50.' },
    { c: 'math', q: 'How many minutes are in 3 hours?', o: ['180', '120', '300', '160'], e: '3 × 60 = 180 minutes.' },
    { c: 'math', q: '48 ÷ 4 = ?', o: ['12', '14', '16', '11'], e: '48 ÷ 4 = 12.' },
    { c: 'math', q: 'Which number is the biggest?', o: ['0.5', '0.45', '0.405', '0.05'], e: '0.5 is the same as 0.50, which is more than 0.45.' },

    // ── Same meaning ────────────────────────────────────────
    { c: 'synonym', q: 'Which word means the same as “happy”?', o: ['Glad', 'Sad', 'Angry', 'Tired'], e: 'Happy = glad. “I am glad you came.”' },
    { c: 'synonym', q: 'Which word means the same as “big”?', o: ['Large', 'Tiny', 'Short', 'Weak'], e: 'Big = large.' },
    { c: 'synonym', q: 'Which word means the same as “start”?', o: ['Begin', 'Stop', 'Wait', 'Finish'], e: 'Start = begin. “The class begins at 10.”' },
    { c: 'synonym', q: 'Which word means the same as “quick”?', o: ['Fast', 'Slow', 'Late', 'Quiet'], e: 'Quick = fast.' },
    { c: 'synonym', q: 'Which word means the same as “shut”?', o: ['Close', 'Open', 'Break', 'Push'], e: 'Shut the door = close the door.' },
    { c: 'synonym', q: 'Which word means the same as “clever”?', o: ['Smart', 'Lazy', 'Rich', 'Loud'], e: 'Clever = smart.' },
    { c: 'synonym', q: 'Which word means the same as “end”?', o: ['Finish', 'Start', 'Build', 'Return'], e: 'End = finish.' },
    { c: 'synonym', q: 'Which word means the same as “gift”?', o: ['Present', 'Price', 'Letter', 'Prize money'], e: 'A gift is a present you give someone.' },
    { c: 'synonym', q: 'Which word means the same as “easy”?', o: ['Simple', 'Hard', 'Long', 'Strange'], e: 'Easy = simple.' },
    { c: 'synonym', q: 'Which word means the same as “choose”?', o: ['Pick', 'Drop', 'Lose', 'Hide'], e: 'Choose = pick. “Pick one colour.”' },

    // ── Hard: idioms ────────────────────────────────────────
    { c: 'idiom', q: 'What does “break the ice” mean?', o: ['Start a friendly conversation', 'Break something cold', 'Stop talking', 'Feel very cold'], e: 'You “break the ice” when you start talking with new people.' },
    { c: 'idiom', q: '“It’s a piece of cake” means…', o: ['It is very easy', 'It is a dessert', 'It is expensive', 'It is very small'], e: 'Something that is “a piece of cake” is very easy to do.' },
    { c: 'idiom', q: '“Under the weather” means…', o: ['Feeling a little sick', 'Standing in the rain', 'Very happy', 'Very busy'], e: '“I’m under the weather” means “I feel a bit ill.”' },
    { c: 'idiom', q: '“Hit the books” means…', o: ['Study hard', 'Throw books', 'Buy new books', 'Close the books'], e: '“I have to hit the books tonight” means “I have to study.”' },
    { c: 'idiom', q: '“Once in a blue moon” means…', o: ['Very rarely', 'Every night', 'Every month', 'Never again'], e: 'Something that happens “once in a blue moon” happens very rarely.' },
    { c: 'idiom', q: '“Cost an arm and a leg” means…', o: ['Be very expensive', 'Cause an injury', 'Be free', 'Be cheap'], e: 'If a phone costs an arm and a leg, it is very expensive.' },
    { c: 'idiom', q: '“On cloud nine” means…', o: ['Extremely happy', 'Very confused', 'High up in a plane', 'Very tired'], e: 'When you are “on cloud nine”, you are extremely happy.' },
    { c: 'idiom', q: '“Call it a day” means…', o: ['Stop working for today', 'Phone someone', 'Start the day early', 'Name the day'], e: '“Let’s call it a day” means “Let’s stop working now.”' },

    // ── Hard: phrasal verbs ─────────────────────────────────
    { c: 'phrasal', q: 'Please ___ this form and give it back.', o: ['fill out', 'fill off', 'fill on', 'fill away'], e: '“Fill out” a form means complete it.' },
    { c: 'phrasal', q: 'The meeting was ___ because the manager was sick.', o: ['called off', 'called up', 'called in', 'called on'], e: '“Call off” means cancel.' },
    { c: 'phrasal', q: 'I will ___ the word in the dictionary.', o: ['look up', 'look after', 'give up', 'put on'], e: '“Look up” means search for information.' },
    { c: 'phrasal', q: 'Can you ___ my dog while I travel?', o: ['look after', 'look up', 'run into', 'put off'], e: '“Look after” means take care of.' },
    { c: 'phrasal', q: 'Don’t ___! You can finish the course.', o: ['give up', 'give out', 'give away', 'give back'], e: '“Give up” means stop trying.' },
    { c: 'phrasal', q: 'I ___ my old teacher at the market yesterday.', o: ['ran into', 'ran out', 'ran over', 'ran off'], e: '“Run into” someone means meet them by chance.' },
    { c: 'phrasal', q: 'We have ___ milk. Please buy some.', o: ['run out of', 'run into', 'run over', 'run away'], e: '“Run out of” means have none left.' },
    { c: 'phrasal', q: 'Please ___ the lights when you leave.', o: ['turn off', 'turn up', 'turn over', 'turn into'], e: '“Turn off” means stop a machine or light.' },

    // ── Hard: grammar ───────────────────────────────────────
    { c: 'grammar', q: 'If I ___ you, I would take the job.', o: ['were', 'am', 'will be', 'being'], e: 'For advice we say “If I were you…”.' },
    { c: 'grammar', q: 'She has worked here ___ five years.', o: ['for', 'since', 'from', 'during'], e: 'Use “for” with a length of time: for five years.' },
    { c: 'grammar', q: 'By next year, I ___ my degree.', o: ['will have finished', 'finish', 'finished', 'have finishing'], e: '“Will have finished” shows something complete before a future time.' },
    { c: 'grammar', q: 'Neither the manager nor the workers ___ happy.', o: ['were', 'was', 'is', 'be'], e: 'With “neither… nor”, the verb matches the nearer subject: workers were.' },
    { c: 'grammar', q: 'I wish I ___ speak French.', o: ['could', 'can', 'will', 'am'], e: 'After “I wish”, use the past form: I wish I could.' },
    { c: 'grammar', q: 'He asked me where ___.', o: ['I lived', 'did I live', 'do I live', 'I am live'], e: 'In reported questions, use normal word order: where I lived.' },
    { c: 'grammar', q: 'This is the ___ book I have ever read.', o: ['most interesting', 'more interesting', 'interestingest', 'much interesting'], e: 'Long adjectives use “the most” for the superlative.' },
    { c: 'grammar', q: 'The letter ___ yesterday.', o: ['was sent', 'sent', 'is sending', 'has send'], e: 'A letter cannot send itself, so use the passive: was sent.' },

    // ── Hard: vocabulary ────────────────────────────────────
    { c: 'vocab', q: 'What does “meticulous” mean?', o: ['Very careful about details', 'Very fast', 'Very angry', 'Very lazy'], e: 'A meticulous worker checks every detail.' },
    { c: 'vocab', q: '“Reluctant” means…', o: ['Not wanting to do something', 'Very excited', 'Very rich', 'Always late'], e: '“He was reluctant to leave” means he did not want to leave.' },
    { c: 'vocab', q: '“Abundant” means…', o: ['More than enough', 'Very rare', 'Very small', 'Broken'], e: 'Abundant water means plenty of water.' },
    { c: 'vocab', q: '“Ambiguous” means…', o: ['Having more than one meaning', 'Very clear', 'Very loud', 'Very old'], e: 'An ambiguous message can be understood in two ways.' },
    { c: 'vocab', q: 'Which word means “to make something less serious”?', o: ['Mitigate', 'Magnify', 'Migrate', 'Mimic'], e: 'To mitigate a problem is to make it less serious.' },
    { c: 'vocab', q: '“Diligent” means…', o: ['Hard-working and careful', 'Lazy', 'Dishonest', 'Forgetful'], e: 'A diligent student works hard and carefully.' },
    { c: 'vocab', q: '“Concise” means…', o: ['Short and clear', 'Long and detailed', 'Confusing', 'Rude'], e: 'A concise answer says a lot in few words.' },
    { c: 'vocab', q: 'The opposite of “temporary” is…', o: ['permanent', 'short', 'quick', 'modern'], e: 'Temporary means for a short time; permanent means forever.' }
  ];

  if (typeof module === 'object' && module.exports) module.exports = BANK;
  else root.D5_BANK = BANK;
})(typeof self !== 'undefined' ? self : this);
