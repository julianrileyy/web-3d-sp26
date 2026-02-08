let img;
function preload() {
 img = loadImage('caketexture.jpg');
img2 = loadImage('insidetexture.png');
}
function setup() {
    createCanvas(400,400, WEBGL);
}

function draw() {
    background(200);
    orbitControl();
    ambientLight(128, 128, 128);
    directionalLight(128, 128, 128, 0, 0, -1);
    noStroke();
//Bottom Layer
push();
translate(0,50,0); //positioning
noStroke();
 texture(img);
cylinder(100,60); //radius,height
pop();
    
//Top Layer
push();
translate(0,0,0);
noStroke();
texture(img2);
cylinder(70,60);
pop();
    
//Candle1
push();
translate(40, -40, 0); // Position on cake
fill(131, 92, 59);      
cylinder(3, 30);      
pop();
//Flame1
push();
translate(40, -60, 0); 
fill(255, 232, 124);    
sphere(4);            
pop();
    
//Candle2
push();
translate(-40, -40, 0); // Position on cake
fill(131, 92, 59);      
cylinder(3, 30);      
pop();
//Flame2
push();
translate(-40, -60, 0); 
fill(255, 232, 124);    
sphere(4);            
pop();
    
//Candle3
push();
translate(0, -40, 40); // Position on cake
fill(131, 92, 59);      
cylinder(3, 30);      
pop();
//Flame3
push();
translate(0, -60, 40); 
fill(255, 232, 124);    
sphere(4);            
pop();
    
//Candle4
push();
translate(0, -40, -40); // Position on cake
fill(131, 92, 59);      
cylinder(3, 30);      
pop();
//Flame4
push();
translate(0, -60, -40); 
fill(255, 232, 124);    
sphere(4);            
pop();
    
//Candle5
push();
translate(0, -40, 0); // Position on cake
fill(131, 92, 59);      
cylinder(3, 30);      
pop();
//Flame5
push();
translate(0, -60, 0); 
fill(255, 232, 124);    
sphere(4);            
pop();
}