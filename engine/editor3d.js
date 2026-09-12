let engine = null;
let scene = null;
let camera = null;
let canvas = null;
let objects = new Map();
let selectedId = null;
let currentTool = "orbit";
let idCounter = 1;
let dragPlane = null;
let dragging = false;
const listeners = { select: [], change: [] };
export function on(evt, cb) { (listeners[evt] || (listeners[evt] = [])).push(cb); }
function emit(evt, payload) { (listeners[evt] || []).forEach((cb) => cb(payload)); }
function nextId() { return "obj3d_" + idCounter++; }
export function isReady() { return !!engine; }

export function init(canvasEl) {
  if (engine) return;
  canvas = canvasEl;
  engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.06, 0.06, 0.07, 1);
  camera = new BABYLON.ArcRotateCamera("cam", -1.2, 1.1, 12, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 3;
  camera.upperRadiusLimit = 60;
  camera.wheelPrecision = 30;
  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.9;
  const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-1, -2, -1), scene);
  dir.intensity = 0.6;
  const gridMat = new BABYLON.GridMaterial ? new BABYLON.GridMaterial("gridMat", scene) : null;
  const refGround = BABYLON.MeshBuilder.CreateGround("refGrid", { width: 40, height: 40 }, scene);
  const simpleMat = new BABYLON.StandardMaterial("refMat", scene);
  simpleMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.12);
  simpleMat.alpha = 0.6;
  refGround.material = gridMat || simpleMat;
  refGround.isPickable = false;

  dragPlane = BABYLON.MeshBuilder.CreateGround("dragPlane", { width: 200, height: 200 }, scene);
  dragPlane.isVisible = false;
  dragPlane.isPickable = true;

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
      const pick = pointerInfo.pickInfo;
      if (!pick || !pick.hit) { if (currentTool === "orbit") selectObject(null); return; }
      const hitId = findIdByMesh(pick.pickedMesh);
      if (currentTool === "delete" && hitId) { deleteObject(hitId); return; }
      if (hitId) {
        selectObject(hitId);
        if (currentTool !== "orbit") { /* placement tools don't drag existing objects */ }
        dragging = true;
        camera.detachControl(canvas);
      } else if (currentTool !== "orbit") {
        placeAtGround(pick.pickedPoint);
      }
    }
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
      dragging = false;
      camera.attachControl(canvas, true);
    }
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE && dragging && selectedId) {
      const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === dragPlane);
      if (pick && pick.hit) {
        const obj = objects.get(selectedId);
        if (obj) {
          obj.mesh.position.x = pick.pickedPoint.x;
          obj.mesh.position.z = pick.pickedPoint.z;
          obj.data.x = pick.pickedPoint.x;
          obj.data.z = pick.pickedPoint.z;
          emit("change", obj.data);
        }
      }
    }
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine && engine.resize());
}

function findIdByMesh(mesh) {
  for (const [id, o] of objects.entries()) if (o.mesh === mesh) return id;
  return null;
}

export function setTool(tool) { currentTool = tool; }
export function getTool() { return currentTool; }

function placeAtGround(point) {
  const p = point || new BABYLON.Vector3(0, 0.5, 0);
  if (currentTool === "box") addBox({ x: p.x, y: 0.5, z: p.z });
  else if (currentTool === "sphere") addSphere({ x: p.x, y: 0.5, z: p.z });
  else if (currentTool === "ground") addGroundPlane({ x: p.x, z: p.z });
}

function colorMat(hex) {
  const mat = new BABYLON.StandardMaterial("mat" + nextId(), scene);
  const c = BABYLON.Color3.FromHexString(hex.startsWith("#") ? hex : "#" + hex.toString(16).padStart(6, "0"));
  mat.diffuseColor = c;
  mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
  return mat;
}

export function addBox({ x = 0, y = 0.5, z = 0, size = 1, color = "9aa0ff", label } = {}) {
  const id = nextId();
  const mesh = BABYLON.MeshBuilder.CreateBox(id, { size }, scene);
  mesh.position.set(x, y, z);
  mesh.material = colorMat(color);
  const data = { id, kind: "box", x, y, z, size, color, label: label || "Box" };
  objects.set(id, { mesh, data });
  refreshLayers();
  selectObject(id);
  return id;
}

export function addSphere({ x = 0, y = 0.5, z = 0, diameter = 1, color = "6de3c6", label } = {}) {
  const id = nextId();
  const mesh = BABYLON.MeshBuilder.CreateSphere(id, { diameter }, scene);
  mesh.position.set(x, y, z);
  mesh.material = colorMat(color);
  const data = { id, kind: "sphere", x, y, z, diameter, color, label: label || "Sphere" };
  objects.set(id, { mesh, data });
  refreshLayers();
  selectObject(id);
  return id;
}

export function addGroundPlane({ x = 0, z = 0, width = 4, height = 4, color = "232429", label } = {}) {
  const id = nextId();
  const mesh = BABYLON.MeshBuilder.CreateGround(id, { width, height }, scene);
  mesh.position.set(x, 0, z);
  mesh.material = colorMat(color);
  const data = { id, kind: "ground", x, z, width, height, color, label: label || "Ground" };
  objects.set(id, { mesh, data });
  refreshLayers();
  selectObject(id);
  return id;
}

/** Import a premade mesh asset (glb/obj/babylon) from a URL, e.g. from the AssetBox. */
export async function addImportedMesh({ url, fileName, x = 0, y = 0, z = 0, label } = {}) {
  const id = nextId();
  const rootUrl = url.substring(0, url.lastIndexOf("/") + 1);
  const file = fileName || url.substring(url.lastIndexOf("/") + 1);
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", rootUrl, file, scene);
  const root = new BABYLON.TransformNode(id, scene);
  result.meshes.forEach((m) => { if (m.parent === null) m.parent = root; });
  root.position.set(x, y, z);
  const data = { id, kind: "import", url, fileName: file, x, y, z, label: label || "Imported Model" };
  objects.set(id, { mesh: root, data, extraMeshes: result.meshes });
  refreshLayers();
  selectObject(id);
  return id;
}

export function deleteObject(id) {
  const obj = objects.get(id);
  if (!obj) return;
  if (obj.extraMeshes) obj.extraMeshes.forEach((m) => m.dispose());
  obj.mesh.dispose();
  objects.delete(id);
  if (selectedId === id) selectObject(null);
  refreshLayers();
}

export function selectObject(id) {
  selectedId = id;
  emit("select", id ? objects.get(id)?.data : null);
  refreshLayers();
}
export function getSelected() { return selectedId ? objects.get(selectedId)?.data : null; }

export function updateSelectedProp(key, value) {
  if (!selectedId) return;
  const obj = objects.get(selectedId);
  if (!obj) return;
  obj.data[key] = value;
  const { mesh, data } = obj;
  if (["x", "y", "z"].includes(key)) mesh.position.set(data.x, data.y ?? mesh.position.y, data.z ?? mesh.position.z);
  if (key === "color" && mesh.material) mesh.material.diffuseColor = BABYLON.Color3.FromHexString("#" + data.color);
  if (key === "size" && data.kind === "box") mesh.scaling.setAll(data.size);
  if (key === "diameter" && data.kind === "sphere") mesh.scaling.setAll(data.diameter);
  emit("change", data);
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
    list.innerHTML = '<div class="empty-state" style="padding:16px 0;"><span style="font-size:12px;">No objects yet — pick a tool and click the ground.</span></div>';
  }
}

export function clearScene() { [...objects.keys()].forEach(deleteObject); }

export function serialize() {
  return {
    objects: [...objects.values()].map((o) => ({ ...o.data })),
    camera: camera ? { alpha: camera.alpha, beta: camera.beta, radius: camera.radius } : undefined,
  };
}
export function loadScene(sceneData) {
  clearScene();
  if (!sceneData) return;
  if (sceneData.camera && camera) {
    camera.alpha = sceneData.camera.alpha;
    camera.beta = sceneData.camera.beta;
    camera.radius = sceneData.camera.radius;
  }
  (sceneData.objects || []).forEach((data) => {
    if (data.kind === "box") addBox(data);
    else if (data.kind === "sphere") addSphere(data);
    else if (data.kind === "ground") addGroundPlane(data);
    else if (data.kind === "import") addImportedMesh(data);
  });
  selectObject(null);
}

export function destroy() {
  if (engine) {
    engine.stopRenderLoop();
    scene.dispose();
    engine.dispose();
    engine = null; scene = null; camera = null;
  }
  objects.clear();
  selectedId = null;
  idCounter = 1;
}
export function resize() { engine && engine.resize(); }
