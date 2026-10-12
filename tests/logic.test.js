// Run with: npm test   (uses Node's built-in test runner, no installs needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');
const BANK = require('../js/questions.js');

test('question bank is well formed', () => {
  assert.ok(BANK.length >= 50);
  for (const q of BANK) {
    assert.equal(q.o.length, 4, q.q);
    assert.equal(new Set(q.o).size, 4, 'duplicate options: ' + q.q);
    assert.ok(q.e && q.c);
  }
});

test('daily set is the same for everyone on the same day', () => {
  assert.deepEqual(L.dailySet(BANK, '2026-10-12'), L.dailySet(BANK, '2026-10-12'));
  assert.notDeepEqual(L.dailySet(BANK, '2026-10-12'), L.dailySet(BANK, '2026-10-13'));
});

test('daily set goes easy, easy, medium, medium, hard', () => {
  for (let i = 0; i < 30; i++) assert.deepEqual(L.dailySet(BANK, L.addDays('2026-01-01', i)).map((q) => q.d), ['e', 'e', 'm', 'm', 'h']);
});

test('extra tasks: hard challenge, word quiz, listening', () => {
  const day = '2026-10-12';
  const hard = L.hardSet(BANK, day);
  assert.equal(hard.length, 3);
  assert.ok(hard.every((q) => q.d === 'h'));
  assert.equal(new Set(hard.map((q) => q.c)).size, 3);
  const dailyHard = L.dailySet(BANK, day).find((q) => q.d === 'h').q;
  assert.ok(!hard.some((q) => q.q === dailyHard));
  const WORDS = require('../js/words.js');
  const wq = L.wordQuiz(WORDS, day)[0];
  assert.equal(wq.o[wq.a], L.wordOfDay(WORDS, day).m);
  const ls = L.listenSet(WORDS, day);
  assert.equal(ls.length, 3);
  ls.forEach((q) => assert.equal(q.o[q.a], q.say));
});

test('daily set has 5 questions from 5 different categories, answer kept correct', () => {
  for (let i = 0; i < 60; i++) {
    const day = L.addDays('2026-01-01', i);
    const set = L.dailySet(BANK, day);
    assert.equal(set.length, 5);
    assert.equal(new Set(set.map((q) => q.c)).size, 5);
    for (const q of set) {
      const src = BANK.find((b) => b.q === q.q && b.c === q.c && b.o.includes(q.o[q.a]));
      assert.equal(q.o[q.a], src.o[0], 'correct answer moved: ' + q.q);
    }
  }
});

test('dates', () => {
  assert.equal(L.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(L.diffDays('2026-02-27', '2026-03-01'), 2);
  assert.equal(L.weekStart('2026-10-12'), '2026-10-12'); // Monday
  assert.equal(L.weekStart('2026-10-18'), '2026-10-12'); // Sunday
});

test('streak: continues, resets, and uses savers', () => {
  assert.equal(L.nextStreak({ last: null, streak: 0, savers: 0 }, '2026-10-12').streak, 1);
  assert.equal(L.nextStreak({ last: '2026-10-11', streak: 4, savers: 0 }, '2026-10-12').streak, 5);
  assert.equal(L.nextStreak({ last: '2026-10-09', streak: 4, savers: 0 }, '2026-10-12').streak, 1);

  const saved = L.nextStreak({ last: '2026-10-10', streak: 4, savers: 1 }, '2026-10-12');
  assert.deepEqual([saved.streak, saved.savers, saved.used], [5, 0, 1]);

  const notEnough = L.nextStreak({ last: '2026-10-08', streak: 4, savers: 1 }, '2026-10-12');
  assert.equal(notEnough.streak, 1);
});

test('streak: a saver is earned every 7 days, max 2', () => {
  const r = L.nextStreak({ last: '2026-10-11', streak: 6, savers: 0 }, '2026-10-12');
  assert.deepEqual([r.streak, r.savers, r.earned], [7, 1, true]);
  const capped = L.nextStreak({ last: '2026-10-11', streak: 13, savers: 2 }, '2026-10-12');
  assert.deepEqual([capped.savers, capped.earned], [2, false]);
});

test('streak status before playing', () => {
  assert.equal(L.streakStatus({ last: '2026-10-11', streak: 3, savers: 0 }, '2026-10-12').state, 'risk');
  assert.equal(L.streakStatus({ last: '2026-10-10', streak: 3, savers: 1 }, '2026-10-12').state, 'saver');
  assert.equal(L.streakStatus({ last: '2026-10-10', streak: 3, savers: 0 }, '2026-10-12').state, 'lost');
});

test('scoring', () => {
  const all = ['e', 'e', 'm', 'm', 'h'].map((d) => ({ ok: true, ms: 3000, bonus: 5, d }));
  assert.equal(L.scoreDay(all, 1).total, 70 + 25 + 20);
  assert.equal(L.scoreDay(all, 7).total, Math.round(115 * 1.5));
  const mixed = [{ ok: true, bonus: 3, d: 'e' }, { ok: false, bonus: 0, d: 'e' }, { ok: true, bonus: 0, d: 'h' }, { ok: false, d: 'm' }, { ok: false, d: 'h' }];
  assert.equal(L.scoreDay(mixed, 1).total, 33);
  assert.equal(L.speedBonus(true, 4999), 5);
  assert.equal(L.speedBonus(true, 9999), 3);
  assert.equal(L.speedBonus(true, 10000), 0);
  assert.equal(L.speedBonus(false, 100), 0);
});

test('levels', () => {
  assert.equal(L.levelOf(0).n, 1);
  assert.equal(L.levelOf(99).n, 1);
  assert.equal(L.levelOf(100).n, 2);
  assert.equal(L.levelOf(300).n, 3);
  assert.equal(L.levelOf(1000).n, 5);
});

test('league bots are stable and do not change for past days', () => {
  const a = L.botWeek('Priya', '2026-10-12', '2026-10-14');
  assert.equal(a, L.botWeek('Priya', '2026-10-12', '2026-10-14'));
  assert.ok(L.botWeek('Priya', '2026-10-12', '2026-10-18') >= a);
});

const WORDS = require('../js/words.js');

test('word of the day is stable and cycles through every word', () => {
  assert.equal(L.wordOfDay(WORDS, '2026-10-12').w, L.wordOfDay(WORDS, '2026-10-12').w);
  const seen = new Set();
  for (let i = 0; i < WORDS.length; i++) seen.add(L.wordOfDay(WORDS, L.addDays('2026-10-12', i)).w);
  assert.equal(seen.size, WORDS.length);
});

test('wallet: spending lowers balance only; saver purchase rules', () => {
  assert.equal(L.balance({ points: 500, spent: 200 }), 300);
  assert.deepEqual(L.canBuySaver({ points: 500, spent: 0, savers: 0 }), { ok: true });
  assert.equal(L.canBuySaver({ points: 500, spent: 0, savers: 2 }).reason, 'full');
  const poor = L.canBuySaver({ points: 150, spent: 0, savers: 0 });
  assert.deepEqual([poor.reason, poor.need], ['funds', 50]);
});

test('rupees and payout details', () => {
  assert.equal(L.toInr(90), 9);
  assert.equal(L.maxPayout({ points: 1234, spent: 200 }), 103);
  assert.ok(L.validUpi('rahul.k@okbank'));
  assert.ok(!L.validUpi('rahul'));
  assert.ok(L.validAcct('1234 5678 9012'));
  assert.ok(!L.validAcct('12345'));
  assert.ok(L.validIfsc('sbin0001234'));
  assert.ok(!L.validIfsc('SBIN1001234'));
});
