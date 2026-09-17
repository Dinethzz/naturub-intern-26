
// ========================================================
// NATURUB THANK-YOU WEBSITE — V4
// Complete JavaScript
// ========================================================

// Photos: img-20.jpeg through img-30.jpeg
const photos = Array.from({ length: 11 }, (_, i) => ({
  src: `img-${i + 20}.jpeg`,
  title: "A moment to remember",
  number: String(i + 1).padStart(2, "0")
}));

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


// ========================================================
// 1. CINEMATIC HERO BACKGROUND SLIDESHOW
// First ten images: img-20 to img-29
// Crossfade + gentle zoom + infinite loop
// ========================================================

function initHeroSlideshow() {

  const hero = document.querySelector(".hero");
  const firstImage = hero?.querySelector(".hero-photo");

  if (!hero || !firstImage) return;

  // Respect accessibility settings
  if (reducedMotion) return;

  const sources = Array.from(
    { length: 10 },
    (_, i) => `/img-${i + 20}.jpeg`
  );

  const DISPLAY_TIME = 5200;
  const FADE_TIME = 1500;

  let activeIndex = 0;
  let activeLayer = 0;
  let slideshowTimer = null;
  let stopped = false;

  // Inject CSS automatically.
  // No need to modify style.css.

  const style = document.createElement("style");

  style.textContent = `

    .hero .hero-photo.hero-slide {
      position: absolute;
      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center 45%;

      z-index: -2;

      opacity: 0;

      transform: scale(1.035);

      transition:
        opacity ${FADE_TIME}ms ease-in-out,
        transform 8500ms linear;

      will-change: opacity, transform;

      pointer-events: none;
    }

    .hero .hero-photo.hero-slide.is-active {
      opacity: 1;
      transform: scale(1.11);
    }

    @media (max-width: 600px) {

      .hero .hero-photo.hero-slide {
        object-position: center 45%;
      }

    }

    @media (prefers-reduced-motion: reduce) {

      .hero .hero-photo.hero-slide {
        transition: none;
        transform: none;
      }

    }

  `;

  document.head.appendChild(style);

  // Prepare first image

  firstImage.classList.add(
    "hero-slide",
    "is-active"
  );

  firstImage.alt =
    "A memory from our internship at Naturub";

  // Create second image layer

  const secondImage = firstImage.cloneNode(false);

  secondImage.removeAttribute("fetchpriority");
  secondImage.removeAttribute("src");

  secondImage.classList.remove("is-active");

  secondImage.setAttribute(
    "aria-hidden",
    "true"
  );

  secondImage.alt = "";

  firstImage.insertAdjacentElement(
    "afterend",
    secondImage
  );

  const layers = [
    firstImage,
    secondImage
  ];

  // Preload image to avoid flickering

  function preloadImage(src) {

    return new Promise(resolve => {

      const image = new Image();

      image.onload = () => resolve(true);

      image.onerror = () => resolve(false);

      image.src = src;

    });

  }

  // Change hero background

  async function changeSlide() {

    if (stopped) return;

    const nextIndex =
      (activeIndex + 1) % sources.length;

    const nextLayer = 1 - activeLayer;

    const nextImage = layers[nextLayer];

    const loaded = await preloadImage(
      sources[nextIndex]
    );

    if (stopped) return;

    // If image unavailable, preserve previous image

    if (!loaded) {

      slideshowTimer = window.setTimeout(
        changeSlide,
        DISPLAY_TIME
      );

      return;

    }

    nextImage.src = sources[nextIndex];

    // Begin smooth transition

    window.requestAnimationFrame(() => {

      if (stopped) return;

      nextImage.classList.add("is-active");

      layers[activeLayer].classList.remove(
        "is-active"
      );

      activeIndex = nextIndex;

      activeLayer = nextLayer;

      slideshowTimer = window.setTimeout(
        changeSlide,
        DISPLAY_TIME + FADE_TIME
      );

    });

  }

  // Pause when visitor leaves browser tab

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        window.clearTimeout(slideshowTimer);

        stopped = true;

      } else {

        stopped = false;

        window.clearTimeout(slideshowTimer);

        slideshowTimer = window.setTimeout(
          changeSlide,
          DISPLAY_TIME
        );

      }

    }
  );

  // Start slideshow

  slideshowTimer = window.setTimeout(
    changeSlide,
    DISPLAY_TIME
  );

}

initHeroSlideshow();


// ========================================================
// 2. PHOTO GALLERY
// ========================================================

const gallery = document.getElementById("gallery");

const dialog = document.getElementById("lightbox");

const viewerImage = document.getElementById(
  "lightbox-image"
);

const viewerCount = document.getElementById(
  "lightbox-count"
);

const viewerCaption = document.getElementById(
  "lightbox-caption"
);

const status = document.getElementById(
  "live-status"
);

let currentPhoto = 0;


// ==========================================
// INSTAGRAM-STYLE DOUBLE TAP HEART
// ==========================================

function replayHeart(element) {
  if (!element) return;

  // Create a perfectly shaped SVG heart.
  if (!element.querySelector("svg")) {
    element.innerHTML = `
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="#ff3040"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
        2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
        C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42
        22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
  }

  // Restart animation on repeated double taps.
  element.classList.remove("burst");
  void element.offsetWidth;
  element.classList.add("burst");

  // Small hearts spreading outward.
  const container = element.parentElement;

  if (container && !reducedMotion) {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("span");

      particle.className = "ig-heart-particle";
      particle.textContent = "♥";
      particle.setAttribute("aria-hidden", "true");

      const angle = (Math.PI * 2 * i) / 8;
      const distance = 65 + Math.random() * 65;

      particle.style.setProperty(
        "--x",
        `${Math.cos(angle) * distance}px`
      );

      particle.style.setProperty(
        "--y",
        `${Math.sin(angle) * distance}px`
      );

      particle.style.setProperty(
        "--rotation",
        `${Math.random() * 90 - 45}deg`
      );

      container.appendChild(particle);

      particle.addEventListener(
        "animationend",
        () => particle.remove(),
        { once: true }
      );
    }
  }

  if (status) {
    status.textContent = "A little love for this memory!";
  }
}


// ========================================================
// 4. IMAGE VIEWER
// ========================================================

function showPhoto(index) {

  currentPhoto =
    (index + photos.length) % photos.length;

  const photo = photos[currentPhoto];

  viewerImage.src = photo.src;

  viewerImage.alt =
    `${photo.title}, photo ${currentPhoto + 1} of ${photos.length}`;

  viewerCount.textContent =
    `${photo.number} / ${photos.length}`;

  viewerCaption.textContent = photo.title;

}

function openViewer(index) {

  showPhoto(index);

  if (!dialog.open) {
    dialog.showModal();
  }

  document.body.classList.add("modal-open");

}

function closeViewer() {

  if (dialog.open) {
    dialog.close();
  }

}


// ========================================================
// 5. GENERATE GALLERY IMAGES
// ========================================================

photos.forEach((photo, index) => {

  const card = document.createElement("figure");

  card.className = "photo-card";

  card.innerHTML = `

    <button
      class="photo-open"
      type="button"
      aria-label="Open photo ${index + 1} of ${photos.length}; double-tap to send a heart"
    >

      <img
        src="${photo.src}"
        alt="Naturub internship memory ${index + 1}"
        loading="lazy"
        decoding="async"
      />

      <span
        class="photo-error"
        aria-hidden="true"
      >
        Photo unavailable
      </span>

      <span class="photo-caption">

        <span>

          <small>
            MEMORY ${photo.number}
          </small>

          <b>
            ${photo.title}
          </b>

        </span>

        <span
          class="expand"
          aria-hidden="true"
        >
          ↗
        </span>

      </span>

      <span
        class="heart-burst"
        aria-hidden="true"
      >
        ♥
      </span>

    </button>

  `;

  gallery.appendChild(card);

  const button = card.querySelector("button");

  const img = card.querySelector("img");

  const heart = card.querySelector(
    ".heart-burst"
  );

  // Image loading skeleton

  img.addEventListener("load", () => {

    card.classList.add("loaded");

  });

  img.addEventListener("error", () => {

    card.classList.add("is-error");

    button.disabled = true;

    button.setAttribute(
      "aria-label",
      `Photo ${index + 1} unavailable`
    );

  });

  if (img.complete) {

    if (img.naturalWidth) {

      card.classList.add("loaded");

    } else if (img.src) {

      card.classList.add("is-error");

    }

  }

  // Double-tap detection

  let lastTap = 0;

  let singleTapTimer;

  button.addEventListener("click", () => {

    const now = Date.now();

    if (now - lastTap < 320) {

      clearTimeout(singleTapTimer);

      lastTap = 0;

      replayHeart(heart);

    } else {

      lastTap = now;

      singleTapTimer = setTimeout(() => {

        lastTap = 0;

        openViewer(index);

      }, 320);

    }

  });

  button.addEventListener("dblclick", event => {

    event.preventDefault();

  });

});


// ========================================================
// 6. FULL-SCREEN VIEWER CONTROLS
// ========================================================

document.getElementById(
  "close-lightbox"
).addEventListener(
  "click",
  closeViewer
);

document.getElementById(
  "prev-photo"
).addEventListener("click", () => {

  showPhoto(currentPhoto - 1);

});

document.getElementById(
  "next-photo"
).addEventListener("click", () => {

  showPhoto(currentPhoto + 1);

});

dialog.addEventListener("close", () => {

  document.body.classList.remove(
    "modal-open"
  );

});

dialog.addEventListener("click", event => {

  if (event.target === dialog) {

    closeViewer();

  }

});

// Keyboard navigation

document.addEventListener("keydown", event => {

  if (!dialog.open) return;

  if (event.key === "ArrowLeft") {

    showPhoto(currentPhoto - 1);

  }

  if (event.key === "ArrowRight") {

    showPhoto(currentPhoto + 1);

  }

});


// ========================================================
// 7. MOBILE SWIPE SUPPORT
// ========================================================

const imageWrap = document.getElementById(
  "viewer-image-wrap"
);

const viewerHeart = document.getElementById(
  "viewer-heart"
);

let touchStartX = null;

imageWrap.addEventListener(
  "touchstart",
  event => {

    touchStartX =
      event.touches.length === 1
        ? event.touches[0].clientX
        : null;

  },
  { passive: true }
);

imageWrap.addEventListener(
  "touchend",
  event => {

    if (
      touchStartX === null ||
      !event.changedTouches.length
    ) {
      return;
    }

    const delta =
      event.changedTouches[0].clientX -
      touchStartX;

    touchStartX = null;

    if (Math.abs(delta) > 55) {

      showPhoto(
        currentPhoto + (delta < 0 ? 1 : -1)
      );

    }

  },
  { passive: true }
);


// ========================================================
// 8. DOUBLE-TAP HEART IN VIEWER
// ========================================================

let lastViewerTap = 0;

imageWrap.addEventListener("click", () => {

  const now = Date.now();

  if (now - lastViewerTap < 330) {

    replayHeart(viewerHeart);

    lastViewerTap = 0;

  } else {

    lastViewerTap = now;

  }

});

imageWrap.addEventListener(
  "dblclick",
  event => {

    event.preventDefault();

  }
);


// ========================================================
// 9. COLORFUL THANK-YOU TERMINAL
// Types the entire message from top to bottom
// ========================================================

const terminal = document.getElementById(
  "typed-message"
);

const replayButton = document.getElementById(
  "replay-typing"
);

const terminalWindow = document.querySelector(
  ".gratitude-terminal"
);


// Terminal content with syntax highlighting

const terminalLines = [

  [
    {
      t: "// TO EVERYONE AT NATURUB",
      c: "comment"
    }
  ],

  [],

  [
    {
      t: "const ",
      c: "keyword"
    },
    {
      t: "ourJourney",
      c: "variable"
    },
    {
      t: " = {",
      c: "plain"
    }
  ],

  [
    {
      t: "  arrived: ",
      c: "property"
    },
    {
      t: '"ready to learn"',
      c: "string"
    },
    {
      t: ","
    }
  ],

  [
    {
      t: "  leavingWith: [",
      c: "property"
    }
  ],

  [
    {
      t: '    "new skills",',
      c: "string"
    }
  ],

  [
    {
      t: '    "meaningful experiences",',
      c: "string"
    }
  ],

  [
    {
      t: '    "memories that will stay long after our final day"',
      c: "string"
    }
  ],

  [
    {
      t: "  ]",
      c: "plain"
    }
  ],

  [
    {
      t: "};",
      c: "plain"
    }
  ],

  [],

  [
    {
      t: "const ",
      c: "keyword"
    },
    {
      t: "thankYou",
      c: "variable"
    },
    {
      t: " = ["
    }
  ],

  [
    {
      t: '  "Every mentor who guided us",',
      c: "string"
    }
  ],

  [
    {
      t: '  "Every colleague who answered our questions",',
      c: "string"
    }
  ],

  [
    {
      t: '  "Every team who welcomed us and made space to grow"',
      c: "string"
    }
  ],

  [
    {
      t: "];"
    }
  ],

  [],

  [
    {
      t: "thankYou",
      c: "variable"
    },
    {
      t: ".forEach",
      c: "function"
    },
    {
      t: "((person) => {"
    }
  ],

  [
    {
      t: "  console",
      c: "variable"
    },
    {
      t: ".log",
      c: "function"
    },
    {
      t: "("
    },
    {
      t: '"We appreciate you ♥"',
      c: "string"
    },
    {
      t: ");"
    }
  ],

  [
    {
      t: "});"
    }
  ],

  [],

  [
    {
      t: "// WITH APPRECIATION, FROM ALL OF US ♥",
      c: "comment"
    }
  ]

];


// ========================================================
// 10. TERMINAL TYPING ENGINE
// ========================================================

let typingTimer = null;

let hasTyped = false;

let generation = 0;


// Build terminal structure

function buildTerminal() {

  terminal.replaceChildren();

  const tasks = [];

  terminalLines.forEach((line, lineIndex) => {

    const row = document.createElement("span");

    row.className = "terminal-line";

    terminal.appendChild(row);

    if (!line.length) {

      tasks.push({
        type: "pause",
        duration: 130
      });

    }

    line.forEach(segment => {

      const piece = document.createElement("span");

      piece.className =
        `syntax-${segment.c || "plain"}`;

      row.appendChild(piece);

      for (const char of segment.t) {

        tasks.push({
          type: "char",
          node: piece,
          char
        });

      }

    });

    if (lineIndex < terminalLines.length - 1) {

      tasks.push({
        type: "pause",
        duration: 120
      });

    }

  });

  return tasks;

}


// Start typing animation

function startTyping(restart = false) {

  if (hasTyped && !restart) return;

  hasTyped = true;

  generation++;

  const run = generation;

  window.clearTimeout(typingTimer);

  const tasks = buildTerminal();

  replayButton.disabled = true;

  // Reduced motion accessibility

  if (reducedMotion) {

    tasks.forEach(task => {

      if (task.type === "char") {

        task.node.textContent += task.char;

      }

    });

    replayButton.disabled = false;

    return;

  }

  let cursor = 0;

  function tick() {

    if (run !== generation) return;

    if (cursor === tasks.length) {

      replayButton.disabled = false;

      terminalWindow.classList.add(
        "typing-complete"
      );

      return;

    }

    const task = tasks[cursor++];

    if (task.type === "char") {

      task.node.textContent += task.char;

    }

    const delay =
      task.type === "pause"
        ? task.duration
        : task.char === " "
          ? 8
          : 17;

    typingTimer = window.setTimeout(
      tick,
      delay
    );

  }

  terminalWindow.classList.remove(
    "typing-complete"
  );

  tick();

}


// Replay animation

replayButton.addEventListener(
  "click",
  () => {

    startTyping(true);

  }
);


// ========================================================
// 11. START TERMINAL WHEN VISIBLE
// ========================================================

if ("IntersectionObserver" in window) {

  const terminalObserver =
    new IntersectionObserver(entries => {

      if (
        entries.some(
          entry => entry.isIntersecting
        )
      ) {

        startTyping();

        terminalObserver.disconnect();

      }

    }, {
      threshold: 0.16
    });

  terminalObserver.observe(
    terminalWindow
  );

} else {

  startTyping();

}


// ========================================================
// 12. GSAP ANIMATIONS
// ========================================================

// Optional: website remains functional if GSAP fails.

if (!reducedMotion && window.gsap) {

  if (window.ScrollTrigger) {

    gsap.registerPlugin(ScrollTrigger);

  }

  // Hero intro

  gsap.from(".hero-intro", {

    y: 22,
    opacity: 0,
    duration: 0.8,
    delay: 0.2

  });

  // Hero heading

  gsap.from(".hero h1", {

    y: 55,
    opacity: 0,
    duration: 1.15,
    delay: 0.35,
    ease: "power3.out"

  });

  // Hero text and button

  gsap.from(".hero-copy, .primary-link", {

    y: 28,
    opacity: 0,
    duration: 0.85,
    delay: 0.7,
    stagger: 0.13

  });

  // Scroll animations

  if (window.ScrollTrigger) {

    gsap.utils.toArray(".reveal").forEach(
      element => {

        gsap.from(element, {

          scrollTrigger: {

            trigger: element,
            start: "top 92%",
            once: true

          },

          y: 35,
          opacity: 0,
          duration: 0.85,
          ease: "power2.out"

        });

      }
    );

    // Gallery entrance animations

    gsap.utils.toArray(".photo-card").forEach(
      (element, index) => {

        gsap.from(element, {

          scrollTrigger: {

            trigger: element,
            start: "top 98%",
            once: true

          },

          y: 24,
          opacity: 0,
          duration: 0.65,

          delay: (index % 3) * 0.07,

          ease: "power2.out"

        });

      }
    );

  }

}

// ========================================================
// END — NATURUB THANK-YOU WEBSITE V4
// ========================================================