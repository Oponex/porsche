# 911 Turbo S — Internal Design Document
### Reverse-engineering the emotional architecture of a luxury product page

This document analyses **why** the Porsche 911 Turbo S experience is structured the way it is,
then specifies a blueprint to reproduce that logic. It is written for designers and frontend
engineers building the concept in this repository.

---

## 0. Thesis: a website as an emotional sequence

Porsche does not design *pages*; it designs a **descent through emotional states**. Scrolling
is treated as a film edit. Each section is a "shot" with one job, one focal point, and a single
feeling it must produce before handing off to the next. The premium feeling comes not from
ornament but from **restraint, rhythm, and confidence** — empty space used as a luxury good.

Three principles govern everything:

1. **One idea per screen.** Cognitive load is kept near zero so each emotion lands cleanly.
2. **Image leads, text follows.** Imagery does the persuading; copy only labels the feeling.
3. **Negative space = status.** Cheap sites fill space. Luxury sites can afford to leave it empty.

---

## 1. The emotional stages (top to bottom)

### Stage 1 — Hero · "Awe"
- **What the user sees:** Fullscreen motion of the car, near-black surroundings, a single
  short headline, almost no UI.
- **Why here:** The first 1–2 seconds set the price bracket in the visitor's mind. Porsche
  spends its strongest asset immediately to claim authority.
- **Emotion:** Awe, desire, "this is special." Minimal text forces the *image* to create the
  reaction, not words.
- **Mechanics:** 100svh, object-fit cover video, dark vignette scrim for text legibility,
  display type at ~9rem, a quiet scroll cue.

### Stage 2 — Identity · "Understanding"
- **Why after the hero:** Awe must be converted into meaning before it fades. The visitor now
  asks "what is this?" — Porsche answers with one philosophical statement, not a feature list.
- **How interest builds:** A single large sentence on a calm background. Huge type, huge
  margins. This is the "mission statement" beat that signals the brand has a point of view.
- **Emotion:** Respect, intrigue.

### Stage 3 — Performance · "Power"
- **Why specs appear here:** Now that the visitor cares, give them ammunition. Numbers are the
  rational justification for the emotional pull from Stage 1.
- **How numbers are presented:** Enormous numerals, minimal labels, counting-up animation.
  Each figure gets its own column and a hairline rule — they read like records, not a table.
- **Why it feels powerful:** Scale = importance. A 6rem "640 hp" *is* the experience of power
  rendered typographically.

### Stage 4 — Feature storytelling · "Desire"
- **Why one feature at a time:** Sequential focus = a story. Each block is a full-bleed image
  with a 3-line caption, sides alternating to create scroll rhythm.
- **Emotion:** Growing desire; the visitor mentally "owns" each feature in turn.

### Stage 5 — Technology · "Trust"
- **Why here:** Desire needs to be defended rationally. Engineering proof converts wanting into
  justifying. Presented as a tight grid of named systems — dense but ordered.
- **Emotion:** Confidence, credibility.

### Stage 6 — Experience · "Belonging"
- **Why here:** The pivot from product to *self*. The visitor stops evaluating a car and starts
  imagining their life with it. Fixed-background imagery + emotive, second-person copy.
- **Emotion:** Aspiration, identity, ownership before purchase.

### Stage 7 — Gallery · "Immersion"
- **Why here:** A wordless breather. After the emotional peak, pure imagery lets the visitor
  linger and project. Minimal chrome, large frames, gentle hover scale.
- **Emotion:** Calm admiration.

### Stage 8 — Specifications · "Certainty"
- **Why near the end:** The final rational checkpoint for the serious buyer. Clean two-column
  definition lists — scannable, honest, complete.
- **Emotion:** Reassurance, decisiveness.

### Stage 9 — Finale · "Commitment"
- **Why last:** End on intent. A strong statement + two clear CTAs (Build / Test Drive) while
  emotion is still high. The last impression is an invitation, not a hard sell.
- **Emotion:** Resolve.

---

## 2. Design system extracted

### Spacing
8px base, geometric scale (`0.5 / 1 / 1.5 / 2.5 / 4 / 6 / 9 / 12rem`). Sections breathe at
`9rem` vertical padding; features separate at `12rem`. Generosity is the point.

### Typography
- **Display:** Archivo 800/900 — confident, condensed-ish grotesque for headlines.
- **Body:** Inter 300/400 — neutral, quiet.
- **Fluid scale** via `clamp()`: display `3→9rem`, h2 `2→4rem`, body `1→1.125rem`.
- Tight line-height (1.05) on display, generous (1.6) on body. Wide tracking (0.22em) only on
  uppercase eyebrows.

### Color
Near-black canvas (#0a0a0a), off-white text, **one** signature accent (gold #c8a45c) used
sparingly, red reserved for true emphasis. Limited palette = perceived luxury.

### Image-to-text ratio
Roughly **70% image / 30% text** above the fold and in feature sections. Copy never exceeds
~3 lines per block; max line length ~42–52ch.

### Visual rhythm
Alternating light/dark surfaces, alternating feature sides, recurring eyebrow → title → copy
triad. Predictable structure + varied media = rhythm without monotony.

### Interaction patterns (premium)
- Frosted, hide-on-scroll-down navigation.
- Scroll-reveal: 28px rise + fade, eased `cubic-bezier(0.22,1,0.36,1)`.
- Counting statistics (easeOutCubic).
- Slow image hover-zoom (1.2–1.4s) — luxury moves *slowly*.
- Thin scroll-progress indicator.
- Everything disabled under `prefers-reduced-motion`.

---

## 3. Why Porsche feels premium (the short list)

1. **Restraint** — says less, trusts the product.
2. **Space as luxury** — large margins signal confidence.
3. **Scale** — oversized type/imagery commands attention.
4. **Slow motion** — unhurried animation reads as expensive.
5. **One accent** — disciplined color.
6. **Sequence** — emotional pacing, not a feature dump.
7. **Quality of media** — the imagery is the brand.
8. **Consistency** — a true system, not ad-hoc styling.

---

## 4. Recommendations

**UI:** token-driven system (this repo), `<picture>` + AVIF/WebP, hairline 1px dividers,
2px radius max (sharp = serious).
**UX:** scroll-spy nav, skip link, keyboard-navigable drawer, 45/50 rootMargin spy zone,
honor reduced-motion, never trap scroll.
**Animation:** IntersectionObserver only, transform/opacity only, rAF-throttled scroll,
stagger groups, pause off-screen video.
**Design system:** keep tokens in `:root`, one type scale, one spacing scale, document them.
**GitHub presentation:** strong README + this DESIGN.md, screenshots in `/docs`, conventional
commits, GitHub Pages deploy, Lighthouse badge.

**Commit history suggestion (conventional commits):**
```
feat: scaffold project structure and design tokens
feat(hero): fullscreen video hero with scroll cue
feat(performance): animated stat counters
feat(features): alternating feature storytelling blocks
feat(nav): frosted hide-on-scroll nav with scroll-spy
feat(a11y): skip link, reduced-motion, focus styles
docs: add README and internal design document
perf: rAF throttling and off-screen video pause
```

**Deployment:** GitHub Pages (`Settings → Pages → deploy from main /root`) or Netlify drag-drop.
