/*
 * Daylit — UI layer. Plain JavaScript, no framework, no build step.
 * State lives in localStorage on the device; game rules live in logic.js.
 */
(function () {
  'use strict';

  const L = window.D5Logic, BANK = window.D5_BANK, DICT = window.D5_I18N, WORDS = window.D5_WORDS || [];
  const KEY = 'daylit:v1';
  const QTIME = 20000; // ms per question

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const app = $('#app'), nav = $('#nav'), toastEl = $('#toast'), shell = $('#shell');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ?date=YYYY-MM-DD lets reviewers simulate other days (see README).
  const params = new URLSearchParams(location.search);
  const todayKey = () => {
    const o = params.get('date');
    return o && /^\d{4}-\d{2}-\d{2}$/.test(o) ? o : L.fmt(new Date());
  };

  /* ── Icons (one consistent line set) ─────────────────────────────────── */
  const P = {
    flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
    star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z',
    zap: 'M13 2 4 14h7l-1 8 9-12h-7z',
    trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
    snow: 'M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2',
    check: 'M20 6 9 17l-5-5',
    x: 'M18 6 6 18M6 6l12 12',
    home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
    chart: 'M6 20V11M12 20V4M18 20v-6',
    award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
    user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    crown: 'M3 18h18L19 7l-4.5 4.5L12 5l-2.5 6.5L5 7z',
    share: 'M4 13v7h16v-7M12 3v12M7 8l5-5 5 5',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5M12 8h.01',
    refresh: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
    back: 'M15 18l-6-6 6-6',
    sound: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
    globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
    level: 'M12 2 21 7v10l-9 5-9-5V7z',
    speaker: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7',
    wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h11l2 3M16 13.5h.01',
    chev: 'M9 6l6 6-6 6',
    lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
    bookmark: 'M6 3h12v18l-6-4-6 4z'
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${P[n]}"/></svg>`;

  /* ── Rings: concentric progress arcs ─────────────────────────────────── */
  // items: [{ pct, color }] outer → inner
  function rings(items, center = '', size = 128) {
    const sw = items.length > 1 ? 11 : 12, gap = 3;
    let r = 50 - sw / 2, svg = '';
    items.forEach((it, i) => {
      const C = 2 * Math.PI * r, p = Math.max(0, Math.min(1, it.pct));
      svg += `<circle cx="50" cy="50" r="${r.toFixed(2)}" fill="none" stroke="${it.color}" stroke-width="${sw}" class="track"/>`;
      if (p > 0) svg += `<circle cx="50" cy="50" r="${r.toFixed(2)}" fill="none" stroke="${it.color}" stroke-width="${sw}" stroke-linecap="round" class="arc d${i}" style="--c:${C.toFixed(2)}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - p)).toFixed(2)}"/>`;
      r -= sw + gap;
    });
    return `<div class="rings" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100" aria-hidden="true">${svg}</svg><div class="center">${center}</div></div>`;
  }
  const C_ACCENT = 'var(--accent)', C_WEEK = 'var(--week)', C_LEVEL = 'var(--level)';

  /* ── State ───────────────────────────────────────────────────────────── */
  const fresh = () => ({
    v: 1, name: '', lang: 'en', joined: null, points: 0, streak: 0, best: 0, savers: 0, last: null,
    history: {}, badges: {}, correct: 0, answered: 0, fast: 0, saverUsed: 0, run: null, sound: true,
    spent: 0, ledger: null, learned: {}, tasks: {}, xrun: null, payout: null, payouts: []
  });
  let S = load();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage blocked */ }
    return fresh();
  }
  // Older saves have no wallet history: rebuild it from past days.
  if (!Array.isArray(S.ledger)) S.ledger = Object.keys(S.history).sort().map((d) => ({ d, t: 'day', a: S.history[d].p, c: S.history[d].c }));
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } }

  /* ── Sound: soft tones made with Web Audio (no audio files) ──────────── */
  const Sound = {
    ctx: null,
    play(type) {
      if (S.sound === false) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = this.ctx || new AC();
        const ctx = this.ctx, now = ctx.currentTime;
        const seq = {
          tap: [[880, 0, 0.025]], ok: [[784, 0, 0.09], [1175, 0.08, 0.09]], bad: [[247, 0, 0.07], [196, 0.1, 0.07]],
          done: [[523, 0, 0.08], [659, 0.09, 0.08], [784, 0.18, 0.08], [1047, 0.27, 0.1]], streak: [[659, 0, 0.08], [988, 0.11, 0.1]]
        }[type] || [];
        seq.forEach(([f, t0, vol]) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + t0);
          g.gain.setValueAtTime(0.0001, now + t0);
          g.gain.exponentialRampToValueAtTime(vol, now + t0 + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + t0 + 0.32);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + t0); o.stop(now + t0 + 0.34);
        });
      } catch (e) { /* audio not available */ }
    }
  };
  /* ── Listen: the phone's own text-to-speech (works offline, no data) ── */
  const Voice = {
    ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    speak(text, btn) {
      if (!this.ok) return;
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        const v = voices.find((x) => /en[-_]IN/i.test(x.lang)) || voices.find((x) => /^en[-_](GB|US)/i.test(x.lang)) || voices.find((x) => /^en/i.test(x.lang));
        if (v) u.voice = v;
        u.lang = v ? v.lang : 'en-IN';
        u.rate = 0.88;
        if (btn) { btn.classList.add('speaking'); u.onend = u.onerror = () => btn.classList.remove('speaking'); }
        synth.speak(u);
      } catch (e) { /* speech not available */ }
    },
    stop() { try { if (this.ok) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  };
  const listenBtn = (text, cls = '') => Voice.ok ? `<button class="listen ${cls}" data-act="speak" data-text="${esc(text)}" aria-label="${t('listen')}">${icon('speaker')}</button>` : '';
  const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ } };

  /* ── i18n helpers ────────────────────────────────────────────────────── */
  function t(k, v) {
    let s = (DICT[S.lang] && DICT[S.lang][k]) || DICT.en[k] || k;
    if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  const loc = () => (S.lang === 'hi' ? 'hi-IN' : 'en-IN');
  const num = (n) => Number(n).toLocaleString(loc());
  const dateLabel = (k, o = { weekday: 'long', day: 'numeric', month: 'long' }) => L.parse(k).toLocaleDateString(loc(), o);
  const inr = (v) => '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const ptsInr = (p) => inr(L.toInr(p));
  const levelName = (n) => t('lv.' + Math.min(n, 8));
  const greeting = () => { const h = new Date().getHours(); return t(h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'); };
  const hue = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const initial = (n) => esc((n.trim()[0] || '?').toUpperCase());
  const avatar = (name) => `<span class="av" style="--h:${hue(name)}">${initial(name)}</span>`;
  const brand = () => `<span class="brand"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg><span class="wordmark">Daylit</span></span>`;

  /* ── Badges ──────────────────────────────────────────────────────────── */
  const perfectDays = () => Object.values(S.history).filter((h) => h.c === 5).length;
  const BADGES = [
    { id: 'first', icon: 'check', test: () => Object.keys(S.history).length >= 1, prog: () => [Object.keys(S.history).length, 1] },
    { id: 'perfect', icon: 'target', test: (d) => !!(S.history[d] && S.history[d].c === 5), prog: () => [perfectDays(), 1] },
    { id: 'streak3', icon: 'flame', test: () => S.streak >= 3, prog: () => [S.streak, 3] },
    { id: 'streak7', icon: 'flame', test: () => S.streak >= 7, prog: () => [S.streak, 7] },
    { id: 'fast10', icon: 'zap', test: () => S.fast >= 10, prog: () => [S.fast, 10] },
    { id: 'pts500', icon: 'star', test: () => S.points >= 500, prog: () => [S.points, 500] },
    { id: 'saver', icon: 'snow', test: () => S.saverUsed > 0, prog: () => [S.saverUsed, 1] },
    { id: 'level5', icon: 'trophy', test: () => L.levelOf(S.points).n >= 5, prog: () => [L.levelOf(S.points).n, 5] },
    { id: 'streak30', icon: 'crown', test: () => S.streak >= 30, prog: () => [S.streak, 30] }
  ];
  function checkBadges(day) {
    const got = [];
    BADGES.forEach((b) => { if (!S.badges[b.id] && b.test(day)) { S.badges[b.id] = day; got.push(b); } });
    return got;
  }

  /* ── Router ──────────────────────────────────────────────────────────── */
  let tab = 'home', G = null, tick = null, lastDay = todayKey(), lastResult = null;
  function toTop() { if (shell) shell.scrollTop = 0; window.scrollTo(0, 0); }
  function stopTimers() { if (G) { clearTimeout(G.timer); clearInterval(G.clock); } clearInterval(tick); }
  function go(next) { payArmed = false; buyArmed = false; if (next !== 'payout') payDraft = null; tab = next || tab; stopTimers(); Voice.stop(); G = null; render(); toTop(); }
  function render() {
    document.documentElement.lang = S.lang;
    if (!S.name) { nav.hidden = true; return renderOnboarding(); }
    nav.hidden = false;
    renderNav();
    ({ home: renderHome, league: renderLeague, badges: renderBadges, profile: renderProfile, wallet: renderWallet, payout: renderPayout }[tab] || renderHome)();
  }
  const NAV = [['home', 'home'], ['league', 'chart'], ['badges', 'award'], ['profile', 'user']];
  function renderNav() {
    nav.innerHTML = NAV.map(([id, ic]) =>
      `<button class="nav-btn${tab === id ? ' on' : ''}" data-act="tab" data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${t('nav_' + id)}</span></button>`).join('');
  }

  /* ── Onboarding: four calm steps ─────────────────────────────────────── */
  let ob = { step: 0, name: '' };
  function renderOnboarding() {
    const step = ob.step;
    const foot = (label, act, disabled = false) => `<div class="foot"><div class="foot-in"><button class="btn${step === 0 ? ' accent' : ''}" data-act="${act}" id="obNext" ${disabled ? 'disabled' : ''}>${label}</button></div></div>`;
    const top = step > 0 ? `<div class="play-top"><button class="back-btn" data-act="obBack">${icon('back')}${t('back')}</button>
        <div class="segs" style="margin-left:auto;max-width:120px">${[1, 2, 3].map((k) => `<span class="${k <= step ? 'cur' : ''}"></span>`).join('')}</div></div>` : '';
    let body;
    if (step === 0) {
      body = `<div class="ob-hero"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg>
          <h1>${t('obH')}</h1><p>${t('obP')}</p></div>${foot(t('getStarted'), 'obNext')}`;
    } else if (step === 1) {
      body = `<div class="ob-q"><h1>${t('obLangQ')}</h1><p>${t('obLangP')}</p></div>
        <div class="list" role="radiogroup">
          ${[['en', 'Aa', 'English', t('langEnSub')], ['hi', 'अ', 'हिन्दी', t('langHiSub')]].map(([v, g, n, d]) => `
            <button class="choice${S.lang === v ? ' sel' : ''}" role="radio" aria-checked="${S.lang === v}" data-act="obLang" data-v="${v}">
              <span class="glyph">${g}</span><span class="grow"><strong>${n}</strong><small>${d}</small></span><span class="check">${icon('check')}</span></button>`).join('')}
        </div>${foot(t('continueBtn'), 'obNext')}`;
    } else if (step === 2) {
      body = `<div class="ob-q"><h1>${t('obNameQ')}</h1><p>${t('obNameP')}</p></div>
        <form id="welcomeForm" novalidate>
          <input id="nm" class="big-input" maxlength="20" autocomplete="given-name" aria-label="${t('yourName')}" placeholder="${t('namePh')}" value="${esc(ob.name)}">
          <p class="field-err" id="nmErr" hidden>${t('nameErr')}</p>
        </form>${foot(t('continueBtn'), 'obNext', !ob.name.trim())}`;
    } else {
      const rows = [['star', 'ic-accent', 'how1'], ['flame', 'ic-accent', 'how2'], ['chart', 'ic-level', 'how3']];
      body = `<div class="ob-q"><h1>${t('obHowQ')}</h1></div>
        <div class="list">${rows.map(([ic, c, k]) => `<div><span class="row-ic ${c}">${icon(ic)}</span><span class="grow"><strong>${t(k + 't')}</strong><small>${t(k + 'd')}</small></span></div>`).join('')}</div>
        ${foot(t('startLearning'), 'obDone')}`;
    }
    app.innerHTML = `<section class="play onboard">${top}<div class="ob-body">${body}</div></section>`;
    toTop();
    const nm = $('#nm'); if (nm) setTimeout(() => nm.focus(), 300);
  }
  function obNext() {
    if (ob.step === 2 && !ob.name.trim()) { const er = $('#nmErr'); if (er) er.hidden = false; return; }
    ob.step = Math.min(3, ob.step + 1);
    Sound.play('tap');
    renderOnboarding();
  }
  function obDone() {
    S.name = ob.name.trim().slice(0, 20); S.joined = S.joined || todayKey(); save();
    Sound.play('done');
    tab = 'home'; render(); toTop();
  }

  /* ── Home ────────────────────────────────────────────────────────────── */
  function weekRow(today) {
    const ws = L.weekStart(today);
    return `<ol class="week">${Array.from({ length: 7 }, (_, i) => {
      const k = L.addDays(ws, i), h = S.history[k];
      const cls = [h ? 'did' : '', k === today ? 'now' : ''].join(' ');
      return `<li class="${cls}"><span class="wd">${L.parse(k).toLocaleDateString(loc(), { weekday: 'narrow' })}</span><span class="wdot">${h ? icon('check') : ''}</span></li>`;
    }).join('')}</ol>`;
  }
  const weekDays = (today) => { const ws = L.weekStart(today); let n = 0; for (let i = 0; i < 7; i++) if (S.history[L.addDays(ws, i)]) n++; return n; };

  function renderHome() {
    const today = todayKey();
    const st = L.streakStatus(S, today);
    const lv = L.levelOf(S.points);
    const done = S.history[today];
    const runAns = S.run && S.run.date === today ? S.run.answers : [];
    const started = !done && runAns.length > 0;
    const shownStreak = st.state === 'lost' ? 0 : S.streak;
    const nextMult = L.multFor(L.nextStreak(S, today).streak);
    const answeredToday = done ? 5 : runAns.length;
    const wd = weekDays(today);

    let notice = '';
    if (!done && st.state === 'saver') notice = `<div class="notice">${icon('snow')}<p>${t('saverWill')}</p></div>`;
    else if (!done && st.state === 'lost' && st.prev >= 2) notice = `<div class="notice">${icon('info')}<p>${t('streakLost', { n: st.prev })}</p></div>`;

    const ringBlock = rings([
      { pct: answeredToday / 5, color: C_ACCENT },
      { pct: wd / 7, color: C_WEEK },
      { pct: lv.pct, color: C_LEVEL }
    ]);


    const action = done ? `
        <div class="today-msg"><h2>${t('doneH')}</h2><p>${t('scoreToday', { n: done.c, p: num(done.p) })}</p></div>
        <div class="countdown"><span>${t('nextIn')}</span><strong id="cd">--:--:--</strong></div>
        <div class="two">
          <button class="btn secondary" data-act="share">${icon('share')} ${t('share')}</button>
          <button class="btn secondary" data-act="practice">${icon('refresh')} ${t('practice')}</button>
        </div>` : `
        <div class="today-msg"><h2>${started ? t('inProgress') : t('todayFive')}</h2><p>${started ? t('inProgressB') : t('todaySub')}</p></div>
        ${nextMult > 1 ? `<div class="bonus">${icon('zap')} ${t('bonusToday', { m: nextMult })}</div>` : ''}
        <button class="btn accent" data-act="play">${started ? t('continueBtn') : t('startToday')}</button>`;

    app.innerHTML = `
    <section class="screen home">
      <header class="home-head">
        <div class="head-top"><p class="eyebrow">${dateLabel(today, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <button class="pill" data-act="tab" data-tab="wallet" aria-label="${t('wallet')}">${icon('wallet')}<span>${ptsInr(L.balance(S))}</span></button></div>
        <h1 class="large-title">${greeting()}, ${esc(S.name)}</h1>
      </header>
      ${notice}
      <article class="card today">
        <div class="today-top">
          ${ringBlock}
          <div class="legend">
            <div class="lg a"><span>${t('ringToday')}</span><strong>${answeredToday}<small>/5</small></strong></div>
            <div class="lg w"><span>${t('ringWeek')}</span><strong>${wd}<small>/7</small></strong></div>
            <div class="lg l"><span>${t('level', { n: lv.n })}</span><strong>${Math.round(lv.pct * 100)}<small>%</small></strong></div>
          </div>
        </div>
        ${action}
      </article>

      <article class="card">
        <div class="streak-line">${icon('flame')}<strong>${t('streakDays', { n: shownStreak })}</strong><span>${t('bestStreak')}: ${num(S.best)}</span></div>
        ${weekRow(today)}
      </article>

      ${wotdCard(today)}

      ${tasksCard(today, !!done)}

      <div class="list">
        <button data-act="tab" data-tab="wallet"><span class="row-ic ic-accent">${icon('wallet')}</span><span class="grow">${t('wallet')}</span><span class="val">${num(L.balance(S))} · ${ptsInr(L.balance(S))}</span>${icon('chev', 'chev')}</button>
        <div><span class="row-ic ic-level">${icon('level')}</span><span class="grow">${levelName(lv.n)}</span><span class="val">${t('toNext', { n: num(lv.next - S.points), m: lv.n + 1 })}</span></div>
        <div><span class="row-ic ic-grey">${icon('snow')}</span><span class="grow">${t('savers')}</span><span class="val">${S.savers}/2</span></div>
      </div>
    </section>`;

    fillBars();
    $$('[data-count]', app).forEach((el) => countUp(el, Number(el.dataset.count), 150, 700));
    if (done) startCountdown();
  }
  function fillBars() {
    requestAnimationFrame(() => setTimeout(() => $$('[data-w]', app).forEach((el) => { el.style.width = Math.max(0, Number(el.dataset.w)) + '%'; }), 120));
  }

  function startCountdown() {
    const el = $('#cd');
    const upd = () => {
      const now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((mid - now) / 1000));
      const p = (n) => String(n).padStart(2, '0');
      if (el) el.textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
      if (s === 0 || todayKey() !== lastDay) { lastDay = todayKey(); go('home'); }
    };
    upd();
    tick = setInterval(upd, 1000);
  }

  function wotdCard(today) {
    if (!WORDS.length) return '';
    const w = L.wordOfDay(WORDS, today);
    const got = !!S.learned[w.w];
    return `<article class="card wotd">
        <div class="wotd-top"><span class="eyebrow">${t('wotd')}</span>${listenBtn(`${w.w}. ${w.m} For example: ${w.ex}`)}</div>
        <h3 class="wotd-word">${esc(w.w)}</h3>
        <p class="wotd-meta">${esc(w.s)} · <i>${esc(w.p)}</i></p>
        <p class="wotd-m">${esc(w.m)}</p>
        <p class="wotd-hi"><span>${t('inHindi')}</span> ${esc(w.hi)}</p>
        <p class="wotd-ex">“${esc(w.ex)}”</p>
        ${taskDone('word') || got ? `<button class="btn secondary sm" disabled>${icon('check')} ${t('learnedDone')}</button>` : `<button class="btn sm" data-act="task" data-id="word">${t('task_word')} · +${L.DIFF_PTS.e}</button>`}
      </article>`;
  }

  /* ── Wallet + shop ───────────────────────────────────────────────────── */
  let buyArmed = false;
  function renderWallet() {
    const bal = L.balance(S), can = L.canBuySaver(S);
    const btnLabel = can.ok ? num(L.SAVER_COST) : can.reason === 'full' ? t('full') : t('needMore', { n: num(can.need) });
    const items = (S.ledger || []).slice().reverse();
    const label = (e) => e.t === 'saver' ? t('ledgerSaver') : e.t === 'payout' ? t('ledgerPayout', { to: esc(e.to || '') }) : e.t === 'task' ? t('ledgerTask', { name: t('task_' + e.id), c: e.c, n: e.n }) : t('ledgerDay', { c: e.c });
    const ic = (e) => ({ saver: 'snow', payout: 'wallet', task: 'target' }[e.t] || 'star');
    const rows = items.length ? items.slice(0, 40).map((e) => `
        <div><span class="row-ic ${e.a >= 0 ? 'ic-accent' : e.t === 'payout' ? 'ic-good' : 'ic-grey'}">${icon(ic(e))}</span>
          <span class="grow"><strong>${label(e)}</strong><small>${dateLabel(e.d, { weekday: 'short', day: 'numeric', month: 'short' })}</small></span>
          <span class="amt ${e.a >= 0 ? 'plus' : 'minus'}">${e.a >= 0 ? '+' : '−'}${num(Math.abs(e.a))}<small>${ptsInr(Math.abs(e.a))}</small></span></div>`).join('')
      : `<div><span class="muted">${t('noHistory')}</span></div>`;
    app.innerHTML = `
    <section class="screen">
      <div><button class="back-btn" data-act="tab" data-tab="home">${icon('back')}${t('nav_home')}</button></div>
      <h1 class="large-title">${t('wallet')}</h1>
      <article class="card wallet-hero">
        <span class="eyebrow">${t('balance')}</span>
        <strong class="bal"><span>${ptsInr(bal)}</span></strong>
        <p class="muted" style="margin-top:-2px">${num(bal)} ${t('points')} · ${t('rateLine')}</p>
        <div class="wh-row"><div><span>${t('lifetime')}</span><b>${ptsInr(S.points)}</b></div><div><span>${t('spentT')}</span><b>${ptsInr(S.spent || 0)}</b></div></div>
        <button class="btn accent" data-act="tab" data-tab="payout" style="margin-top:14px">${icon('wallet')} ${t('getPaid')}</button>
      </article>
      <h2 class="section">${t('shop')}</h2>
      <div class="list">
        <div><span class="row-ic ic-level">${icon('snow')}</span>
          <span class="grow"><strong>${t('saverItem')}</strong><small>${t('saverItemD')}</small><small>${t('ownedN', { n: S.savers })}</small></span>
          <button class="buy" data-act="buy" id="buyBtn" ${can.ok ? '' : 'disabled'}>${can.ok ? icon('star') : ''}${btnLabel}</button></div>
      </div>
      <p class="muted small" style="padding:0 4px">${t('walletNote')}</p>
      <h2 class="section">${t('history')}</h2>
      <div class="list ledger">${rows}</div>
    </section>`;
  }
  function buySaver(btn) {
    const can = L.canBuySaver(S);
    if (!can.ok) return;
    if (!buyArmed) {
      buyArmed = true; btn.classList.add('armed'); btn.textContent = t('confirmBuy', { n: num(L.SAVER_COST) });
      setTimeout(() => { buyArmed = false; if (btn.isConnected && tab === 'wallet') renderWallet(); }, 3500);
      return;
    }
    buyArmed = false;
    S.spent = (S.spent || 0) + L.SAVER_COST;
    S.savers = Math.min(L.MAX_SAVERS, (S.savers || 0) + 1);
    S.ledger.push({ d: todayKey(), t: 'saver', a: -L.SAVER_COST });
    save();
    Sound.play('ok'); buzz(15);
    toast(t('bought'));
    renderWallet();
  }

  /* ── Payout (demo): turn points into rupees ──────────────────────────── */
  let payDraft = null, payArmed = false, payAmt = null;
  const maskTo = (pd) => !pd ? '' : pd.method === 'upi' ? pd.upi : 'A/c ••••' + String(pd.acct).slice(-4);
  function renderPayout() {
    const max = L.maxPayout(S), min = L.MIN_PAYOUT, pd = S.payout;
    const editing = !pd || payDraft;
    const d = payDraft || pd || { method: 'upi', name: S.name, upi: '', acct: '', ifsc: '' };
    if (payAmt === null || payAmt > max) payAmt = max;
    const chips = [50, 100, 200].filter((v) => v <= max).map((v) => `<button class="chip${payAmt === v ? ' on' : ''}" data-act="payAmt" data-v="${v}">${inr(v)}</button>`).join('')
      + (max >= min ? `<button class="chip${payAmt === max ? ' on' : ''}" data-act="payAmt" data-v="${max}">${t('allAmt')} · ${inr(max)}</button>` : '');
    const form = `
      <form class="list payform" id="payForm" novalidate>
        <div><span class="grow">${t('payDetails')}</span>
          <span class="seg" role="group"><button type="button" class="${d.method === 'upi' ? 'on' : ''}" data-act="payMethod" data-v="upi">${t('methodUpi')}</button><button type="button" class="${d.method === 'bank' ? 'on' : ''}" data-act="payMethod" data-v="bank">${t('methodBank')}</button></span></div>
        <label for="pfName"><span class="lbl">${t('fullName')}</span><input id="pfName" class="inline" maxlength="40" autocomplete="name" value="${esc(d.name || '')}"></label>
        ${d.method === 'upi'
          ? `<label for="pfUpi"><span class="lbl">${t('upiId')}</span><input id="pfUpi" class="inline" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('upiPh')}" value="${esc(d.upi || '')}"></label>`
          : `<label for="pfAcct"><span class="lbl">${t('acctNo')}</span><input id="pfAcct" class="inline" inputmode="numeric" maxlength="22" autocomplete="off" value="${esc(d.acct || '')}"></label>
             <label for="pfIfsc"><span class="lbl">${t('ifsc')}</span><input id="pfIfsc" class="inline" maxlength="11" autocapitalize="characters" autocomplete="off" value="${esc(d.ifsc || '')}"></label>`}
      </form>
      <p class="field-err" id="payErr" hidden></p>
      <button class="btn" data-act="paySave">${t('saveDetails')}</button>`;
    const saved = `
      <div class="list">
        <div><span class="row-ic ic-good">${icon(pd && pd.method === 'upi' ? 'zap' : 'wallet')}</span>
          <span class="grow"><strong>${esc(pd ? pd.name : '')}</strong><small>${pd ? (pd.method === 'upi' ? t('methodUpi') : t('methodBank') + ' · ' + esc(pd.ifsc)) : ''} · ${esc(maskTo(pd))}</small></span>
          <button class="link-btn" data-act="payEdit">${t('editDetails')}</button></div>
      </div>`;
    const history = (S.payouts || []).slice().reverse().map((po) => `
        <div><span class="row-ic ${po.status === 'paid' ? 'ic-good' : 'ic-grey'}">${icon(po.status === 'paid' ? 'check' : 'clock')}</span>
          <span class="grow"><strong>${inr(po.inr)} → ${esc(po.to)}</strong><small>${dateLabel(po.d, { day: 'numeric', month: 'short' })} · ${po.ref}</small></span>
          <span class="status ${po.status}">${po.status === 'paid' ? t('stPaid') : t('stProcessing')}</span></div>`).join('');
    app.innerHTML = `
    <section class="screen">
      <div><button class="back-btn" data-act="tab" data-tab="wallet">${icon('back')}${t('wallet')}</button></div>
      <h1 class="large-title">${t('payTitle')}</h1>
      <div class="demo-banner">${icon('info')}<p>${t('demoBanner')}</p></div>
      <article class="card wallet-hero">
        <span class="eyebrow">${t('availableInr')}</span>
        <strong class="bal">${inr(max)}</strong>
        <p class="muted">${num(L.balance(S))} ${t('points')} · ${t('rateLine')}</p>
      </article>
      ${editing ? form : saved}
      ${!editing ? (max >= min ? `
        <h2 class="section">${t('amount')}</h2>
        <div class="chips">${chips}</div>
        <button class="btn accent" data-act="withdraw" id="wdBtn">${t('withdrawBtn', { n: num(payAmt) })}</button>`
        : `<p class="muted small" style="padding:0 4px">${t('minPayout', { n: min })} ${t('needMore', { n: num((min - max) * L.POINTS_PER_RUPEE) })} ${t('points')}.</p>`) : ''}
      <h2 class="section">${t('payouts')}</h2>
      <div class="list">${history || `<div><span class="muted">${t('noPayouts')}</span></div>`}</div>
    </section>`;
  }
  function readPayForm() {
    const d = Object.assign({}, payDraft || S.payout || { method: 'upi' });
    const v = (id) => { const el = $('#' + id); return el ? el.value.trim() : undefined; };
    if (v('pfName') !== undefined) d.name = v('pfName');
    if (v('pfUpi') !== undefined) d.upi = v('pfUpi');
    if (v('pfAcct') !== undefined) d.acct = v('pfAcct').replace(/\s/g, '');
    if (v('pfIfsc') !== undefined) d.ifsc = v('pfIfsc').toUpperCase();
    return d;
  }
  function savePayDetails() {
    const d = readPayForm(), err = $('#payErr');
    const fail = (k) => { if (err) { err.textContent = t(k); err.hidden = false; } Sound.play('bad'); buzz([20, 40, 20]); };
    if (!d.name || d.name.length < 2) return fail('errName');
    if (d.method === 'upi' && !L.validUpi(d.upi)) return fail('errUpi');
    if (d.method === 'bank' && !L.validAcct(d.acct)) return fail('errAcct');
    if (d.method === 'bank' && !L.validIfsc(d.ifsc)) return fail('errIfsc');
    S.payout = d.method === 'upi' ? { method: 'upi', name: d.name, upi: d.upi } : { method: 'bank', name: d.name, acct: d.acct, ifsc: d.ifsc };
    payDraft = null; save();
    Sound.play('ok'); toast(t('savedDetails'));
    renderPayout();
  }
  function withdraw(btn) {
    const max = L.maxPayout(S);
    if (!S.payout) return toast(t('addDetailsFirst'));
    const amt = Math.min(payAmt || max, max);
    if (amt < L.MIN_PAYOUT) return;
    if (!payArmed) {
      payArmed = true; btn.textContent = t('confirmWithdraw', { n: num(amt) }); btn.classList.add('armed');
      setTimeout(() => { if (payArmed) { payArmed = false; if (tab === 'payout') renderPayout(); } }, 4000);
      return;
    }
    payArmed = false;
    const pts = amt * L.POINTS_PER_RUPEE, to = maskTo(S.payout);
    const ref = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    S.spent = (S.spent || 0) + pts;
    S.payouts = S.payouts || [];
    S.payouts.push({ d: todayKey(), inr: amt, pts, to, ref, status: 'processing' });
    S.ledger.push({ d: todayKey(), t: 'payout', a: -pts, to });
    payAmt = null;
    save(); buzz(15);
    renderPayout();
    setTimeout(() => {
      const po = S.payouts.find((x) => x.ref === ref);
      if (po) { po.status = 'paid'; save(); }
      Sound.play('done'); toast(t('payoutDone'));
      if (tab === 'payout') renderPayout();
    }, 2200);
  }

  /* ── Extra daily tasks: easy → hard ─────────────────────────────────── */
  const TASKS = [
    { id: 'word', d: 'e', ic: 'bookmark', max: () => L.DIFF_PTS.e },
    { id: 'listen', d: 'm', ic: 'speaker', max: () => 3 * L.DIFF_PTS.m, voice: true },
    { id: 'hard', d: 'h', ic: 'target', max: () => 3 * L.DIFF_PTS.h, needsDaily: true }
  ];
  const taskDone = (id) => !!((S.tasks[todayKey()] || {})[id]);
  function taskSet(id, day) {
    if (id === 'word') return L.wordQuiz(WORDS, day);
    if (id === 'listen') return L.listenSet(WORDS, day);
    return L.hardSet(BANK, day);
  }
  function tasksCard(today, dailyDone) {
    const rows = TASKS.map((tk) => {
      const res = (S.tasks[today] || {})[tk.id];
      const locked = tk.needsDaily && !dailyDone, noVoice = tk.voice && !Voice.ok;
      const status = res ? `<span class="t-done">${icon('check')} +${res.p}</span>`
        : locked ? `<span class="t-lock">${icon('lock')}</span>`
        : noVoice ? '' : `<span class="t-go">${t('upTo', { n: tk.max() })}${icon('chev', 'chev')}</span>`;
      const sub = locked ? t('taskLocked') : noVoice ? t('needsVoice') : t('task_' + tk.id + 'D');
      const can = !res && !locked && !noVoice;
      return `<${can ? 'button data-act="task" data-id="' + tk.id + '"' : 'div'} class="task${res ? ' done' : ''}${locked || noVoice ? ' off' : ''}">
          <span class="row-ic ${res ? 'ic-good' : 'd-' + tk.d}">${icon(res ? 'check' : tk.ic)}</span>
          <span class="grow"><strong>${t('task_' + tk.id)} <em class="diff d-${tk.d}">${t('d' + tk.d.toUpperCase())}</em></strong><small>${sub}</small></span>
          ${status}</${can ? 'button' : 'div'}>`;
    }).join('');
    const all = TASKS.every((tk) => taskDone(tk.id));
    return `<div><h2 class="section">${t('tasksTitle')} · ${t('rateLine')}</h2></div>
      <div class="list tasks">${rows}</div>${all ? `<p class="muted small" style="padding:0 4px;margin-top:-6px">${icon('check')} ${t('allTasksDone')}</p>` : ''}`;
  }
  function startTask(id) {
    const today = todayKey();
    if (taskDone(id)) return go('home');
    stopTimers();
    if (!S.xrun || S.xrun.date !== today || S.xrun.id !== id) S.xrun = { date: today, id, answers: [], open: null };
    if (S.xrun.open !== null && S.xrun.answers.length === S.xrun.open) S.xrun.answers.push({ ok: false, ms: QTIME, bonus: 0, pick: -1, d: TASKS.find((x) => x.id === id).d });
    S.xrun.open = null;
    save();
    G = { mode: id, set: taskSet(id, today), answers: S.xrun.answers };
    if (G.answers.length >= G.set.length) return finishTask();
    showQuestion();
  }
  function finishTask() {
    const today = todayKey(), id = G.mode, answers = G.answers;
    const c = answers.filter((a) => a.ok).length, n = G.set.length;
    const p = answers.reduce((sum, a) => sum + L.answerPts(a), 0);
    const before = L.levelOf(S.points);
    S.points += p;
    S.correct += c; S.answered += n;
    S.tasks[today] = Object.assign({}, S.tasks[today], { [id]: { c, n, p } });
    if (id === 'word' && c > 0) { const w = L.wordOfDay(WORDS, today); S.learned[w.w] = today; }
    S.ledger.push({ d: today, t: 'task', id, a: p, c, n });
    S.xrun = null;
    const badges = checkBadges(today);
    save();
    const after = L.levelOf(S.points);
    G = null;
    nav.hidden = true;
    const lvUp = after.n > before.n;
    const extra = [
      lvUp ? `<div><span class="row-ic ic-level">${icon('level')}</span><span class="grow">${t('levelUp', { n: after.n })}</span></div>` : '',
      ...badges.map((b) => `<div><span class="row-ic ic-accent">${icon(b.icon)}</span><span class="grow">${t('newBadge', { b: t('b.' + b.id) })}</span></div>`)
    ].join('');
    app.innerHTML = `
    <section class="finish">
      <div class="finish-hero">
        ${rings([{ pct: c / n, color: 'var(--good)' }], `<strong>${c}<small>/${n}</small></strong>`, 168)}
        <h1>${t('taskDone')}</h1>
        <p>${t('task_' + id)} · <span class="diff d-${TASKS.find((x) => x.id === id).d}">${t('d' + TASKS.find((x) => x.id === id).d.toUpperCase())}</span></p>
      </div>
      <div class="metrics">
        <div class="metric a"><span>${t('mPoints')}</span><strong id="total">0</strong></div>
        <div class="metric"><span>${t('mEarned')}</span><strong class="good-t">${ptsInr(p)}</strong></div>
        <div class="metric"><span>${t('mAcc')}</span><strong>${Math.round((c / n) * 100)}%</strong></div>
      </div>
      ${extra ? `<div class="list">${extra}</div>` : ''}
      <div class="finish-actions"><button class="btn" data-act="home">${t('continueBtn')}</button></div>
    </section>`;
    countUp($('#total'), p, 400, 700);
    Sound.play('done');
    toTop();
  }

  /* ── Quiz ────────────────────────────────────────────────────────────── */
  function startDaily() {
    const today = todayKey();
    if (S.history[today]) return go('home');
    clearInterval(tick);
    if (!S.run || S.run.date !== today) S.run = { date: today, answers: [], open: null };
    // A question that was shown but never answered (app closed, page reloaded)
    // counts as missed. This stops people refreshing to dodge a hard question.
    if (S.run.open !== null && S.run.answers.length === S.run.open) S.run.answers.push({ ok: false, ms: QTIME, bonus: 0, pick: -1 });
    S.run.open = null;
    save();
    G = { mode: 'daily', set: L.dailySet(BANK, today), answers: S.run.answers };
    if (G.answers.length >= L.SET_SIZE) return finishDaily();
    showQuestion();
  }
  function startPractice() {
    stopTimers();
    G = { mode: 'practice', set: L.pickSet(BANK, 'practice:' + Date.now()), answers: [] };
    showQuestion();
  }
  const comboCount = () => { let n = 0; for (let i = G.answers.length - 1; i >= 0 && G.answers[i].ok; i--) n++; return n; };

  function showQuestion() {
    const i = G.answers.length, q = G.set[i];
    if (G.mode === 'daily') { S.run.open = i; save(); }
    else if (S.xrun && G.mode === S.xrun.id) { S.xrun.open = i; save(); }
    nav.hidden = true;
    const total = G.set.length, isListen = !!q.say;
    G.locked = false; G.sel = null;
    const qText = isListen ? t('listenQ') : esc(q.q).replace(/“([^”]+)”/g, '<b>“$1”</b>');
    const combo = comboCount();
    app.innerHTML = `
    <section class="play">
      <div class="play-top">
        <button class="icon-btn" data-act="quit" aria-label="${t('close')}">${icon('x')}</button>
        <div class="segs" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${i}">${Array.from({ length: total }, (_, k) => k).map((k) => `<span class="${k < i ? (G.answers[k].ok ? 'ok' : 'no') : k === i ? 'cur' : ''}"></span>`).join('')}</div>
        <div class="timer" id="timer" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke-width="3" class="t-track"/><circle cx="18" cy="18" r="15" fill="none" stroke-width="3" stroke-linecap="round" class="t-fill" id="tfill" stroke-dasharray="94.25" style="animation-duration:${QTIME}ms"/></svg><b id="tsec">${QTIME / 1000}</b></div>
      </div>
      <div class="q-wrap">
        <div class="q-cat"><span class="dot"></span>${G.mode === 'practice' ? t('practiceTag') + ' · ' : ''}${t('cat.' + q.c)} · <em class="diff d-${q.d}">${t('d' + (q.d || 'm').toUpperCase())}</em> · ${i + 1}/${total}${combo >= 2 ? `<span class="combo">${t('inARow', { n: combo })}</span>` : ''}</div>
        ${isListen ? `<button class="hear" data-act="speak" data-text="${esc(q.say)}" id="hearBtn">${icon('speaker')}<span>${t('playAgain')}</span></button>` : ''}
        <div class="q-row"><h2 class="question${isListen ? ' small-q' : ''}" id="qtext">${qText}</h2>${isListen ? '' : listenBtn(q.q.replace(/[“”]/g, '') + ' ' + q.o.map((o, k) => (k + 1) + '. ' + o).join('. '), 'q-listen')}</div>
        <div class="opts" role="radiogroup" aria-labelledby="qtext">
          ${q.o.map((o, k) => `<button class="opt" role="radio" aria-checked="false" data-act="select" data-k="${k}"><span class="txt">${esc(o)}</span><span class="radio">${icon(k === q.a ? 'check' : 'x')}</span></button>`).join('')}
        </div>
      </div>
      <div class="foot" id="foot"><div class="foot-in"><button class="btn" id="checkBtn" data-act="check" disabled>${t('check')}</button></div></div>
    </section>`;
    toTop();
    if (isListen) setTimeout(() => Voice.speak(q.say, $('#hearBtn')), 350);
    G.t0 = performance.now();
    G.timer = setTimeout(() => pick(G.sel === null ? -1 : G.sel, true), QTIME);
    const sec = $('#tsec'), tm = $('#timer');
    G.clock = setInterval(() => {
      const left = Math.max(0, Math.ceil((QTIME - (performance.now() - G.t0)) / 1000));
      if (sec) sec.textContent = left;
      if (tm) tm.classList.toggle('low', left <= 5);
    }, 200);
  }

  function select(k) {
    if (!G || G.locked) return;
    G.sel = k;
    $$('.opt').forEach((b, j) => { b.classList.toggle('sel', j === k); b.setAttribute('aria-checked', j === k); });
    const cb = $('#checkBtn'); if (cb) cb.disabled = false;
    Sound.play('tap'); buzz(6);
  }

  function pick(k, timedOut = false) {
    if (!G || G.locked) return;
    G.locked = true;
    clearTimeout(G.timer); clearInterval(G.clock);
    const i = G.answers.length, q = G.set[i];
    const ms = Math.round(performance.now() - G.t0);
    const ok = k === q.a;
    const bonus = L.speedBonus(ok, ms);
    G.answers.push({ ok, ms, bonus, pick: k, d: q.d });
    if (G.mode === 'daily') { S.run.answers = G.answers; S.run.open = null; save(); }
    else if (S.xrun && G.mode === S.xrun.id) { S.xrun.answers = G.answers; S.xrun.open = null; save(); }

    const tf = $('#tfill'); if (tf) tf.style.animationPlayState = 'paused';
    $$('.opt').forEach((b, j) => {
      b.disabled = true; b.classList.remove('sel');
      if (j === q.a) b.classList.add('is-correct');
      else if (j === k) b.classList.add('is-wrong');
      else b.classList.add('is-dim');
    });
    const seg = $$('.segs span')[i]; if (seg) seg.className = ok ? 'ok' : 'no';
    buzz(ok ? 12 : [20, 40, 20]);
    Sound.play(ok ? 'ok' : 'bad');

    const head = ok ? t('c' + (1 + (i % 4))) : timedOut && k === -1 ? t('timeUp') : t('wrong');
    const foot = $('#foot');
    foot.className = 'foot answered ' + (ok ? 'good' : 'bad');
    foot.innerHTML = `<div class="foot-in" role="status">
      <div class="verdict"><span class="vi">${icon(ok ? 'check' : timedOut && k === -1 ? 'clock' : 'x')}</span><h3>${head}</h3>
        ${G.mode !== 'practice' && ok ? `<span class="pts">+${L.answerPts({ ok, d: q.d }) + (G.mode === 'daily' ? bonus : 0)}</span>` : ''}</div>
      ${!ok ? `<p class="answer-line">${t('correctSolution')} <b>${esc(q.o[q.a])}</b></p>` : ''}
      <p class="explain">${esc(q.e)} ${listenBtn((ok ? '' : q.o[q.a] + '. ') + q.e, 'inline')}</p>
      <button class="btn ${ok ? 'good' : ''}" data-act="next" id="nextBtn">${t('continueBtn')}</button>
    </div>`;
    const nb = $('#nextBtn'); if (nb) nb.focus({ preventScroll: true });
  }

  function next() {
    if (!G) return;
    Voice.stop();
    if (G.answers.length < G.set.length) return showQuestion();
    if (G.mode === 'daily') finishDaily(); else if (G.mode === 'practice') showPracticeResult(); else finishTask();
  }

  function finishDaily() {
    const today = todayKey();
    const answers = G.answers;
    const prevStreak = L.streakStatus(S, today).state === 'lost' ? 0 : S.streak;
    const ns = L.nextStreak(S, today);
    const sc = L.scoreDay(answers, ns.streak);
    const before = L.levelOf(S.points);

    S.streak = ns.streak; S.savers = ns.savers; S.last = today; S.best = Math.max(S.best, S.streak);
    if (ns.used) S.saverUsed += 1;
    S.points += sc.total;
    S.correct += sc.correct; S.answered += answers.length;
    S.fast += answers.filter((a) => a.ok && a.ms < 5000).length;
    S.history[today] = { c: sc.correct, p: sc.total, r: answers.map((a) => (a.ok ? 1 : 0)), g: answers.map((a) => ({ ok: a.ok, ms: a.ms })) };
    S.run = null;
    S.ledger.push({ d: today, t: 'day', a: sc.total, c: sc.correct });
    const badges = checkBadges(today);
    save();
    const after = L.levelOf(S.points);
    const avg = answers.reduce((s, a) => s + a.ms, 0) / answers.length / 1000;
    G = null;
    lastResult = Object.assign({}, sc, { answers, badges, before, after, used: ns.used, earned: ns.earned, prevStreak, avg });
    showResult(lastResult);
  }

  function showResult(r) {
    nav.hidden = true;
    const perfect = r.correct === 5;
    const lvUp = r.after.n > r.before.n;
    const rows = [
      `<div><span class="row-ic ic-good">${icon('check')}</span><span class="grow">${t('correctAns')} · ${r.correct}/5</span><span class="val">+${r.base}</span></div>`,
      `<div><span class="row-ic ic-grey">${icon('clock')}</span><span class="grow">${t('mTime')}</span><span class="val">${r.avg.toFixed(1)}s</span></div>`,
      `<div><span class="row-ic ic-level">${icon('zap')}</span><span class="grow">${t('speedBonus')}</span><span class="val">+${r.speed}</span></div>`,
      r.perfect ? `<div><span class="row-ic ic-accent">${icon('target')}</span><span class="grow">${t('perfectBonus')}</span><span class="val">+${r.perfect}</span></div>` : '',
      r.mult > 1 ? `<div><span class="row-ic ic-accent">${icon('flame')}</span><span class="grow">${t('streakBonus')}</span><span class="val">×${r.mult}</span></div>` : ''
    ].join('');
    const rewards = [
      lvUp ? `<div><span class="row-ic ic-level">${icon('level')}</span><span class="grow">${t('levelUp', { n: r.after.n })}</span></div>` : '',
      r.used ? `<div><span class="row-ic ic-grey">${icon('snow')}</span><span class="grow">${t('saverUsed')}</span></div>` : '',
      r.earned ? `<div><span class="row-ic ic-grey">${icon('snow')}</span><span class="grow">${t('saverEarned')}</span></div>` : '',
      ...r.badges.map((b) => `<div><span class="row-ic ic-accent">${icon(b.icon)}</span><span class="grow">${t('newBadge', { b: t('b.' + b.id) })}</span></div>`)
    ].join('');
    app.innerHTML = `
    <section class="finish">
      <div class="finish-hero">
        ${rings([{ pct: 1, color: C_ACCENT }, { pct: r.correct / 5, color: 'var(--good)' }], `<strong>${r.correct}<small>/5</small></strong>`, 168)}
        <h1>${perfect ? t('perfectDay') : t('setDone')}</h1>
        <p>${dateLabel(todayKey())}</p>
      </div>
      <div class="metrics">
        <div class="metric a"><span>${t('mPoints')}</span><strong id="total">0</strong></div>
        <div class="metric"><span>${t('mEarned')}</span><strong class="good-t">${ptsInr(r.total)}</strong></div>
        <div class="metric"><span>${t('mAcc')}</span><strong>${Math.round((r.correct / 5) * 100)}%</strong></div>
      </div>
      <div class="list">${rows}</div>
      ${rewards ? `<div class="list">${rewards}</div>` : ''}
      <div class="finish-actions">
        <button class="btn" data-act="toStreak">${t('continueBtn')}</button>
        <button class="btn plain" data-act="share">${t('share')}</button>
      </div>
    </section>`;
    countUp($('#total'), r.total, 500, 900);
    Sound.play('done');
    toTop();
  }

  function showStreak() {
    const r = lastResult;
    if (!r) return go('home');
    app.innerHTML = `
    <section class="finish">
      <div class="streak-hero">
        <svg class="flame-big" viewBox="0 0 24 24" aria-hidden="true"><path d="${P.flame}" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
        <div class="streak-num" id="snum">${num(r.prevStreak)}</div>
        <h1>${t('dayStreakBig')}</h1>
        <p>${r.prevStreak === 0 ? t('streakStarted') : t('streakExtended')} ${t('streakMsg')}</p>
      </div>
      <div class="card">${weekRow(todayKey())}</div>
      <div class="finish-actions"><button class="btn" data-act="home">${t('continueBtn')}</button></div>
    </section>`;
    toTop();
    const el = $('#snum');
    setTimeout(() => {
      if (!el || !el.isConnected) return;
      el.textContent = num(S.streak);
      if (el.animate && !reduceMotion()) el.animate([{ transform: 'translateY(30%)', opacity: 0, color: 'var(--accent)' }, { transform: 'none', opacity: 1, color: 'var(--accent)' }, { color: 'var(--ink)' }], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' });
      Sound.play('streak'); buzz(20);
    }, 650);
  }

  function showPracticeResult() {
    const n = G.answers.filter((a) => a.ok).length;
    G = null;
    app.innerHTML = `
    <section class="finish">
      <div class="finish-hero">
        ${rings([{ pct: n / 5, color: 'var(--good)' }], `<strong>${n}<small>/5</small></strong>`, 168)}
        <h1>${t('practiceTitle')}</h1>
        <p>${t('practiceBody', { n })}</p>
      </div>
      <div class="finish-actions">
        <button class="btn" data-act="practice">${t('again')}</button>
        <button class="btn plain" data-act="home">${t('backHome')}</button>
      </div>
    </section>`;
    toTop();
  }

  function countUp(el, to, delay = 350, dur = 1000) {
    if (!el) return;
    if (reduceMotion() || to <= 0) { el.textContent = num(to); return; }
    el.textContent = num(0);
    setTimeout(() => {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = num(Math.round(to * e));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
  }

  function askQuit() {
    if (!G || G.mode === 'practice') return go('home');
    const d = document.createElement('div');
    d.className = 'overlay';
    d.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="qtitle">
      <h3 id="qtitle">${t('quitTitle')}</h3>
      <p>${t('quitBody')}</p>
      <button class="btn" data-act="stay">${t('stay')}</button>
      <button class="btn plain" data-act="leave" style="color:var(--bad)">${t('leave')}</button>
    </div>`;
    ($('#phone') || document.body).appendChild(d);
    $('[data-act="stay"]', d).focus();
  }
  const closeDialog = () => { const o = $('.overlay'); if (o) o.remove(); };

  /* ── Share ───────────────────────────────────────────────────────────── */
  async function share() {
    const k = todayKey(), h = S.history[k];
    if (!h) return;
    const url = /^https?:/.test(location.protocol) ? location.origin + location.pathname : '';
    const text = `Daylit · ${dateLabel(k, { day: 'numeric', month: 'short' })}\n${h.r.map((x) => (x ? '🟩' : '⬜')).join('')} ${h.c}/5\n${t('streakDays', { n: S.streak })}${url ? '\n' + url : ''}`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch (e) { toast(text.replace(/\n/g, ' ')); }
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ── League ──────────────────────────────────────────────────────────── */
  function renderLeague() {
    const today = todayKey(), ws = L.weekStart(today);
    const me = { name: S.name, pts: L.weekPoints(S.history, ws, today), me: true };
    const rows = L.BOTS.map((n) => ({ name: n, pts: L.botWeek(n, ws, today) })).concat(me)
      .sort((a, b) => b.pts - a.pts || (a.me ? -1 : b.me ? 1 : 0));
    const left = 7 - L.diffDays(ws, today);
    const range = `${dateLabel(ws, { day: 'numeric', month: 'short' })} – ${dateLabel(L.addDays(ws, 6), { day: 'numeric', month: 'short' })}`;
    app.innerHTML = `
    <section class="screen">
      <h1 class="large-title" style="margin-top:8px">${t('weeklyLeague')}</h1>
      <div class="league-sub"><span class="muted">${range}</span><span class="ends">${left <= 1 ? t('dayLeft') : t('daysLeftN', { d: left })}</span></div>
      <div class="list board">
        ${rows.map((r, i) => `
          ${i === 3 ? `<div class="zone">${t('topZone')} ↑</div>` : ''}
          <div class="${r.me ? 'me' : ''} ${i < 3 ? 'top' : ''}" style="--i:${i}">
            <span class="rank">${i + 1}</span>${avatar(r.name)}
            <span class="grow"><strong>${esc(r.name)}</strong>${r.me ? `<small>${t('you')}</small>` : ''}</span>
            <span class="val">${num(r.pts)}</span>
          </div>`).join('')}
      </div>
      <p class="muted small" style="padding:0 4px">${t('leagueNote')}</p>
    </section>`;
  }

  /* ── Achievements ────────────────────────────────────────────────────── */
  function renderBadges() {
    const got = BADGES.filter((b) => S.badges[b.id]).length;
    const mring = (pct) => { const r = 28, C = 2 * Math.PI * r; return `<svg class="mring" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--card-2)" stroke-width="3"/>${pct > 0 ? `<circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(2)}"/>` : ''}</svg>`; };
    app.innerHTML = `
    <section class="screen">
      <h1 class="large-title" style="margin-top:8px">${t('achievements')}</h1>
      <p class="muted" style="margin-top:-8px">${t('badgesCount', { n: got, m: BADGES.length })}</p>
      <div class="ach">
        ${BADGES.map((b, i) => {
          const d = S.badges[b.id];
          const [c, goal] = b.prog();
          const pct = d ? 1 : Math.min(1, c / goal);
          return `<div class="medal-card${d ? ' got' : ''}" style="--i:${i}" title="${t('b.' + b.id + '.d')}">
            <span class="medal">${mring(pct)}<span class="m-core">${icon(b.icon)}</span></span>
            <strong>${t('b.' + b.id)}</strong>
            <small>${d ? dateLabel(d, { day: 'numeric', month: 'short' }) : `${num(Math.min(c, goal))}/${num(goal)}`}</small>
          </div>`; }).join('')}
      </div>
      <div class="list">${BADGES.filter((b) => !S.badges[b.id]).slice(0, 3).map((b) => `<div><span class="row-ic ic-grey">${icon(b.icon)}</span><span class="grow"><strong>${t('b.' + b.id)}</strong><small>${t('b.' + b.id + '.d')}</small></span></div>`).join('')}</div>
    </section>`;
  }

  /* ── Profile ─────────────────────────────────────────────────────────── */
  function renderProfile() {
    const today = todayKey(), lv = L.levelOf(S.points);
    const acc = S.answered ? Math.round((S.correct / S.answered) * 100) : 0;
    const joined = S.joined || Object.keys(S.history).sort()[0] || today;
    const ws = L.weekStart(today), hmStart = L.addDays(ws, -28);
    const heads = Array.from({ length: 7 }, (_, i) => `<span class="hd">${L.parse(L.addDays(ws, i)).toLocaleDateString(loc(), { weekday: 'narrow' })}</span>`).join('');
    const cells = Array.from({ length: 35 }, (_, i) => {
      const k = L.addDays(hmStart, i), h = S.history[k];
      const lvl = h ? (h.c >= 5 ? 'l3' : h.c >= 3 ? 'l2' : 'l1') : '';
      return `<span class="c ${lvl}${k === today ? ' t' : ''}${k > today ? ' f' : ''}" title="${dateLabel(k, { day: 'numeric', month: 'short' })}${h ? ` · ${h.c}/5` : ''}"></span>`;
    }).join('');
    const rules = [['check', 'ic-good', 'rule1b'], ['wallet', 'ic-good', 'rateRule'], ['zap', 'ic-level', 'rule2'], ['target', 'ic-accent', 'rule3'], ['flame', 'ic-accent', 'rule4'], ['snow', 'ic-grey', 'saverHelp'], ['info', 'ic-grey', 'rule5']];
    app.innerHTML = `
    <section class="screen">
      <header class="p-head">
        <span class="av">${initial(S.name)}</span>
        <div><h1>${esc(S.name)}</h1><p>${t('level', { n: lv.n })} · ${levelName(lv.n)} · ${t('joined', { d: dateLabel(joined, { month: 'short', year: 'numeric' }) })}</p></div>
      </header>
      <div class="stats">
        <div class="stat"><span>${t('dayStreak')}</span><strong>${num(S.streak)}</strong></div>
        <div class="stat"><span>${t('totalPoints')}</span><strong>${num(S.points)}</strong></div>
        <div class="stat"><span>${t('accuracy')}</span><strong>${acc}<small>%</small></strong></div>
        <div class="stat"><span>${t('bestStreak')}</span><strong>${num(S.best)}</strong></div>
        <div class="stat"><span>${t('wordsLearned')}</span><strong>${num(Object.keys(S.learned || {}).length)}</strong></div>
        <button class="stat" data-act="tab" data-tab="wallet" style="text-align:left"><span>${t('balance')}</span><strong>${num(L.balance(S))}</strong></button>
      </div>
      <h2 class="section">${t('activity')}</h2>
      <div class="card"><div class="heat">${heads}${cells}</div></div>
      <h2 class="section">${t('settings')}</h2>
      <div class="list">
        <label for="pname"><span class="row-ic ic-grey">${icon('pen')}</span><span>${t('yourName')}</span><input id="pname" class="inline" maxlength="20" value="${esc(S.name)}" autocomplete="given-name"></label>
        <div><span class="row-ic ic-level">${icon('globe')}</span><span class="grow">${t('language')}</span>
          <span class="seg" role="group"><button type="button" class="${S.lang === 'en' ? 'on' : ''}" data-act="setlang" data-v="en">English</button><button type="button" class="${S.lang === 'hi' ? 'on' : ''}" data-act="setlang" data-v="hi">हिन्दी</button></span></div>
        <label for="sndToggle"><span class="row-ic ic-accent">${icon('sound')}</span><span class="grow">${t('sound')}</span><input type="checkbox" id="sndToggle" class="switch" ${S.sound === false ? '' : 'checked'}></label>
      </div>
      <h2 class="section">${t('howPoints')}</h2>
      <div class="list rules">${rules.map(([ic, c, k]) => `<div><span class="row-ic ${c}">${icon(ic)}</span><p class="grow">${t(k)}</p></div>`).join('')}</div>
      <div class="list"><button class="danger-row" data-act="reset" id="resetBtn">${t('reset')}</button></div>
      <p class="app-ver">${brand()} <span>3.0</span></p>
    </section>`;
  }

  /* ── Events ──────────────────────────────────────────────────────────── */
  let resetArmed = false;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    switch (el.dataset.act) {
      case 'tab': go(el.dataset.tab); break;
      case 'speak': Voice.speak(el.dataset.text, el); break;
      case 'learn': S.learned = S.learned || {}; S.learned[el.dataset.w] = todayKey(); save(); Sound.play('ok'); buzz(10); render(); break;
      case 'buy': buySaver(el); break;
      case 'task': startTask(el.dataset.id); break;
      case 'payMethod': payDraft = readPayForm(); payDraft.method = el.dataset.v; renderPayout(); break;
      case 'payEdit': payDraft = Object.assign({}, S.payout); renderPayout(); break;
      case 'paySave': savePayDetails(); break;
      case 'payAmt': payAmt = Number(el.dataset.v); payArmed = false; renderPayout(); break;
      case 'withdraw': withdraw(el); break;
      case 'obNext': obNext(); break;
      case 'obBack': ob.step = Math.max(0, ob.step - 1); renderOnboarding(); break;
      case 'obLang': S.lang = el.dataset.v; save(); renderOnboarding(); break;
      case 'obDone': obDone(); break;
      case 'play': startDaily(); break;
      case 'practice': startPractice(); break;
      case 'select': select(Number(el.dataset.k)); break;
      case 'check': if (G && G.sel !== null) pick(G.sel); break;
      case 'next': next(); break;
      case 'toStreak': showStreak(); break;
      case 'quit': askQuit(); break;
      case 'stay': closeDialog(); break;
      case 'leave': closeDialog(); go('home'); break;
      case 'home': go('home'); break;
      case 'share': share(); break;
      case 'setlang': S.lang = el.dataset.v; save(); render(); break;
      case 'reset':
        if (!resetArmed) {
          resetArmed = true; el.textContent = t('resetSure'); el.classList.add('armed');
          setTimeout(() => { resetArmed = false; if (el.isConnected) { el.textContent = t('reset'); el.classList.remove('armed'); } }, 4000);
        } else { const lang = S.lang; S = fresh(); S.lang = lang; save(); resetArmed = false; ob = { step: 0, name: '' }; tab = 'home'; render(); toTop(); }
        break;
    }
  });
  document.addEventListener('submit', (e) => { if (e.target.id === 'welcomeForm') { e.preventDefault(); obNext(); } });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'nm') { ob.name = e.target.value; const b = $('#obNext'); if (b) b.disabled = !ob.name.trim(); const er = $('#nmErr'); if (er) er.hidden = true; }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'sndToggle') { S.sound = e.target.checked; save(); if (S.sound) Sound.play('ok'); return; }
    if (e.target.id === 'pname') { const v = e.target.value.trim(); if (v) { S.name = v.slice(0, 20); save(); toast('✓'); } }
  });
  document.addEventListener('keydown', (e) => {
    if ($('.overlay')) { if (e.key === 'Escape') closeDialog(); return; }
    if (!G || !$('.play')) return;
    const k = { 1: 0, 2: 1, 3: 2, 4: 3 }[e.key];
    if (!G.locked && k !== undefined) select(k);
    if (e.key === 'Enter') { e.preventDefault(); if (!G.locked && G.sel !== null) pick(G.sel); else if (G.locked) next(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && todayKey() !== lastDay && !G) { lastDay = todayKey(); go('home'); }
  });
  window.addEventListener('offline', () => toast(t('offline')));

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  render();

  // Launch screen: once per session, skipped for reduced motion.
  const splash = $('#splash');
  let seen = false;
  try { seen = sessionStorage.getItem('daylit:splash') === '1'; sessionStorage.setItem('daylit:splash', '1'); } catch (e) { /* storage blocked */ }
  if (splash) {
    if (seen || reduceMotion()) splash.remove();
    else { splash.classList.add('play'); setTimeout(() => splash.classList.add('out'), 1100); setTimeout(() => splash.remove(), 1600); }
  }
})();
