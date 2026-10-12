# Daylit

<img src="icons/icon.svg" width="72" alt="Daylit logo">

Five short English questions a day, plus three extra tasks from easy to hard. Players keep a streak, earn points, level up, collect badges and climb a weekly league.

Built for people on modest Android phones and mobile data who read English as a second language.

- **Zero dependencies, no build step.** Plain HTML, CSS and JavaScript.
- **About 70 KB on first load** (about 35 KB of code gzipped plus a 29 KB font, no images). Works offline after the first visit (service worker), so daily play costs no data.
- **English and Hindi interface.** The questions stay in English, because practising English is the point.

---

## Run it locally

You need any static file server. Pick one:

```bash
git clone <this-repo-url> daylit
cd daylit

# Option A: Python (already on most machines)
python3 -m http.server 5173

# Option B: Node 18+
npm start
```

Open **http://localhost:5173**. You can also open `index.html` directly from disk. Everything works except offline mode, because service workers need `http(s)`.

### Run the tests

```bash
npm test
```

This uses Node's built-in test runner, so there is nothing to install. The tests cover the daily question set, streaks, streak savers, scoring, levels and the league.

### Try other days without waiting

Add `?date=YYYY-MM-DD` to the URL to pretend it is another day:

```
http://localhost:5173/?date=2026-10-13
```

Play one day, then open the next date to see the streak grow. Skip a date to see a streak saver used or a streak broken. To start over, go to **Me → Delete my progress**.

---

## Deploy (free)

It is a static folder, so any static host works.

| Host | Steps |
|---|---|
| **Netlify** | Drag the folder onto app.netlify.com/drop |
| **Vercel** | `npx vercel` in the folder, accept the defaults |
| **GitHub Pages** | Push the repo → Settings → Pages → Deploy from branch `main`, folder `/` |
| **Cloudflare Pages** | Connect the repo, leave the build command empty, output directory `/` |

When you change any file, bump `VERSION` in `sw.js` so returning players get the update.

---

## Project structure

```
daylit/
├── index.html            App shell, plus a desktop-only showcase panel next to a phone frame.
├── css/styles.css        All styles. Design tokens at the top, light and dark themes.
├── css/fonts.css         @font-face rule for the self-hosted font.
├── fonts/                Geist, Latin subset only (SIL OFL).
├── js/
│   ├── questions.js      Question bank (70 questions, 7 categories).
│   ├── i18n.js           All interface text, English + Hindi.
│   ├── words.js          Word-of-the-day list (word, syllables, meaning, Hindi, example).
│   ├── logic.js          Pure game rules: dates, seeded picking, scoring, streaks, levels, league.
│   └── app.js            UI: screens, events, localStorage.
├── sw.js                 Service worker for offline use.
├── manifest.webmanifest  Lets players install it to the home screen.
├── icons/                App icons (SVG + PNG).
├── tests/logic.test.js   Unit tests for logic.js.
├── EXPLAINER.md          What I built, the choices I made, and what I left out.
└── package.json          `npm start` and `npm test` only. No dependencies.
```

`logic.js` has no DOM code, so the same file runs in the browser and in the tests.

### Adding questions

Add an object to `js/questions.js`. **Write the correct answer first.** Options are shuffled at runtime.

```js
{ c: 'meaning', q: 'What does “calm” mean?', o: ['Quiet and peaceful', 'Very angry', 'Very fast', 'Very cold'], e: 'A calm sea has no big waves.' }
```

Categories: `meaning`, `opposite`, `gap`, `spelling`, `odd`, `math`, `synonym`. Each day uses 5 of the 7.

---

## How the rewards work

| Reward | Rule |
|---|---|
| Points | Easy 10, medium 15, hard 20 per correct answer. Speed bonus: +5 under 5 s, +3 under 10 s. +20 for 5/5. |
| Streak | +1 for each day you finish the set. Bonus: ×1.25 from 3 days, ×1.5 from 7, ×1.75 from 14, ×2 from 30. |
| Streak savers | You earn one every 7 streak days (keep up to 2). A saver covers a missed day. |
| Levels | Level 2 at 100 points, level 3 at 300, level 4 at 600, level 5 at 1,000 (`50 × n × (n−1)`). |
| Badges | 9 badges for first day, 5/5, streaks, speed, points, saver use and level 5. |
| Tasks | Today's five (easy → hard) plus Word quiz, Listen and choose, and Hard challenge, each once a day. |
| Rupees (demo) | 10 points = ₹1. Withdraw from ₹50 to a UPI ID or bank account. Simulated: no money moves, details stay on the device. |
| Wallet | Balance = lifetime points − points spent. A streak saver costs 200 in the shop. Level and league always use lifetime points. |
| League | Weekly ranking, Monday to Sunday. In this demo the other players are simulated and labelled as such. |

Points are earned **once per day**. Practice mode exists for learning and earns nothing.
