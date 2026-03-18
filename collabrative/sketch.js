let elements = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  elements = [
    { type: 'glacier', variant: 1, x: width * 0.18, y: height * 0.32, bobOffset: 0,   bobSpeed: 0.008 },
    { type: 'glacier', variant: 2, x: width * 0.50, y: height * 0.28, bobOffset: 1.2, bobSpeed: 0.006 },
    { type: 'glacier', variant: 3, x: width * 0.82, y: height * 0.34, bobOffset: 2.4, bobSpeed: 0.009 },
    { type: 'tree',    variant: 1, x: width * 0.18, y: height * 0.72, bobOffset: 0.5, bobSpeed: 0.007 },
    { type: 'tree',    variant: 2, x: width * 0.50, y: height * 0.72, bobOffset: 1.8, bobSpeed: 0.010 },
    { type: 'tree',    variant: 3, x: width * 0.82, y: height * 0.72, bobOffset: 3.0, bobSpeed: 0.008 },
  ];
}

function draw() {
  background(10, 10, 18);

  let t = millis() / 1000;

  for (let el of elements) {
    let bob = sin(t * el.bobSpeed * 60 + el.bobOffset) * 6;
    push();
    translate(el.x, el.y + bob);
    if (el.type === 'glacier') drawGlacier(el.variant);
    else drawTree(el.variant);
    pop();
  }
}

//  glaciers

function drawGlacier(v) {
  if (v === 1) glacier1();
  if (v === 2) glacier2();
  if (v === 3) glacier3();
}

// left, tall glacier
function glacier1() {
  push();

  let pts = [
    [0, -130], [28, -95], [55, -60], [45, -20], [60, 0],
    [-60, 0], [-45, -20], [-55, -60], [-28, -95],
  ];
  drawIcePoly(pts, [200, 230, 255], [140, 190, 230]);

  let facet1 = [[-55, -60], [-28, -95], [0, -130], [-45, -20]];
  drawIceFacet(facet1, [180, 215, 255, 100]);

  let sub = [[-60, 0], [60, 0], [52, 38], [-52, 38]];
  drawIceFacet(sub, [60, 120, 160, 160]);

  stroke(255, 255, 255, 60);
  strokeWeight(1);
  line(-10, -90, 5, -40);
  line(20, -60, 30, -10);
  noStroke();

  pop();
}

// middle, wide glacier
function glacier2() {
  push();

  let pts = [
    [-90, -40], [-60, -70], [-20, -80], [10, -85], [50, -75],
    [80, -55], [90, -30], [88, 0], [-88, 0],
  ];
  drawIcePoly(pts, [210, 235, 255], [150, 200, 240]);

  let facet = [[10, -85], [50, -75], [80, -55], [30, -50]];
  drawIceFacet(facet, [240, 250, 255, 120]);

  let shadow = [[-90, -40], [-60, -70], [-30, -45], [-85, -10]];
  drawIceFacet(shadow, [100, 150, 200, 80]);

  let sub = [[-88, 0], [88, 0], [70, 50], [-70, 50]];
  drawIceFacet(sub, [40, 100, 140, 170]);

  stroke(255, 255, 255, 50);
  strokeWeight(1);
  line(-40, -65, -20, -20);
  line(30, -70, 40, -30);
  noStroke();

  pop();
}

// right, medium?? glacier lol
function glacier3() {
  push();

  let pts = [
    [-10, -120], [20, -100], [50, -80], [65, -40], [55, 0],
    [-55, 0], [-65, -30], [-50, -70], [-30, -100],
  ];
  drawIcePoly(pts, [195, 225, 255], [130, 185, 225]);

  let peak = [[-30, -100], [-10, -120], [10, -95], [-15, -75]];
  drawIceFacet(peak, [230, 245, 255, 130]);

  let rightFace = [[20, -100], [50, -80], [65, -40], [30, -50]];
  drawIceFacet(rightFace, [170, 210, 255, 90]);

  let sub = [[-55, 0], [55, 0], [42, 45], [-45, 45]];
  drawIceFacet(sub, [50, 110, 150, 160]);

  stroke(255, 255, 255, 55);
  strokeWeight(1);
  line(5, -110, 15, -60);
  line(-35, -70, -20, -20);
  noStroke();

  pop();
}

function drawIcePoly(pts, col1, col2) {
  noStroke();
  fill(col1[0], col1[1], col1[2], 210);
  beginShape();
  for (let pt of pts) vertex(pt[0], pt[1]);
  endShape(CLOSE);

  stroke(255, 255, 255, 40);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let pt of pts) vertex(pt[0] * 0.9, pt[1] * 0.9);
  endShape(CLOSE);
  noStroke();
}

function drawIceFacet(pts, rgba) {
  noStroke();
  fill(rgba[0], rgba[1], rgba[2], rgba[3] ?? 120);
  beginShape();
  for (let pt of pts) vertex(pt[0], pt[1]);
  endShape(CLOSE);
}


//  trees


function drawTree(v) {
  if (v === 1) tree1();
  if (v === 2) tree2();
  if (v === 3) tree3();
}

// left, symetric tree
function tree1() {
  push();
  strokeCap(ROUND);

  stroke(80, 60, 50);
  strokeWeight(10);
  line(0, 0, 0, -90);

  branch(0, -90, -40, -130, 6);
  branch(0, -90,  40, -130, 6);
  branch(0, -70, -50, -100, 5);
  branch(0, -70,  35,  -95, 4.5);

  branch(-40, -130, -65, -155, 3.5);
  branch(-40, -130, -20, -160, 3);
  branch(-65, -155, -80, -175, 2);
  branch(-20, -160, -10, -185, 2);

  branch(40, -130, 60, -155, 3.5);
  branch(40, -130, 22, -158, 3);
  branch(60, -155, 75, -178, 2);
  branch(22, -158, 15, -180, 2);

  branch(-80, -175, -88, -192, 1.2);
  branch(-80, -175, -70, -195, 1.2);
  branch(75, -178,  85, -196, 1.2);
  branch(75, -178,  65, -197, 1.2);

  pop();
}

// middle, wonky tree
function tree2() {
  push();
  strokeCap(ROUND);

  stroke(70, 55, 45);
  strokeWeight(10);
  line(0, 0, 20, -100);

  branch(20, -100, -30, -135, 6);
  branch(20, -100,  50, -128, 5);
  branch(10,  -70, -25,  -95, 4.5);

  branch(-30, -135, -75, -155, 4);
  branch(-30, -135, -15, -165, 3);
  branch(-75, -155, -100, -172, 2.5);
  branch(-75, -155,  -60, -180, 2);
  branch(-100, -172, -115, -188, 1.5);
  branch(-60,  -180,  -50, -198, 1.5);

  branch(50, -128,  70, -148, 3);
  branch(70, -148,  85, -162, 2);
  branch(85, -162,  95, -178, 1.5);

  branch(-115, -188, -120, -202, 1);
  branch(-50,  -198,  -42, -210, 1);

  pop();
}

// right, skinny tree
function tree3() {
  push();
  strokeCap(ROUND);

  stroke(65, 50, 42);
  strokeWeight(9);
  line(0, 0, 0, -110);

  branch(0, -110, -25, -140, 5.5);
  branch(0, -110,  25, -140, 5.5);
  branch(0,  -85, -18, -108, 4);
  branch(0,  -85,  18, -110, 4);

  branch(-25, -140, -45, -168, 3.5);
  branch(-25, -140,  -8, -170, 3);
  branch( 25, -140,  45, -168, 3.5);
  branch( 25, -140,  10, -170, 3);

  branch(-45, -168, -58, -195, 2);
  branch(-45, -168, -32, -196, 2);
  branch( 45, -168,  58, -195, 2);
  branch( 45, -168,  32, -196, 2);

  branch(-58, -195, -65, -213, 1.2);
  branch(-58, -195, -50, -214, 1.2);
  branch( 58, -195,  65, -213, 1.2);
  branch( 58, -195,  50, -214, 1.2);
  branch(-32, -196, -25, -215, 1);
  branch( 32, -196,  25, -215, 1);

  pop();
}

function branch(x1, y1, x2, y2, w) {
  strokeWeight(w);
  line(x1, y1, x2, y2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  elements[0].x = width * 0.18; elements[0].y = height * 0.32;
  elements[1].x = width * 0.50; elements[1].y = height * 0.28;
  elements[2].x = width * 0.82; elements[2].y = height * 0.34;
  elements[3].x = width * 0.18; elements[3].y = height * 0.72;
  elements[4].x = width * 0.50; elements[4].y = height * 0.72;
  elements[5].x = width * 0.82; elements[5].y = height * 0.72;
}