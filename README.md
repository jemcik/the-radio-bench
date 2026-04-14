<div align="center">

# The Radio Bench

**An interactive, open-source course on radio and electronics — from zero to confident.**

[radiobench.dev](https://radiobench.dev)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev)

</div>

---

The Radio Bench is a free, beginner-friendly learning platform that teaches radio fundamentals and the physics behind them. Every chapter starts with a plain-language explanation and a real-world analogy before introducing a single formula. Labs, interactive diagrams, and glossary terms are woven throughout so concepts stick.

The curriculum follows the [CEPT Novice Examination Syllabus (ERC Report 32)](https://docdb.cept.org/document/845), covering everything from Ohm's law to propagation, station equipment, and operating regulations.

## Features

- **Interactive glossary** — hover any highlighted term for a quick tooltip, or click it to pin a full reference card with units, formulas, and related terms (100+ entries)
- **Hands-on labs** — optional bench activities with a multimeter, breadboard, Arduino, oscilloscope, or VNA
- **6 themes** — three light (Paper, Stone, Nordic) and three dark (Dusk, Moonlight, Graphite)
- **Typography** — choose a reading font and text size from the theme popover (preferences persist)
- **Full-text search** — press `Cmd+K` / `Ctrl+K` to search chapters and glossary from anywhere
- **Bookmarks** — save any section heading and get back to it from the sidebar
- **Guided tour** — a pip-boy mascot walks first-time visitors through the interface
- **Circuit diagrams** — a custom SVG symbol library for inline schematics
- **Resumes where you left off** — your last location is remembered between visits

## Curriculum

The course is organized into five parts spanning 21 chapters. Two chapters are published so far and more are on the way.

| Part | Title | Chapters |
|------|-------|----------|
| 0 | Foundations | How to Use This Site, Lab Bench Setup, Math Toolkit, The Decibel |
| I | Electricity & Circuits | Ohm's Law, DC/AC, Resistors, Capacitors, Inductors, Resonance, Filters, Transformers, Semiconductors |
| II | Radio Theory | Radio Waves, Modulation, RF Power |
| III | Station Equipment | Receivers, Transmitters, Antennas, Measurements |
| IV | Propagation, Operations & Regulations | Spectrum & Propagation, EMC, Safety, Procedures, Regulations |

## Getting started

```bash
git clone https://github.com/jemcik/the-radio-bench.git
cd the-radio-bench
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with hot module replacement.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check with `tsc` then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run knip` | Find unused dependencies, exports, and files |
| `npm run check:gitignore` | Fail CI if tracked files match `.gitignore` patterns |

## Tech stack

React 19 with TypeScript, built with Vite and styled using Tailwind CSS. UI primitives come from Radix UI (via shadcn/ui conventions) and icons from Lucide. Routing uses React Router with hash-based navigation for GitHub Pages compatibility. The site is deployed to GitHub Pages with a custom domain.

## Project structure

```
src/
  chapters/       Chapter content (TSX components)
  components/     Layout, sidebar, search, tour, diagrams, UI primitives
  context/        Theme, typography, and bookmark providers
  data/           Chapter registry and glossary definitions
  lib/            Circuit diagram system, theme config, utilities
```

## Contributing

Contributions are welcome — whether it's fixing a typo, improving an explanation, or adding a new interactive widget. Open an issue or submit a pull request.

If you find a mistake in any chapter, you can also use the "Open an issue" link at the bottom of each chapter page — it pre-fills the issue title and labels for you.

## Author

**UT3UVC** — [QRZ page](https://www.qrz.com/db/UT3UVC)

## License

[MIT](LICENSE)
