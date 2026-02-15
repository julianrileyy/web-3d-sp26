let myShape;


function setup() {
    let camvas = createCanvas(400, 400, WEBGL);
    angleMode(DEGREES);
    //ballBlob();
}

function draw() {
    background(0);
    orbitControl();
    noStroke();
    lights();
    ambientLight(255,255,0);
    fill(0,255,255);
    shininess(1);
    specularMaterial(255);
    //emissiveMaterial(255,0,255);
    ellipsoid(100,50,25);
    filter(POSTERIZE,3);
    //model(myShape);
}