import { PREMADE_AUDIO, previewPremadeAudio } from "./audioManager.js";

const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/";
const twe = (code, name) => ({ id: "spr-" + code, name, kind: "twemoji", url: `${TWEMOJI_BASE}${code}.png` });

const SPRITE_ASSETS = [
  twe("1f600", "Grinning Face"),
  twe("1f603", "Happy Face"),
  twe("1f604", "Smiling Face"),
  twe("1f60e", "Cool Face"),
  twe("1f929", "Star-Struck"),
  twe("1f47e", "Alien Invader"),
  twe("1f916", "Robot"),
  twe("1f9d9", "Mage"),
  twe("1f9b8", "Superhero"),
  twe("1f9b9", "Supervillain"),
  twe("1f478", "Princess"),
  twe("1f9da", "Fairy"),
  twe("1f9dc", "Merperson"),
  twe("1f9de", "Elf"),
  twe("1f9df", "Genie"),
  twe("1f47b", "Ghost"),
  twe("1f47b", "Ghost"),
  twe("1f47d", "Alien"),
  twe("1f47f", "Goblin"),
  twe("1f479", "Oni"),
  twe("1f480", "Skull"),
  twe("1f9df", "Zombie"),
  twe("1f432", "Dragon Face"),
  twe("1f409", "Dragon"),
  twe("1f438", "Frog"),
  twe("1f98a", "Fox"),
  twe("1f431", "Cat"),
  twe("1f436", "Dog"),
  twe("1f43b", "Bear"),
  twe("1f981", "Lion"),
  twe("1f42f", "Tiger"),
  twe("1f40a", "Crocodile"),
  twe("1f40d", "Snake"),
  twe("1f98e", "Lizard"),
  twe("1f422", "Turtle"),
  twe("1f40b", "Whale"),
  twe("1f419", "Octopus"),
  twe("1f41f", "Fish"),
  twe("1f420", "Tropical Fish"),
  twe("1f41d", "Bee"),
  twe("1f98b", "Butterfly"),
  twe("1f41e", "Ladybug"),
  twe("1f99f", "Mosquito"),
  twe("2694-fe0f", "Crossed Swords"),
  twe("1f5e1-fe0f", "Dagger"),
  twe("1f3f9", "Bow and Arrow"),
  twe("1f52b", "Pistol"),
  twe("1fa83", "Boomerang"),
  twe("1f4a3", "Bomb"),
  twe("1f4a5", "Collision"),
  twe("1f4a2", "Anger Symbol"),
  twe("1f525", "Fire"),
  twe("1f4a8", "Dash"),
  twe("1f4a6", "Sweat Droplets"),
  twe("1f4a7", "Droplet"),
  twe("1f9e8", "Firecracker"),
  twe("1f9ef", "Fire Extinguisher"),
  twe("2b50", "Star"),
  twe("1f31f", "Glowing Star"),
  twe("2728", "Sparkles"),
  twe("1f48e", "Gem"),
  twe("1f4a0", "Diamond Shape"),
  twe("1f3c6", "Trophy"),
  twe("1f396-fe0f", "Medal"),
  twe("1f947", "Gold Medal"),
  twe("1f948", "Silver Medal"),
  twe("1f949", "Bronze Medal"),
  twe("1f3c5", "Sports Medal"),
  twe("1f4b0", "Money Bag"),
  twe("1fa99", "Coin"),
  twe("1f4b5", "Dollar Bill"),
  twe("1f4b8", "Money with Wings"),
  twe("1f381", "Gift"),
  twe("1f388", "Balloon"),
  twe("1f38a", "Confetti Ball"),
  twe("1f389", "Party Popper"),
  twe("1f9e9", "Puzzle Piece"),
  twe("1f9f2", "Magnet"),
  twe("1f52e", "Crystal Ball"),
  twe("1f48c", "Love Letter"),
  twe("1f30d", "Earth"),
  twe("1f310", "Globe"),
  twe("1f30e", "Earth Americas"),
  twe("1f30f", "Earth Asia"),
  twe("1f30c", "Milky Way"),
  twe("2600-fe0f", "Sun"),
  twe("1f31e", "Sun with Face"),
  twe("1f319", "Crescent Moon"),
  twe("1f311", "New Moon"),
  twe("1f312", "Waxing Crescent"),
  twe("1f313", "First Quarter Moon"),
  twe("1f314", "Waxing Gibbous"),
  twe("1f315", "Full Moon"),
  twe("1f316", "Waning Gibbous"),
  twe("1f317", "Last Quarter Moon"),
  twe("1f318", "Waning Crescent"),
  twe("2b50", "Star"),
  twe("1f324-fe0f", "Sun Behind Small Cloud"),
  twe("26c5", "Sun Behind Cloud"),
  twe("1f326-fe0f", "Sun Behind Rain Cloud"),
  twe("1f327-fe0f", "Cloud with Rain"),
  twe("1f328-fe0f", "Cloud with Snow"),
  twe("1f329-fe0f", "Cloud with Lightning"),
  twe("26a1", "Lightning"),
  twe("2744-fe0f", "Snowflake"),
  twe("1f32a-fe0f", "Wind Face"),
  twe("1f300", "Cyclone"),
  twe("1f308", "Rainbow"),
  twe("1f33f", "Herb"),
  twe("1f331", "Seedling"),
  twe("1f332", "Evergreen Tree"),
  twe("1f333", "Deciduous Tree"),
  twe("1f334", "Palm Tree"),
  twe("1f335", "Cactus"),
  twe("1f33b", "Sunflower"),
  twe("1f337", "Tulip"),
  twe("1f340", "Four Leaf Clover"),
  twe("1f341", "Maple Leaf"),
  twe("1f342", "Fallen Leaf"),
  twe("1f343", "Leaves"),
  twe("1f34e", "Red Apple"),
  twe("1f34f", "Green Apple"),
  twe("1f350", "Pear"),
  twe("1f34a", "Tangerine"),
  twe("1f34b", "Lemon"),
  twe("1f34c", "Banana"),
  twe("1f353", "Strawberry"),
  twe("1f347", "Grapes"),
  twe("1f348", "Melon"),
  twe("1f349", "Watermelon"),
  twe("1f34d", "Pineapple"),
  twe("1f355", "Pizza"),
  twe("1f354", "Hamburger"),
  twe("1f35f", "Fries"),
  twe("1f32e", "Taco"),
  twe("1f32f", "Burrito"),
  twe("1f363", "Sushi"),
  twe("1f35c", "Noodles"),
  twe("1f36a", "Cookie"),
  twe("1f36b", "Chocolate"),
  twe("1f369", "Doughnut"),
  twe("1f370", "Cake"),
  twe("1f382", "Birthday Cake"),
  twe("1f36d", "Lollipop"),
  twe("1f36f", "Honey Pot"),
  twe("1f9c3", "Juice Box"),
  twe("1f964", "Cup with Straw"),
  twe("1f680", "Rocket"),
  twe("1f681", "Helicopter"),
  twe("1f682", "Steam Locomotive"),
  twe("1f683", "Train"),
  twe("1f684", "High-Speed Train"),
  twe("1f685", "Bullet Train"),
  twe("1f686", "Train"),
  twe("1f687", "Metro"),
  twe("1f688", "Light Rail"),
  twe("1f689", "Station"),
  twe("1f68c", "Bus"),
  twe("1f68e", "Trolleybus"),
  twe("1f690", "Minibus"),
  twe("1f691", "Ambulance"),
  twe("1f692", "Fire Engine"),
  twe("1f693", "Police Car"),
  twe("1f697", "Automobile"),
  twe("1f699", "SUV"),
  twe("1f69a", "Delivery Truck"),
  twe("1f6b2", "Bicycle"),
  twe("1f6f2", "Oil Drum"),
  twe("1f6f9", "Skateboard"),
  twe("1f6fc", "Roller Skate"),
  twe("1f6a2", "Ship"),
  twe("26f5", "Sailboat"),
  twe("1f6a4", "Speedboat"),
  twe("1f6f6", "Canoe"),
  twe("1f6f8", "UFO"),
  twe("1f6f0-fe0f", "Satellite"),
  twe("1f3e0", "House"),
  twe("1f3e1", "House with Garden"),
  twe("1f3e2", "Office Building"),
  twe("1f3e5", "Hospital"),
  twe("1f3e6", "Bank"),
  twe("1f3e8", "Hotel"),
  twe("1f3ea", "Convenience Store"),
  twe("1f3eb", "School"),
  twe("1f3ed", "Factory"),
  twe("1f3f0", "Castle"),
  twe("1f5fd", "Statue"),
  twe("1f5fc", "Tokyo Tower"),
  twe("1f3a1", "Ferris Wheel"),
  twe("1f3a2", "Roller Coaster"),
  twe("1f3aa", "Circus Tent"),
  twe("1f5db-fe0f", "Classical Building"),
  twe("1f5fa-fe0f", "World Map"),
  twe("1f5f A-fe0f", "Map"),
  twe("1f6a7", "Construction"),
  twe("1f6a7", "Construction Barrier"),
  twe("1f6a8", "Police Light"),
  twe("1f6b8", "Elevator"),
  twe("1f6aa", "Door"),
  twe("1f6cf-fe0f", "Bed"),
  twe("1f6cb-fe0f", "Couch"),
  twe("1f6bd", "Toilet"),
  twe("1f6bf", "Shower"),
  twe("1f3ae", "Game Pad"),
  twe("1f579-fe0f", "Joystick"),
  twe("1f5b2-fe0f", "Computer Mouse"),
  twe("2328-fe0f", "Keyboard"),
  twe("1f4bb", "Laptop"),
  twe("1f5a5-fe0f", "Desktop Computer"),
  twe("1f4f1", "Mobile Phone"),
  twe("1f4f2", "Mobile Phone with Arrow"),
  twe("1f4fa", "Television"),
  twe("1f4f7", "Camera"),
  twe("1f4f9", "Video Camera"),
  twe("1f50a", "Speaker"),
  twe("1f509", "Speaker Medium Volume"),
  twe("1f508", "Speaker Low Volume"),
  twe("1f507", "Muted Speaker"),
  twe("1f514", "Bell"),
  twe("1f515", "Bell with Slash"),
  twe("1f4e1", "Satellite Antenna"),
  twe("1f4e2", "Loudspeaker"),
  twe("1f4e3", "Megaphone"),
  twe("1f4ac", "Speech Bubble"),
  twe("1f5e8-fe0f", "Left Speech Bubble"),
  twe("1f4ad", "Thought Balloon"),
  twe("1f4a1", "Light Bulb"),
  twe("1f4a4", "Zzz"),
  twe("1f50d", "Magnifying Glass"),
  twe("1f50e", "Magnifying Glass Right"),
  twe("1f512", "Locked"),
  twe("1f513", "Unlocked"),
  twe("1f511", "Key"),
  twe("1f528", "Hammer"),
  twe("1f527", "Wrench"),
  twe("2699-fe0f", "Gear"),
  twe("1f529", "Nut and Bolt"),
  twe("1f4ce", "Paperclip"),
  twe("1f4cc", "Pushpin"),
  twe("1f4cd", "Round Pushpin"),
  twe("1f4c1", "Folder"),
  twe("1f4c2", "Open Folder"),
  twe("1f4c4", "Document"),
  twe("1f4dd", "Memo"),
  twe("1f4ca", "Bar Chart"),
  twe("1f4c8", "Chart Increasing"),
  twe("1f4c9", "Chart Decreasing"),
  twe("2b06-fe0f", "Up Arrow"),
  twe("2b07-fe0f", "Down Arrow"),
  twe("2b05-fe0f", "Left Arrow"),
  twe("27a1-fe0f", "Right Arrow"),
  twe("2194-fe0f", "Left Right Arrow"),
  twe("2195-fe0f", "Up Down Arrow"),
  twe("21a9-fe0f", "Left Arrow Curving"),
  twe("21aa-fe0f", "Right Arrow Curving"),
  twe("23ea", "Fast Reverse Button"),
  twe("23e9", "Fast Forward Button"),
  twe("23ed-fe0f", "Next Track Button"),
  twe("23ee-fe0f", "Last Track Button"),
  twe("23f9-fe0f", "Stop Button"),
  twe("23fa-fe0f", "Record Button"),
  twe("25b6-fe0f", "Play Button"),
  twe("23f8-fe0f", "Pause Button"),
  twe("1f7e2", "Green Circle"),
  twe("1f534", "Red Circle"),
  twe("1f535", "Blue Circle"),
  twe("1f7e1", "Yellow Circle"),
  twe("26ab", "Black Circle"),
  twe("26aa", "White Circle"),
  twe("2b1b", "Black Square"),
  twe("2b1c", "White Square"),
  twe("2705", "Check Mark"),
  twe("274c", "Cross Mark"),
  twe("2757", "Exclamation"),
  twe("2753", "Question Mark"),
  twe("2049-fe0f", "Exclamation Question"),
  twe("1f6ab", "Prohibited"),
  twe("1f6d1", "Stop Sign"),
  twe("26a0-fe0f", "Warning"),
  twe("1f198", "SOS"),
  twe("1f4af", "100"),
  twe("1f51f", "Ten"),
  twe("1f4a2", "Anger Symbol"),
  twe("1f680", "Rocket"),
  twe("2b50", "Star"),
  twe("1f3ae", "Game Pad"),
  twe("1f47e", "Alien Invader"),
  twe("1f6f8", "UFO"),
  twe("1f9e9", "Puzzle Piece"),
  twe("1f3c6", "Trophy"),
  twe("1f47b", "Ghost"),
  twe("1f4a5", "Explosion"),
  twe("1f52e", "Crystal Ball"),
  twe("1f310", "Globe"),
  twe("1f48e", "Gem"),
  twe("1f525", "Fire"),
  twe("2728", "Sparkles"),
  twe("1f4a3", "Bomb"),
  twe("1f3af", "Target"),
  twe("1f916", "Robot"),
  twe("1f409", "Dragon"),
  twe("1f3f0", "Castle"),
  twe("1f9f2", "Magnet"),
];

const BABYLON_ASSETS_BASE = "https://assets.babylonjs.com/meshes/";
const MODEL_ASSETS = [
  { id: "mdl-skull", name: "Skull (imported mesh)", kind: "import", url: BABYLON_ASSETS_BASE + "skull.babylon" },
  { id: "mdl-box", name: "Box (primitive)", kind: "box" },
  { id: "mdl-sphere", name: "Sphere (primitive)", kind: "sphere" },
  { id: "mdl-ground", name: "Ground Plane (primitive)", kind: "ground" },
];

let panelOpen = false;
let currentCategory = "2d";
let searchTerm = "";
let addTargets = { on2D: null, on3D: null };

export function configureAddTargets({ on2D, on3D }) {
  addTargets.on2D = on2D;
  addTargets.on3D = on3D;
}

export function initAssetBox() {
  const panel = document.getElementById("assetbox-panel");
  const tabs = document.getElementById("assetbox-tabs");
  const search = document.getElementById("assetbox-search-input");

  tabs.querySelectorAll(".assetbox-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.querySelectorAll(".assetbox-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.cat;
      renderGrid();
    });
  });

  search.addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderGrid();
  });

  document.getElementById("btn-close-assetbox").addEventListener("click", closeAssetBox);

  renderGrid();
}

export function openAssetBox() {
  const panel = document.getElementById("assetbox-panel");
  panel.classList.remove("hidden");
  requestAnimationFrame(() => panel.classList.add("open"));
  panelOpen = true;
}
export function closeAssetBox() {
  const panel = document.getElementById("assetbox-panel");
  panel.classList.remove("open");
  panelOpen = false;
  setTimeout(() => { if (!panelOpen) panel.classList.add("hidden"); }, 460);
}
export function toggleAssetBox() { panelOpen ? closeAssetBox() : openAssetBox(); }
export function isAssetBoxOpen() { return panelOpen; }

function currentList() {
  if (currentCategory === "2d") return SPRITE_ASSETS;
  if (currentCategory === "3d") return MODEL_ASSETS;
  return PREMADE_AUDIO;
}

function renderGrid() {
  const grid = document.getElementById("assetbox-grid");
  grid.innerHTML = "";
  const list = currentList().filter((a) => a.name.toLowerCase().includes(searchTerm));

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><span style="font-size:12px;">No assets match your search.</span></div>';
    return;
  }

  list.forEach((asset) => {
    const tile = document.createElement("div");
    tile.className = "oneui-card asset-tile";
    tile.title = asset.name;

    const art = document.createElement("div");
    art.className = "art";
    art.appendChild(renderArtPreview(asset));
    tile.appendChild(art);

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = asset.name;
    tile.appendChild(name);

    tile.addEventListener("click", () => handleAssetActivate(asset, tile));
    grid.appendChild(tile);
  });
}

function renderArtPreview(asset) {
  if (currentCategory === "2d") {
    const img = document.createElement("img");
    img.src = asset.url;
    img.alt = asset.name;
    img.loading = "lazy";
    return img;
  }
  if (currentCategory === "3d") {
    const wrap = document.createElement("div");
    wrap.innerHTML = shapeGlyph(asset.kind);
    return wrap.firstElementChild;
  }
  const wrap = document.createElement("div");
  wrap.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-2)" stroke-width="2">
    <path d="M3 12h2l2-6 3 14 3-11 2 6h5"/></svg>`;
  return wrap.firstElementChild;
}

function shapeGlyph(kind) {
  const stroke = 'stroke="var(--c-accent)" stroke-width="1.6" fill="none"';
  if (kind === "import") return `<svg width="34" height="34" viewBox="0 0 24 24" ${stroke}><path d="M12 2l3 5-3 3-3-3z"/><circle cx="12" cy="14" r="6"/></svg>`;
  if (kind === "sphere") return `<svg width="34" height="34" viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="9"/></svg>`;
  if (kind === "ground") return `<svg width="34" height="34" viewBox="0 0 24 24" ${stroke}><path d="M3 17l9-4 9 4-9 4z"/></svg>`;
  return `<svg width="34" height="34" viewBox="0 0 24 24" ${stroke}><rect x="5" y="5" width="14" height="14" rx="2"/></svg>`;
}

async function handleAssetActivate(asset, tileEl) {
  if (currentCategory === "audio") {
    tileEl.classList.add("playing");
    previewPremadeAudio(asset.id);
    setTimeout(() => tileEl.classList.remove("playing"), 500);
    return;
  }
  if (currentCategory === "2d") {
    if (addTargets.on2D) {
      addTargets.on2D({ textureUrl: asset.url, label: asset.name });
    }
    return;
  }
  if (currentCategory === "3d") {
    if (addTargets.on3D) {
      if (asset.kind === "import") {
        addTargets.on3D({ kind: "import", url: asset.url, label: asset.name });
      } else {
        addTargets.on3D({ kind: asset.kind, label: asset.name });
      }
    }
  }
}
