//variable for initial sun position
let sunHeight = (200, 150);



function setup() {
  createCanvas(600, 400, WEBGL);
}
function draw() {
  
  background(0);
   orbitControl();

  // Style the box.
  normalMaterial();
  //sun
  fill(128, 74, 0);
  circle(300, sunHeight, 180);
  fill(184, 115, 51);
  circle(300, sunHeight, 140);
 
  //mountains
  fill(76, 70, 70);
  triangle(200, 400, 520, 253, 800, 400);
  fill(92, 51, 23);
  triangle(200,400,520,253,350,400); 
 
  fill(67, 48, 46);
  triangle(-100, 400, 150, 200, 400, 400);
  fill(59, 49, 49);
  triangle(-100, 400, 150, 200, 0, 400);
 
  fill( 72, 60, 50);
  triangle(200, 400, 450, 250, 800, 400);
  fill(98, 93, 93);
  triangle(200, 400, 450, 250, 300, 400);
 
//planets
   
    
    fill(18, 52, 86);
  circle(30, sunHeight, 40);

     fill(127, 70, 44);
  circle(100, sunHeight, 70);
    
  fill(47, 83, 155);
  circle(185, sunHeight, 80);
    
fill(171, 120, 78);
  circle(268, sunHeight, 70);
    
fill(159, 140, 118);
  circle(390, sunHeight, 150);
    
fill(165, 93, 53);
  circle(530, sunHeight, 110);
}