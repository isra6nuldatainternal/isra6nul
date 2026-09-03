# Placeholder imagery

This site ships **no literal photographs** of people or events — there was
no reliable way to source any. The sandbox this site was built in blocks
outbound access to every stock-photo/CDN host (Unsplash, Pexels, Picsum,
Wikimedia, cdnjs, jsdelivr, unpkg all refused the connection at the network
level — verified directly, not assumed), no AI image-generation API key was
configured (`GEMINI_API_KEY` / `ATLASCLOUD_API_KEY` / `MUAPI_API_KEY` all
unset), and searching other repositories for bundled sample photography was
out of scope for the session. Shipping a guessed/unverifiable image URL
wasn't an option either.

Instead, every image slot uses a **real, rendered image file** — not a live
CSS gradient — generated procedurally in an actual browser canvas and
exported to `assets/img/*.jpg`. Each is a one-off abstract "light study"
composition: a directional base gradient, a soft rim-light streak, several
depth-of-field bokeh highlights, a vignette, and true per-pixel film grain
(see `PLACEHOLDER-GENERATOR.md` for how). They read as considered fine-art
photography, not a stand-in — but they are not photographs of any real
subject, so `alt` text on each describes them honestly as abstract light
studies rather than fabricating a scene.

The hero background is the same idea done in WebGL instead of a static
file: three procedurally generated duotone canvas textures cross-fading
with a noise-perturbed wipe (`assets/js/main.js`, `heroScene()`).

## Where the slots are

| Location | File | Aspect ratio |
|---|---|---|
| Hero background | *(live WebGL, no file)* | full-bleed viewport |
| Gallery — 9 frames | `assets/img/gallery-0[1-9]-*.jpg` | mixed: portrait ≈ 10:13, wide ≈ 2:1, standard ≈ 3:2 |
| About / studio portrait | `assets/img/about-mara-voss.jpg` | 4:5 |

## Swapping in real photography

Each `<figure class="frame">` already uses a plain `<img>` — replace the
`src` (and `alt`, with a real description of the photo's actual content)
and you're done; `object-fit: cover` in `assets/css/style.css` handles any
aspect-ratio mismatch:

```html
<figure class="frame is-tall" data-reveal>
  <img src="assets/img/wedding-big-sur-01.jpg" alt="Bride and groom under an arch of eucalyptus, Big Sur" loading="lazy" />
  <figcaption class="frame__caption">
    <span class="frame__caption-title">The Vows</span>
    <span class="frame__caption-tag">Wedding — Big Sur</span>
  </figcaption>
</figure>
```

For the hero, the cleanest swap is to drop the Three.js crossfade entirely
and replace `.hero__canvas-wrap` with an `<img>`/`<picture>` or a CSS
`background-image` slideshow — the shader is only there because there was
no photograph to show.
