
// Photos must be named img-20.jpeg through img-30.jpeg in /public.
const photos = Array.from({ length: 11 }, (_, i) => ({
  src: `public/img-${i + 20}.jpeg`,
  title: `A moment to remember`,
  number: String(i + 1).padStart(2, "0")
}));

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const gallery = document.getElementById("gallery");
const dialog = document.getElementById("lightbox");
const viewerImage = document.getElementById("lightbox-image");
const viewerCount = document.getElementById("lightbox-count");
const viewerCaption = document.getElementById("lightbox-caption");
const status = document.getElementById("live-status");
let currentPhoto = 0;

function replayHeart(element) {
  element.classList.remove("burst");
  void element.offsetWidth; // Restart the CSS animation on every double-tap.
  element.classList.add("burst");
  status.textContent = "A little love for this memory!";
}

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  viewerImage.src = photo.src;
  viewerImage.alt = `${photo.title}, photo ${currentPhoto + 1} of ${photos.length}`;
  viewerCount.textContent = `${photo.number} / ${photos.length}`;
  viewerCaption.textContent = photo.title;
}

function openViewer(index) {
  showPhoto(index);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("modal-open");
}

function closeViewer() {
  if (dialog.open) dialog.close();
}

photos.forEach((photo, index) => {
  const card = document.createElement("figure");
  card.className = "photo-card";
  card.innerHTML = `
    <button class="photo-open" type="button" aria-label="Open photo ${index + 1} of ${photos.length}; double-tap to send a heart">
      <img src="${photo.src}" alt="Naturub internship memory ${index + 1}" loading="lazy" decoding="async" />
      <span class="photo-error" aria-hidden="true">Photo unavailable</span>
      <span class="photo-caption"><span><small>MEMORY ${photo.number}</small><b>${photo.title}</b></span><span class="expand" aria-hidden="true">↗</span></span>
      <span class="heart-burst" aria-hidden="true">♥</span>
    </button>`;
  gallery.appendChild(card);

  const button = card.querySelector("button");
  const img = card.querySelector("img");
  const heart = card.querySelector(".heart-burst");
  img.addEventListener("load", () => card.classList.add("loaded"));
  img.addEventListener("error", () => {
    card.classList.add("is-error");
    button.disabled = true;
    button.setAttribute("aria-label", `Photo ${index + 1} unavailable`);
  });
  if (img.complete) {
    if (img.naturalWidth) card.classList.add("loaded");
    else if (img.src) card.classList.add("is-error");
  }

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
  button.addEventListener("dblclick", event => event.preventDefault());
});

// Full-screen viewer: arrows, keyboard, swipe, backdrop and double-tap hearts.
document.getElementById("close-lightbox").addEventListener("click", closeViewer);
document.getElementById("prev-photo").addEventListener("click", () => showPhoto(currentPhoto - 1));
document.getElementById("next-photo").addEventListener("click", () => showPhoto(currentPhoto + 1));
dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
dialog.addEventListener("click", event => {
  if (event.target === dialog) closeViewer();
});
document.addEventListener("keydown", event => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
});

const imageWrap = document.getElementById("viewer-image-wrap");
const viewerHeart = document.getElementById("viewer-heart");
let touchStartX = null;
imageWrap.addEventListener("touchstart", event => {
  touchStartX = event.touches.length === 1 ? event.touches[0].clientX : null;
}, { passive: true });
imageWrap.addEventListener("touchend", event => {
  if (touchStartX === null || !event.changedTouches.length) return;
  const delta = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(delta) > 55) showPhoto(currentPhoto + (delta < 0 ? 1 : -1));
}, { passive: true });
let lastViewerTap = 0;
imageWrap.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastViewerTap < 330) {
    replayHeart(viewerHeart);
    lastViewerTap = 0;
  } else lastViewerTap = now;
});
imageWrap.addEventListener("dblclick", event => event.preventDefault());

// Accessible animated tabs (click and arrow-key navigation).
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = {
  gallery: document.getElementById("panel-gallery"),
  note: document.getElementById("panel-note")
};
function activateTab(name, focus = false) {
  tabs.forEach(tab => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
  if (name === "note") startTyping();
  if (!reducedMotion && window.gsap) {
    gsap.fromTo(panels[name], { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: .5, ease: "power2.out", clearProps: "opacity,transform" });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    activateTab(tabs[next].dataset.tab, true);
  });
});

// The entire second-tab terminal message types from top to bottom.
// This is playful pseudocode, not code that is executed by the browser.
const gratitudeMessage = [
  "// A little message from all of us",
  "",
  "people.who_teach_us = truly_grateful;",
  "",
  "while (we.learn) {",
  "  you.shareKnowledge();",
  "  you.guideWithPatience();",
  "  we.ask();",
  "  we.grow();",
  "}",
  "",
  "// Knowledge stays in our minds.",
  "// Kindness stays in our hearts.",
  "",
  'return "Thank you for everything.";',
  "",
  "'From all of us, with heartfelt gratitude.'"
].join("\n");

const typedElement = document.getElementById("typed-message");
const replayButton = document.getElementById("replay-typing");
let typingStarted = false;
let typingTimer = null;
let typingPosition = 0;

function typeNextCharacter() {
  if (typingPosition >= gratitudeMessage.length) {
    typingTimer = null;
    replayButton.disabled = false;
    return;
  }

  const char = gratitudeMessage[typingPosition++];
  typedElement.textContent += char;
  // Pause at line endings so the message reads naturally on phones.
  const delay = char === "\n" ? 150 : char === " " ? 15 : 29;
  typingTimer = window.setTimeout(typeNextCharacter, delay);
}

function startTyping(restart = false) {
  if (typingStarted && !restart) return;
  typingStarted = true;
  window.clearTimeout(typingTimer);
  typingTimer = null;
  typingPosition = 0;
  typedElement.textContent = "";

  if (reducedMotion) {
    typedElement.textContent = gratitudeMessage;
    replayButton.disabled = false;
    return;
  }

  replayButton.disabled = true;
  typeNextCharacter();
}

replayButton.addEventListener("click", () => startTyping(true));

// GSAP is optional: content remains usable if the CDN cannot load.
if (!reducedMotion && window.gsap) {
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  gsap.from(".hero-intro", { y: 22, opacity: 0, duration: .8, delay: .2 });
  gsap.from(".hero h1", { y: 55, opacity: 0, duration: 1.15, delay: .35, ease: "power3.out" });
  gsap.from(".hero-copy, .primary-link", { y: 28, opacity: 0, duration: .85, delay: .7, stagger: .13 });
  if (window.ScrollTrigger) {
    gsap.utils.toArray(".reveal").forEach(element => {
      gsap.from(element, { scrollTrigger: { trigger: element, start: "top 92%", once: true }, y: 35, opacity: 0, duration: .85, ease: "power2.out" });
    });
    gsap.utils.toArray(".photo-card").forEach((element, index) => {
      gsap.from(element, { scrollTrigger: { trigger: element, start: "top 98%", once: true }, y: 24, opacity: 0, duration: .65, delay: (index % 3) * .07, ease: "power2.out" });
    });
  }
}