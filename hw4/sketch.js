let lightColor;
let rotateFlower = true;
let rotationSpeed = 0.01;
let showGround = true;
let haloPulse = 0;

function setup() {
  createCanvas(750, 600, WEBGL);

  lightColor = color(180, 220, 255);

  // External Button
  let toggleButton = createButton("Summon / Dismiss Celestial Plane");
  toggleButton.position(10, 10);
  toggleButton.mousePressed(toggleGround);
}

function draw() {
  background(10, 5, 30); 
  noStroke();
  orbitControl();

  haloPulse = sin(frameCount * 0.05) * 60 + 200;

 
  ambientLight(80);
  pointLight(red(lightColor), green(lightColor), blue(lightColor), 0, -250, 200);

  
  if (showGround) {
    push();
    rotateX(HALF_PI);
    fill(80, 0, 120, 120);
    plane(900, 900);
    pop();
  }

  // Sphere
  push();
  translate(300, -250, -200);
  noStroke();
  fill(haloPulse, haloPulse, 255);
  sphere(60);
  pop();

  // Stem
  push();
  translate(0, 120, 0);
  fill(180, 255, 220);
  cylinder(20, 180);
  pop();

  //Flower
  push();
  translate(0, -20, 0);

  if (rotateFlower) {
    rotateY(frameCount * rotationSpeed);
  }

  fill(255, 200, 255);
  cone(90, 140);
  pop();

  // (Box)
  push();
  translate(-250, 100, 100);
  rotateY(frameCount * 0.01);
  fill(200, 230, 255);
  box(90, 60, 90);
  pop();
}

// Keyboard Controls
function keyPressed() {

  if (key === '1') {
    // Goldenlight
    lightColor = color(255, 240, 180);
  }

  if (key === '2') {
    //blue
    lightColor = color(180, 220, 255);
  }

  if (key === 's') {
    // Freeze
    rotateFlower = false;
  }

  if (key === 'r') {
    // increase rotation
    rotateFlower = true;
    rotationSpeed += 0.01;
  }
}

// -------- Button --------
function toggleGround() {
  showGround = !showGround;
}

