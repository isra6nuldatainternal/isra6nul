# Placeholder imagery

This build ships with **no photographs**. The sandbox this site was built in
blocks outbound access to every stock-photo/CDN host (Unsplash, Pexels,
Picsum, Wikimedia, cdnjs, jsdelivr, unpkg all refused the connection at the
network level), and there was no way to verify a hotlinked image URL would
actually resolve. Rather than ship guessed/broken `<img>` links, every image
slot uses a generated stand-in: a layered CSS gradient ("light pool" + linear
base) plus a film-grain SVG overlay and vignette, defined in `assets/css/style.css`
under `.frame` / `.frame__tone`. The hero background is the same idea done in
WebGL (`assets/js/main.js`, `heroScene()`) — three procedurally generated
duotone canvas textures cross-fading with a noise-perturbed wipe.

This is a deliberate placeholder system, not a bug — but it's built to be
swapped out easily once real photography exists.

## Where the slots are

| Location | Markup | Aspect ratio (desktop grid) |
|---|---|---|
| Hero background | `#heroCanvasWrap` canvas (Three.js) | full-bleed viewport |
| Gallery — 10 frames | `.gallery-grid .frame[data-tone]` | mixed: `is-tall` ≈ 3:4, default ≈ 3:2, `is-wide` ≈ 2:1, `is-small` ≈ 2:1 |
| About / studio portrait | `.about-grid .frame` | 4:5 |

## Swapping in real photography

For each `<figure class="frame" data-tone="N">`, replace the three decorative
divs with a real `<img>` as the first child, keeping `figcaption` as-is:

```html
<figure class="frame" data-reveal>
  <img src="assets/img/wedding-big-sur-01.jpg" alt="Bride and groom under an arch of eucalyptus, Big Sur" loading="lazy" />
  <div class="frame__vignette" aria-hidden="true"></div>
  <figcaption class="frame__caption">
    <span class="frame__caption-title">The Vows</span>
    <span class="frame__caption-tag">Wedding — Big Sur</span>
  </figcaption>
</figure>
```

Then in `style.css`, give `.frame img` `width:100%; height:100%; object-fit:cover;`
and drop `data-tone`/`.frame__tone`/`.frame__grain` (or leave `.frame__grain`
in at a low opacity — a little grain over a real photo still reads as
intentional film texture). Always add real `alt` text — the placeholder divs
are `aria-hidden` because they carry no information; a real photo does, so it
needs a description, not `alt=""`.

For the hero, the cleanest swap is to drop the Three.js crossfade entirely
and replace `.hero__canvas-wrap` with an `<img>`/`<picture>` or a CSS
`background-image` slideshow — the shader is only there because there was no
photograph to show.
