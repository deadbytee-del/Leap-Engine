const DB_NAME = "leap-engine-projects";
let db = null;
function getDB() {
  if (!db) {
    if (typeof PouchDB === "undefined") {
      throw new Error("PouchDB failed to load from CDN.");
    }
    db = new PouchDB(DB_NAME);
  }
  return db;
}
function uid() {
  return "proj_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
export async function createProject(name, type) {
  const database = getDB();
  const id = uid();
  const doc = {
    _id: id,
    name: name && name.trim() ? name.trim() : "Untitled Game",
    type,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    scene: type === "3d" ? { objects: [], camera: { alpha: -1.2, beta: 1.1, radius: 12 } } : { objects: [] },
  };
  await database.put(doc);
  return doc;
}

export async function listProjects() {
  const database = getDB();
  const result = await database.allDocs({ include_docs: true });
  return result.rows
    .map((r) => r.doc)
    .filter((d) => !d._id.startsWith("_design"))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id) {
  const database = getDB();
  return database.get(id);
}

export async function saveProject(id, sceneData, extra = {}) {
  const database = getDB();
  let doc = await database.get(id);
  doc = { ...doc, ...extra, scene: sceneData, updatedAt: Date.now() };
  const res = await database.put(doc);
  doc._rev = res.rev;
  return doc;
}

export async function renameProject(id, newName) {
  const database = getDB();
  const doc = await database.get(id);
  doc.name = newName;
  doc.updatedAt = Date.now();
  await database.put(doc);
  return doc;
}

export async function deleteProject(id) {
  const database = getDB();
  const doc = await database.get(id);
  return database.remove(doc);
}

export async function duplicateProject(id) {
  const database = getDB();
  const doc = await database.get(id);
  const clone = {
    ...doc,
    _id: uid(),
    _rev: undefined,
    name: doc.name + " Copy",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  delete clone._rev;
  await database.put(clone);
  return clone;
}

export async function estimateStorageUsage() {
  try {
    const database = getDB();
    const info = await database.info();
    return `${info.doc_count} project${info.doc_count === 1 ? "" : "s"} stored locally`;
  } catch (e) {
    return "Unknown";
  }
}

export async function destroyAllProjects() {
  const database = getDB();
  await database.destroy();
  db = null;
}
