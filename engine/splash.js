import { transitionScreens } from "./animations.js";
import * as UI from "./uiManager.js";
const CHECKS = [
  { key: "PIXI", label: "Loading 2D Renderer (PixiJS)" },
  { key: "BABYLON", label: "Loading 3D Renderer (BabylonJS)" },
  { key: "gsap", label: "Loading Animation System (GSAP)" },
  { key: "PouchDB", label: "Loading Local Storage (PouchDB)" },
  { key: "Howl", label: "Loading Audio Engine (Howler)" },
];
function isLoaded(key) {
  return typeof window[key] !== "undefined";
}
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
export async function runBootSequence() {
  const bar = document.getElementById("splash-progress-bar");
  const tag = document.getElementById("splash-tag");
  const splashEl = document.getElementById("splash-screen");
  const menuEl = document.getElementById("main-menu");
  const MAX_WAIT_MS = 6000;
  const startedAt = Date.now();
  for (let i = 0; i < CHECKS.length; i++) {
    const check = CHECKS[i];
    tag.textContent = check.label + "…";
    while (!isLoaded(check.key) && Date.now() - startedAt < MAX_WAIT_MS) {
      await wait(60);
    }
    const pct = Math.round(((i + 1) / CHECKS.length) * 100);
    bar.style.width = pct + "%";
    await wait(120);
  }

  tag.textContent = isAllLoaded() ? "Ready" : "Starting in offline/partial mode…";
  await wait(280);
  await transitionScreens(splashEl, menuEl, { duration: 0.6 });
  UI.init();
}
function isAllLoaded() {
  return CHECKS.every((c) => isLoaded(c.key));
}
