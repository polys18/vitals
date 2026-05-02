# Landing Page Redesign — Design Spec
**Date:** 2026-05-02  
**Project:** Demetra Health — `index.html`  
**Scope:** Visual redesign and animation system for the existing single-file landing page

---

## Overview

Elevate the Demetra landing page from "clean lavender" to "cinematic premium health brand." The page opens dark and dramatic, breathes through lavender sections, returns dark for the feature showcase, then closes dark. No new copy, no new sections, no new features — purely a visual and motion upgrade.

---

## Color Zones

The page alternates between two named zones:

| Zone | CSS variable | Hex | Used for |
|------|-------------|-----|----------|
| Dark | `--zone-dark` | `#0d0f1a` | Hero, Carousel, Footer |
| Light | `--zone-light` | `#EDEAF8` | Trust, Why, Clinical Chips, Core Values |

Surface color inside light zones stays `#F8F7FE` (`--surf`) for cards and sub-panels. All existing CSS variables (`--teal`, `--lav`, `--text`, etc.) are unchanged.

---

## Page Structure (top to bottom)

```
[DARK]   Hero
[WAVE]   dark → light
[LIGHT]  Trust / Organizations
[LIGHT]  Why Demetra
[WAVE]   light → dark
[DARK]   Feature Carousel
[WAVE]   dark → light
[LIGHT]  Clinical Chips
[LIGHT]  Core Values
[WAVE]   light → dark
[DARK]   Footer
```

Four wave dividers total. Each is a full-width SVG (`viewBox="0 0 1440 80"`, `preserveAspectRatio="none"`, `height="80px"`). The wave's `fill` matches the destination zone so the transition reads as the new zone "flowing in."

Wave direction alternates:
- dark→light: wave curves up-left (concave top edge)
- light→dark: wave curves down-right (convex top edge)

The wave element itself carries the background color of the source zone, so there is no gap between section and wave.

---

## Hero Section

### Background
Full dark navy (`#0d0f1a`). Remove the existing lavender sandwich gradient and all blob animations.

Replace blobs with two static decorative rings:
- Ring 1: `280px × 280px`, `border: 1px solid rgba(78,168,166,.10)`, centered on the headline
- Ring 2: `180px × 180px`, `border: 1px solid rgba(123,108,246,.12)`, centered on the headline
- Ring 3 (glow only): `200px × 200px` radial gradient `rgba(78,168,166,.18) → transparent`, top-left quadrant, `filter: blur(32px)`
- Ring 4 (glow only): `160px × 160px` radial gradient `rgba(123,108,246,.15) → transparent`, bottom-right quadrant, `filter: blur(28px)`

Rings are `position: absolute`, `pointer-events: none`, centered via `top:50%; left:50%; transform:translate(-50%,-50%)`.

### Content
All copy unchanged. Color changes only:
- Eyebrow label: `#4ea8a6` (teal) — unchanged
- Headline: `color: #fff`. The gradient accent phrase uses `background: linear-gradient(90deg, #4ea8a6, #7b6cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent`
- Subtext: `rgba(255,255,255,.65)`
- CTA button: existing teal→lavender gradient, unchanged

Trust logos strip is **removed from the hero** and placed in its own section below the first wave divider.

### Entrance Animation
Staggered cascade on page load (no scroll trigger — hero is always visible):
1. Eyebrow label: `animation-delay: 0ms`
2. Headline line 1: `animation-delay: 80ms`
3. Headline line 2: `animation-delay: 160ms`
4. Subtext: `animation-delay: 260ms`
5. CTA button: `animation-delay: 360ms`

Each element: `opacity: 0 → 1`, `transform: translateY(14px) → translateY(0)`, duration `480ms`, easing `cubic-bezier(.4,0,.2,1)`.

---

## Wave Dividers

Implemented as `<div class="wave-divider wave-to-light">` or `wave-to-dark`. Each div has:
- `background`: source zone color (so no gap above the SVG)
- `line-height: 0` to eliminate inline spacing
- SVG inside with `fill` = destination zone color

Two SVG path shapes (reused via class):
```
wave-to-light: M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z  (fill: #EDEAF8)
wave-to-dark:  M0,40 C360,0  1080,80 1440,40 L1440,80 L0,80 Z  (fill: #0d0f1a)
```

---

## Feature Carousel (Dark Cinematic)

Section background: `#0d0f1a`. Keeps dark zone color.

### Section Header
Above the carousel slides:
- Eyebrow: `"Features"`, teal, uppercase, letter-spaced
- Heading: white, `font-size: clamp(28px, 3.5vw, 38px)`, weight 700, left-aligned within the section's max-width container

### Slide Layout
Each slide is a flex row:
- **Left (45%)**: Phone mockup
  - `width: clamp(140px, 38vw, 220px)`, `aspect-ratio: 220 / 420`
  - `border-radius: 28px`
  - `border: 1.5px solid rgba(78,168,166,.4)`
  - `box-shadow: 0 0 48px rgba(78,168,166,.25), 0 16px 48px rgba(0,0,0,.6)`
  - Screen area: `inset: 8px`, `border-radius: 20px`, filled with the actual phone mockup `<img>`
- **Right (55%)**: Text content
  - Eyebrow: feature name, teal, uppercase
  - Headline: white, `font-size: clamp(24px, 3vw, 36px)`, weight 700
  - Body: `rgba(255,255,255,.7)`, 16px
  - Navigation dots: row of 5 dots at bottom, active dot is teal pill (`width: 20px`), inactive dots are `rgba(255,255,255,.3)` circles

### Slide Transition
Crossfade: `opacity: 0 → 1` over `300ms ease`. Previous slide fades out simultaneously. No layout shift — both slides occupy the same grid cell via `position: absolute` within a relative container.

### Entrance Animation (on scroll)
When carousel section enters viewport:
1. Section heading cascades in (eyebrow → heading, 80ms stagger)
2. Phone mockup: `translateY(20px) → translateY(0)`, `opacity: 0 → 1`, delay `160ms`
3. Text content: stagger eyebrow → headline → body → dots, 80ms each, starting at delay `260ms`

---

## Scroll Animation System

### IntersectionObserver Setup
Single observer instance, `threshold: 0.15`, `rootMargin: "0px 0px -40px 0px"`.

Observed elements carry a `data-animate` attribute. On intersection:
1. Element gets class `is-visible`
2. `is-visible` triggers: `opacity: 1; transform: none; transition: opacity 400ms ease, transform 400ms cubic-bezier(.4,0,.2,1)`
3. Default (pre-visible) state: `opacity: 0; transform: translateY(16px)`

### Stagger
Elements that belong to a staggered group carry `data-stagger-index="0"`, `"1"`, `"2"` etc. Each index adds `80ms` to the `transition-delay`: `transition-delay: calc(var(--stagger-index) * 80ms)`.

Set via inline style at render time: `style="--stagger-index: 2"`.

### Sections and their staggered children
| Section | Staggered children |
|---------|-------------------|
| Trust | Each logo/org item |
| Why Demetra | Eyebrow, heading, paragraph |
| Clinical Chips | Each `.check-chip` (6 total) |
| Core Values | Each `.val-item` |

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  [data-animate] { opacity: 1 !important; transform: none !important; transition: none !important; }
}
```
Hero entrance animations are also disabled under reduced motion.

---

## Trust / Organizations Section

No structural changes. Background: `#EDEAF8` (light zone). Gets scroll-triggered stagger animation on logos.

---

## Why Demetra Section

No structural changes. Background: `#F8F7FE` (surf, inset within light zone). Gets scroll-triggered cascade on eyebrow → heading → paragraph.

---

## Clinical Chips Section

No structural changes (6 chips, colored borders, existing copy). Gets scroll-triggered stagger — chips animate in left-to-right, top-to-bottom, 80ms apart.

---

## Core Values Section

No structural changes (accordion, smooth grid-template-rows animation already in place). Gets scroll-triggered stagger on the `.val-item` rows.

---

## Footer

No changes. Already dark (`var(--text)` background). Sits naturally in the dark zone after the final wave divider.

---

## What Does NOT Change

- All copy verbatim (no new text, no changed text)
- Clinical chip content (6 items only, existing wording)
- Core values titles and body text
- Accordion behavior and animation
- Phone mockup images (`pics/` directory)
- Supabase form/modal integration
- `confirm.html` email confirmation page
- CSS variables for teal, lavender, text color
- Font families (Outfit headings, Inter body)
- Mobile responsiveness approach

---

## Files Affected

- `index.html` — all changes live here (single-file architecture)

No new files, no build step, no dependencies added.
