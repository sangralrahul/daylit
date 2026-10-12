/*
 * Word of the day: useful everyday and work words.
 * w = word, s = syllables (helps pronunciation), p = part of speech,
 * m = meaning in simple English, hi = meaning in Hindi, ex = example sentence.
 */
(function (root) {
  const WORDS = [
    { w: 'punctual', s: 'punc·tu·al', p: 'adjective', m: 'Arriving or doing something at the agreed time.', hi: 'समय का पाबंद', ex: 'Ravi is always punctual for work.' },
    { w: 'reliable', s: 're·li·a·ble', p: 'adjective', m: 'Someone or something you can trust.', hi: 'भरोसेमंद', ex: 'She is a reliable driver.' },
    { w: 'polite', s: 'po·lite', p: 'adjective', m: 'Kind and respectful when you speak or act.', hi: 'विनम्र', ex: 'Please be polite to every customer.' },
    { w: 'deadline', s: 'dead·line', p: 'noun', m: 'The last time or date to finish something.', hi: 'अंतिम तारीख', ex: 'The deadline for the form is Friday.' },
    { w: 'schedule', s: 'sched·ule', p: 'noun', m: 'A plan of when things will happen.', hi: 'समय-सारिणी', ex: 'Check the bus schedule before you leave.' },
    { w: 'earn', s: 'earn', p: 'verb', m: 'To get money or a reward for your work.', hi: 'कमाना', ex: 'I earn extra money on weekends.' },
    { w: 'improve', s: 'im·prove', p: 'verb', m: 'To make something better, or to get better.', hi: 'सुधारना', ex: 'Daily practice helps you improve.' },
    { w: 'confident', s: 'con·fi·dent', p: 'adjective', m: 'Feeling sure about yourself.', hi: 'आत्मविश्वासी', ex: 'She feels confident speaking English now.' },
    { w: 'patient', s: 'pa·tient', p: 'adjective', m: 'Able to wait calmly without getting angry.', hi: 'धैर्यवान', ex: 'Be patient, the bus will come soon.' },
    { w: 'receipt', s: 're·ceipt', p: 'noun', m: 'A paper or message that shows you paid.', hi: 'रसीद', ex: 'Please keep the receipt.' },
    { w: 'discount', s: 'dis·count', p: 'noun', m: 'An amount taken off the usual price.', hi: 'छूट', ex: 'There is a ten percent discount today.' },
    { w: 'delay', s: 'de·lay', p: 'noun', m: 'When something happens later than planned.', hi: 'देरी', ex: 'Sorry for the delay in my reply.' },
    { w: 'request', s: 're·quest', p: 'verb', m: 'To ask for something politely.', hi: 'अनुरोध करना', ex: 'I would like to request a day off.' },
    { w: 'customer', s: 'cus·tom·er', p: 'noun', m: 'A person who buys something.', hi: 'ग्राहक', ex: 'The customer asked for a refund.' },
    { w: 'confirm', s: 'con·firm', p: 'verb', m: 'To say that something is true or fixed.', hi: 'पुष्टि करना', ex: 'Please confirm your order.' },
    { w: 'cancel', s: 'can·cel', p: 'verb', m: 'To decide that a plan will not happen.', hi: 'रद्द करना', ex: 'They had to cancel the meeting.' },
    { w: 'available', s: 'a·vail·a·ble', p: 'adjective', m: 'Free, or ready to be used.', hi: 'उपलब्ध', ex: 'Is the doctor available today?' },
    { w: 'complain', s: 'com·plain', p: 'verb', m: 'To say that something is wrong or not good.', hi: 'शिकायत करना', ex: 'He called to complain about the noise.' },
    { w: 'grateful', s: 'grate·ful', p: 'adjective', m: 'Thankful for something.', hi: 'आभारी', ex: 'I am grateful for your help.' },
    { w: 'honest', s: 'hon·est', p: 'adjective', m: 'Telling the truth.', hi: 'ईमानदार', ex: 'Thank you for your honest answer.' },
    { w: 'instead', s: 'in·stead', p: 'adverb', m: 'In place of something else.', hi: 'के बजाय', ex: 'Drink water instead of soda.' },
    { w: 'nearby', s: 'near·by', p: 'adjective', m: 'Close to here.', hi: 'पास में', ex: 'Is there a pharmacy nearby?' },
    { w: 'urgent', s: 'ur·gent', p: 'adjective', m: 'Needing action right now.', hi: 'ज़रूरी', ex: 'This message is urgent.' },
    { w: 'explain', s: 'ex·plain', p: 'verb', m: 'To make something easy to understand.', hi: 'समझाना', ex: 'Can you explain the rules again?' },
    { w: 'practice', s: 'prac·tice', p: 'noun', m: 'Doing something again and again to get better.', hi: 'अभ्यास', ex: 'Five minutes of practice a day is enough.' },
    { w: 'goal', s: 'goal', p: 'noun', m: 'Something you want to achieve.', hi: 'लक्ष्य', ex: 'My goal is to speak English at work.' },
    { w: 'journey', s: 'jour·ney', p: 'noun', m: 'Travel from one place to another.', hi: 'यात्रा', ex: 'The journey takes two hours by train.' },
    { w: 'appointment', s: 'ap·point·ment', p: 'noun', m: 'A fixed time to meet someone.', hi: 'मुलाक़ात का समय', ex: 'I have a doctor’s appointment at five.' },
    { w: 'salary', s: 'sal·a·ry', p: 'noun', m: 'Money you get every month for your job.', hi: 'वेतन', ex: 'The salary is paid on the first day.' },
    { w: 'progress', s: 'prog·ress', p: 'noun', m: 'Movement toward a better result.', hi: 'प्रगति', ex: 'You are making good progress.' },
    { w: 'accurate', s: 'ac·cu·rate', p: 'adjective', m: 'Correct in every detail.', hi: 'सटीक', ex: 'Please give an accurate address.' }
  ];
  if (typeof module === 'object' && module.exports) module.exports = WORDS;
  else root.D5_WORDS = WORDS;
})(typeof self !== 'undefined' ? self : this);
