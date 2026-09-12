let app = null;
let world = null;
let objects = new Map();
let selectedId = null;
let currentTool = "select";
let idCounter = 1;
const listeners = { select: [], change: [] };
export function on(evt, cb) { (listeners[evt] || (listeners[evt] = [])).push(cb); }
function emit(evt, payload) { (listeners[evt] || []).forEach((cb) => cb(payload)); }
function nextId() { return "obj2d_" + idCounter++; }
export function isReady() { return !!app; }
export function init(canvasEl) {
  if (app) return;
  app = new PIXI.Application({
    view: canvasEl,
    resizeTo: canvasEl.parentElement,
    backgroundAlpha: 0,
    antialias: true,
  });
  world = new PIXI.Container();
  app.stage.addChild(world);
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointerdown", (e) => {
    if (e.target === app.stage) {
      if (currentTool === "select") selectObject(null);
      else placeAtPointer(e.global.x, e.global.y);
    }
  });
  app.ticker.add(() => {});
}
export function setTool(tool) { currentTool = tool; }
export function getTool() { return currentTool; }
function makeSelectable(view, id) {
  view.eventMode = "static";
  view.cursor = "pointer";
  let dragging = false;
  let start = { x: 0, y: 0 };
  view.on("pointerdown", (e) => {
    e.stopPropagation();
    if (currentTool === "delete") { deleteObject(id); return; }
    selectObject(id);
    dragging = true;
    const local = e.getLocalPosition(world);
    start = { x: local.x - view.x, y: local.y - view.y };
  });
  view.on("globalpointermove", (e) => {
    if (!dragging) return;
    const local = e.getLocalPosition(world);
    view.x = local.x - start.x;
    view.y = local.y - start.y;
    const obj = objects.get(id);
    if (obj) { obj.data.x = view.x; obj.data.y = view.y; emit("change", obj.data); }
  });
  view.on("pointerup", () => (dragging = false));
  view.on("pointerupoutside", () => (dragging = false));
}
function placeAtPointer(x, y) {
  if (currentTool === "rect") addRect({ x, y });
  else if (currentTool === "circle") addCircle({ x, y });
}

export function addRect({ x = 200, y = 200, w = 120, h = 80, color = 0x6de3c6, label } = {}) {
  const id = nextId();
  const g = new PIXI.Graphics();
  g.beginFill(color);
  g.drawRoundedRect(-w / 2, -h / 2, w, h, 8);
  g.endFill();
  g.x = x; g.y = y;
  makeSelectable(g, id);
  world.addChild(g);
  const data = { id, kind: "rect", x, y, w, h, color, label: label || "Rectangle", rotation: 0 };
  objects.set(id, { view: g, data });
  refreshLayers();
  selectObject(id);
  return id;
}

export function addCircle({ x = 260, y = 260, r = 48, color = 0x9aa0ff, label } = {}) {
  const id = nextId();
  const g = new PIXI.Graphics();
  g.beginFill(color);
  g.drawCircle(0, 0, r);
  g.endFill();
  g.x = x; g.y = y;
  makeSelectable(g, id);
  world.addChild(g);
  const data = { id, kind: "circle", x, y, r, color, label: label || "Circle", rotation: 0 };
  objects.set(id, { view: g, data });
  refreshLayers();
  selectObject(id);
  return id;
}

export function addSprite({ textureUrl, x = 300, y = 240, scale = 1, label } = {}) {
  const id = nextId();
  const tex = PIXI.Texture.from(textureUrl);
  const spr = new PIXI.Sprite(tex);
  spr.anchor.set(0.5);
  spr.x = x; spr.y = y; spr.scale.set(scale);
  makeSelectable(spr, id);
  world.addChild(spr);
  const data = { id, kind: "sprite", x, y, scale, textureUrl, label: label || "Sprite", rotation: 0 };
  objects.set(id, { view: spr, data });
  refreshLayers();
  selectObject(id);
  return id;
}

export function deleteObject(id) {
  const obj = objects.get(id);
  if (!obj) return;
  world.removeChild(obj.view);
  obj.view.destroy();
  objects.delete(id);
  if (selectedId === id) selectObject(null);
  refreshLayers();
}

export function selectObject(id) {
  selectedId = id;
  emit("select", id ? objects.get(id)?.data : null);
  refreshLayers();
}

export function getSelected() {
  return selectedId ? objects.get(selectedId)?.data : null;
}

export function updateSelectedProp(key, value) {
  if (!selectedId) return;
  const obj = objects.get(selectedId);
  if (!obj) return;
  obj.data[key] = value;
  applyDataToView(obj);
  emit("change", obj.data);
}

function applyDataToView(obj) {
  const { view, data } = obj;
  view.x = data.x; view.y = data.y;
  view.rotation = (data.rotation || 0) * Math.PI / 180;
  if (data.kind === "rect") {
    view.clear();
    view.beginFill(data.color);
    view.drawRoundedRect(-data.w / 2, -data.h / 2, data.w, data.h, 8);
    view.endFill();
  } else if (data.kind === "circle") {
    view.clear();
    view.beginFill(data.color);
    view.drawCircle(0, 0, data.r);
    view.endFill();
  } else if (data.kind === "sprite") {
    view.scale.set(data.scale);
  }
}

function refreshLayers() {
  const list = document.getElementById("layers-list");
  if (!list) return;
  list.innerHTML = "";
  [...objects.values()].forEach(({ data }) => {
    const el = document.createElement("div");
    el.className = "layer-item" + (data.id === selectedId ? " selected" : "");
    el.textContent = data.label;
    el.onclick = () => selectObject(data.id);
    list.appendChild(el);
  });
  if (objects.size === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:16px 0;"><span style="font-size:12px;">No objects yet — pick a tool and click the canvas.</span></div>';
  }
}

export function clearScene() {
  [...objects.keys()].forEach(deleteObject);
}

export function serialize() {
  return { objects: [...objects.values()].map((o) => ({ ...o.data })) };
}

export function loadScene(sceneData) {
  clearScene();
  if (!sceneData || !Array.isArray(sceneData.objects)) return;
  sceneData.objects.forEach((data) => {
    if (data.kind === "rect") addRect(data);
    else if (data.kind === "circle") addCircle(data);
    else if (data.kind === "sprite") addSprite(data);
  });
  selectObject(null);
}

export function destroy() {
  if (app) {
    app.destroy(false, { children: true });
    app = null; world = null;
  }
  objects.clear();
  selectedId = null;
  idCounter = 1;
}

export function resize() {

}
