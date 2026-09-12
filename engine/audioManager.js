let actx = null;
function getCtx() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    actx = new AC();
  }
  return actx;
}
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
}
export function playTone({ freq = 440, duration = 0.35, shape = "sine", gain = 0.18 } = {}) {
  unlockAudio();
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = shape;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}
export function playJingle(notes = [523.25, 659.25, 783.99], gap = 0.09) {
  notes.forEach((f, i) => {
    setTimeout(() => playTone({ freq: f, duration: 0.25, shape: "triangle", gain: 0.15 }), i * gap * 1000);
  });
}
export function playNoiseHit(duration = 0.18) {
  unlockAudio();
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.35, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  noise.connect(filter).connect(g).connect(ctx.destination);
  noise.start();
}
const activeHowls = new Map();
export function playUrl(id, url, { loop = false, volume = 0.7 } = {}) {
  if (typeof Howl === "undefined") {
    console.warn("Howler.js not loaded yet.");
    return null;
  }
  stopUrl(id);
  const howl = new Howl({ src: [url], loop, volume });
  howl.play();
  activeHowls.set(id, howl);
  return howl;
}
export function stopUrl(id) {
  const existing = activeHowls.get(id);
  if (existing) {
    existing.stop();
    activeHowls.delete(id);
  }
}
export function stopAll() {
  activeHowls.forEach((h) => h.stop());
  activeHowls.clear();
}
export const PREMADE_AUDIO = [
  { id: "sfx-coin", name: "Coin Pickup", kind: "jingle", data: { notes: [880, 1174.66, 1567.98] } },
  { id: "sfx-jump", name: "Jump Blip", kind: "tone", data: { freq: 660, duration: 0.16, shape: "square" } },
  { id: "sfx-hit", name: "Impact Hit", kind: "noise", data: { duration: 0.2 } },
  { id: "sfx-select", name: "UI Select", kind: "tone", data: { freq: 1046.5, duration: 0.1, shape: "sine" } },
  { id: "sfx-powerup", name: "Power Up", kind: "jingle", data: { notes: [523.25, 659.25, 783.99, 1046.5], gap: 0.07 } },
  { id: "sfx-alert", name: "Alert Tone", kind: "tone", data: { freq: 220, duration: 0.4, shape: "sawtooth" } },
];

export function previewPremadeAudio(assetId) {
  const asset = PREMADE_AUDIO.find((a) => a.id === assetId);
  if (!asset) return;
  if (asset.kind === "tone") playTone(asset.data);
  else if (asset.kind === "jingle") playJingle(asset.data.notes, asset.data.gap);
  else if (asset.kind === "noise") playNoiseHit(asset.data.duration);
}
