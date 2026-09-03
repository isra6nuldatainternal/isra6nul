# Placeholder image generator

`tools/placeholder-generator.html` + `tools/export-images.mjs` produce the
files in `assets/img/`. Each composition is a layered HTML5 canvas
painting — directional base gradient, a shadow pool, one soft rim-light
streak, several depth-of-field bokeh highlights, a vignette, and true
per-pixel film grain — driven by a seeded PRNG (`mulberry32`), so the same
`seed` always regenerates the exact same image byte-for-byte.

## Regenerating / adding images

```bash
cd site/tools
npm install playwright && npx playwright install chromium
node export-images.mjs
```

Edit the `specs` array at the top of `export-images.mjs` to change a mood,
seed, or size, or to add a new slot — `id` becomes the output filename
(`assets/img/<id>.jpg`), `w`/`h` are the export resolution (`object-fit:
cover` in the site's CSS handles any crop), and `moodKey` picks one of the
six palettes defined in `placeholder-generator.html` (`gold`, `taupe`,
`umber`, `amber`, `slate`, `blush`).

This is a one-off content-generation tool, not a build step the site
depends on at runtime — `playwright` is intentionally not vendored or
listed as a site dependency, only needed here if you're regenerating
images.
