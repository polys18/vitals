# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Demetra landing page from a light lavender theme to a cinematic dark/light alternating design with wave dividers, dark hero, dark carousel, and staggered scroll animations.

**Architecture:** All changes are in `index.html` (single-file project, no build step). The page alternates between a dark zone (`#0d0f1a`) for hero/carousel/footer and a light zone (`#EDEAF8`) for all other sections. Four SVG wave dividers create organic transitions between zones. A single IntersectionObserver drives staggered cascade animations on all light sections.

**Tech Stack:** Vanilla HTML/CSS/JS, D3 CDN not used here — just plain browser APIs (IntersectionObserver, CSS custom properties, CSS animations).

---

## File Map

**Only file modified:** `index.html`

Sections of `index.html` and their current line ranges (approximate — lines shift as you edit):
- `:root` CSS variables: ~line 20–29
- `.hero` CSS: ~line 57
- Blob CSS: ~lines 59–65
- Particles CSS: ~lines 66–68
- `.carousel-section` CSS: ~lines 207–216
- Carousel inner CSS (arrows, dots, text): ~lines 217–400
- Trust section CSS: ~lines 80–126
- `</style>` closing tag: ~line 707
- Hero HTML (`<section class="hero">`): ~lines 731–753
- Trust HTML: ~lines 755–768
- Problem section HTML: ~lines 770–793
- Carousel section HTML: ~lines 795–899
- Why section HTML: ~lines 901–908
- Clinical section HTML: ~lines 910–946
- Values section HTML: ~lines 948–962
- `</main>` closing tag: ~line 964
- Footer HTML: ~lines 966–973
- JS `<script>` tag: ~line 1073

---

## Task 1: Add zone CSS variables and darken the hero background

**Files:**
- Modify: `index.html` — `:root` block and `.hero` rule

- [ ] **Step 1: Add zone variables to `:root`**

  In the `:root` block (around line 20), add two new variables after `--dark: #0B0D1A;`:

  ```css
  --zone-dark: #0d0f1a;
  --zone-light: #EDEAF8;
  ```

- [ ] **Step 2: Replace `.hero` background with the dark zone**

  Find the `.hero` rule (it starts with `.hero { min-height:100svh; background:linear-gradient(...`).

  Replace the entire `background:` value so the rule becomes:

  ```css
  .hero { min-height:100svh; background:var(--zone-dark); position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; scroll-snap-align:start; }
  ```

- [ ] **Step 3: Update hero text colors for dark background**

  Find `.hero-h1` and update its `color`:
  ```css
  .hero-h1 { font-family:'Outfit',sans-serif; font-size:clamp(38px,7vw,62px); font-weight:700; color:#fff; line-height:1.06; margin:0; animation:hero-in 1s var(--ease) .4s both; }
  ```

  Find `.hero-sub` and update its `color`:
  ```css
  .hero-sub { font-size:clamp(16px,2vw,19px); color:rgba(255,255,255,.65); line-height:1.7; margin-top:20px; max-width:540px; animation:hero-in 1s var(--ease) .55s both; }
  ```

- [ ] **Step 4: Verify visually**

  Open `index.html` in a browser. The hero should now be dark navy (`#0d0f1a`). The headline should be white and the subtext a lighter white. The badge, blobs, and button should still be visible. The rest of the page remains lavender (that changes later).

---

## Task 2: Remove blobs and particles from hero, add dark glow rings

**Files:**
- Modify: `index.html` — blob/particle CSS (remove), hero HTML (replace elements), add hero ring CSS

- [ ] **Step 1: Remove blob and particle CSS**

  Delete these CSS rules entirely (they are consecutive blocks around lines 59–68):
  - `.blob { ... }`
  - `.blob-1 { ... }`
  - `.blob-2 { ... }`
  - `.blob-3 { ... }`
  - `@keyframes blob1 { ... }`
  - `@keyframes blob2 { ... }`
  - `@keyframes blob3 { ... }`
  - `.particles { ... }`
  - `.dot { ... }`
  - `@keyframes dot-float { ... }`

- [ ] **Step 2: Add hero ring CSS**

  In the `/* ══ HERO ══ */` block, after the `.hero { ... }` rule, add:

  ```css
  .hero-ring {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .hero-ring-1 {
    width: 520px; height: 520px;
    border: 1px solid rgba(78,168,166,.10);
  }
  .hero-ring-2 {
    width: 320px; height: 320px;
    border: 1px solid rgba(123,108,246,.12);
  }
  .hero-glow-1 {
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(78,168,166,.18) 0%, transparent 70%);
    filter: blur(32px);
    top: 15%; left: 10%;
    transform: none;
  }
  .hero-glow-2 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(123,108,246,.15) 0%, transparent 70%);
    filter: blur(28px);
    top: auto; bottom: 10%;
    right: 8%; left: auto;
    transform: none;
  }
  ```

- [ ] **Step 3: Replace blob and particle elements in HTML**

  Find the hero section HTML (`<section class="hero" ...>`). It currently has:
  ```html
  <div class="blob blob-1" aria-hidden="true"></div>
  <div class="blob blob-2" aria-hidden="true"></div>
  <div class="blob blob-3" aria-hidden="true"></div>
  <div class="particles" aria-hidden="true">
    <div class="dot" ...></div>
    ... (6 dot divs)
  </div>
  ```

  Delete all of those and replace with:
  ```html
  <div class="hero-ring hero-ring-1" aria-hidden="true"></div>
  <div class="hero-ring hero-ring-2" aria-hidden="true"></div>
  <div class="hero-ring hero-glow-1" aria-hidden="true"></div>
  <div class="hero-ring hero-glow-2" aria-hidden="true"></div>
  ```

- [ ] **Step 4: Remove `hero-badge` float animation that looks odd on dark**

  The `.hero-badge` currently has `animation:badge-enter .9s ... .3s both, badge-float 3.5s ... 1.2s infinite`. The float is fine but update its border/background to better suit dark background:

  Find `.hero-badge { ... }` in CSS and update:
  ```css
  .hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(78,168,166,.15); border:1px solid rgba(78,168,166,.35); border-radius:999px; padding:6px 14px 6px 8px; font-size:13px; color:var(--teal); font-weight:500; margin-bottom:22px; animation:badge-enter .9s var(--spring) .3s both, badge-float 3.5s ease-in-out 1.2s infinite; }
  ```

- [ ] **Step 5: Verify visually**

  Reload the browser. The hero should now show: dark navy background, two faint ring circles centered on the content, soft teal glow top-left, soft lavender glow bottom-right. The animated blobs and floating dots should be gone. The headline, badge, subtext, and CTA button should all be visible.

---

## Task 3: Dark-theme the feature carousel section

**Files:**
- Modify: `index.html` — carousel CSS rules

- [ ] **Step 1: Change carousel section background to dark zone**

  Find `.carousel-section { ... }` (around line 207) and replace its background entirely:

  ```css
  .carousel-section {
    position: relative;
    height: 100svh;
    overflow: hidden;
    background: var(--zone-dark);
    scroll-snap-align: start;
  }
  ```

- [ ] **Step 2: Update carousel label and counter colors for dark**

  Find `.carousel-section-label` and `.carousel-counter`. Change their colors:

  ```css
  .carousel-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: rgba(255,255,255,.42);
  }
  .carousel-counter {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .12em;
    color: rgba(255,255,255,.42);
    font-variant-numeric: tabular-nums;
  }
  ```

- [ ] **Step 3: Update carousel arrows for dark background**

  Find `.carousel-arrow { ... }` and update:

  ```css
  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 12;
    width: clamp(44px, 5vw, 56px);
    height: clamp(44px, 5vw, 56px);
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.15);
    background: rgba(255,255,255,.08);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    color: #fff;
    font-size: clamp(28px, 4vw, 36px);
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,.3);
    transition: transform .25s var(--spring), opacity .25s, background .25s;
  }
  .carousel-arrow:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.08);
    background: rgba(255,255,255,.14);
  }
  .carousel-arrow:disabled { opacity: .28; cursor: default; box-shadow: none; }
  ```

- [ ] **Step 4: Update slide text colors for dark background**

  Find `.feat-eyebrow` (already teal, no change needed for color), `.feat-heading`, and `.feat-body`:

  ```css
  .feat-heading {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(26px,3.2vw,44px);
    font-weight: 700;
    color: #fff;
    line-height: 1.1;
    margin: 0 0 20px;
    opacity: 0;
    transform: translateY(12px);
  }
  .feat-body {
    font-size: clamp(14px,1.5vw,16px);
    color: rgba(255,255,255,.7);
    line-height: 1.8;
    opacity: 0;
    transform: translateY(10px);
  }
  ```

  Update `.feat-rule` to use a light color:
  ```css
  .feat-rule {
    width: 1px;
    height: clamp(120px,20vh,200px);
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,.14) 50%, transparent);
    flex-shrink: 0;
  }
  ```

- [ ] **Step 5: Update slide dots for dark background**

  Find `.sdot` and `.sdot.active`:

  ```css
  .sdot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(255,255,255,.25);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: width .4s var(--ease), background .4s var(--ease);
  }
  .sdot.active { width: 28px; background: var(--teal); }
  .sdot:not(.active):hover { background: rgba(255,255,255,.5); }
  ```

- [ ] **Step 6: Update carousel hint color**

  Find `.carousel-hint { ... }` and update the color:
  ```css
  color: rgba(255,255,255,.38);
  ```

- [ ] **Step 7: Add teal glow to phone image**

  Find `.feat-phone img { ... }` and update the filter/shadow:

  ```css
  .feat-phone img {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 68vh;
    filter:
      drop-shadow(0 0 32px rgba(78,168,166,.35))
      drop-shadow(0 16px 48px rgba(0,0,0,.6))
      drop-shadow(0 0 64px rgba(78,168,166,.15));
  }
  ```

- [ ] **Step 8: Verify visually**

  Reload the browser and scroll to the carousel section. The background should be dark navy. Text should be white/translucent white. Navigation arrows should be dark-translucent. Phone images should have a teal glow aura. Slide dots should be translucent white with the active one teal. Arrows and navigation should all still function correctly.

---

## Task 4: Add SVG wave dividers

**Files:**
- Modify: `index.html` — add wave CSS, insert 4 wave elements in HTML

- [ ] **Step 1: Add wave divider CSS**

  Before the `/* ══ RESPONSIVE ══ */` comment (near the bottom of the `<style>` block), add:

  ```css
  /* ══ WAVE DIVIDERS ══ */
  .wave-divider {
    display: block;
    line-height: 0;
    overflow: hidden;
    flex-shrink: 0;
  }
  .wave-divider svg {
    display: block;
    width: 100%;
  }
  .wave-to-light { background: var(--zone-dark); }
  .wave-to-dark  { background: var(--zone-light); }
  ```

- [ ] **Step 2: Insert wave 1 — after hero, before trust section**

  Find `</section>` that closes the hero (`<!-- ══ TRUST ══ -->` comment is right after it).

  Insert between the hero closing `</section>` and the `<!-- ══ TRUST ══ -->` comment:

  ```html
  <div class="wave-divider wave-to-light" aria-hidden="true">
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" height="80">
      <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#EDEAF8"/>
    </svg>
  </div>
  ```

- [ ] **Step 3: Insert wave 2 — after problem section, before carousel**

  Find `</section>` that closes the problem section (the one with `class="problem-section"`). The `<!-- ══ FEATURE CAROUSEL ══ -->` comment follows it.

  Insert between the problem section closing `</section>` and the carousel comment:

  ```html
  <div class="wave-divider wave-to-dark" aria-hidden="true">
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" height="80">
      <path d="M0,40 C360,0 1080,80 1440,40 L1440,80 L0,80 Z" fill="#0d0f1a"/>
    </svg>
  </div>
  ```

- [ ] **Step 4: Insert wave 3 — after carousel, before why section**

  Find `</section>` that closes the carousel section (after the `</div><!-- /slides-wrap -->`, arrows, dots, and hint divs). The `<!-- ══ WHY DEMETRA ══ -->` comment follows.

  Insert:

  ```html
  <div class="wave-divider wave-to-light" aria-hidden="true">
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" height="80">
      <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#EDEAF8"/>
    </svg>
  </div>
  ```

- [ ] **Step 5: Insert wave 4 — after values section, before footer**

  Find `</section>` that closes the values section (after the `</div>` for `values-inner`). Then comes `</main>` and then the `<!-- ══ FOOTER ══ -->` comment.

  Insert inside `<main>` just before `</main>`:

  ```html
  <div class="wave-divider wave-to-dark" aria-hidden="true">
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" height="80">
      <path d="M0,40 C360,0 1080,80 1440,40 L1440,80 L0,80 Z" fill="#0d0f1a"/>
    </svg>
  </div>
  ```

  Also update the footer background to flow seamlessly (it's already dark `var(--text)` = `#1a1a2e` which is close enough to `#0d0f1a`). Update footer background to use `--zone-dark`:

  Find `.site-footer { background: var(--text); ... }` and change to:
  ```css
  .site-footer { background: var(--zone-dark); padding: clamp(56px, 9vw, 88px) 24px clamp(40px, 6vw, 60px); text-align: center; }
  ```

- [ ] **Step 6: Remove mandatory scroll-snap**

  Mandatory scroll snap conflicts with the wave dividers and the new multi-section flow. Find:
  ```css
  html { scroll-behavior: smooth; overflow-x: hidden; scroll-snap-type: y mandatory; }
  ```
  Change to:
  ```css
  html { scroll-behavior: smooth; overflow-x: hidden; }
  ```

  Also remove `scroll-snap-align: start;` from `.hero`, `.carousel-section`, `.clinical-section`, `.values-section` (search for `scroll-snap-align` and delete those declarations).

- [ ] **Step 7: Verify visually**

  Reload and scroll through the full page. You should see:
  - Hero (dark) → wave curving into trust section (light)
  - Light sections flowing down → wave curving into carousel (dark)
  - Carousel (dark) → wave curving into why section (light)
  - Light sections flowing down → wave curving into footer (dark)
  
  The waves should be seamless with no visible gap between section and wave. Check on both desktop and mobile widths.

---

## Task 5: Update light section backgrounds and trust section styling

**Files:**
- Modify: `index.html` — trust-section CSS, why-section CSS, problem-section CSS

The light sections need to feel like one continuous light zone. Currently some have `var(--surf)` (#F8F7FE) and some have `var(--bg)` (#EDEAF8). Unify to use `var(--zone-light)` or `var(--surf)` as appropriate.

- [ ] **Step 1: Update trust section**

  Find `.trust-section { ... }` and replace:

  ```css
  .trust-section {
    background: var(--zone-light);
    padding: clamp(52px, 8vw, 80px) 24px;
    text-align: center;
  }
  ```

  (Remove the `border-top` and `border-bottom` — the wave divider above it creates the separation already.)

- [ ] **Step 2: Update problem section**

  Find `.problem-section { ... }` and update:

  ```css
  .problem-section {
    background: var(--surf);
    padding: clamp(88px, 12vw, 140px) 24px 0;
  }
  ```

  (Remove `scroll-snap-align: start` if still present.)

- [ ] **Step 3: Update why section background**

  Find `.why-section { ... }`:

  ```css
  .why-section {
    background: var(--zone-light);
    padding: clamp(40px,6vh,64px) 24px;
  }
  ```

- [ ] **Step 4: Update values section**

  Find `.values-section { ... }`:

  ```css
  .values-section {
    background: var(--zone-light);
    border-top: none;
    padding: clamp(52px, 8vw, 80px) 24px;
  }
  ```

  (Remove `border-top: 1px solid var(--bord)` — the section flow provides visual separation now.)

- [ ] **Step 5: Verify visually**

  Scroll through the light sections. Trust → Problem → (wave) → Carousel → (wave) → Why → Clinical → Values should all flow smoothly with consistent lavender-ish backgrounds. The carousel stands out as a dark island.

---

## Task 6: Build the scroll animation system

**Files:**
- Modify: `index.html` — add CSS for `[data-animate]`, add JS IntersectionObserver

- [ ] **Step 1: Add scroll animation CSS**

  Before the `/* ══ RESPONSIVE ══ */` comment (after the wave divider CSS you added in Task 4), add:

  ```css
  /* ══ SCROLL ANIMATIONS ══ */
  [data-animate] {
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 400ms cubic-bezier(.4,0,.2,1),
      transform 400ms cubic-bezier(.4,0,.2,1);
    transition-delay: calc(var(--si, 0) * 80ms);
  }
  [data-animate].is-visible {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-animate] {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
  ```

- [ ] **Step 2: Add IntersectionObserver JS**

  At the bottom of the `<script>` block, just before the closing `</script>` tag, add:

  ```js
  // ── SCROLL ANIMATIONS
  (function() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-animate]').forEach(function(el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(function(el) {
      observer.observe(el);
    });
  })();
  ```

- [ ] **Step 3: Verify the system works (no elements animated yet)**

  Add `data-animate` to one element temporarily to verify: find the `<h2>` inside `.hero-cred` (trust section) and add `data-animate` and `style="--si:0"`. Reload the browser, scroll past the wave into the trust section — the h2 should fade in. Remove the temporary attribute when confirmed (you'll add permanent ones in the next task).

---

## Task 7: Apply scroll animations to all light sections

**Files:**
- Modify: `index.html` — HTML attributes on section children

Add `data-animate` and `style="--si:N"` to staggered elements. `--si` is the stagger index (0-based). Each index adds 80ms of delay.

- [ ] **Step 1: Trust section — 3 elements**

  Find the trust section HTML and add attributes:

  ```html
  <section class="trust-section" aria-label="Team background">
    <div class="hero-cred">
      <h2 data-animate style="--si:0">Built by experienced physicians, researchers, and operators</h2>
      <p data-animate style="--si:1">We have spent 10+ years building clinical AI...</p>
      <div class="hero-logo-strip" data-animate style="--si:2" aria-label="Institutional experience">
        <span>Stanford</span>
        <span>Google</span>
        <span>Y Combinator</span>
        <span>MIT</span>
        <span>BCG</span>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 2: Problem section — heading and stat cards**

  ```html
  <section class="problem-section" aria-labelledby="problem-heading">
    <div class="problem-inner">
      <h2 class="problem-heading" id="problem-heading" data-animate style="--si:0">Millions are silently living with treatable disease</h2>
      <div class="stat-grid" aria-label="Common undetected health risks">
        <article class="stat-card" data-animate style="--si:1">...</article>
        <article class="stat-card" data-animate style="--si:2">...</article>
        <article class="stat-card" data-animate style="--si:3">...</article>
      </div>
      <p class="problem-note" data-animate style="--si:4">Reactive healthcare is failing us...</p>
    </div>
    ...
  </section>
  ```

  Note: The stat cards currently have their own `opacity:0; animation:stat-rise...` CSS. Remove that from the CSS (find `.stat-card { ... opacity:0; transform:translateY(24px); animation:stat-rise .8s var(--ease) forwards; }` and remove the opacity/transform/animation lines) so the IntersectionObserver handles them instead:

  ```css
  .stat-card {
    background: var(--surf);
    border-radius: 24px;
    padding: clamp(28px, 4vw, 42px);
    box-shadow: 0 18px 54px rgba(26,26,46,.08), 0 1px 0 rgba(255,255,255,.9) inset;
  }
  ```

  Also delete the `.stat-card:nth-child(2)` and `:nth-child(3)` animation-delay rules and the `@keyframes stat-rise` block.

- [ ] **Step 3: Why section — 3 elements**

  ```html
  <section class="why-section" id="why" aria-labelledby="why-heading">
    <div class="why-inner">
      <span class="why-eyebrow" data-animate style="--si:0">Why Demetra</span>
      <h2 class="why-lead" id="why-heading" data-animate style="--si:1">Demetra is a doctor...</h2>
      <p class="why-body" data-animate style="--si:2">She reviews your labs...</p>
    </div>
  </section>
  ```

- [ ] **Step 4: Clinical section — heading, sub, and 6 chips**

  ```html
  <section class="clinical-section" id="clinical" aria-labelledby="clinical-heading">
    <div class="clinical-inner">
      <h2 class="clinical-heading" id="clinical-heading" data-animate style="--si:0">Demetra runs an expanding list...</h2>
      <p class="clinical-sub" data-animate style="--si:1">Demetra runs dozens of checks...</p>
      <div class="check-grid" aria-label="Clinical intelligence checks">
        <article class="check-chip" style="--cc:239,68,68" data-animate style="--si:2">...</article>
        <article class="check-chip" style="--cc:245,158,11" data-animate style="--si:3">...</article>
        <article class="check-chip" style="--cc:123,108,246" data-animate style="--si:4">...</article>
        <article class="check-chip" style="--cc:249,115,22" data-animate style="--si:5">...</article>
        <article class="check-chip" style="--cc:16,185,129" data-animate style="--si:6">...</article>
        <article class="check-chip" style="--cc:78,168,166" data-animate style="--si:7">...</article>
      </div>
      <p class="clinical-note" data-animate style="--si:8">Built by physicians...</p>
    </div>
  </section>
  ```

  **Important:** Each `<article class="check-chip">` already has an inline `style="--cc:..."`. You need to merge the two style attributes into one. Use this pattern:
  ```html
  <article class="check-chip" data-animate style="--cc:239,68,68; --si:2">
  ```

- [ ] **Step 5: Values section — heading and 7 val-items**

  Add `data-animate` to the heading and each `.val-item`:

  ```html
  <section id="values" class="values-section" aria-labelledby="val-h2">
    <div class="values-inner">
      <h2 id="val-h2" class="values-heading" data-animate style="--si:0">Core Values</h2>
      <div class="values-list">
        <div class="val-item" data-animate style="--si:1">...</div>
        <div class="val-item" data-animate style="--si:2">...</div>
        <div class="val-item" data-animate style="--si:3">...</div>
        <div class="val-item" data-animate style="--si:4">...</div>
        <div class="val-item" data-animate style="--si:5">...</div>
        <div class="val-item" data-animate style="--si:6">...</div>
        <div class="val-item" data-animate style="--si:7">...</div>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 6: Final visual verification — full page scroll**

  Open `index.html` in the browser. Scroll from top to bottom and verify:
  1. **Hero**: Dark navy, glow rings visible, headline white, badge teal, CTA button visible. Entrance animations fire immediately on page load.
  2. **Wave 1**: Smooth organic curve from dark → lavender.
  3. **Trust**: Heading, body text, and logo strip cascade in as you scroll into view (80ms stagger between them).
  4. **Problem**: Heading fades in, then stat cards cascade in one by one, then note.
  5. **Wave 2**: Smooth organic curve from lavender → dark.
  6. **Carousel**: Dark navy background. White text. Teal-glowing phone images. Translucent dark arrows. White/teal dots. Slide transitions still work (click arrows or dots).
  7. **Wave 3**: Smooth organic curve from dark → lavender.
  8. **Why**: Eyebrow → heading → body cascade in.
  9. **Clinical**: Heading → sub → chips cascade in (chips stagger nicely left-to-right).
  10. **Values**: Heading then accordion items cascade in. Clicking items still expands/collapses smoothly.
  11. **Wave 4**: Smooth organic curve from lavender → dark.
  12. **Footer**: Dark background, tagline white, button visible.

  Check on mobile (375px) as well — waves should stretch full-width, dark sections should look correct.

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Color zones (dark/light) — Tasks 1, 3, 5
- ✅ Hero dark background + glow rings — Tasks 1, 2
- ✅ Hero text colors for dark — Task 1
- ✅ Hero entrance animation — kept existing `animation: hero-in` system (already staggers: badge .3s, h1 .4s, sub .55s, btn .7s)
- ✅ Trust section repositioned to light zone — Task 5
- ✅ Wave dividers (4) — Task 4
- ✅ Carousel dark cinematic — Task 3
- ✅ Carousel text colors — Task 3
- ✅ Phone image teal glow — Task 3 Step 7
- ✅ Staggered cascade scroll animations — Tasks 6, 7
- ✅ IntersectionObserver — Task 6
- ✅ Reduced motion support — Task 6 Step 1
- ✅ Footer dark zone — Task 4 Step 5

**Known adaptation from spec:** The spec listed Why before Carousel in the page structure, but the actual HTML has Why after Carousel. The implementation follows the actual HTML order (Why comes after Carousel). The zone assignments still work correctly: Why is in the light zone after the carousel's dark zone.

**Carousel slide transition note:** The spec called for a crossfade transition. The existing carousel already does a crossfade (opacity fade + translateX). The dark-theme update in Task 3 preserves this behavior — no JS changes needed for the transition itself.
