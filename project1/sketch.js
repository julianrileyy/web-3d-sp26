

let sliders = {};
let moodHistory = [];
let screen = "garden";
let analyticsMode = "constellation";
let points = 0;

let stars = [];
let time = 0;

// Tending Boosts
let waterBoost = 0;
let pruneBoost = 0;
let sunBoost = 0;
let bloomBoost = 0;

function setup() {
  createCanvas(1000, 650);
  
  angleMode(DEGREES);
  loadData();
  createMoodSliders();
  createStars();
}

function draw() {
  time += 0.5;
  drawGradientSky();
  drawStars();

  if (screen === "garden") {
    drawGarden();
    drawUI();
  } else {
    if (analyticsMode === "constellation") {
      drawConstellation();
    } else {
      drawCalendar();
    }
  }
}

// 
// BACKGROUND
// 

function drawGradientSky() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(15, 10, 40), color(45, 10, 70), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function createStars() {
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      twinkle: random(100)
    });
  }
}

function drawStars() {
  noStroke();
  for (let s of stars) {
    let glow = 150 + sin(time + s.twinkle) * 100;
    fill(200, 220, 255, glow);
    circle(s.x, s.y, s.size);
  }
}

// 
// MOODS
//

function createMoodSliders() {
  sliders.happiness = createSlider(0, 100, 50);
  sliders.energy = createSlider(0, 100, 50);
  sliders.anxiety = createSlider(0, 100, 50);
  sliders.calm = createSlider(0, 100, 50);

  let i = 0;
  for (let key in sliders) {
    sliders[key].position(40, 225 + i * 50);
    sliders[key].style("width", "220px");
    sliders[key].style("opacity", "0.8");
    i++;
  }
}

function drawMoodLabels() {
  textSize(16);
  textFont()
  fill(200, 220, 255);
  text("Happiness", 140, 90);
  text("Energy", 140, 140);
  text("Anxiety", 140, 190);
  text("Calm", 140, 240);
}

function getMoodScore() {
  let positive = sliders.happiness.value() +
                 sliders.energy.value() +
                 sliders.calm.value();
  let negative = sliders.anxiety.value();
  return (positive - negative) / 3;
}

// 
// GARDEN
//

function drawGarden() {
  drawMoodLabels();

  let mood = getMoodScore();
  let vitality = mood + points +
                 waterBoost +
                 pruneBoost +
                 sunBoost +
                 bloomBoost;

  drawWater();
  drawLilyPad();
  drawSucculent(vitality);
  drawTendingEffects();

  // Boost
  waterBoost *= 0.98;
  pruneBoost *= 0.98;
  sunBoost *= 0.98;
  bloomBoost *= 0.97;
}

function drawWater() {
  fill(20, 40 + sin(time) * 10, 80, 150);
  ellipse(width/2, height-80, 500, 180);
}

function drawLilyPad() {
  fill(50, 150, 110, 220);
  ellipse(width/2, height-100, 320, 130);
}

function drawSucculent(vitality) {
  push();
  translate(width/2, height-140);

  let droop = map(vitality + pruneBoost, -100, 300, 45, 0, true);
  rotate(droop);

  let size = map(vitality, -100, 300, 60, 180, true);

  // glow
  fill(160, 200, 255, 80);
  ellipse(0, 0, size + sin(time*2)*15 + 60);

  for (let layer = 3; layer > 0; layer--) {
    let layerSize = size * (layer/3);
    for (let i = 0; i < 8; i++) {
      push();
      rotate(i * (360/8));
      fill(100 + vitality/5, 200, 180 + vitality/10, 220);
      ellipse(0, -layerSize/2, layerSize/3, layerSize);
      pop();
    }
  }
  pop();
}

// 
// TENDING
// 

function drawTendingEffects() {

  if (waterBoost > 1) {
    for (let i = 0; i < 5; i++) {
      fill(150, 200, 255, 150);
      circle(width/2 + random(-50,50),
             height-200 + random(-50,50), 6);
    }
  }

  if (sunBoost > 1) {
    noFill();
    stroke(255, 220, 120, 150);
    strokeWeight(3);
    ellipse(width/2, height-200,
            200 + sin(time*3)*20);
  }

  if (bloomBoost > 1) {
    noFill();
    stroke(255, 150, 255, 150);
    ellipse(width/2, height-200,
            250 + sin(time*4)*30);
  }

  noStroke();
}

//
// UI
// 

function drawUI() {
  fill(255);
  textSize(18);
  text("Points: " + points, 820, 60);

  drawSoftButton("Save Mood", 850, 120);
  drawSoftButton("Analytics", 850, 170);

  drawSoftButton("Journal (+5)", 850, 260);
  drawSoftButton("Hydrate (+5)", 850, 310);

  drawSoftButton("Water (+1)", 850, 380);
  drawSoftButton("Prune (+1)", 850, 430);
  drawSoftButton("Sunlight (+1)", 850, 480);
  drawSoftButton("Fertilize (+1)", 850, 530);
}

function drawSoftButton(label, x, y) {
  fill(90, 120, 200, 130);
  ellipse(x, y, 170, 45);
  fill(255);
  textSize(13);
  textAlign(CENTER, CENTER);
  text(label, x, y);
}

function mousePressed() {

  if (dist(mouseX, mouseY, 850, 120) < 85) saveMood();
  if (dist(mouseX, mouseY, 850, 170) < 85) screen = "analytics";

  if (dist(mouseX, mouseY, 850, 260) < 85) points += 5;
  if (dist(mouseX, mouseY, 850, 310) < 85) points += 5;

  if (dist(mouseX, mouseY, 850, 380) < 85) { points += 1; waterBoost += 10; }
  if (dist(mouseX, mouseY, 850, 430) < 85) { points += 1; pruneBoost += 10; }
  if (dist(mouseX, mouseY, 850, 480) < 85) { points += 1; sunBoost += 12; }
  if (dist(mouseX, mouseY, 850, 530) < 85) { points += 1; bloomBoost += 15; }

  if (screen === "analytics") {
    analyticsMode =
      analyticsMode === "constellation"
      ? "calendar"
      : "constellation";
  }
}

// 
// DATA
// 

function saveMood() {
  let entry = {
    total: getMoodScore(),
    date: new Date().toLocaleDateString()
  };
  moodHistory.push(entry);
  localStorage.setItem("etherealMoodGarden", JSON.stringify(moodHistory));
}

function loadData() {
  let data = localStorage.getItem("etherealMoodGarden");
  if (data) moodHistory = JSON.parse(data);
}

