/*
 * Daylit — pure game logic (no DOM). Shared by the app and the tests.
 * Everything here is deterministic so it can be unit-tested with `npm test`.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.D5Logic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SET_SIZE = 5;
  const MAX_SAVERS = 2;

  /* ── Dates: local calendar days as "YYYY-MM-DD" keys ─────────────── */
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); }; // noon: DST-safe
  const addDays = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return fmt(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const weekStart = (k) => addDays(k, -((parse(k).getDay() + 6) % 7)); // Monday

  /* ── Seeded randomness (same seed → same result on every phone) ──── */
  function seedFrom(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
  function rng(seed) {
    let a = seedFrom(String(seed));
    return function () { // mulberry32
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ── Difficulty: each category is easy, medium or hard ─────────── */
  const CAT_DIFF = { odd: 'e', math: 'e', synonym: 'e', opposite: 'e', meaning: 'm', gap: 'm', spelling: 'm', idiom: 'h', phrasal: 'h', grammar: 'h', vocab: 'h' };
  const DIFF_PTS = { e: 10, m: 15, h: 20 };
  const diffOf = (c) => CAT_DIFF[c] || 'm';
  const ask = (q, r) => {
    const order = shuffle([0, 1, 2, 3], r);
    return { c: q.c, d: diffOf(q.c), q: q.q, e: q.e, o: order.map((i) => q.o[i]), a: order.indexOf(0) };
  };

  /* ── Question sets: 5 categories, ordered easy → medium → hard ────── */
  function pickSet(bank, seed) {
    const r = rng(seed);
    const by = {};
    bank.forEach((q) => (by[q.c] = by[q.c] || []).push(q));
    const cats = Object.keys(by).sort();
    const of = (d) => shuffle(cats.filter((c) => diffOf(c) === d), r);
    const chosen = [...of('e').slice(0, 2), ...of('m').slice(0, 2), ...of('h').slice(0, 1)];
    return chosen.map((c) => { const pool = by[c]; return ask(pool[Math.floor(r() * pool.length)], r); });
  }
  // Hard challenge: 3 hard questions from 3 categories, never today's hard question.
  function hardSet(bank, dayKey) {
    const r = rng('hard:' + dayKey);
    const skip = pickSet(bank, 'daily:' + dayKey).filter((q) => q.d === 'h').map((q) => q.q);
    const pool = shuffle(bank.filter((q) => diffOf(q.c) === 'h' && !skip.includes(q.q)), r);
    const out = [], used = new Set();
    for (const q of pool) { if (!used.has(q.c)) { used.add(q.c); out.push(ask(q, r)); } if (out.length === 3) break; }
    return out;
  }
  // Word quiz: pick the meaning of today's word.
  function wordQuiz(words, dayKey) {
    const w = wordOfDay(words, dayKey), r = rng('wq:' + dayKey);
    const wrong = shuffle(words.filter((x) => x.w !== w.w), r).slice(0, 3).map((x) => x.m);
    return [ask({ c: 'wotd', q: `What does “${w.w}” mean?`, o: [w.m, ...wrong], e: w.ex }, r)].map((q) => Object.assign(q, { d: 'e' }));
  }
  // Listening: hear a word, choose it from four.
  function listenSet(words, dayKey) {
    const r = rng('ls:' + dayKey), pool = shuffle(words, r);
    return pool.slice(0, 3).map((w) => {
      const wrong = shuffle(words.filter((x) => x.w !== w.w), r).slice(0, 3).map((x) => x.w);
      return Object.assign(ask({ c: 'listen', q: '', o: [w.w, ...wrong], e: `“${w.w}” means: ${w.m}` }, r), { d: 'm', say: w.w });
    });
  }
  const dailySet = (bank, dayKey) => pickSet(bank, 'daily:' + dayKey);

  /* ── Scoring ──────────────────────────────────────────────────── */
  function speedBonus(ok, ms) {
    if (!ok) return 0;
    if (ms < 5000) return 5;
    if (ms < 10000) return 3;
    return 0;
  }
  function multFor(streak) {
    if (streak >= 30) return 2;
    if (streak >= 14) return 1.75;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.25;
    return 1;
  }
  const answerPts = (a) => (a.ok ? DIFF_PTS[a.d] || 10 : 0);
  function scoreDay(answers, streak) {
    const correct = answers.filter((a) => a.ok).length;
    const base = answers.reduce((s, a) => s + answerPts(a), 0);
    const speed = answers.reduce((s, a) => s + (a.ok ? a.bonus || 0 : 0), 0);
    const perfect = correct === SET_SIZE ? 20 : 0;
    const mult = multFor(streak);
    return { correct, base, speed, perfect, mult, total: Math.round((base + speed + perfect) * mult) };
  }

  /* ── Streaks & streak savers ──────────────────────────────────── */
  // What the streak looks like *before* playing today.
  function streakStatus(p, today) {
    if (!p.last || !p.streak) return { state: 'none', n: 0 };
    const gap = diffDays(p.last, today);
    if (gap <= 0) return { state: 'done', n: p.streak };
    if (gap === 1) return { state: 'risk', n: p.streak };
    const missed = gap - 1;
    if (missed <= (p.savers || 0)) return { state: 'saver', n: p.streak, missed };
    return { state: 'lost', n: 0, prev: p.streak };
  }
  // The streak *after* finishing today's set.
  function nextStreak(p, today) {
    let streak = p.streak || 0, savers = p.savers || 0, used = 0, earned = false;
    const gap = p.last ? diffDays(p.last, today) : null;
    if (gap === 0) return { streak, savers, used, earned };
    if (gap === 1) streak += 1;
    else if (gap > 1 && gap - 1 <= savers) { used = gap - 1; savers -= used; streak += 1; }
    else streak = 1;
    if (streak % 7 === 0 && savers < MAX_SAVERS) { savers += 1; earned = true; }
    return { streak, savers, used, earned };
  }

  /* ── Levels: L2 at 100, L3 at 300, L4 at 600, L5 at 1000 … ────── */
  const threshold = (n) => 50 * (n - 1) * n;
  function levelOf(points) {
    let n = 1;
    while (points >= threshold(n + 1)) n++;
    const cur = threshold(n), next = threshold(n + 1);
    return { n, cur, next, pct: (points - cur) / (next - cur) };
  }

  /* ── Weekly league (demo players are simulated deterministically) ─ */
  const BOTS = ['Priya', 'Arjun', 'Fatima', 'Ravi', 'Sneha', 'Imran', 'Kavya', 'Suresh', 'Anita'];
  function botWeek(name, ws, today) {
    const skill = 0.45 + rng('skill:' + name)() * 0.5;
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const k = addDays(ws, i);
      if (k > today) break;
      const r = rng(name + ':' + k);
      const playsEarly = r() < 0.5, plays = r() < skill + 0.2;
      if (!plays || (k === today && !playsEarly)) continue;
      const correct = Math.min(5, Math.floor(skill * 4 + r() * 2.4));
      const speed = Math.floor(r() * correct * 4);
      const mult = 1 + Math.floor(r() * 3) * 0.25;
      total += Math.round((correct * 10 + speed + (correct === 5 ? 20 : 0)) * mult);
    }
    return total;
  }
  function weekPoints(history, ws, today) {
    let s = 0;
    for (let i = 0; i < 7; i++) {
      const k = addDays(ws, i);
      if (k > today) break;
      if (history[k]) s += history[k].p;
    }
    return s;
  }

  /* ── Daily goals (shown as progress; they do not add points) ─────── */
  function dailyGoals(answers) {
    const a = answers || [];
    return [
      { id: 'finish', cur: Math.min(a.length, SET_SIZE), goal: SET_SIZE },
      { id: 'correct', cur: Math.min(a.filter((x) => x.ok).length, 4), goal: 4 },
      { id: 'fast', cur: Math.min(a.filter((x) => x.ok && x.ms < 5000).length, 2), goal: 2 }
    ];
  }

  /* ── Word of the day: every word once before any repeats ─────────── */
  function wordOfDay(words, dayKey) {
    const order = shuffle(words.map((_, i) => i), rng('words'));
    const n = ((diffDays('2026-01-01', dayKey) % words.length) + words.length) % words.length;
    return words[order[n]];
  }

  /* ── Rupees and payouts (demo) ───────────────────────────────────── */
  const POINTS_PER_RUPEE = 10;
  const MIN_PAYOUT = 50; // rupees
  const toInr = (pts) => pts / POINTS_PER_RUPEE;
  const maxPayout = (s) => Math.floor(balance(s) / POINTS_PER_RUPEE);
  const validUpi = (v) => /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test((v || '').trim());
  const validAcct = (v) => /^\d{9,18}$/.test((v || '').replace(/\s/g, ''));
  const validIfsc = (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test((v || '').trim().toUpperCase());

  /* ── Wallet: lifetime points drive level + league; spending only lowers the balance ── */
  const SAVER_COST = 200;
  const balance = (s) => (s.points || 0) - (s.spent || 0);
  function canBuySaver(s) {
    if ((s.savers || 0) >= MAX_SAVERS) return { ok: false, reason: 'full' };
    if (balance(s) < SAVER_COST) return { ok: false, reason: 'funds', need: SAVER_COST - balance(s) };
    return { ok: true };
  }

  return {
    SET_SIZE, dailyGoals, wordOfDay, SAVER_COST, balance, canBuySaver,
    CAT_DIFF, DIFF_PTS, diffOf, answerPts, hardSet, wordQuiz, listenSet,
    POINTS_PER_RUPEE, MIN_PAYOUT, toInr, maxPayout, validUpi, validAcct, validIfsc, MAX_SAVERS, BOTS,
    fmt, parse, addDays, diffDays, weekStart,
    rng, shuffle, pickSet, dailySet,
    speedBonus, multFor, scoreDay,
    streakStatus, nextStreak,
    threshold, levelOf,
    botWeek, weekPoints
  };
});
