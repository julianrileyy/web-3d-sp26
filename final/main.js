
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

import { WORKS, CONFIG } from "./works.js";

// constants

const PANEL_SPACING  = 11;       // work spacing
const FIRST_PANEL_X  = 11;       
const CAMERA_Z       = 9;        
const LERP_SPEED     = 0.075;    
const DRAG_SCALE     = 0.018;  
const WHEEL_SCALE    = 0.012;    
const INERTIA_DECAY  = 0.88;     


const MAX_CAMERA_X = FIRST_PANEL_X + (WORKS.length - 1) * PANEL_SPACING + 3;



let W = window.innerWidth;
let H = window.innerHeight;

const canvas = document.getElementById("canvas");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.setClearColor(0x0c0b09);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 300);
camera.position.set(0, 0, CAMERA_Z);

//text

const loader = new THREE.TextureLoader();

function loadTex(path) {
  return loader.load(path);
}



function mat(color, opts = {}) {
  return new THREE.MeshBasicMaterial({ color, ...opts });
}

function plane(w, h, color, opts) {
  const geo  = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geo, mat(color, opts));
  return mesh;
}



for (let y = -7; y <= 7; y += 3.5) {
  const pts = [new THREE.Vector3(-4, y, -2), new THREE.Vector3(300, y, -2)];
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x1a1815, transparent: true, opacity: 1 })));
}


//star
function buildStarShape(outerR, innerR, points) {
  const shape = new THREE.Shape();
  const step  = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r     = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x     = Math.cos(angle) * r;
    const y     = Math.sin(angle) * r;
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

const starShape = buildStarShape(3.2, 1.35, 5);
const starGeo   = new THREE.ShapeGeometry(starShape);


const starFill = new THREE.Mesh(starGeo, mat(0x7d2030, { transparent: true, opacity: 0.10 }));
starFill.position.set(0, 0, -1.5);
scene.add(starFill);

// star outline
const starEdgeGeo = new THREE.EdgesGeometry(starGeo);
const starOutline = new THREE.LineSegments(
  starEdgeGeo,
  new THREE.LineBasicMaterial({ color: 0x7d2030, transparent: true, opacity: 0.55 })
);
starOutline.position.set(0, 0, -1.4);
scene.add(starOutline);


[
  [4.0, 4.08, 0.40],
  [5.2, 5.26, 0.20],
  [6.6, 6.64, 0.12],
].forEach(([inner, outer, opacity]) => {
  const rGeo  = new THREE.RingGeometry(inner, outer, 80);
  const rMesh = new THREE.Mesh(rGeo, mat(0x7d2030, { transparent: true, opacity, side: THREE.DoubleSide }));
  rMesh.position.set(0, 0, -1.5);
  scene.add(rMesh);
});

//works

const panelData = []; 

WORKS.forEach((work, i) => {
  const x = FIRST_PANEL_X + i * PANEL_SPACING;

  // bg
  const shadow = plane(9.35, 8.2, 0x070706);
  shadow.position.set(x + 0.18, -0.18, -0.05);
  scene.add(shadow);

  // border
  const border = plane(9.25, 8.1, 0x1e1c19);
  border.position.set(x, 0, -0.02);
  scene.add(border);

  // bg square
  const bg = plane(9.0, 7.85, 0xeee8dc);
  bg.position.set(x, 0, 0);
  scene.add(bg);


  const imgGeo = new THREE.PlaneGeometry(8.5, 5.8);
  let imgMat;

  if (work.image) {
    const tex = loadTex(work.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    imgMat = new THREE.MeshBasicMaterial({ map: tex });
  } else {
    imgMat = new THREE.MeshBasicMaterial({ color: 0x2a2825 });
  }

  const imgMesh = new THREE.Mesh(imgGeo, imgMat);
  imgMesh.position.set(x, 0.95, 0.01);
  scene.add(imgMesh);


 const crossColor = 0x4a4844;
 [[new THREE.Vector3(x, 0.95 + 1.4, 0.02), new THREE.Vector3(x, 0.95 - 1.4, 0.02)],
[new THREE.Vector3(x - 1.4, 0.95, 0.02), new THREE.Vector3(x + 1.4, 0.95, 0.02)]]
.forEach(pts => {
  const g = new THREE.BufferGeometry().setFromPoints(pts);
   const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: crossColor, transparent: true, opacity: 0.4 }));
    scene.add(l);
  });



  //html text
  const div = document.createElement("div");
  div.className = "work-text";
  div.innerHTML = `
    <div class="work-index">0${i + 1}</div>
    <h2 class="work-title">${work.title}</h2>
    <p class="work-meta">${work.year}&nbsp;&nbsp;/&nbsp;&nbsp;${work.medium}</p>
    <p class="work-desc">${work.description}</p>
  `;
  document.getElementById("overlay").appendChild(div);
  panelData.push({ div, worldX: x, worldY: -4.5 });
});

//scroll

let targetX  = 0;
let currentX = 0;
let velocity = 0;    

// cntrls

window.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = (e.deltaY + e.deltaX) * WHEEL_SCALE;
  velocity += delta;
}, { passive: false });



let isDragging    = false;
let dragStartX    = 0;
let dragPrevX     = 0;
let dragVelocity  = 0;

window.addEventListener("mousedown", (e) => {
  isDragging   = true;
  dragStartX   = e.clientX;
  dragPrevX    = e.clientX;
  dragVelocity = 0;
  velocity     = 0;
  document.body.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx      = (e.clientX - dragPrevX) * DRAG_SCALE;
  dragVelocity  = -dx;
  targetX       = Math.max(0, Math.min(MAX_CAMERA_X, targetX - dx));
  dragPrevX     = e.clientX;
});

window.addEventListener("mouseup", () => {
  if (isDragging) {
    velocity   = dragVelocity * 2.5; // release momentum
    isDragging = false;
  }
  document.body.style.cursor = "grab";
});

window.addEventListener("mouseleave", () => {
  if (isDragging) {
    velocity   = dragVelocity * 2.5;
    isDragging = false;
    document.body.style.cursor = "grab";
  }
});



let touchPrevX   = 0;
let touchVelocity = 0;

window.addEventListener("touchstart", (e) => {
  touchPrevX    = e.touches[0].clientX;
  touchVelocity = 0;
  velocity      = 0;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const dx      = (e.touches[0].clientX - touchPrevX) * DRAG_SCALE;
  touchVelocity = -dx;
  targetX       = Math.max(0, Math.min(MAX_CAMERA_X, targetX - dx));
  touchPrevX    = e.touches[0].clientX;
}, { passive: false });

window.addEventListener("touchend", () => {
  velocity = touchVelocity * 3;
});



window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
});



const tempVec      = new THREE.Vector3();
const progressFill = document.getElementById("progress-fill");
const homeOverlay  = document.getElementById("homepage-overlay");

function syncOverlays() {
  // Homepage fade
  const homeFade = Math.max(0, 1 - currentX / 5);
  homeOverlay.style.opacity = homeFade;

  // text positions
  panelData.forEach(({ div, worldX, worldY }) => {
    tempVec.set(worldX, worldY, 0);
    tempVec.project(camera);

    const sx = ( tempVec.x * 0.5 + 0.5) * W;
    const sy = (-tempVec.y * 0.5 + 0.5) * H;

    div.style.transform = `translate(-50%, 0) translate(${sx}px, ${sy}px)`;

    // Fade in/out
    const distFromCenter = Math.abs(sx - W * 0.5) / (W * 0.5);
    div.style.opacity     = Math.max(0, 1 - distFromCenter * 1.4);
  });

  // Progress bar
  const pct = (currentX / MAX_CAMERA_X) * 100;
  progressFill.style.width = `${pct}%`;
}



const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();


  if (!isDragging) {
    velocity  *= INERTIA_DECAY;
    targetX    = Math.max(0, Math.min(MAX_CAMERA_X, targetX + velocity));
  }


  currentX          += (targetX - currentX) * LERP_SPEED;
  camera.position.x  = currentX;

  starFill.rotation.z    =  t * 0.07;
  starOutline.rotation.z =  t * 0.07;

  renderer.render(scene, camera);
  syncOverlays();
}

animate();
