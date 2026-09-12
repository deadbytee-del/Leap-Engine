const LOGO_B64 = btoa("https://i.postimg.cc/n9HmXz1J/Untitled-design-1-1-removebg-preview.png");
function decodeLogoUrl() { return atob(LOGO_B64); }
export function playInAppExportSplash() {
  return new Promise((resolve) => {
    const overlay = document.getElementById("export-overlay");
    const madeWith = document.getElementById("export-made-with");
    const logo = document.getElementById("export-logo");
    overlay.classList.remove("hidden");
    madeWith.classList.remove("hidden");
    madeWith.style.opacity = 1;
    logo.classList.add("hidden");
    logo.src = "";
    const useGsap = typeof gsap !== "undefined";
    const step2 = () => {
      logo.src = decodeLogoUrl();
      logo.classList.remove("hidden");
      if (useGsap) {
        gsap.fromTo(logo, { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out" });
      } else {
        logo.style.opacity = 1;
      }
      setTimeout(() => {
        if (useGsap) {
          gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: finish });
        } else {
          finish();
        }
      }, 1100);
    };

    const finish = () => {
      overlay.classList.add("hidden");
      overlay.style.opacity = 1;
      resolve();
    };

    if (useGsap) {
      gsap.to(madeWith, {
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.5,
        delay: 0.9,
        onComplete: () => { madeWith.classList.add("hidden"); step2(); },
      });
    } else {
      setTimeout(() => { madeWith.classList.add("hidden"); step2(); }, 900);
    }
  });
}
function buildExportedSplashBlock() {
  return `
<div id="nx-export-splash" style="position:fixed;inset:0;z-index:9999;background:#050506;display:flex;align-items:center;justify-content:center;flex-direction:column;">
  <div id="nx-made-with" style="font-size:20px;letter-spacing:4px;text-transform:uppercase;color:#8b8d95;font-weight:700;font-family:-apple-system,'Segoe UI',sans-serif;opacity:1;transition:opacity .5s ease, filter .5s ease;">Made with</div>
  <img id="nx-logo" alt="" style="display:none;max-width:min(60vw,480px);width:100%;height:auto;opacity:0;transition:opacity .6s ease, filter .6s ease;filter:blur(10px);pointer-events:none;user-select:none;-webkit-user-drag:none;" />
</div>
<script>
(function(){
  var _l = "${LOGO_B64}";
  function _d(){ return atob(_l); }
  var madeWith = document.getElementById('nx-made-with');
  var logo = document.getElementById('nx-logo');
  var splash = document.getElementById('nx-export-splash');
  setTimeout(function(){
    madeWith.style.opacity = 0;
    madeWith.style.filter = 'blur(8px)';
    setTimeout(function(){
      madeWith.style.display = 'none';
      logo.src = _d();
      logo.style.display = 'block';
      requestAnimationFrame(function(){
        logo.style.opacity = 1;
        logo.style.filter = 'blur(0px)';
      });
      setTimeout(function(){
        splash.style.transition = 'opacity .4s ease';
        splash.style.opacity = 0;
        setTimeout(function(){ splash.remove(); }, 420);
      }, 1300);
    }, 500);
  }, 900);
})();
</script>`;
}
function buildRuntime2D(scene) {
  return `
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js"></script>
<div id="game-root" style="position:fixed;inset:0;background:#101014;"></div>
<script>
  var SCENE = ${JSON.stringify(scene)};
  var app = new PIXI.Application({ resizeTo: window, backgroundAlpha: 1, background: 0x101014, antialias: true });
  document.getElementById('game-root').appendChild(app.view);
  var world = new PIXI.Container();
  app.stage.addChild(world);
  (SCENE.objects || []).forEach(function(o){
    var view;
    if (o.kind === 'rect') {
      view = new PIXI.Graphics();
      view.beginFill(o.color); view.drawRoundedRect(-o.w/2, -o.h/2, o.w, o.h, 8); view.endFill();
    } else if (o.kind === 'circle') {
      view = new PIXI.Graphics();
      view.beginFill(o.color); view.drawCircle(0, 0, o.r); view.endFill();
    } else if (o.kind === 'sprite') {
      view = new PIXI.Sprite(PIXI.Texture.from(o.textureUrl));
      view.anchor.set(0.5);
      view.scale.set(o.scale || 1);
    }
    if (view) {
      view.x = o.x; view.y = o.y; view.rotation = (o.rotation || 0) * Math.PI / 180;
      world.addChild(view);
      var t0 = Math.random() * Math.PI * 2;
      app.ticker.add(function(){ view.y = o.y + Math.sin(app.ticker.lastTime/500 + t0) * 4; });
    }
  });
</script>`;
}
function buildRuntime3D(scene) {
  return `
<script src="https://cdn.babylonjs.com/babylon.js"></script>
<script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
<canvas id="renderCanvas" style="width:100%;height:100%;display:block;position:fixed;inset:0;"></canvas>
<script>
  var SCENE_DATA = ${JSON.stringify(scene)};
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.06,0.06,0.07,1);
  var camData = SCENE_DATA.camera || { alpha: -1.2, beta: 1.1, radius: 12 };
  var camera = new BABYLON.ArcRotateCamera('cam', camData.alpha, camData.beta, camData.radius, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  new BABYLON.HemisphericLight('h', new BABYLON.Vector3(0,1,0), scene).intensity = 0.9;
  new BABYLON.DirectionalLight('d', new BABYLON.Vector3(-1,-2,-1), scene).intensity = 0.6;
  var ground = BABYLON.MeshBuilder.CreateGround('g', { width: 40, height: 40 }, scene);
  var gm = new BABYLON.StandardMaterial('gm', scene); gm.diffuseColor = new BABYLON.Color3(0.08,0.08,0.09);
  ground.material = gm;
  function mat(hex){ var m = new BABYLON.StandardMaterial('m'+Math.random(), scene); m.diffuseColor = BABYLON.Color3.FromHexString('#'+hex); return m; }
  (SCENE_DATA.objects || []).forEach(function(o){
    if (o.kind === 'box') { var b = BABYLON.MeshBuilder.CreateBox(o.id, { size: o.size||1 }, scene); b.position.set(o.x,o.y,o.z); b.material = mat(o.color); }
    else if (o.kind === 'sphere') { var s = BABYLON.MeshBuilder.CreateSphere(o.id, { diameter: o.diameter||1 }, scene); s.position.set(o.x,o.y,o.z); s.material = mat(o.color); }
    else if (o.kind === 'ground') { var pg = BABYLON.MeshBuilder.CreateGround(o.id, { width:o.width||4, height:o.height||4 }, scene); pg.position.set(o.x,0,o.z); pg.material = mat(o.color); }
    else if (o.kind === 'import') { BABYLON.SceneLoader.ImportMeshAsync('', o.url.substring(0, o.url.lastIndexOf('/')+1), o.fileName || o.url.substring(o.url.lastIndexOf('/')+1), scene); }
  });
  engine.runRenderLoop(function(){ scene.render(); });
  window.addEventListener('resize', function(){ engine.resize(); });
</script>`;
}
export function buildExportedHTML(project) {
  const runtime = project.type === "3d" ? buildRuntime3D(project.scene) : buildRuntime2D(project.scene);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(project.name || "Leap Game")}</title>
<style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#101014;font-family:-apple-system,'Segoe UI',sans-serif;}</style>
</head>
<body>
${buildExportedSplashBlock()}
${runtime}
</body>
</html>`;
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
export async function exportGame(project) {
  await playInAppExportSplash();
  const html = buildExportedHTML(project);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (project.name || "leap-game").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  a.download = `${safeName || "leap-game"}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
