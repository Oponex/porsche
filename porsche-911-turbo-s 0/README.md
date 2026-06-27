# 911 Turbo S — Premium Concept Experience

A fullscreen, scroll-driven luxury product page inspired by the **Porsche 911 Turbo S**
digital experience. Built with semantic HTML5, a token-based CSS design system, and
modular vanilla JavaScript — no frameworks, no build step.

> ⚠️ Concept / educational project. Not affiliated with or endorsed by Dr. Ing. h.c. F. Porsche AG.
> Replace placeholder media in `/assets` with your own licensed assets before publishing.

---

## Inspiration

This project reverse-engineers the *emotional architecture* of the Porsche 911 Turbo S
website: a sequence of nine deliberate stages that move the visitor from awe → understanding
→ desire → ownership. The goal is not to copy pixels, but to reproduce the **logic** — the
spacing rhythm, the image-to-text ratio, the restraint — that makes the original feel premium.

See [`DESIGN.md`](DESIGN.md) for the full internal design document.

---

## Features

- **Responsive Design** — mobile-first, fluid type and spacing via `clamp()`
- **Smooth Animations** — IntersectionObserver scroll reveals + animated stat counters
- **Modern UI** — dark, restrained palette with a single signature accent
- **Interactive Navigation** — frosted sticky header, hide-on-scroll, scroll-spy active links, mobile drawer
- **Performance Optimized** — `requestAnimationFrame` throttling, lazy images, off-screen video pausing
- **Mobile Friendly** — works from 320px up; reduced-motion respected

---

## Technologies

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, Grid, Flexbox, `clamp()` fluid scales
- **JavaScript (ES5-safe vanilla)** — modular, dependency-free

---

## Folder Structure

```
porsche-911-turbo-s/
├── index.html            # Single-page, nine semantic <section>s
├── README.md
├── DESIGN.md             # Internal design document / analysis
├── .gitignore
├── favicon.ico
├── css/
│   ├── style.css         # Design tokens, foundations, section layout
│   ├── components.css    # Buttons, nav, drawer, progress bar
│   ├── animations.css    # Reveal + micro-motion (reduced-motion safe)
│   └── responsive.css    # Mobile-first breakpoints
├── js/
│   ├── script.js         # Entry orchestrator (video, fallbacks)
│   ├── animations.js     # Scroll reveals, counters, progress bar
│   └── navigation.js     # Header, drawer, scroll-spy, smooth scroll
└── assets/
    ├── images/           # hero.jpg, feature-*, gallery-*, experience.jpg
    ├── videos/           # hero.mp4
    └── icons/
```

CSS is layered from **foundations → components → motion → responsive** so a reader can
understand the system in the order it cascades. JS is split by **concern**, not by page section.

---

## Installation

No build tools required.

```bash
git clone https://github.com/<you>/porsche-911-turbo-s.git
cd porsche-911-turbo-s

# Option A: open directly
open index.html        # macOS  (use 'start' on Windows)

# Option B: serve locally (recommended for video + observers)
npx serve .            # or: python -m http.server 8000
```

Then add your media to `/assets` (see filenames referenced in `index.html`).

---

## Screenshots

Recommended captures for the repo / submission:

| Location | Shot |
|---|---|
| `docs/screenshots/hero.png`        | Fullscreen hero |
| `docs/screenshots/performance.png` | Animated stat counters |
| `docs/screenshots/features.png`    | Alternating feature blocks |
| `docs/screenshots/mobile.png`      | Mobile drawer open |

---

## Future Improvements

- Replace background-attachment parallax with a GPU `transform` parallax for smoother mobile
- Add a real configurator (color / wheels) with state persisted to `localStorage`
- Ship optimized `AVIF`/`WebP` with `<picture>` and responsive `srcset`
- Add `prefers-color-scheme` light theme
- Integrate a lightweight router for deep-linkable sections

---

## Performance

- IntersectionObserver instead of scroll listeners for reveals (no layout thrash)
- All scroll handlers wrapped in a shared `requestAnimationFrame` throttle
- Hero video pauses when scrolled out of view
- Images lazy-loaded; only animation properties (`opacity`, `transform`) are transitioned
- `will-change` scoped to revealing elements only
- Honors `prefers-reduced-motion`

Target Lighthouse: 95+ Performance / 100 Accessibility / 100 Best Practices.

---

## Credits

- **Inspiration:** Porsche 911 Turbo S digital experience (porsche.com)
- **Fonts:** Archivo + Inter (Google Fonts, OFL)
- **Media:** placeholders — supply your own licensed images/video before deployment

---

## License

MIT for the code. Media assets and the Porsche name/marks are **not** covered and must be
sourced/licensed independently.
