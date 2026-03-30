// Basic Three.js Example
// Chelsea Thompto - Spring 2026
import * as THREE from 'three';
import { OrbitControls } from './src/OrbitControls.js';

let camera, canvas, controls, scene, renderer;
init();

function init() {
    canvas = document.getElementById("3-holder");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfeff5);
    scene.fog = new THREE.FogExp2(0xbfeff5, 0.0015);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.setAnimationLoop(animate);
    canvas.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(400, 200, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    // materials?
    const shelfMat  = new THREE.MeshPhongMaterial({ color: 0x8B4513, flatShading: true });
    const phoneMat  = new THREE.MeshPhongMaterial({ color: 0x1a1a2e, flatShading: true });
    const teddyMat  = new THREE.MeshPhongMaterial({ color: 0xc49a6c, flatShading: true });
    const radioMat  = new THREE.MeshPhongMaterial({ color: 0x3d5a80, flatShading: true });
    const bottleMat = new THREE.MeshPhongMaterial({ color: 0x90e0ef, transparent: true, opacity: 0.85, flatShading: true });

   
    for (let i = 0; i < 1; i++) {
        const rx = () => Math.random() * 240 - 120;
        const rz = () => Math.random() * 240 - 120;
        const ry = () => Math.random() * Math.PI * 2;

        const shelf = createBookshelf(shelfMat);
        shelf.position.set(rx(), -35, rz());
        shelf.rotation.y = ry();
        scene.add(shelf);

        const phones = createHeadphones(phoneMat);
        phones.position.set(rx(), -55, rz());
        phones.rotation.y = ry();
        scene.add(phones);

        const bear = createTeddyBear(teddyMat);
        bear.position.set(rx(), -48, rz());
        bear.rotation.y = ry();
        scene.add(bear);

        const radio = createRadio(radioMat);
        radio.position.set(rx(), -52, rz());
        radio.rotation.y = ry();
        scene.add(radio);

        const bottle = createWaterBottle(bottleMat);
        bottle.position.set(rx(), -47, rz());
        bottle.rotation.y = ry();
        scene.add(bottle);
    }

    // ground
    const earth = new THREE.PlaneGeometry(2000, 2000);
    const ground = new THREE.MeshPhongMaterial({ color: 0x402314, flatShading: true });
    const groundMesh = new THREE.Mesh(earth, ground);
    groundMesh.translateY(-60);
    groundMesh.rotateX(-1.5708);
    scene.add(groundMesh);

    // lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 2);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);
    const ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);
}

// bookshelf
function createBookshelf(mat) {
    const g = new THREE.Group();
    const add = (geo, x = 0, y = 0, z = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        g.add(m);
    };
    // sides
    add(new THREE.BoxGeometry(3, 50, 12), -14);
    add(new THREE.BoxGeometry(3, 50, 12),  14);
    // Top and bottom boards
    add(new THREE.BoxGeometry(31, 3, 12), 0,  24);
    add(new THREE.BoxGeometry(31, 3, 12), 0, -24);
    // shelves
    [-11, 1, 13].forEach(y => add(new THREE.BoxGeometry(25, 3, 10), 0, y));
    // cubes 
    [-11, 1, 13].forEach(sy => {
        [-8, 0, 8].forEach(sx => add(new THREE.BoxGeometry(4, 6, 4), sx, sy + 4.5));
    });
    return g;
}

// headphones
function createHeadphones(mat) {
    const g = new THREE.Group();
    // top
    const band = new THREE.Mesh(new THREE.TorusGeometry(10, 1.5, 8, 20, Math.PI), mat);
    band.position.y = 0;
    g.add(band);
    // ear parts
    const earGeo = new THREE.CylinderGeometry(5, 5, 3, 14);
    [-1, 1].forEach(side => {
        const ear = new THREE.Mesh(earGeo, mat);
        ear.position.set(side * 10, -4, 0);
        ear.rotation.z = Math.PI / 2;
        g.add(ear);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 5, 8), mat);
        stem.position.set(side * 10, -1.5, 0);
        g.add(stem);
    });
    return g;
}

// teddy
function createTeddyBear(mat) {
    const g = new THREE.Group();
    const sphere = (r, x, y, z) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
        m.position.set(x, y, z);
        g.add(m);
    };
    sphere(10,  0,  0,  0);  // body
    sphere( 7,  0, 14,  0);  // head
    sphere( 3, -5, 20,  0);  // left ear
    sphere( 3,  5, 20,  0);  // right ear
    sphere( 2,  0, 13,  6);  // snout
    sphere( 4, -9,  3,  4);  // left arm
    sphere( 4,  9,  3,  4);  // right arm
    sphere( 3, -5, -9,  4);  // left foot
    sphere( 3,  5, -9,  4);  // right foot
    return g;
}

// radio
function createRadio(mat) {
    const g = new THREE.Group();
    const add = (geo, x = 0, y = 0, z = 0, rx = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.x = rx;
        g.add(m);
    };
    // rectangle
    add(new THREE.BoxGeometry(30, 15, 12));
    // circle
    add(new THREE.CylinderGeometry(5, 5, 1, 16), -7, 2, 6.5, Math.PI / 2);
    // Buttons
    [-4, 0, 4].forEach(x => add(new THREE.BoxGeometry(2.5, 2.5, 1), x + 9, -3, 6.5));
    // antenna
    add(new THREE.CylinderGeometry(0.6, 0.6, 22, 8), 12, 18.5, 0);
    return g;
}

// bottle
function createWaterBottle(mat) {
    const g = new THREE.Group();
    const cyl = (rt, rb, h, y) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 16), mat);
        m.position.y = y;
        g.add(m);
    };
    cyl(5,   5,   25,  0);    // body
    cyl(2.5, 5,    5, 15);    // curve
    cyl(2.5, 2.5,  5, 19.5); // neck
    cyl(3,   3,    4, 24);    // cap
    return g;
}

function animate() {
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}