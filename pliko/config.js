

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

/* -------------------------------------------------------------------
   30 COIN SOUNDS
   Every puck plays one of these while it falls. They are shuffled, and
   once all 30 have played the shuffle starts again, so sounds repeat
   in a random order. Replace "insert wav" with e.g. "sounds/coin1.wav".
   (Sounds you leave as "insert wav" are simply skipped.)
------------------------------------------------------------------- */
const COIN_SOUNDS = [
  "insert wav",  // coin sound 1
  "insert wav",  // coin sound 2
  "insert wav",  // coin sound 3
  "insert wav",  // coin sound 4
  "insert wav",  // coin sound 5
  "insert wav",  // coin sound 6
  "insert wav",  // coin sound 7
  "insert wav",  // coin sound 8
  "insert wav",  // coin sound 9
  "insert wav",  // coin sound 10
  "insert wav",  // coin sound 11
  "insert wav",  // coin sound 12
  "insert wav",  // coin sound 13
  "insert wav",  // coin sound 14
  "insert wav",  // coin sound 15
  "insert wav",  // coin sound 16
  "insert wav",  // coin sound 17
  "insert wav",  // coin sound 18
  "insert wav",  // coin sound 19
  "insert wav",  // coin sound 20
  "insert wav",  // coin sound 21
  "insert wav",  // coin sound 22
  "insert wav",  // coin sound 23
  "insert wav",  // coin sound 24
  "insert wav",  // coin sound 25
  "insert wav",  // coin sound 26
  "insert wav",  // coin sound 27
  "insert wav",  // coin sound 28
  "insert wav",  // coin sound 29
  "insert wav"   // coin sound 30
];
