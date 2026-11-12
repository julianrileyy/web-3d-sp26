/* Small helpers used by BOTH the host screen and the phones. No need to edit. */

function isWav(s) {
  return typeof s === 'string' && /\.wav$/i.test(s.trim());
}

function clampInt(v, lo, hi) {
  v = parseInt(v, 10);
  if (isNaN(v)) v = lo;
  return Math.max(lo, Math.min(hi, v));
}

function makeCode(n) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no confusing 0/O/1/I
  let s = '';
  for (let i = 0; i < n; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

/* Round character picture. If the image file is missing the pastel
   circle with the character number stays visible instead. */
function avatarHTML(i, extraClass) {
  const c = CHARACTERS[i];
  return '<div class="char-img ' + (extraClass || '') + '">' + (i + 1) +
    '<img alt="" src="' + c.image + '" onerror="this.style.display=\'none\'"></div>';
}

/* Grid of all characters. Calls onPick(index) when one is tapped. */
function buildCharGrid(container, onPick, selected) {
  container.innerHTML = '';
  CHARACTERS.forEach(function (c, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'char-card' + (i === selected ? ' selected' : '');
    b.innerHTML = avatarHTML(i, '') + '<div class="cname"></div>';
    b.querySelector('.cname').textContent = c.name;
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(container.children, function (x) { x.classList.remove('selected'); });
      b.classList.add('selected');
      onPick(i);
    });
    container.appendChild(b);
  });
}
