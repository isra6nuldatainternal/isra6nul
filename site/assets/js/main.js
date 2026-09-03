import * as THREE from "../../vendor/three.module.min.js";

/* ==========================================================================
   Setup
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const fineHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const prefersReducedMotion = () => reduceMotionQuery.matches;

/* ==========================================================================
   Nav — solid on scroll + mobile panel
   ========================================================================== */

(function nav() {
  const navEl = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("mobilePanel");

  ScrollTrigger.create({
    start: 60,
    onUpdate: (self) => navEl.classList.toggle("is-scrolled", self.scroll() > 60),
  });

  const closePanel = () => {
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };
  const openPanel = () => {
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  };

  toggle.addEventListener("click", () => {
    panel.classList.contains("is-open") ? closePanel() : openPanel();
  });
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", closePanel));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      closePanel();
      toggle.focus();
    }
  });
})();

/* ==========================================================================
   Custom cursor (fine pointers only)
   ========================================================================== */

(function cursor() {
  if (!fineHoverQuery.matches) return;
  const dot = document.querySelector(".cursor-dot");
  const quickX = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3" });
  const quickY = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    dot.classList.add("is-active");
    quickX(e.clientX);
    quickY(e.clientY);
  });
  window.addEventListener("pointerleave", () => dot.classList.remove("is-active"));

  document.querySelectorAll("a, button, .frame").forEach((el) => {
    el.addEventListener("pointerenter", () => dot.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => dot.classList.remove("is-hover"));
  });
})();

/* ==========================================================================
   Hero — Three.js ambient duotone crossfade
   Procedurally generated (no photography assets shipped in this build —
   see PLACEHOLDER-IMAGERY.md). Swap generateToneTexture() for real photo
   textures (THREE.TextureLoader) once final images are available.
   ========================================================================== */

function heroScene() {
  const wrap = document.getElementById("heroCanvasWrap");
  if (!wrap) return;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function generateToneTexture(stops, angle, blobs) {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const rad = (angle * Math.PI) / 180;
    const x0 = size / 2 - (Math.cos(rad) * size) / 2;
    const y0 = size / 2 - (Math.sin(rad) * size) / 2;
    const x1 = size / 2 + (Math.cos(rad) * size) / 2;
    const y1 = size / 2 + (Math.sin(rad) * size) / 2;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    blobs.forEach(([bx, by, br, color, alpha]) => {
      const rg = ctx.createRadialGradient(bx * size, by * size, 0, bx * size, by * size, br * size);
      rg.addColorStop(0, color.replace("ALPHA", alpha));
      rg.addColorStop(1, color.replace("ALPHA", "0"));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, size, size);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const texA = generateToneTexture(
    [
      [0, "#2c2117"],
      [0.55, "#6e5230"],
      [1, "#c7a876"],
    ],
    125,
    [
      [0.72, 0.32, 0.55, "rgba(255,235,205,ALPHA)", "0.55"],
      [0.2, 0.85, 0.4, "rgba(60,42,20,ALPHA)", "0.6"],
    ]
  );
  const texB = generateToneTexture(
    [
      [0, "#3a342a"],
      [0.5, "#8c7a5c"],
      [1, "#e4d2b4"],
    ],
    35,
    [
      [0.28, 0.28, 0.5, "rgba(250,240,220,ALPHA)", "0.5"],
      [0.78, 0.75, 0.45, "rgba(40,32,20,ALPHA)", "0.55"],
    ]
  );
  const texC = generateToneTexture(
    [
      [0, "#241d16"],
      [0.5, "#57452a"],
      [1, "#b79b6c"],
    ],
    200,
    [
      [0.5, 0.22, 0.45, "rgba(255,230,195,ALPHA)", "0.5"],
      [0.35, 0.8, 0.5, "rgba(35,26,15,ALPHA)", "0.6"],
    ]
  );

  const uniforms = {
    uTexA: { value: texA },
    uTexB: { value: texB },
    uProgress: { value: 0 },
    uParallax: { value: new THREE.Vector2(0, 0) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform float uProgress;
      uniform vec2 uParallax;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv + uParallax * (vUv - 0.5) * 0.06;
        vec2 uvA = uv * 0.94 + 0.03;
        vec2 uvB = uv * 0.94 + 0.03;

        vec3 colA = texture2D(uTexA, uvA).rgb;
        vec3 colB = texture2D(uTexB, uvB).rgb;

        float n = hash(floor(vUv * 40.0)) * 0.12;
        float edge = vUv.x * 0.7 + vUv.y * 0.3 + n;
        float m = smoothstep(edge - 0.12, edge + 0.12, uProgress * 1.24 - 0.12);

        vec3 color = mix(colA, colB, m);

        float grain = (hash(vUv * 800.0) - 0.5) * 0.035;
        color += grain;

        float vig = smoothstep(1.05, 0.35, length(vUv - 0.5));
        color *= mix(0.72, 1.0, vig);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener("resize", resize);

  renderer.render(scene, camera);

  if (prefersReducedMotion()) return;

  let cancelled = false;
  const cycle = [texA, texB, texC, texA];
  let step = 0;

  function nextCrossfade() {
    if (cancelled) return;
    uniforms.uTexA.value = cycle[step % (cycle.length - 1)];
    uniforms.uTexB.value = cycle[(step % (cycle.length - 1)) + 1];
    uniforms.uProgress.value = 0;
    gsap.to(uniforms.uProgress, {
      value: 1,
      duration: 3.2,
      ease: "power2.inOut",
      onUpdate: () => renderer.render(scene, camera),
      onComplete: () => {
        step++;
        if (!cancelled) gsap.delayedCall(2.6, nextCrossfade);
      },
    });
  }
  gsap.delayedCall(2.2, nextCrossfade);

  if (fineHoverQuery.matches) {
    window.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      gsap.to(uniforms.uParallax.value, {
        x: nx,
        y: ny,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => renderer.render(scene, camera),
      });
    });
  }

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    onUpdate: (self) => {
      wrap.style.opacity = String(1 - self.progress * 0.5);
      wrap.style.transform = `scale(${1 + self.progress * 0.08})`;
    },
  });

  reduceMotionQuery.addEventListener("change", () => {
    if (prefersReducedMotion()) {
      cancelled = true;
      gsap.killTweensOf(uniforms.uProgress);
    }
  });
}

heroScene();

/* ==========================================================================
   Hero headline — SplitText reveal
   ========================================================================== */

(function heroHeadline() {
  const heading = document.querySelector("[data-split-text]");
  if (!heading) return;

  if (prefersReducedMotion()) return;

  const split = new SplitText(heading, { type: "words", wordsClass: "word" });
  gsap.set([heading, ".hero__eyebrow", ".hero__sub", ".hero__actions"], { opacity: 1 });
  gsap.set(split.words, { opacity: 0, yPercent: 130, rotate: 3 });
  gsap.set(".hero__eyebrow", { opacity: 0, y: 12 });
  gsap.set([".hero__sub", ".hero__actions"], { opacity: 0, y: 16 });

  const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.out" } });
  tl.to(".hero__eyebrow", { opacity: 1, y: 0, duration: 0.5 })
    .to(split.words, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.045, ease: "expo.out" }, "-=0.2")
    .to(".hero__sub", { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
    .to(".hero__actions", { opacity: 1, y: 0, duration: 0.6, onComplete: () => split.revert() }, "-=0.4");
})();

/* ==========================================================================
   Scroll reveals — generic [data-reveal], section-scoped stagger
   ========================================================================== */

(function scrollReveals() {
  const mm = gsap.matchMedia();

  mm.add(
    { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
    (ctx) => {
      const { reduced } = ctx.conditions;

      document.querySelectorAll(".section").forEach((section) => {
        const items = section.querySelectorAll("[data-reveal]");
        if (!items.length) return;

        if (reduced) {
          gsap.set(items, { opacity: 1, y: 0 });
          return;
        }

        gsap.set(items, { opacity: 0, y: 26 });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });

      if (!reduced) {
        gsap.utils.toArray(".gallery-grid .frame").forEach((frame, i) => {
          gsap.set(frame, { opacity: 0, scale: 0.94, y: 20 });
        });
        gsap.to(".gallery-grid .frame", {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: "back.out(1.5)",
          stagger: { each: 0.06, from: "start", grid: "auto" },
          scrollTrigger: {
            trigger: ".gallery-grid",
            start: "top 85%",
          },
        });

        gsap.utils.toArray(".rule").forEach((rule) => {
          gsap.from(rule, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: rule, start: "top 92%" },
          });
        });
      }
    }
  );
})();

/* ==========================================================================
   Gallery — magnetic hover (subtle, clamped; fine pointers only)
   ========================================================================== */

(function magneticFrames() {
  if (!fineHoverQuery.matches || prefersReducedMotion()) return;

  document.querySelectorAll(".frame").forEach((frame) => {
    const xTo = gsap.quickTo(frame, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(frame, "y", { duration: 0.5, ease: "power3" });
    const rTo = gsap.quickTo(frame, "rotate", { duration: 0.5, ease: "power3" });
    const sTo = gsap.quickTo(frame, "scale", { duration: 0.4, ease: "power3" });

    frame.addEventListener("pointerenter", () => sTo(1.025));
    frame.addEventListener("pointermove", (e) => {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left - r.width / 2) / r.width;
      const py = (e.clientY - r.top - r.height / 2) / r.height;
      xTo(px * 14);
      yTo(py * 14);
      rTo(px * 1.4);
    });
    frame.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
      rTo(0);
      sTo(1);
    });
  });
})();

/* ==========================================================================
   Inquiry form — presentational (no backend in this build)
   ========================================================================== */

(function inquiryForm() {
  const form = document.getElementById("inquiryForm");
  const status = document.getElementById("formStatus");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.classList.add("is-sent");
    status.classList.add("is-visible");
    status.focus?.();
  });
})();

/* ==========================================================================
   Footer year
   ========================================================================== */

document.getElementById("year").textContent = String(new Date().getFullYear());
