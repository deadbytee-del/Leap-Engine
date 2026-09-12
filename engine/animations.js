const hasGSAP = () => typeof gsap !== "undefined";
export function transitionScreens(fromEl, toEl, { duration = 0.55 } = {}) {
  return new Promise((resolve) => {
    toEl.classList.remove("hidden");
    if (!hasGSAP()) {
      if (fromEl) fromEl.classList.add("hidden");
      toEl.style.opacity = 1;
      resolve();
      return;
    }
    gsap.set(toEl, { opacity: 0, filter: "blur(14px)" });
    const tl = gsap.timeline({
      onComplete: () => { if (fromEl) fromEl.classList.add("hidden"); resolve(); },
    });
    if (fromEl) {
      tl.to(fromEl, { opacity: 0, filter: "blur(14px)", duration: duration * 0.7, ease: "power2.in" }, 0);
    }
    tl.to(toEl, { opacity: 1, filter: "blur(0px)", duration, ease: "power3.out" }, fromEl ? duration * 0.25 : 0);
  });
}

export function fadeIn(el, opts = {}) {
  if (!hasGSAP()) { el.style.opacity = 1; return; }
  gsap.fromTo(el, { opacity: 0, y: opts.y ?? 8 }, { opacity: 1, y: 0, duration: opts.duration ?? 0.35, ease: "power2.out" });
}
export function fadeOut(el, opts = {}) {
  if (!hasGSAP()) { el.remove(); return Promise.resolve(); }
  return new Promise((resolve) => {
    gsap.to(el, { opacity: 0, y: opts.y ?? -8, duration: opts.duration ?? 0.3, ease: "power2.in", onComplete: resolve });
  });
}

export function staggerReveal(container, selector = ":scope > *", opts = {}) {
  const items = container.querySelectorAll(selector);
  if (!hasGSAP()) { items.forEach((el) => el.classList.add("anim-rise-in")); return; }
  gsap.fromTo(
    items,
    { opacity: 0, y: 16, filter: "blur(6px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out", stagger: opts.stagger ?? 0.05 }
  );
}
export function bindTilt(el, { maxTilt = 6 } = {}) {
  let raf = null;
  function onMove(e) {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * maxTilt).toFixed(2);
    const ry = (px * maxTilt).toFixed(2);
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);
    });
  }
  function onLeave() {
    if (hasGSAP()) {
      gsap.to(el, { "--rx": "0deg", "--ry": "0deg", duration: 0.4, ease: "power2.out" });
    } else {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }
  }
  el.classList.add("tilt-target");
  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseenter", () => el.classList.add("tilt-active"));
  el.addEventListener("mouseleave", () => { el.classList.remove("tilt-active"); onLeave(); });
}

export function bindTiltAll(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    if (!el.dataset.tiltBound) {
      bindTilt(el);
      el.dataset.tiltBound = "1";
    }
  });
}
export function bindRipple(el) {
  el.classList.add("ripple");
  el.addEventListener("pointerdown", (e) => {
    const rect = el.getBoundingClientRect();
    const dot = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 1.4;
    dot.className = "ripple-dot";
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${e.clientX - rect.left - size / 2}px`;
    dot.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(dot);
    setTimeout(() => dot.remove(), 650);
  });
}
export function bindRippleAll(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    if (!el.dataset.rippleBound) {
      bindRipple(el);
      el.dataset.rippleBound = "1";
    }
  });
}
