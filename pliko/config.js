

const SETTINGS = {
  FALL_SECONDS: 8,         // every puck takes this long to fall (make your wav files about this long)
  MILESTONE_EVERY: 15,     // character pop-up after every N pucks dropped (all players together)
  POPUP_SECONDS: 4,        // how long the pop-up stays on screen
  STAGGER_MS: 700,         // gap between pucks when the wheel gives someone several
  ID_PREFIX: "bfplinko-",  // leave alone (used to build the game code)
  PEER_OPTIONS: {}         // advanced: leave empty to use the free public PeerJS server
};

/* -------------------------------------------------------------------
   13 CHARACTERS
   name  -> replace "name" with the character's name
   image -> a square picture in the /images folder. Used on the selection
            screen, on the puck, and in the pop-up. (If the file is missing
            a pastel placeholder is shown instead, so nothing breaks.)
   sound -> replace "insert wav" with e.g. "sounds/name1.wav". Played with
            this character's pop-up every 15 pucks.
------------------------------------------------------------------- */
const CHARACTERS = [
  { name: "MX", image: "images/character1.png",  sound: "insert wav" },  // character 1
  { name: "JESSIE", image: "images/character2.png",  sound: "insert wav" },  // character 2
  { name: "ISAIAH", image: "images/character3.png",  sound: "insert wav" },  // character 3
  { name: "LANDON", image: "images/character4.png",  sound: "insert wav" },  // character 4
  { name: "JASMINE", image: "images/character5.png",  sound: "insert wav" },  // character 5
  { name: "CARL", image: "images/character6.png",  sound: "insert wav" },  // character 6
  { name: "CADEN", image: "images/character7.png",  sound: "insert wav" },  // character 7
  { name: "JJ", image: "images/character8.png",  sound: "insert wav" },  // character 8
  { name: "PHLIP", image: "images/character9.png",  sound: "insert wav" },  // character 9
  { name: "BEN", image: "images/character10.png", sound: "insert wav" },  // character 10
  { name: "GAVIN", image: "images/character11.png", sound: "insert wav" },  // character 11
  { name: "JONAH", image: "images/character12.png", sound: "insert wav" },  // character 12
  { name: "LES", image: "images/character13.png", sound: "insert wav" }   // character 13
];


const COIN_SOUNDS = [
  "sounds/proj2sound1.wav",  // pucks sounds
  "sounds/proj2sound2.wav",  
  "sounds/proj2sound3.wav",  
  "sounds/proj2sound4.wav",  
  "sounds/proj2sound5.wav",  
  "sounds/proj2sound6.wav",  
  "sounds/proj2sound7.wav",  
  "sounds/proj2sound8.wav", 
  "sounds/proj2sound9.wav",   
  "sounds/proj2sound10.wav",   
  "sounds/proj2sound11.wav",   
  "sounds/proj2sound12.wav",   
  "sounds/proj2sound13.wav",   
  "sounds/proj2sound14.wav",   
  "sounds/proj2sound15.wav",   
  "sounds/proj2sound16.wav",  
  "sounds/proj2sound17.wav",  
  "sounds/proj2sound18.wav",  
  "sounds/proj2sound19.wav",   
  "sounds/proj2sound20.wav",   
  "sounds/proj2sound21.wav",   
  "sounds/proj2sound22.wav",  
  "sounds/proj2sound23.wav",   
  "sounds/proj2sound24.wav",   
  "sounds/proj2sound25.wav",   
  "sounds/proj2sound26.wav",   
  "sounds/proj2sound27.wav",   
  "sounds/proj2sound28.wav",   
  "sounds/proj2sound29.wav",   
  "sounds/proj2sound30.wav"   
];
