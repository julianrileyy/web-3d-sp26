

/* ---------- board geometry (1 unit = one column width) ---------- */
const GEO = {
  cols: 6, rows: 10,
  rowH: 0.8, firstPegY: 1.5,
  pegR: 0.13, puckR: 0.33, hop: 0.4,
  startY: 0.45, frameTop: 0.05
};
GEO.lastPegY = GEO.firstPegY + (GEO.rows - 1) * GEO.rowH;
GEO.slotTop = GEO.lastPegY + 0.7;
GEO.slotBottom = GEO.slotTop + 0.95;
GEO.restY = GEO.slotBottom - GEO.puckR - 0.05;
GEO.frameBottom = GEO.slotBottom + 0.2;
GEO.totalH = GEO.frameBottom + 0.15;

const PASTELS = ['#ffc8dd', '#cdb4db', '#bde0fe', '#b9fbc0', '#fde4cf', '#fbf8cc', '#f1c0e8', '#a2d2ff', '#ffafcc', '#cfbaf0'];
const PEG_COLORS = ['#ff9ec9', '#c9a7ff', '#8ec9ff', '#7fdcae', '#ffc38a'];
const PUCK_PX = 128;

/* ---------- state ---------- */
const $ = id => document.getElementById(id);
let S = 60, OX = 0, OY = 0;          // pixels per unit, board offset
let bg = null;                        // pre-drawn background (board, pegs, flowers)
let started = false;
let hostChar = 0;                     // character used by SPACE-bar pucks
let totalDropped = 0;
const pucks = [], particles = [], butterflies = [], charGfx = [];
const players = {};                   // pid -> {pid, char, count, conn, online}
const connPid = {};                   // peer id -> pid
let peer = null, joinCode = '', retryTimer = null;

const px = x => OX + x * S;
const py = y => OY + y * S;
const pegY = r => GEO.firstPegY + r * GEO.rowH;

/* ==========================================================
   p5 hooks
   ========================================================== */
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'fixed');
  cnv.style('left', '0');
  cnv.style('top', '0');
  cnv.style('z-index', '0');
  layout();
  for (let i = 0; i < CHARACTERS.length; i++) makeCharGfx(i);
  buildBackground();
  wireUI();
  startPeer(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layout();
  buildBackground();
}

function draw() {
  imageMode(CORNER);
  image(bg, 0, 0, width, height);

  const now = millis();
  const fallMs = SETTINGS.FALL_SECONDS * 1000;
  for (let i = pucks.length - 1; i >= 0; i--) {
    const p = pucks[i];
    const t = (now - p.t0) / fallMs;
    if (t >= 1) {
      burst(p);
      pucks.splice(i, 1);
      continue;
    }
    const pos = puckPos(p.path, t);
    drawPuck(p, pos.x, pos.y);
  }
  drawParticles();
}

/* ==========================================================
   layout + static background
   ========================================================== */
function layout() {
  S = Math.min(windowHeight * 0.96 / GEO.totalH, windowWidth * 0.6 / GEO.cols);
  OX = (windowWidth - GEO.cols * S) / 2;
  OY = (windowHeight - GEO.totalH * S) / 2;
}

function rng(seed) {                  // small seeded random so the decoration is stable
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function drawFlower(g, x, y, r, n, col, center, rot) {
  g.push();
  g.translate(x, y);
  g.rotate(rot || 0);
  g.noStroke();
  g.fill(col);
  for (let i = 0; i < n; i++) {
    g.push();
    g.rotate(TWO_PI * i / n);
    g.ellipse(r * 0.62, 0, r * 0.95, r * 0.62);
    g.pop();
  }
  g.fill(center);
  g.circle(0, 0, r * 0.7);
  g.pop();
}

function drawButterfly(g, x, y, s, flap, c1, c2, ang) {
  const w = Math.abs(Math.cos(flap)) * 0.85 + 0.15;
  g.push();
  g.translate(x, y);
  g.rotate(ang || 0);
  g.noStroke();
  g.push();
  g.scale(w, 1);
  g.fill(c1);
  g.ellipse(-s * 0.55, -s * 0.3, s * 0.9, s * 0.75);
  g.ellipse(s * 0.55, -s * 0.3, s * 0.9, s * 0.75);
  g.fill(c2);
  g.ellipse(-s * 0.4, s * 0.32, s * 0.6, s * 0.5);
  g.ellipse(s * 0.4, s * 0.32, s * 0.6, s * 0.5);
  g.fill(255, 255, 255, 170);
  g.circle(-s * 0.58, -s * 0.32, s * 0.2);
  g.circle(s * 0.58, -s * 0.32, s * 0.2);
  g.pop();
  g.fill('#8a6a9c');
  g.ellipse(0, 0, s * 0.14, s * 0.9);
  g.stroke('#8a6a9c');
  g.strokeWeight(Math.max(1, s * 0.04));
  g.noFill();
  g.line(0, -s * 0.4, -s * 0.2, -s * 0.72);
  g.line(0, -s * 0.4, s * 0.2, -s * 0.72);
  g.pop();
}

function buildBackground() {
  if (bg) bg.remove();
  bg = createGraphics(windowWidth, windowHeight);
  bg.pixelDensity(Math.min(2, window.devicePixelRatio || 1));

  // soft gradient
  const ctx = bg.drawingContext;
  const grad = ctx.createLinearGradient(0, 0, windowWidth, windowHeight);
  grad.addColorStop(0, '#ffe3f1');
  grad.addColorStop(0.5, '#eadfff');
  grad.addColorStop(1, '#d8f4ea');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, windowWidth, windowHeight);

  // scattered flowers + leaves around the edges (kept off the board)
  const rand = rng(7);
  const boardL = px(-0.4), boardR = px(GEO.cols + 0.4);
  ctx.globalAlpha = 0.75;
  for (let i = 0; i < 44; i++) {
    const x = rand() * windowWidth, y = rand() * windowHeight;
    const r = 16 + rand() * 40;
    if (x > boardL - r && x < boardR + r) continue;
    bg.noStroke();
    bg.fill('#c8efd4');
    bg.push(); bg.translate(x, y + r * 0.9); bg.rotate(-0.6); bg.ellipse(0, 0, r * 1.3, r * 0.5); bg.pop();
    bg.push(); bg.translate(x, y + r * 0.9); bg.rotate(0.6);  bg.ellipse(0, 0, r * 1.3, r * 0.5); bg.pop();
    drawFlower(bg, x, y, r, 5 + Math.floor(rand() * 3), PASTELS[Math.floor(rand() * PASTELS.length)], '#ffe99a', rand() * 6);
  }
  ctx.globalAlpha = 1;

  // board frame
  const fx = px(-0.1), fy = py(GEO.frameTop);
  const fw = (GEO.cols + 0.2) * S, fh = (GEO.frameBottom - GEO.frameTop) * S;
  bg.stroke('#ffb8d9');
  bg.strokeWeight(Math.max(4, S * 0.08));
  bg.fill(255, 255, 255, 150);
  bg.rect(fx, fy, fw, fh, S * 0.35);

  // the 6 landing pockets
  const SLOT_COLORS = ['#ffc8dd', '#bde0fe', '#fde4cf', '#d9c6f0', '#b9fbc0', '#fbf3b5'];
  bg.noStroke();
  for (let i = 0; i < GEO.cols; i++) {
    bg.fill(SLOT_COLORS[i]);
    bg.rect(px(i) + 2, py(GEO.slotTop), S - 4, (GEO.slotBottom - GEO.slotTop) * S, S * 0.12);
  }
  bg.stroke(255);
  bg.strokeWeight(Math.max(3, S * 0.05));
  for (let i = 1; i < GEO.cols; i++) bg.line(px(i), py(GEO.slotTop), px(i), py(GEO.slotBottom));

  // pegs = little flowers (10 rows)
  for (let r = 0; r < GEO.rows; r++) {
    const xs = (r % 2 === 0) ? [0.5, 1.5, 2.5, 3.5, 4.5, 5.5] : [1, 2, 3, 4, 5];
    xs.forEach(function (x, i) {
      bg.stroke(255);
      bg.strokeWeight(Math.max(1.5, S * 0.03));
      bg.fill(PEG_COLORS[(r + i) % PEG_COLORS.length]);
      bg.circle(px(x), py(pegY(r)), S * GEO.pegR * 2);
    });
  }

  // flower garland along the top edge
  for (let i = 0; i < GEO.cols; i++) {
    drawFlower(bg, px(i + 0.5), py(GEO.frameTop), S * 0.17, 6, PASTELS[(i * 3 + 1) % PASTELS.length], '#ffe27a', i);
  }
}

/* ---------- character pucks (round pictures) ---------- */
function makeCharGfx(i) {
  const g = createGraphics(PUCK_PX, PUCK_PX);
  g.pixelDensity(1);
  drawFallbackPuck(g, i);
  charGfx[i] = g;
  loadImage(CHARACTERS[i].image, function (img) {
    g.clear();
    const c = g.drawingContext;
    c.save();
    c.beginPath();
    c.arc(PUCK_PX / 2, PUCK_PX / 2, PUCK_PX / 2, 0, Math.PI * 2);
    c.clip();
    const sc = Math.max(PUCK_PX / img.width, PUCK_PX / img.height);
    g.image(img, (PUCK_PX - img.width * sc) / 2, (PUCK_PX - img.height * sc) / 2, img.width * sc, img.height * sc);
    c.restore();
  }, function () { /* no image yet: keep the pastel placeholder */ });
}

function drawFallbackPuck(g, i) {
  g.clear();
  g.noStroke();
  g.fill(PASTELS[i % PASTELS.length]);
  g.circle(PUCK_PX / 2, PUCK_PX / 2, PUCK_PX);
  g.fill('#8a5a9c');
  g.textAlign(CENTER, CENTER);
  g.textSize(46);
  g.text(i + 1, PUCK_PX / 2, PUCK_PX / 2 + 3);
}

/* ==========================================================
   butterflies drifting across the screen
   ========================================================== */
function initButterflies() {
  for (let i = 0; i < 9; i++) {
    butterflies.push({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() * 0.00035 + 0.00015) * (Math.random() < 0.5 ? -1 : 1),
      vy: (Math.random() - 0.5) * 0.0002,
      ph: Math.random() * 10,
      size: 22 + Math.random() * 18,
      c1: PASTELS[(i * 3) % PASTELS.length],
      c2: PASTELS[(i * 3 + 4) % PASTELS.length]
    });
  }
}

function updateButterflies() {
  butterflies.forEach(function (b) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -0.05) b.x = 1.05;
    if (b.x > 1.05) b.x = -0.05;
    if (b.y < 0.05 || b.y > 0.95) b.vy = -b.vy;
    const yy = b.y * height + Math.sin(frameCount * 0.03 + b.ph) * 14;
    drawButterfly(window, b.x * width, yy, b.size, frameCount * 0.22 + b.ph, b.c1, b.c2, b.vx * 90);
  });
}

/* ==========================================================
   pucks: path, position, drawing
   ========================================================== */
function buildPath() {
  // Pegs: even rows sit at 0.5,1.5..5.5 — odd rows at 1,2..5.
  // The puck lands on a peg, then hops left or right onto a peg in the next row.
  let x = Math.random() < 0.5 ? 2.5 : 3.5;
  const off = GEO.pegR + GEO.puckR;
  const pts = [{ x: x, y: GEO.startY }];
  for (let r = 0; r < GEO.rows; r++) {
    pts.push({ x: x, y: pegY(r) - off });
    if (r < GEO.rows - 1) {
      const nextEven = ((r + 1) % 2 === 0);
      const lo = nextEven ? 0.5 : 1, hi = nextEven ? 5.5 : 5;
      let nx = x + (Math.random() < 0.5 ? -0.5 : 0.5);
      if (nx < lo) nx = x + 0.5;
      if (nx > hi) nx = x - 0.5;
      x = nx;
    }
  }
  x += (Math.random() < 0.5 ? -0.5 : 0.5);      // final hop into one of the 6 pockets
  pts.push({ x: x, y: GEO.restY });
  return pts;
}

function puckPos(path, t) {
  const segs = path.length - 1;
  const f = Math.min(t, 0.99999) * segs;
  const k = Math.floor(f), u = f - k;
  const a = path[k], b = path[k + 1];
  const hop = (k === 0) ? 0 : (k === segs - 1 ? GEO.hop * 0.8 : GEO.hop);
  const yu = (k === 0) ? u * u : u;
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * yu - 4 * hop * u * (1 - u)
  };
}

function drawPuck(p, x, y) {
  const r = GEO.puckR * S;
  const cx = px(x), cy = py(y);
  noStroke();
  fill(120, 80, 140, 45);
  circle(cx + r * 0.12, cy + r * 0.2, r * 2.15);
  fill(p.ring);
  circle(cx, cy, r * 2.25);
  push();
  translate(cx, cy);
  rotate(Math.sin(millis() * 0.004 + p.wob) * 0.12);
  imageMode(CENTER);
  image(charGfx[p.char], 0, 0, r * 1.92, r * 1.92);
  pop();
  noFill();
  stroke(255);
  strokeWeight(Math.max(2, r * 0.1));
  circle(cx, cy, r * 2.25);
}

function burst(p) {
  const last = p.path[p.path.length - 1];
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: px(last.x), y: py(last.y),
      vx: (Math.random() - 0.5) * S * 0.07,
      vy: -(Math.random() * 0.5 + 0.3) * S * 0.07,
      life: 60, rot: Math.random() * 6, s: S * (0.14 + Math.random() * 0.1),
      col: PASTELS[Math.floor(Math.random() * PASTELS.length)]
    });
  }
}

function drawParticles() {
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    const q = particles[i];
    q.x += q.vx; q.y += q.vy; q.vy += S * 0.0035; q.life--; q.rot += 0.1;
    if (q.life <= 0) { particles.splice(i, 1); continue; }
    drawingContext.globalAlpha = q.life / 60;
    fill(q.col);
    push();
    translate(q.x, q.y);
    rotate(q.rot);
    ellipse(0, 0, q.s, q.s * 0.55);
    pop();
  }
  drawingContext.globalAlpha = 1;
}

/* ==========================================================
   dropping pucks
   ========================================================== */
function launchPuck(charIdx, owner) {
  totalDropped++;
  if (owner) {
    owner.count++;
    send(owner, { type: 'count', count: owner.count });
  }
  const si = nextSoundIndex();
  if (si >= 0) playBuf(coinBuf[si]);
  pucks.push({
    path: buildPath(),
    t0: millis(),
    char: charIdx,
    wob: Math.random() * 6,
    ring: PASTELS[(si >= 0 ? si : Math.floor(Math.random() * PASTELS.length)) % PASTELS.length]
  });
  if (totalDropped % SETTINGS.MILESTONE_EVERY === 0) queuePopup(charIdx, totalDropped);
  renderPlayers();
}

function dropBatch(p, n) {
  for (let i = 0; i < n; i++) {
    setTimeout(function () { launchPuck(p.char, p); }, i * SETTINGS.STAGGER_MS);
  }
}

/* ==========================================================
   sound (Web Audio so many sounds can overlap)
   ========================================================== */
let audioCtx = null;
const coinBuf = [], nameBuf = [];
let soundBag = [], lastSound = -1;

function loadBuf(src) {
  if (!isWav(src)) return Promise.resolve(null);       // "insert wav" = skipped
  return fetch(src)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
    .then(function (ab) { return new Promise(function (res, rej) { audioCtx.decodeAudioData(ab, res, rej); }); })
    .catch(function (e) { console.warn('Could not load sound:', src, e); return null; });
}

function initAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return Promise.resolve();
  audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const jobs = [];
  COIN_SOUNDS.forEach(function (src, i) { jobs.push(loadBuf(src).then(function (b) { coinBuf[i] = b; })); });
  CHARACTERS.forEach(function (c, i) { jobs.push(loadBuf(c.sound).then(function (b) { nameBuf[i] = b; })); });
  return Promise.all(jobs);
}

function playBuf(buf) {
  if (!buf || !audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const s = audioCtx.createBufferSource();
    s.buffer = buf;
    s.connect(audioCtx.destination);
    s.start(0);
  } catch (e) { /* ignore */ }
}

function nextSoundIndex() {              // shuffled "bag": all sounds play, then reshuffle
  if (!soundBag.length) {
    const have = [];
    coinBuf.forEach(function (b, i) { if (b) have.push(i); });
    if (!have.length) return -1;
    for (let i = have.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = have[i]; have[i] = have[j]; have[j] = tmp;
    }
    if (have.length > 1 && have[have.length - 1] === lastSound) have.unshift(have.pop());
    soundBag = have;
  }
  lastSound = soundBag.pop();
  return lastSound;
}

/* ==========================================================
   the 15-puck pop-up
   ========================================================== */
const popupQueue = [];
let popupBusy = false;

function queuePopup(ci, n) {
  popupQueue.push({ ci: ci, n: n });
  if (!popupBusy) nextPopup();
}

function nextPopup() {
  const job = popupQueue.shift();
  if (!job) { popupBusy = false; return; }
  popupBusy = true;
  $('popImg').innerHTML = avatarHTML(job.ci, 'big');
  $('popName').textContent = CHARACTERS[job.ci].name;
  $('popSub').textContent = 'Puck #' + job.n + '!';
  const el = $('popup');
  el.classList.add('show');
  playBuf(nameBuf[job.ci]);
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(nextPopup, 450);
  }, SETTINGS.POPUP_SECONDS * 1000);
}

/* ==========================================================
   player list (top right)
   ========================================================== */
function renderPlayers() {
  const list = Object.keys(players).map(function (k) { return players[k]; });
  let html = '<div class="ptitle">Players: ' + list.length + ' &nbsp;·&nbsp; Pucks: ' + totalDropped + '</div>';
  list.forEach(function (p) {
    html += '<div class="prow' + (p.online ? '' : ' off') + '">' + avatarHTML(p.char, 'mini') +
      '<span class="pname">' + CHARACTERS[p.char].name + '</span><span class="pcount">' + p.count + '</span></div>';
  });
  $('players').innerHTML = html;
}

/* ==========================================================
   start button + SPACE bar
   ========================================================== */
function wireUI() {
  buildCharGrid($('hostGrid'), function (i) { hostChar = i; }, 0);
  $('startBtn').addEventListener('click', onStart);
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && started) {
      e.preventDefault();
      if (!e.repeat) launchPuck(hostChar, null);
    }
  });
  renderPlayers();
}

function onStart() {
  const b = $('startBtn');
  b.disabled = true;
  b.textContent = 'Loading sounds…';
  initAudio().catch(function (e) { console.warn(e); }).then(function () {
    started = true;
    $('startOverlay').style.display = 'none';
    broadcast({ type: 'started' });
  });
}

/* ==========================================================
   phones: PeerJS connection (game code)
   ========================================================== */
function setStatus(text, ok) {
  const el = $('status');
  el.textContent = text;
  el.className = ok ? 'ok' : 'bad';
}

function send(p, msg) {
  try { if (p && p.conn && p.conn.open) p.conn.send(msg); } catch (e) { /* ignore */ }
}

function broadcast(msg) {
  Object.keys(players).forEach(function (k) { send(players[k], msg); });
}

function showJoinInfo(code) {
  $('joinCode').textContent = code;
  const u = new URL('play.html', location.href);
  u.search = ''; u.hash = '';
  const shown = u.host + u.pathname;
  u.searchParams.set('code', code);
  $('joinUrl').textContent = shown;
  try {
    const qr = qrcode(0, 'M');
    qr.addData(u.href);
    qr.make();
    $('qr').innerHTML = qr.createImgTag(4, 2);
  } catch (e) { console.warn('QR failed', e); }
}

function startPeer(attempt) {
  clearTimeout(retryTimer);
  if (peer) { try { peer.destroy(); } catch (e) { /* ignore */ } peer = null; }
  const code = makeCode(4);
  let p;
  try {
    p = new Peer(SETTINGS.ID_PREFIX + code, SETTINGS.PEER_OPTIONS || {});
  } catch (e) {
    setStatus('Phone join unavailable — press SPACE to drop pucks.', false);
    return;
  }
  peer = p;
  joinCode = '';

  p.on('open', function () {
    joinCode = code;
    showJoinInfo(code);
    setStatus('Ready — waiting for phones…', true);
  });

  p.on('connection', function (conn) {
    conn.on('data', function (d) { onData(conn, d); });
    conn.on('close', function () { onConnClosed(conn); });
    conn.on('error', function () { onConnClosed(conn); });
  });

  p.on('disconnected', function () {
    setTimeout(function () { try { if (peer === p && !p.destroyed) p.reconnect(); } catch (e) { /* ignore */ } }, 1500);
  });

  p.on('error', function (err) {
    if (err.type === 'unavailable-id' && attempt < 6) { startPeer(attempt + 1); return; }
    console.warn('Peer error:', err);
    if (!joinCode) {
      setStatus('Can\'t reach the connection server — phones can\'t join. SPACE still works.', false);
      clearTimeout(retryTimer);
      retryTimer = setTimeout(function () { startPeer(0); }, 8000);
    }
  });
}

function onConnClosed(conn) {
  const pid = connPid[conn.peer];
  const p = players[pid];
  if (p && p.conn === conn) { p.online = false; p.conn = null; renderPlayers(); }
}

function onData(conn, d) {
  if (!d || typeof d !== 'object') return;
  if (d.type === 'pick') {
    const pid = String(d.pid || conn.peer).slice(0, 40);
    const ch = clampInt(d.char, 0, CHARACTERS.length - 1);
    let p = players[pid];
    if (!p) { p = players[pid] = { pid: pid, char: ch, count: 0, conn: conn, online: true }; }
    else { p.char = ch; p.conn = conn; p.online = true; }
    connPid[conn.peer] = pid;
    send(p, { type: 'joined', count: p.count, started: started });
    renderPlayers();
  } else if (d.type === 'spin') {
    const p = players[connPid[conn.peer]];
    if (!p || !started) return;
    dropBatch(p, clampInt(d.n, 0, 5));
  }
}
