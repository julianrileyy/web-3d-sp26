/* ==========================================================
   PLINKO GARDEN — PHONE CONTROLLER
   Players: enter code -> pick character -> spin the wheel (0-5 pucks).
   You normally don't need to edit this file — use config.js.
   ========================================================== */
(function () {
  'use strict';
  const $ = function (id) { return document.getElementById(id); };

  const store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  const params = new URLSearchParams(location.search);
  let pid = store.get('plinko_pid');
  if (!pid) {
    pid = 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    store.set('plinko_pid', pid);
  }
  let code = (params.get('code') || store.get('plinko_code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

  let peer = null, conn = null, connTimer = null;
  let connected = false, inGame = false, hostStarted = false, spinning = false, reloading = false;
  let wheelRot = 0, myChar = null, pending = null;

  function show(id) {
    ['scrJoin', 'scrChar', 'scrGame'].forEach(function (s) { $(s).classList.toggle('active', s === id); });
  }
  function joinMsg(t) { $('joinMsg').textContent = t || ''; }
  function setCount(n) { $('countNum').textContent = n; }
  function send(m) { try { if (conn && conn.open) conn.send(m); } catch (e) { /* ignore */ } }

  /* ---------------- wheel (drawn once, rotated with CSS) ---------------- */
  function drawWheel() {
    const cv = $('wheel'), c = cv.getContext('2d');
    const W = cv.width, M = W / 2, R = M - 10;
    const cols = ['#ffc8dd', '#cdb4db', '#bde0fe', '#b9fbc0', '#fde4cf', '#fbf8cc'];
    const rad = function (d) { return d * Math.PI / 180; };
    for (let i = 0; i < 6; i++) {            // segment i is centred at i*60° clockwise from the top
      c.beginPath();
      c.moveTo(M, M);
      c.arc(M, M, R, rad(i * 60 - 30 - 90), rad(i * 60 + 30 - 90));
      c.closePath();
      c.fillStyle = cols[i];
      c.fill();
      c.lineWidth = 6;
      c.strokeStyle = '#fff';
      c.stroke();
      c.save();
      c.translate(M, M);
      c.rotate(rad(i * 60));
      c.fillStyle = '#6b4a7f';
      c.font = 'bold 96px "Trebuchet MS", Arial, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(String(i), 0, -R * 0.62);
      c.restore();
    }
    c.beginPath();
    c.arc(M, M, R, 0, Math.PI * 2);
    c.lineWidth = 14;
    c.strokeStyle = '#ffb8d9';
    c.stroke();
    // little flower in the middle
    c.save();
    c.translate(M, M);
    c.fillStyle = '#ff9ec9';
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate(rad(i * 60));
      c.beginPath();
      c.ellipse(32, 0, 30, 18, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    c.beginPath();
    c.arc(0, 0, 22, 0, Math.PI * 2);
    c.fillStyle = '#ffe27a';
    c.fill();
    c.restore();
  }

  function updateSpin() {
    const b = $('spinBtn');
    b.disabled = !(hostStarted && !spinning && connected);
    b.textContent = hostStarted ? 'SPIN!' : 'Waiting for host…';
  }

  $('spinBtn').addEventListener('click', function () {
    if (spinning || !hostStarted || !connected) return;
    spinning = true;
    updateSpin();
    $('result').textContent = '';
    const k = Math.floor(Math.random() * 6);                 // 0-5 pucks
    const jitter = (Math.random() - 0.5) * 40;               // land somewhere inside the segment
    const target = (((-k * 60 + jitter) % 360) + 360) % 360;
    const cur = ((wheelRot % 360) + 360) % 360;
    const delta = (((target - cur) % 360) + 360) % 360;
    wheelRot += 360 * 5 + delta;
    $('wheel').style.transform = 'rotate(' + wheelRot + 'deg)';
    setTimeout(function () {
      send({ type: 'spin', n: k });
      $('result').textContent = k === 0 ? '0 pucks — spin again!' : (k === 1 ? '1 puck!' : k + ' pucks!') + ' 🦋';
      setTimeout(function () { spinning = false; updateSpin(); }, k * SETTINGS.STAGGER_MS + 900);
    }, 4300);
  });

  /* ---------------- connecting ---------------- */
  function fail(msg, forgetCode) {
    clearTimeout(connTimer);
    if (forgetCode) store.set('plinko_code', '');
    show('scrJoin');
    $('joinBtn').disabled = false;
    joinMsg(msg);
  }

  function connect(c) {
    code = c;
    joinMsg('Connecting…');
    $('joinBtn').disabled = true;
    if (peer) { try { peer.destroy(); } catch (e) { /* ignore */ } }
    clearTimeout(connTimer);
    connTimer = setTimeout(function () {
      fail('Could not connect. Check the code and your Wi-Fi, then try again.');
    }, 15000);

    try { peer = new Peer(SETTINGS.PEER_OPTIONS || {}); }
    catch (e) { fail('Could not start the connection.'); return; }

    peer.on('open', function () {
      conn = peer.connect(SETTINGS.ID_PREFIX + code, { reliable: true });
      conn.on('open', function () {
        clearTimeout(connTimer);
        connected = true;
        store.set('plinko_code', code);
        onConnected();
      });
      conn.on('data', onData);
      conn.on('close', onClosed);
      conn.on('error', function () { /* handled by close */ });
    });
    peer.on('error', function (err) {
      if (err.type === 'peer-unavailable') fail('Can\'t find that code. Check the big screen and try again.', true);
      else fail('Connection problem (' + err.type + '). Please try again.');
    });
  }

  function onConnected() {
    const saved = store.get('plinko_char');              // "CODE:index" — lets you rejoin after a phone sleep
    if (saved && saved.split(':')[0] === code) {
      myChar = clampInt(saved.split(':')[1], 0, CHARACTERS.length - 1);
      send({ type: 'pick', pid: pid, char: myChar });
    } else {
      show('scrChar');
    }
  }

  function onData(d) {
    if (!d || typeof d !== 'object') return;
    if (d.type === 'joined') {
      inGame = true;
      hostStarted = !!d.started;
      setCount(d.count || 0);
      $('meBox').innerHTML = avatarHTML(myChar, 'mini');
      $('meBox').hidden = false;
      $('countBox').hidden = false;
      show('scrGame');
      updateSpin();
    } else if (d.type === 'started') {
      hostStarted = true;
      updateSpin();
    } else if (d.type === 'count') {
      setCount(d.count);
    }
  }

  function onClosed() {
    connected = false;
    if (reloading || !inGame) return;
    reloading = true;
    $('banner').textContent = 'Connection lost — reconnecting…';
    $('banner').hidden = false;
    setTimeout(function () { location.reload(); }, 1500);
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && inGame && (!conn || !conn.open) && !reloading) {
      reloading = true;
      location.reload();
    }
  });

  /* ---------------- wire up the screens ---------------- */
  $('codeIn').addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  $('joinBtn').addEventListener('click', function () {
    const c = $('codeIn').value.trim().toUpperCase();
    if (c.length !== 4) { joinMsg('Enter the 4-letter code from the big screen.'); return; }
    connect(c);
  });
  $('codeIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('joinBtn').click(); });

  buildCharGrid($('charGrid'), function (i) { pending = i; $('goBtn').disabled = false; }, -1);
  $('goBtn').addEventListener('click', function () {
    if (pending === null || !connected) return;
    myChar = pending;
    store.set('plinko_char', code + ':' + myChar);
    send({ type: 'pick', pid: pid, char: myChar });
  });

  drawWheel();
  if (code.length === 4) {
    $('codeIn').value = code;
    connect(code);
  }
})();
