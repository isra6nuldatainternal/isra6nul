# Northlight Studio — landing page

A single-page, image-forward landing page for a photography studio.
Plain HTML/CSS/JS — no build step, no framework, no bundler.

## Run it

Any static file server works, e.g.:

```bash
cd site
python3 -m http.server 8080
# open http://127.0.0.1:8080
```

## Stack

- **GSAP 3 + ScrollTrigger + SplitText** — scroll reveals, magnetic hover,
  headline reveal. Vendored locally in `vendor/` (GSAP's free "no charge"
  license — see https://gsap.com/standard-license).
- **Three.js** (ES module build) — the hero's ambient duotone crossfade.
  Vendored locally in `vendor/` (MIT licensed). `three.module.min.js`
  imports a sibling `three.core.min.js` chunk — both must ship together.
- **Google Fonts** — Libre Bodoni (display serif) + Public Sans (body),
  loaded from `fonts.googleapis.com` in `index.html`. Requires network
  access to Google Fonts; falls back to system serif/sans (`font-display:
  swap`) if that's unavailable.

No npm install is needed to run the site — the vendored files in `vendor/`
are the only "dependency," already checked in.

## Design system

Derived from the `ui-ux-pro-max` skill's design-system search (editorial
grid/magazine + motion-driven styles, "Magazine Style" typography pairing,
GSAP scroll/parallax/hover presets) plus a custom warm-neutral-luxury
palette. Tokens live at the top of `assets/css/style.css`.

## Known limitation: no real photography

See [`PLACEHOLDER-IMAGERY.md`](./PLACEHOLDER-IMAGERY.md) — every image slot
is a generated placeholder, with exact swap-in instructions for when real
photos are available.

## Accessibility notes

- All text/background pairs verified ≥ 4.5:1 (WCAG AA); UI borders (focus
  rings, input underlines) ≥ 3:1.
- `prefers-reduced-motion` is honored throughout — scroll reveals, the hero
  crossfade, magnetic hover, and the scroll cue all render their final state
  immediately and skip continuous motion when set, including a live
  `matchMedia` listener for the hero crossfade if the OS setting changes
  mid-visit.
- Custom cursor and magnetic gallery hover are gated on `(hover: hover) and
  (pointer: fine)` and don't run on touch devices.
- Decorative layers (`.frame__tone`, `.frame__grain`, `.frame__vignette`,
  gradient backdrops) are `aria-hidden`; gallery captions remain in the
  accessibility tree even though they're visually hover-revealed.
- Touch targets (nav links, buttons, footer links) are ≥ 44×44px.
