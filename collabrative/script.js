import * as THREE from "three";
import { OrbitControls } from "./src/OrbitControls.js";
import { PointerLockControls } from "./src/PointerLockControls.js";

let camera, canvas, controls, scene, renderer;

let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let snowParticles;

init();

function init() {
    canvas = document.getElementById("3-holder");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8aafc4);
    scene.fog = new THREE.FogExp2(0x8aafc4, 0.003);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setAnimationLoop(animate);
    canvas.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 10, 0);

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById("blocker");
    const instructions = document.getElementById("instructions");

    instructions.addEventListener("click", function () {
        controls.lock();
    });

    controls.addEventListener("lock", function () {
        instructions.style.display = "none";
        blocker.style.display = "none";
    });

    controls.addEventListener("unlock", function () {
        blocker.style.display = "block";
        instructions.style.display = "";
    });

    scene.add(controls.object);

    const onKeyDown = function (event) {
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                moveForward = true;
                break;
            case "ArrowLeft":
            case "KeyA":
                moveLeft = true;
                break;
            case "ArrowDown":
            case "KeyS":
                moveBackward = true;
                break;
            case "ArrowRight":
            case "KeyD":
                moveRight = true;
                break;
            case "Space":
                if (canJump === true) velocity.y += 350;
                canJump = false;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                moveForward = false;
                break;
            case "ArrowLeft":
            case "KeyA":
                moveLeft = false;
                break;
            case "ArrowDown":
            case "KeyS":
                moveBackward = false;
                break;
            case "ArrowRight":
            case "KeyD":
                moveRight = false;
                break;
        }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    // snow ground
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshPhongMaterial({
        color: 0xddeaf5,
        specular: 0x99bbcc,
        shininess: 15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // snow drifts scattered on ground
    for (let i = 0; i < 60; i++) {
        const drift = makeSnowDrift();
        drift.position.set(
            Math.random() * 1600 - 800,
            0,
            Math.random() * 1600 - 800
        );
        drift.rotation.y = Math.random() * Math.PI * 2;
        const s = 0.5 + Math.random() * 2.5;
        drift.scale.set(s * (0.6 + Math.random()), s * 0.4, s * (0.6 + Math.random()));
        scene.add(drift);
    }

    // glaciers
    for (let i = 0; i < 12; i++) {
        let glacier;
        let r = Math.floor(Math.random() * 3);

        if (r === 0) glacier = makeGlacier1();
        if (r === 1) glacier = makeGlacier2();
        if (r === 2) glacier = makeGlacier3();

        glacier.position.set(Math.random() * 1200 - 600, 0, Math.random() * 1200 - 600);
        glacier.rotation.y = Math.random() * Math.PI * 2;

        let s = 1 + Math.random() * 1.5;
        glacier.scale.set(s, s, s);

        scene.add(glacier);
    }

    // dead trees
    for (let i = 0; i < 35; i++) {
        let tree;
        let r = Math.floor(Math.random() * 3);

        if (r === 0) tree = makeTree1();
        if (r === 1) tree = makeTree2();
        if (r === 2) tree = makeTree3();

        tree.position.set(Math.random() * 1000 - 500, 0, Math.random() * 1000 - 500);
        tree.rotation.y = Math.random() * Math.PI * 2;

        let s = 0.8 + Math.random() * 1.2;
        tree.scale.set(s, s, s);

        scene.add(tree);
    }

    // falling snow
    snowParticles = makeSnowParticles(8000);
    scene.add(snowParticles);

    // lights
    const dirLight1 = new THREE.DirectionalLight(0xd8ecff, 2.0);
    dirLight1.position.set(1, 3, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8aafc4, 1.2);
    dirLight2.position.set(-1, 0.5, -1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x607888, 1.5);
    scene.add(ambientLight);

    window.addEventListener("resize", onWindowResize);
}

// snow

function makeSnowParticles(count) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = Math.random() * 1600 - 800;
        positions[i * 3 + 1] = Math.random() * 300;
        positions[i * 3 + 2] = Math.random() * 1600 - 800;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        color: 0xeef5ff,
        size: 1.4,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
    });

    return new THREE.Points(geo, mat);
}

function makeSnowDrift() {
    const group = new THREE.Group();
    const mat = new THREE.MeshPhongMaterial({
        color: 0xe8f2fa,
        specular: 0xaaccdd,
        shininess: 20,
    });

    // mound
    const mound = new THREE.Mesh(
        new THREE.SphereGeometry(10, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
        mat
    );
    mound.scale.set(1, 0.45, 1);
    group.add(mound);

    // smaller mound
    const side = new THREE.Mesh(
        new THREE.SphereGeometry(6, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2),
        mat
    );
    side.position.set(7, 0, 2);
    side.scale.set(1, 0.4, 0.9);
    group.add(side);

    return group;
}

// materials

function makeIceMat(color, opacity = 0.88) {
    return new THREE.MeshPhongMaterial({
        color,
        specular: 0xffffff,
        shininess: 140,
        transparent: true,
        opacity,
    });
}

function makeIceCliffMat(color) {
  
    return new THREE.MeshPhongMaterial({
        color,
        specular: 0x99ccee,
        shininess: 40,
    });
}

function makeSnowCapMat() {
    return new THREE.MeshPhongMaterial({
        color: 0xeef6ff,
        specular: 0xbbddee,
        shininess: 25,
    });
}

function makeBarkMat() {
    return new THREE.MeshPhongMaterial({
        color: 0x2e2318,
        specular: 0x110d09,
        shininess: 4,
    });
}

// glaciers


function makeGlacier1() {
    
    const g = new THREE.Group();

   
    const body = new THREE.Mesh(new THREE.BoxGeometry(140, 50, 100), makeIceCliffMat(0xb0ccdf));
    body.position.y = 25;
    g.add(body);

    
    const upper = new THREE.Mesh(new THREE.BoxGeometry(120, 28, 85), makeIceMat(0xc8dff0, 0.94));
    upper.position.set(-5, 64, 5);
    upper.rotation.y = 0.04;
    g.add(upper);

    // blue
    const face = new THREE.Mesh(new THREE.BoxGeometry(130, 55, 12), makeIceCliffMat(0x7aaabf));
    face.position.set(0, 25, -50);
    g.add(face);

    // cracking
    const crev1 = new THREE.Mesh(new THREE.BoxGeometry(40, 22, 30), makeIceMat(0x9bbdd0, 0.88));
    crev1.position.set(-30, 82, -10);
    crev1.rotation.z = 0.12;
    crev1.rotation.y = 0.15;
    g.add(crev1);

    const crev2 = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 25), makeIceMat(0x88afc5, 0.84));
    crev2.position.set(25, 80, 15);
    crev2.rotation.z = -0.10;
    crev2.rotation.y = -0.2;
    g.add(crev2);

    // snow accumulation
    const snow = new THREE.Mesh(new THREE.BoxGeometry(115, 8, 80), makeSnowCapMat());
    snow.position.set(-5, 79, 5);
    g.add(snow);

    // broken ice chunk
    const chunk = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 18), makeIceMat(0x8ab8d0, 0.90));
    chunk.position.set(35, 7, -55);
    chunk.rotation.set(0.3, 0.5, -0.2);
    g.add(chunk);

    return g;
}

function makeGlacier2() {
   
    const g = new THREE.Group();

   
    const back = new THREE.Mesh(new THREE.BoxGeometry(100, 70, 80), makeIceCliffMat(0xa8c4d8));
    back.position.set(20, 35, 20);
    g.add(back);

    
    const mid = new THREE.Mesh(new THREE.BoxGeometry(130, 45, 70), makeIceMat(0xbcd6ea, 0.93));
    mid.position.set(0, 22, -5);
    g.add(mid);

    // cliff face
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(110, 50, 14), makeIceCliffMat(0x6b9cb8));
    cliff.position.set(0, 25, -42);
    g.add(cliff);

    // layer lines
    const strata1 = new THREE.Mesh(new THREE.BoxGeometry(98, 4, 78), makeIceMat(0x7aaec8, 0.70));
    strata1.position.set(20, 18, 20);
    g.add(strata1);

    const strata2 = new THREE.Mesh(new THREE.BoxGeometry(98, 4, 78), makeIceMat(0x7aaec8, 0.65));
    strata2.position.set(20, 36, 20);
    g.add(strata2);

    // block splitting off top
    const crev = new THREE.Mesh(new THREE.BoxGeometry(50, 30, 35), makeIceMat(0x9dc0d6, 0.86));
    crev.position.set(15, 82, 10);
    crev.rotation.z = 0.18;
    crev.rotation.y = -0.12;
    g.add(crev);

    // snow on top
    const snow1 = new THREE.Mesh(new THREE.BoxGeometry(95, 10, 75), makeSnowCapMat());
    snow1.position.set(20, 73, 20);
    g.add(snow1);

    const snow2 = new THREE.Mesh(new THREE.BoxGeometry(44, 6, 30), makeSnowCapMat());
    snow2.position.set(15, 99, 10);
    snow2.rotation.z = 0.18;
    g.add(snow2);

    // chunks at base
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 14), makeIceMat(0x88b0c8, 0.88));
    c1.position.set(-30, 6, -50);
    c1.rotation.set(0.2, 0.8, 0.15);
    g.add(c1);

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 10), makeIceMat(0x7aaabf, 0.84));
    c2.position.set(20, 4, -52);
    c2.rotation.set(-0.1, 0.3, 0.25);
    g.add(c2);

    return g;
}

function makeGlacier3() {
    
    const g = new THREE.Group();

    
    const body = new THREE.Mesh(new THREE.BoxGeometry(160, 38, 110), makeIceCliffMat(0xb4cfe0));
    body.position.y = 19;
    g.add(body);

    // lighter surface
    const top = new THREE.Mesh(new THREE.BoxGeometry(150, 20, 100), makeIceMat(0xcde0f0, 0.92));
    top.position.y = 48;
    g.add(top);

    // blue
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(150, 42, 10), makeIceCliffMat(0x5a8faa));
    cliff.position.set(0, 19, -55);
    g.add(cliff);

    // lines on cliff 
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(148, 3, 8), makeIceMat(0x6699bb, 0.65));
    s1.position.set(0, 14, -55);
    g.add(s1);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(148, 3, 8), makeIceMat(0x6699bb, 0.60));
    s2.position.set(0, 28, -55);
    g.add(s2);

    // multiple slabs at different tilts
    const crevasseData = [
        [-45, 0.14,  0.00],
        [-10, -0.08,  0.12],
        [ 30,  0.16, -0.08],
        [ 55, -0.12,  0.05],
    ];
    crevasseData.forEach(([x, rz, ry]) => {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(28, 16, 22), makeIceMat(0x8ab0c8, 0.82));
        slab.position.set(x, 66, (Math.random() - 0.5) * 30);
        slab.rotation.z = rz;
        slab.rotation.y = ry;
        g.add(slab);
    });

    // snow on top
    const snow = new THREE.Mesh(new THREE.BoxGeometry(145, 9, 96), makeSnowCapMat());
    snow.position.y = 60;
    g.add(snow);

    // scattered chunks 
    for (let i = 0; i < 5; i++) {
        const chunk = new THREE.Mesh(
            new THREE.BoxGeometry(
                8 + Math.random() * 16,
                6 + Math.random() * 10,
                7 + Math.random() * 12
            ),
            makeIceMat(0x80aac0, 0.86)
        );
        chunk.position.set(
            Math.random() * 120 - 60,
            3 + Math.random() * 4,
            -58 - Math.random() * 20
        );
        chunk.rotation.set(
            (Math.random() - 0.5) * 0.5,
            Math.random() * Math.PI,
            (Math.random() - 0.5) * 0.4
        );
        g.add(chunk);
    }

    return g;
}

// trees


function makeBranch(length, baseWidth, x, y, z, rotZ, rotX, rotY = 0) {
    const tipWidth = baseWidth * 0.25;
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(tipWidth, baseWidth, length, 6),
        makeBarkMat()
    );
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, rotY, rotZ);
    return mesh;
}

function makeSnowClump(scale = 1) {
    const mat = new THREE.MeshPhongMaterial({ color: 0xe8f3fa, shininess: 10 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(2.5 * scale, 5, 4), mat);
    mesh.scale.y = 0.4;
    return mesh;
}

function makeTree1() {
    
    const g = new THREE.Group();

    const trunk = makeBranch(72, 5.0, 0, 36, 0, 0.08, 0);
    g.add(trunk);

    // broken nub at top
    const nub = makeBranch(10, 2.0, 1, 74, 0, 0.4, 0.1);
    g.add(nub);

    // drooping twig
    const bL = makeBranch(30, 2.4, -14, 52, 4, 1.15, 0.08);
    g.add(bL);
    const snowL = makeSnowClump(1.3);
    snowL.position.set(-26, 48, 4);
    g.add(snowL);

    // right broken 
    const bR = makeBranch(14, 2.0, 13, 56, -3, -0.95, -0.06);
    g.add(bR);

    // left twig
    const bUL = makeBranch(20, 1.4, -8, 64, 3, 0.75, -0.1);
    g.add(bUL);
    const snowUL = makeSnowClump(0.9);
    snowUL.position.set(-16, 62, 3);
    g.add(snowUL);

    // right twig
    const bUR = makeBranch(14, 1.0, 9, 67, -2, -0.70, 0.08);
    g.add(bUR);

    // dangling branch
    const bDangle = makeBranch(18, 1.2, -6, 44, 6, 2.2, 0.15);
    g.add(bDangle);

    return g;
}

function makeTree2() {
    // asymmetric tree
    const g = new THREE.Group();

    const trunk = makeBranch(80, 4.8, 0, 38, 0, -0.30, 0.06);
    g.add(trunk);

    // long drooping branch
    const bBig = makeBranch(44, 2.8, -22, 50, 8, 1.25, -0.12);
    g.add(bBig);
    const snowBig = makeSnowClump(1.8);
    snowBig.position.set(-42, 45, 8);
    g.add(snowBig);

    // secondary 
    const bSub = makeBranch(18, 1.2, -38, 47, 10, 1.55, 0.2);
    g.add(bSub);

    // stub on opposite side
    const bStub = makeBranch(12, 1.8, 14, 58, -4, -0.60, 0.0);
    g.add(bStub);
    const snowStub = makeSnowClump(0.8);
    snowStub.position.set(18, 56, -4);
    g.add(snowStub);

    // broken top stub
    const bTop = makeBranch(8, 1.0, -5, 70, 2, -0.2, 0.1);
    g.add(bTop);

    // dangling twig 
    const bDown = makeBranch(16, 0.9, -10, 56, 5, 2.4, 0.1);
    g.add(bDown);

    return g;
}

function makeTree3() {
    
    const g = new THREE.Group();

    const trunk = makeBranch(90, 4.5, 0, 45, 0, 0.04, 0);
    g.add(trunk);

    // drooping branches
    const bL1 = makeBranch(34, 2.2, -12, 52, 6, 0.72, -0.08);
    g.add(bL1);
    const bR1 = makeBranch(28, 2.0,  12, 55, -5, -0.68, 0.08);
    g.add(bR1);
    const snowL1 = makeSnowClump(1.5);
    snowL1.position.set(-30, 46, 6);
    g.add(snowL1);
    const snowR1 = makeSnowClump(1.2);
    snowR1.position.set(24, 50, -5);
    g.add(snowR1);

    // broken
    const bL2 = makeBranch(20, 1.6, -9, 66, 4, 0.65, 0.10);
    g.add(bL2);
    const bR2 = makeBranch(10, 1.2, 10, 68, -3, -0.50, -0.10); // broken stub
    g.add(bR2);
    const snowL2 = makeSnowClump(0.9);
    snowL2.position.set(-18, 62, 4);
    g.add(snowL2);

    // top twigs
    const bL3 = makeBranch(12, 0.9, -6, 76, 2, 0.60, 0.08);
    g.add(bL3);
    const bR3 = makeBranch(10, 0.8,  6, 77, -2, -0.55, -0.06);
    g.add(bR3);

    // dangling dead branch
    const bDangle = makeBranch(22, 1.0, -8, 48, 8, 2.3, -0.1);
    g.add(bDangle);

    // dead twig 
    const bTwig = makeBranch(10, 0.6, -18, 63, 6, 1.4, 0.25);
    g.add(bTwig);

    return g;
}

// loop

function animate() {
    const time = performance.now();

    // drift snow particles downward and wrap
    if (snowParticles) {
        const pos = snowParticles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setY(i, pos.getY(i) - 0.12 - Math.random() * 0.06);
            pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.15);
            if (pos.getY(i) < 0) pos.setY(i, 300);
        }
        pos.needsUpdate = true;
    }

    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.object.position.y += velocity.y * delta;

        if (controls.object.position.y < 10) {
            velocity.y = 0;
            controls.object.position.y = 10;
            canJump = true;
        }
    }

    prevTime = time;
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}