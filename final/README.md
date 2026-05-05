# CatJJArt Portfolio
**Three.js horizontal scroll portfolio — JJ Cathcart**

---

## Project Structure

```
portfolio/
├── index.html          ← Entry point. Change your name/tagline here (or in works.js)
├── style.css           ← All styles. Colors, fonts, layout.
├── js/
│   ├── works.js        ← ✏️  YOUR CONTENT. Edit this file to update works & info.
│   └── main.js         ← Three.js engine, scroll controls, animation loop.
└── assets/
    └── images/
        ├── work-1.jpg  ← Drop your images here (see naming below)
        ├── work-2.jpg
        ├── work-3.jpg
        ├── work-4.jpg
        └── work-5.jpg
```

---

## Quickstart

### 1 — Add your images

Drop your image files into `assets/images/`. Name them:

```
work-1.jpg
work-2.jpg
work-3.jpg
work-4.jpg
work-5.jpg
```

Any image format works (`.jpg`, `.png`, `.webp`). Update the `image` path in `works.js` if you use a different naming convention.

**Recommended size:** 1200 × 1400 px or similar portrait orientation for best fit.

---

### 2 — Edit your works

Open `js/works.js` and fill in each entry:

```js
export const WORKS = [
  {
    title:       "Your Work Title",
    year:        "2024",
    medium:      "Oil on Canvas",
    description: "A brief description.",
    image:       "./assets/images/work-1.jpg",
  },
  // ...
];
```

Also update the `CONFIG` block at the bottom of `works.js` for your name, tagline, and contact info.

---

### 3 — Run locally (required — browsers block ES module imports from file://)

You need a local server. Pick one:

**Option A — VS Code Live Server extension**
Install "Live Server" by Ritwick Dey → right-click `index.html` → Open with Live Server.

**Option B — Python (built-in)**
```bash
cd portfolio
python3 -m http.server 8080
# Open: http://localhost:8080
```

**Option C — Node / npx**
```bash
cd portfolio
npx serve .
# Open the URL it prints
```

---

## Customization

### Colors — `style.css`
```css
:root {
  --bg:      #0c0b09;   /* main background */
  --cream:   #eee8dc;   /* panel + text color */
  --wine:    #7d2030;   /* accent (star, progress bar, labels) */
  --charcoal:#1e1c19;   /* panel border */
  --muted:   #7a7470;   /* metadata text */
  --dim:     #3a3733;   /* description text + lines */
}
```

### Scroll feel — `js/main.js`
```js
const LERP_SPEED    = 0.075;   // Lower = silkier/slower easing
const DRAG_SCALE    = 0.018;   // Mouse drag sensitivity
const WHEEL_SCALE   = 0.012;   // Wheel sensitivity
const INERTIA_DECAY = 0.88;    // Momentum friction (0.8 = short, 0.95 = long)
```

### Panel spacing — `js/main.js`
```js
const PANEL_SPACING  = 11;   // World units between panels
const FIRST_PANEL_X  = 11;   // Where the first panel appears
```

### Add or remove works
- Add an entry to the `WORKS` array in `works.js`
- Add a matching image to `assets/images/`
- The scene builds automatically from the array — no Three.js code to touch.

### Fonts
Change the Google Fonts import URL in `style.css` and update `--font-display` / `--font-body` variables.

---

## Controls
| Action | Effect |
|--------|--------|
| Mouse wheel | Horizontal scroll |
| Click + drag | Pan left/right |
| Release drag | Inertia / momentum |
| Touch swipe | Horizontal scroll (mobile) |

---

## Deployment

This is a static site — host it anywhere:
- **GitHub Pages** — push repo, enable Pages in settings.
- **Netlify** — drag the `portfolio/` folder into Netlify's deploy UI.
- **Vercel** — `vercel deploy` from the folder.

No build step required.

---

## Note on TrackballControls

Three.js's built-in `TrackballControls` rotates the scene freely, which conflicts with horizontal-only navigation. This project implements equivalent drag physics — inertia, momentum, and smooth easing — constrained to the X axis. If you want to add TrackballControls for a future "dive into work" detail view, the import line is left as a comment at the top of `main.js`.
