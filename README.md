# Daylit

<img src="icons/icon.svg" width="72" alt="Daylit logo">

**A one-minute English habit.** Five short questions a day, from easy to hard, plus three extra tasks. Players keep a streak, earn points worth rupees, level up, collect badges and climb a weekly league.

Built for people on modest Android phones and mobile data who read English as a second language.

| | |
|---|---|
| **Live app** | https://daylit5.vercel.app (best on a phone) |
| **Walkthrough video** (3 min) | https://drive.google.com/file/d/1mwe1qkdR-4KL5hPPvGjFpsvUDz5jbuJg/view?usp=sharing |
| **Explainer** | [EXPLAINER.md](EXPLAINER.md): what I built, the choices I made, what I left out |

---

## Quick start

You need **Git** and **Node.js 18 or newer**. Nothing else: there are no dependencies to install and no build step.

```bash
git clone https://github.com/sangralrahul/daylit.git
cd daylit
npm start
```

Then open **http://localhost:5173** in your browser.

To stop the server, press `Ctrl + C`.

### What you should see

1. A short launch animation, then **"A one-minute English habit."** with a **Get started** button.
2. Four quick steps: language, your name, and how it works.
3. The **home screen**, with three rings, today's five questions and a **Start today's five** button.

On a laptop, the app appears inside a phone frame next to a short description. To see the phone layout full screen, open your browser's developer tools and turn on device mode (`Ctrl + Shift + M` in Chrome), or open the link on your phone.

### Run the tests

```bash
npm test
```

15 tests, using Node's built-in test runner. They cover the daily question set and its easy-to-hard order, the extra tasks, scoring, streaks and streak savers, levels, the league, word of the day, the wallet, and rupee and payout-detail checks.

Expected output ends with:

```
# tests 15
# pass 15
# fail 0
```

---

## Other ways to run it

Any static file server works, because the app is plain HTML, CSS and JavaScript.

| You have | Command | Then open |
|---|---|---|
| Node.js 18+ | `npm start` | http://localhost:5173 |
| Node.js, different port | `npm start -- 8080` | http://localhost:8080 |
| Python 3 (macOS / Linux) | `python3 -m http.server 5173` | http://localhost:5173 |
| Python 3 (Windows) | `py -m http.server 5173` | http://localhost:5173 |
| Nothing installed | Double-click `index.html` | (opens directly) |

Opening `index.html` directly works for everything except offline mode. Service workers need a real `http://` address.

### Try other days without waiting

Daily apps are hard to test in one sitting. Add `?date=YYYY-MM-DD` to the address to pretend it's another day:

```
http://localhost:5173/?date=2026-10-13
http://localhost:5173/?date=2026-10-14
```

- Play one date, then the next date: the streak grows.
- Skip a date: a streak saver is used, or the streak resets.
- To start over, go to **Me → Delete my progress** (tap twice to confirm).

### Troubleshooting

| Problem | Fix |
|---|---|
| `npm` or `node` is not recognised | Install Node.js 18+ from https://nodejs.org, then open a new terminal. |
| "Port 5173 is busy" | Run `npm start -- 8080` and open http://localhost:8080. |
| You still see an old version after changing files | Hard refresh (`Ctrl + Shift + R`). The service worker caches files, so bump `VERSION` in `sw.js` when you change them. |
| The **Listen** buttons don't appear | The device has no text-to-speech voice. On Android, install "Speech Services by Google". |
| The app shows another person's progress | Progress is saved in the browser. Use **Me → Delete my progress**, or a private window. |

---

## Deploy (free)

It's a static folder, so any static host works.

| Host | Steps |
|---|---|
| **Vercel** (used for the live app) | Import the repo at https://vercel.com/new. Framework preset: **Other**. Leave the build command empty. `vercel.json` sets caching headers. |
| **Netlify** | Drag the folder onto https://app.netlify.com/drop |
| **GitHub Pages** | Repo → Settings → Pages → Deploy from branch `main`, folder `/` |
| **Cloudflare Pages** | Connect the repo, leave the build command empty, output directory `/` |

---

## Features

- **Today's five:** five questions, easy → easy → medium → medium → hard. Everyone gets the same set each day. Tap an answer, then **Check**. 20-second timer with a speed bonus. Every answer shows a one-line explanation.
- **Three extra tasks a day:** Word quiz (easy), Listen and choose (medium), and Hard challenge (hard, unlocks after today's five).
- **Listen:** speaker buttons read questions and explanations aloud with the phone's own voice (offline, no data).
- **Word of the day:** syllables, meaning, Hindi meaning and an example sentence.
- **Rewards:** points, streaks with a multiplier, streak savers, levels, 9 badges and a weekly league.
- **Wallet:** balance in points and rupees, a dated history of every entry, and a shop to buy streak savers.
- **Get paid (demo):** add a UPI ID or bank account (format checked), withdraw from ₹50, see Processing → Paid. Simulated: no money moves, and details stay on the device.
- **English or Hindi interface**, light and dark mode, sound effects with an on/off switch, and installable to the home screen.
- **Fair by design:** points are earned once per day, and closing or reloading the page during a question counts it as missed, so a hard question can't be skipped.

---

## How the rewards work

| Reward | Rule |
|---|---|
| Points | Easy 10, medium 15, hard 20 per correct answer. Today's five also gives a speed bonus (+5 under 5 s, +3 under 10 s) and +20 for 5/5. |
| Streak | +1 for each day you finish today's five. Bonus: ×1.25 from 3 days, ×1.5 from 7, ×1.75 from 14, ×2 from 30. |
| Streak savers | Earn one every 7 streak days, or buy one for 200 points (hold up to 2). A saver covers a missed day. |
| Levels | Level 2 at 100 points, level 3 at 300, level 4 at 600, level 5 at 1,000 (`50 × n × (n−1)`). |
| Rupees (demo) | 10 points = ₹1. Minimum payout ₹50. |
| Wallet | Balance = lifetime points − points spent. Level and league always use lifetime points, so spending never costs you rank. |
| League | Weekly, Monday to Sunday. In this demo the other players are simulated, and the app says so. |

Practice mode is for learning and earns nothing.

---

## Project structure

```
daylit/
├── index.html            App shell, plus a desktop-only intro panel next to a phone frame
├── css/
│   ├── styles.css        All styles. Design tokens at the top; light and dark themes
│   └── fonts.css         @font-face for the self-hosted font
├── fonts/geist.woff2     Geist, Latin subset only (SIL Open Font License)
├── js/
│   ├── questions.js      Question bank: 102 questions in 11 categories
│   ├── words.js          Word-of-the-day list
│   ├── i18n.js           All interface text, English + Hindi
│   ├── logic.js          Pure game rules (no DOM): dates, seeded question sets,
│   │                     difficulty, scoring, streaks, levels, league, wallet, payouts
│   └── app.js            UI: screens, events, saving to localStorage
├── sw.js                 Service worker (offline support)
├── manifest.webmanifest  Install-to-home-screen settings
├── icons/                App icons
├── scripts/serve.js      Tiny local server used by `npm start` (no dependencies)
├── tests/logic.test.js   Unit tests for logic.js
├── vercel.json           Caching headers for Vercel
├── EXPLAINER.md          What I built, the choices I made, what I left out
└── VIDEO_SCRIPT.md       Narration of the walkthrough video, with timestamps
```

`logic.js` has no DOM code, so the same file runs in the browser and in the tests. A future server could reuse it to score answers, which a real-money version would need.

### Adding questions

Add an object to `js/questions.js`. **Write the correct answer first**; options are shuffled at runtime.

```js
{ c: 'meaning', q: 'What does “calm” mean?', o: ['Quiet and peaceful', 'Very angry', 'Very fast', 'Very cold'], e: 'A calm sea has no big waves.' }
```

| Difficulty | Categories |
|---|---|
| Easy | `odd`, `math`, `synonym`, `opposite` |
| Medium | `meaning`, `gap`, `spelling` |
| Hard | `idiom`, `phrasal`, `grammar`, `vocab` |

Run `npm test` afterwards; a test checks that every question has four different options.

---

## Tech

- Plain HTML, CSS and JavaScript (ES2017+). No framework, no build step, no runtime dependencies.
- About 70 KB on first load, then offline via the service worker.
- Progress is stored in `localStorage` on the device. There is no backend in this version; see "What I left out" in [EXPLAINER.md](EXPLAINER.md).
- Tested on a 360 × 760 phone viewport in light and dark mode, and on desktop Chrome.

## License

MIT
