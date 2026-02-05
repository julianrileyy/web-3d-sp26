function setup() {
    createCanvas(400,400, WEBGL);
}

function draw() {
    background(200);
    orbitControl();
    ambientLight(128, 128, 128);
    directionalLight(128, 128, 128, 0, 0, -1);
    
//Bottom Layer
push();
translate(0,50,0); //positioning
fill(245,222,179);
noStroke();
cylinder(100,60); //radius,height
pop();
    
//Top Layer
push();
translate(0,0,0);
fill(255, 221, 202);
noStroke();
cylinder(70,60);
pop();
    
//Candle1
push();
translate(40, -40, 0); // Position on cake
fill(227, 228, 250);      
cylinder(3, 30);      
pop();
//Flame1
push();
translate(40, -60, 0); 
fill(238, 154, 77);    
sphere(4);            
pop();
    
//Candle2
push();
translate(-40, -40, 0); // Position on cake
fill(227, 228, 250);      
cylinder(3, 30);      
pop();
//Flame2
push();
translate(-40, -60, 0); 
fill(238, 154, 77);    
sphere(4);            
pop();
    
//Candle3
push();
translate(0, -40, 40); // Position on cake
fill(227, 228, 250);      
cylinder(3, 30);      
pop();
//Flame3
push();
translate(0, -60, 40); 
fill(238, 154, 77);    
sphere(4);            
pop();
    
//Candle4
push();
translate(0, -40, -40); // Position on cake
fill(227, 228, 250);      
cylinder(3, 30);      
pop();
//Flame4
push();
translate(0, -60, -40); 
fill(238, 154, 77);    
sphere(4);            
pop();
    
//Candle5
push();
translate(0, -40, 0); // Position on cake
fill(227, 228, 250);      
cylinder(3, 30);      
pop();
//Flame5
push();
translate(0, -60, 0); 
fill(238, 154, 77);    
sphere(4);            
pop();
    
//Sprinkles
push();
translate(0, 40, 100); 
fill(238, 154, 77);    
sphere(4);            
pop();
    
push();
translate(30, 60, 95); 
fill(238, 154, 77);    
sphere(4);            
pop();

push();
translate(45, 30, 90); 
fill(238, 154, 77);    
sphere(4);            
pop();
}
