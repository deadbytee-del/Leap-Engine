import * as Projects from "./projectManager.js";
import * as Editor2D from "./editor2d.js";
import * as Editor3D from "./editor3d.js";
import * as AssetBox from "./assetbox.js";
import * as ExportManager from "./exportManager.js";
import { unlockAudio, playTone } from "./audioManager.js";
import { bindTiltAll, bindRippleAll, staggerReveal, fadeIn, fadeOut } from "./animations.js";

let pendingType = null;
let currentProject = null;
let currentView = "create";
export function init() {
  document.body.addEventListener("pointerdown", unlockAudio, { once: true });
  wireNav();
  wireCreateView();
  wireModal();
  wireEditorChrome();
  wireSettings();
  AssetBox.initAssetBox();
  AssetBox.configureAddTargets({
    on2D: (opts) => Editor2D.addSprite(opts),
    on3D: (opts) => {
      if (opts.kind === "import") Editor3D.addImportedMesh(opts);
      else if (opts.kind === "box") Editor3D.addBox(opts);
      else if (opts.kind === "sphere") Editor3D.addSphere(opts);
      else if (opts.kind === "ground") Editor3D.addGroundPlane(opts);
    },
  });
  switchView("create");
  bindTiltAll(".tilt");
  bindRippleAll(".btn");
  renderProjects();
}
function wireNav() {
  document.querySelectorAll(".menu-nav .nav-item").forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });
}
function switchView(view) {
  currentView = view;
  document.querySelectorAll(".menu-nav .nav-item").forEach((i) => i.classList.toggle("active", i.dataset.view === view));
  document.querySelectorAll(".menu-content .view").forEach((v) => v.classList.add("hidden"));
  const target = document.getElementById(`view-${view}`);
  target.classList.remove("hidden");
  fadeIn(target, { y: 10 });
  if (view === "projects") renderProjects();
  if (view === "settings") refreshSettings();
}
function wireCreateView() {
  document.querySelectorAll(".type-card").forEach((card) => {
    card.addEventListener("click", () => {
      pendingType = card.dataset.type;
      openNewProjectModal(pendingType);
    });
  });
}

function openNewProjectModal(type) {
  const modal = document.getElementById("modal-new-project");
  document.getElementById("modal-new-title").textContent = `Name Your ${type.toUpperCase()} Game`;
  document.getElementById("modal-new-sub").textContent =
    type === "2d" ? "A new PixiJS-powered 2D project will be created." : "A new BabylonJS-powered 3D project will be created.";
  const input = document.getElementById("input-project-name");
  input.value = "";
  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 60);
}
function wireModal() {
  document.getElementById("btn-cancel-new-project").addEventListener("click", () => {
    document.getElementById("modal-new-project").classList.add("hidden");
  });
  document.getElementById("btn-confirm-new-project").addEventListener("click", confirmNewProject);
  document.getElementById("input-project-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmNewProject();
  });
}
async function confirmNewProject() {
  const name = document.getElementById("input-project-name").value.trim() || "Untitled Game";
  const doc = await Projects.createProject(name, pendingType);
  document.getElementById("modal-new-project").classList.add("hidden");
  showToast(`"${doc.name}" created`, "success");
  playTone({ freq: 740, duration: 0.18 });
  openEditor(doc);
}
async function renderProjects() {
  const grid = document.getElementById("projects-grid");
  const projects = await Projects.listProjects();
  grid.innerHTML = "";
  if (projects.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--c-silver-dim)" stroke-width="1.5"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 7l3-4h5l2 3"/></svg>
      <span>No games yet — create one to get started.</span>
    </div>`;
    return;
  }

  projects.forEach((p) => {
    const card = document.createElement("div");
    card.className = "oneui-card tilt project-card";
    card.innerHTML = `
      <div class="thumb">
        ${p.type === "3d"
          ? '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="1.6"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>'
          : '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-2)" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>'}
      </div>
      <div class="meta">
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="row">
          <span class="chip ${p.type === "3d" ? "chip-3d" : "chip-2d"}">${p.type.toUpperCase()}</span>
          <span class="date">${new Date(p.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-open">Open</button>
        <button class="btn btn-ghost btn-dup">Duplicate</button>
        <button class="btn btn-danger btn-del">Delete</button>
      </div>`;
    card.querySelector(".btn-open").addEventListener("click", () => openEditor(p));
    card.querySelector(".btn-dup").addEventListener("click", async (e) => {
      e.stopPropagation();
      await Projects.duplicateProject(p._id);
      showToast("Project duplicated", "success");
      renderProjects();
    });
    card.querySelector(".btn-del").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
        await Projects.deleteProject(p._id);
        showToast("Project deleted", "success");
        renderProjects();
      }
    });
    grid.appendChild(card);
  });
  bindTiltAll(".tilt");
  bindRippleAll(".btn");
  staggerReveal(grid);
}
function wireEditorChrome() {
  document.getElementById("btn-back-to-menu").addEventListener("click", closeEditor);
  document.getElementById("btn-save-project").addEventListener("click", saveCurrentProject);
  document.getElementById("btn-export-game").addEventListener("click", exportCurrentProject);
  document.getElementById("btn-toggle-assetbox").addEventListener("click", AssetBox.toggleAssetBox);
  document.getElementById("btn-open-assetbox-menu").addEventListener("click", AssetBox.toggleAssetBox);

  document.querySelectorAll("#tool-row-2d .tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tool-row-2d .tool-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Editor2D.setTool(btn.dataset.tool);
    });
  });
  document.querySelectorAll("#tool-row-3d .tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tool-row-3d .tool-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Editor3D.setTool(btn.dataset.tool3d);
    });
  });
  Editor2D.on("select", renderPropertiesPanel2D);
  Editor2D.on("change", (data) => { if (Editor2D.getSelected()?.id === data.id) renderPropertiesPanel2D(data); });
  Editor3D.on("select", renderPropertiesPanel3D);
  Editor3D.on("change", (data) => { if (Editor3D.getSelected()?.id === data.id) renderPropertiesPanel3D(data); });
  window.addEventListener("resize", () => { Editor3D.resize(); });
}

function openEditor(project) {
  currentProject = project;
  document.getElementById("editor-project-title").textContent = project.name;
  document.getElementById("editor-project-type").textContent = project.type === "3d" ? "3D Project · BabylonJS" : "2D Project · PixiJS";
  document.getElementById("main-menu").classList.add("hidden");
  const editorScreen = document.getElementById("editor-screen");
  editorScreen.classList.remove("hidden");
  fadeIn(editorScreen);
  const canvas2d = document.getElementById("canvas-2d");
  const canvas3d = document.getElementById("canvas-3d");
  const toolRow2d = document.getElementById("tool-row-2d");
  const toolRow3d = document.getElementById("tool-row-3d");
  if (project.type === "3d") {
    canvas2d.classList.add("hidden");
    canvas3d.classList.remove("hidden");
    toolRow2d.classList.add("hidden");
    toolRow3d.classList.remove("hidden");
    Editor3D.init(canvas3d);
    Editor3D.loadScene(project.scene);
    setTimeout(() => Editor3D.resize(), 50);
  } else {
    canvas3d.classList.add("hidden");
    canvas2d.classList.remove("hidden");
    toolRow3d.classList.add("hidden");
    toolRow2d.classList.remove("hidden");
    Editor2D.init(canvas2d);
    Editor2D.loadScene(project.scene);
  }
  clearPropertiesPanel();
}

function closeEditor() {
  if (currentProject) saveCurrentProject(true);
  Editor2D.destroy();
  Editor3D.destroy();
  AssetBox.closeAssetBox();
  document.getElementById("editor-screen").classList.add("hidden");
  const menu = document.getElementById("main-menu");
  menu.classList.remove("hidden");
  fadeIn(menu);
  switchView("projects");
}
async function saveCurrentProject(silent) {
  if (!currentProject) return;
  const scene = currentProject.type === "3d" ? Editor3D.serialize() : Editor2D.serialize();
  const updated = await Projects.saveProject(currentProject._id, scene);
  currentProject = updated;
  if (!silent) showToast("Game saved", "success");
}
async function exportCurrentProject() {
  if (!currentProject) return;
  await saveCurrentProject(true);
  await ExportManager.exportGame(currentProject);
  showToast("Game exported", "success");
}
function clearPropertiesPanel() {
  document.getElementById("properties-panel").innerHTML = `
    <div class="empty-state" style="padding:20px 0;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-silver-dim)" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
      <span style="font-size:12px;">Select an object to edit its properties</span>
    </div>`;
}

function propRow(label, inputHtml) {
  return `<div class="prop-row"><label>${label}</label>${inputHtml}</div>`;
}

function renderPropertiesPanel2D(data) {
  const panel = document.getElementById("properties-panel");
  if (!data) return clearPropertiesPanel();
  let rows = "";
  rows += propRow("Label", `<input class="input" data-k="label" value="${escapeHtml(data.label)}" />`);
  rows += propRow("X", `<input class="input" type="number" data-k="x" value="${Math.round(data.x)}" />`);
  rows += propRow("Y", `<input class="input" type="number" data-k="y" value="${Math.round(data.y)}" />`);
  rows += propRow("Rotation", `<input class="input" type="number" data-k="rotation" value="${data.rotation || 0}" />`);
  if (data.kind === "rect") {
    rows += propRow("Width", `<input class="input" type="number" data-k="w" value="${data.w}" />`);
    rows += propRow("Height", `<input class="input" type="number" data-k="h" value="${data.h}" />`);
    rows += propRow("Color", `<input class="input" type="color" data-k="color" value="${"#" + data.color.toString(16).padStart(6, "0")}" />`);
  } else if (data.kind === "circle") {
    rows += propRow("Radius", `<input class="input" type="number" data-k="r" value="${data.r}" />`);
    rows += propRow("Color", `<input class="input" type="color" data-k="color" value="${"#" + data.color.toString(16).padStart(6, "0")}" />`);
  } else if (data.kind === "sprite") {
    rows += propRow("Scale", `<input class="input" type="number" step="0.1" data-k="scale" value="${data.scale}" />`);
  }
  panel.innerHTML = rows;
  panel.querySelectorAll("[data-k]").forEach((input) => {
    input.addEventListener("input", () => {
      let val = input.value;
      if (input.type === "number") val = parseFloat(val) || 0;
      if (input.type === "color") val = parseInt(val.replace("#", "0x"), 16);
      Editor2D.updateSelectedProp(input.dataset.k, val);
    });
  });
}

function renderPropertiesPanel3D(data) {
  const panel = document.getElementById("properties-panel");
  if (!data) return clearPropertiesPanel();
  let rows = "";
  rows += propRow("Label", `<input class="input" data-k="label" value="${escapeHtml(data.label)}" />`);
  rows += propRow("X", `<input class="input" type="number" step="0.1" data-k="x" value="${(data.x||0).toFixed(2)}" />`);
  rows += propRow("Y", `<input class="input" type="number" step="0.1" data-k="y" value="${(data.y||0).toFixed(2)}" />`);
  rows += propRow("Z", `<input class="input" type="number" step="0.1" data-k="z" value="${(data.z||0).toFixed(2)}" />`);
  if (data.kind === "box") {
    rows += propRow("Size", `<input class="input" type="number" step="0.1" data-k="size" value="${data.size}" />`);
    rows += propRow("Color", `<input class="input" type="color" data-k="color" value="#${data.color}" />`);
  } else if (data.kind === "sphere") {
    rows += propRow("Diameter", `<input class="input" type="number" step="0.1" data-k="diameter" value="${data.diameter}" />`);
    rows += propRow("Color", `<input class="input" type="color" data-k="color" value="#${data.color}" />`);
  } else if (data.kind === "ground") {
    rows += propRow("Color", `<input class="input" type="color" data-k="color" value="#${data.color}" />`);
  }
  panel.innerHTML = rows;
  panel.querySelectorAll("[data-k]").forEach((input) => {
    input.addEventListener("input", () => {
      let val = input.value;
      if (input.type === "number") val = parseFloat(val) || 0;
      if (input.type === "color") val = val.replace("#", "");
      Editor3D.updateSelectedProp(input.dataset.k, val);
    });
  });
}
function wireSettings() {
  document.getElementById("btn-clear-storage").addEventListener("click", async () => {
    if (confirm("This deletes ALL locally saved games. Continue?")) {
      await Projects.destroyAllProjects();
      showToast("Local data cleared", "success");
      refreshSettings();
    }
  });
}
async function refreshSettings() {
  document.getElementById("setting-storage").textContent = await Projects.estimateStorageUsage();
}
export function showToast(message, type = "default") {
  const stack = document.getElementById("toast-stack");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.appendChild(el);
  fadeIn(el);
  setTimeout(async () => { await fadeOut(el); el.remove(); }, 2400);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
