# English Verb Trainer

A progressive web app (PWA) for learning English verb conjugation, built with spaced repetition (SM-2 algorithm). Works fully offline and installs on any device like a native app.

🔗 **[Live demo](https://replit.com/@svereskov-dev/english-verb-trainer)**

---

## Features

- **220+ verbs** — 120 irregular + 100 regular, each with Russian translation hints
- **4 exercise modes**
  - **Form** — conjugate a verb in a given tense and subject (I/you/she/…)
  - **Irregular** — type the Past Simple or Past Participle of an irregular verb
  - **Context** — fill the gap in a real sentence
  - **Mixed** — random mix of all three modes
- **Spaced repetition (SM-2)** — verbs you struggle with appear more often
- **Offline support** — full PWA with service worker; works without internet
- **Progress tracking** — streak counter, session stats, mistake review
- **Dark / light mode**
- **Mobile-first** design, installable on iOS and Android

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | wouter |
| Storage | IndexedDB via `idb` |
| PWA | `vite-plugin-pwa` |
| Monorepo | pnpm workspaces |

No backend. All data lives in the browser's IndexedDB.

---

## Project structure

```
artifacts/verb-trainer/
├── src/
│   ├── data/
│   │   ├── verbs.ts            # 220+ verbs with Russian translations
│   │   └── gapFillSentences.ts # Context exercise sentences
│   ├── engine/
│   │   ├── srs.ts              # SM-2 spaced repetition
│   │   ├── exercises.ts        # Exercise generation
│   │   ├── conjugate.ts        # English conjugation rules
│   │   └── validate.ts         # Answer checking (typo tolerance)
│   ├── db/
│   │   ├── index.ts            # IndexedDB setup
│   │   ├── progress.ts         # Per-verb SRS state
│   │   ├── stats.ts            # Session statistics
│   │   └── settings.ts         # User preferences
│   ├── components/
│   │   ├── ExerciseCard.tsx    # Question display + Russian hint
│   │   ├── AnswerInput.tsx     # Input + Check/Next buttons
│   │   ├── BottomNav.tsx       # Tab navigation
│   │   └── ui/                 # shadcn/ui component library
│   ├── pages/
│   │   ├── practice.tsx        # Main exercise screen
│   │   ├── home.tsx            # Dashboard
│   │   ├── verbs.tsx           # Full verb list
│   │   ├── stats.tsx           # Statistics
│   │   ├── mistakes.tsx        # Review weak verbs
│   │   └── settings.tsx        # Preferences
│   └── hooks/
│       ├── useExerciseSession.ts
│       ├── useSettings.ts
│       └── useStats.ts
├── vite.config.ts
├── package.json
└── index.html
```

---

## Running locally

**Requirements:** Node.js 18+, pnpm 9+

```bash
# Install dependencies
pnpm install

# Start dev server (runs at http://localhost:5173)
pnpm --filter @workspace/verb-trainer run dev
```

---

## How the SRS works

Each verb starts with an interval of 1 day and an ease factor of 2.5.  
After each answer:
- **Correct** → interval multiplies by the ease factor; ease factor stays or rises
- **Wrong** → interval resets to 1 day; ease factor drops by 0.2 (min 1.3)

Verbs due for review are prioritised over new verbs.

---

## License

MIT
