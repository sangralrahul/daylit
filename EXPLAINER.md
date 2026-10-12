# Daylit: explainer

## What I built

**Daylit** is a one-minute English practice app. Each day everyone gets the same five questions, one each from five different categories: word meaning, opposites, fill the gap, spelling, odd one out, quick maths and same meaning. Each question has a 20-second timer. After each answer the player sees a one-line explanation, so even a wrong answer teaches something.

Finishing the daily set pays out points, extends the streak, moves the player along the level bar, can unlock badges, and adds to their weekly league total. When they are done, the home screen shows their result, a countdown to the next set, a share button that produces a spoiler-free 🟩🟥 grid, and a practice mode.

## Why this task

You told me three things about your users. Each one shaped a decision.

**1. Modest Android phones and mobile data**

- No framework and no build step. The code is about 32 KB gzipped. A React starter is bigger than that before you write any code.
- No images. The logo, icons, rings and badges are inline SVG.
- One font, Geist, is self-hosted as a Latin-only subset (29 KB). Hindi falls back to the phone's own Noto Devanagari font, so it costs nothing extra. Fonts load with `font-display: swap`, so text shows at once even on a slow connection.
- A service worker caches everything on the first visit. After that the app opens with no network and uses no data. Questions are picked on the device, so playing needs no server round trip.
- Animations are small and cheap: CSS transforms only, and they are switched off under "reduce motion".
- I tested at 360 × 760, a common budget-Android size, in light and dark mode. No horizontal scrolling.
- On a laptop, the app appears inside a phone frame next to a short description, so reviewers see it the way players would.

**2. English as a second language**

- The task itself is English practice. A habit that improves English is useful to people who work in English as a second language.
- The interface can switch between English and Hindi at any time, from the first screen onward. Questions stay in English on purpose.
- Copy is short and literal: "Not quite. The answer is '27'." I avoided idioms, puns and clever microcopy.
- Tap targets are 52–62 px tall and the question text is large. The keyword in a question is highlighted so the eye goes straight to it.

**3. What they earn is worth real money**

This changed the rewards design more than anything else. If points convert to money, the rules have to be clear and hard to game.

- **Points are earned once per day.** Practice mode never pays. Without this, people could farm points.
- **Refreshing does not help.** The app records the moment a question is shown. If the player leaves or reloads before answering, that question counts as missed. You cannot reload to get past a hard question.
- **Same questions for everyone each day** (seeded by the date). That makes the league fair, and it makes a server-side check possible later.
- **Every rule is shown in the app** (Me → How points work), and the results screen breaks the total into parts: base, speed, perfect bonus, streak multiplier.
- **Streak savers** soften the "lost my 20-day streak because I was ill" moment. That moment is the most common reason people quit streak apps. One saver is earned per 7 days, and you can hold at most two, so a saver cannot replace showing up.
- The league is labelled as simulated. I did not want to fake social proof for people whose time is worth money.

## Which rewards I chose, and why

| Mechanic | Why it is here |
|---|---|
| **Streak + multiplier** | The main reason to come back tomorrow. The multiplier makes a long streak pay, not only look nice. |
| **Speed bonus** | Keeps a one-minute session lively and rewards fluency, not only correctness. Small enough (+3/+5) that slow, careful readers are not punished. |
| **Levels** | Long-term progress that never goes backwards, unlike a streak. |
| **Badges** | A handful of milestones (9), each with a clear rule and the date it was earned. |
| **Weekly league** | Social pressure that resets each week, so a newcomer can still win. |
| **Share grid** | Free word-of-mouth that does not give away the answers. |

I left out hearts/lives and paid boosts. They punish players or push spending, and that is the wrong deal for this audience.

## Name, logo and look

**Daylit** is short, easy to say in English and Hindi, and describes the habit: a little light every day. The logo is a sunrise drawn with **five arcs, one for each daily question**, in ember orange on near-black.

The look is calm and grown-up, in the style of native iOS apps such as Fitness and Settings. The people we build for earn real money with us, so the app should feel like a serious tool, not a toy.

- **One typeface** (Geist), set tight for headings. **Neutral greys** with a single warm accent. Green and red appear only for right and wrong.
- **Activity rings** are the signature visual: the outer ring is today's five questions, the middle one is days played this week, and the inner one is progress to the next level. Closing the outer ring is the daily goal.
- **Grouped lists and cards** like iOS Settings, with a frosted tab bar.
- Real dark mode (true black), designed alongside light mode.

### First run

Four short steps, one decision per screen: a welcome, the app language, your name, and a three-line "how it works". There's no email or password.

### How a day feels

1. **Today:** the rings and their numbers, one clear button to start, then the streak week, three daily goals, and points, level and streak savers.
2. **Questions:** tap an answer, then press **Check**. This two-step pattern prevents accidental taps on small screens. A sheet slides up with the right answer and a one-line explanation.
3. **Results:** a score ring, then points, accuracy and average time, then a breakdown of where the points came from and any new badges.
4. **Streak:** a full screen where the streak number rolls up by one. This is the moment that brings people back tomorrow.

### More tasks, from easy to hard

Every question category now has a difficulty: **easy** (odd one out, quick maths, opposites, same meaning), **medium** (meaning, fill the gap, spelling) and **hard** (idioms, phrasal verbs, grammar, advanced words). Today's five always runs easy, easy, medium, medium, hard, so players warm up before the hard one. Harder answers pay more: 10, 15 or 20 points.

There are also three extra tasks each day, each once per day:

| Task | Difficulty | What you do | Up to |
|---|---|---|---|
| Word quiz | Easy | Pick the meaning of today's word | 10 pts |
| Listen and choose | Medium | Hear a word spoken, pick it from four | 45 pts |
| Hard challenge | Hard | Three hard questions (unlocks after today's five) | 60 pts |

The same anti-refresh rule applies to every task: a question that was shown but not answered counts as missed.

### Getting paid (demo)

Points have a rupee value: **10 points = ₹1**, shown on the home screen, after every task and in the wallet. On **Get paid**, players add a UPI ID or a bank account (account number and IFSC). The app checks the format before saving. Players then pick an amount (minimum ₹50) and confirm with a second tap. The payout shows as *Processing*, then *Paid · demo* with a reference number.

This is a **demo**. A clear banner says that no money is sent and the details stay on the phone. The app never asks for a PIN, OTP or password. A real version would send the request to a server, where the payment provider and the anti-fraud checks live, and the server would be the only place that decides a payout.

### Listen and word of the day

Many players read English as a second language, and hearing a word helps as much as reading it. A speaker button reads each question and its options aloud, and another reads the explanation after you answer. It uses the phone's built-in voice (Web Speech API), which works offline and costs no data. If a phone has no voice installed, the button simply doesn't appear.

A **word of the day** card shows a useful everyday or work word with syllables, a plain-English meaning, the Hindi meaning and an example sentence. Players can listen to it and mark it as learned, and the profile counts the words learned. The list cycles so no word repeats until all have been shown.

### Wallet and shop

Because what players earn is worth real money to them, they should always be able to see exactly where every point came from. The **wallet** shows the balance, the total ever earned, the total spent, and a dated history of every entry ("Daily five · 4/5 · +90").

The **shop** sells one thing: a streak saver for 200 points (you can hold two). Buying takes two taps, so nobody spends by accident. Spending lowers the balance only. Level and league rank use lifetime points, so spending never costs a player their place.

### Sound and motion

Short, soft tones mark selecting, right, wrong, finishing and the streak going up. They are generated in code (no audio files), and players can turn them off in Settings. Motion is restrained: rings draw in, numbers count up, sheets slide and answers react to taps. Everything respects the phone's "reduce motion" setting.

## What I left out (and what I would do next)

- **No real payments.** Payouts are simulated on the device. Real payouts need a server, a payment provider, identity checks and fraud limits.
- **No backend.** Progress lives in `localStorage` on the device, so it is not shared across devices and a determined user could edit it. For real money, the server must own scoring: it would serve the day's questions, timestamp each answer, compute points, and run the real league. `logic.js` is pure and already tested, so it could move to the server mostly as-is.
- **No accounts.** The first screen asks only for a name. A real version would use phone number + OTP, which suits this audience better than email.
- **A small question bank** (70 questions). Categories repeat every few days. In production the daily set would come from the server, with difficulty adjusted to each player.
- **No audio or pictures.** Listening and picture questions would be good for lower-literacy players, but they cost data. I would add them as optional, small downloads.
- **No push reminders.** A daily reminder is the biggest retention lever after streaks, but it needs a backend and notification permission.
- **Hindi only.** The text is all in `i18n.js`, so adding Tamil, Bengali or other languages means adding one more dictionary. The Hindi text should be checked by a native speaker before launch.

## Where I used AI tools

I used an AI coding assistant (Claude) to help draft parts of the code, the question bank, the Hindi interface text and this document. I reviewed the output, chose the product and reward rules, tested the app on a phone-sized screen, and wrote the unit tests that check the game rules.
