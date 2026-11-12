# Plinko Garden 🌸🦋

A pastel flower-and-butterfly Plinko for a big screen, with phones as controllers (Kahoot-style game code).
Built with p5.js. Everything you need is in this folder — no installs.

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | **The big host screen.** Open this one on the projector/TV. |
| `play.html` | The phone controller. Players open this (the QR code does it for them). |
| `config.js` | **The only file you edit.** Names, picture paths, sound paths, timings. |
| `images/` | Put your 13 character pictures here. |
| `sounds/` | Put your 30 coin sounds + 13 character sounds (.wav) here. |
| `lib/` | p5.js, PeerJS and QR code libraries (already included — don't touch). |
| `host.js`, `play.js`, `shared.js`, `style.css` | The game itself. |

## What you need to add

**1. Character names** — open `config.js`, find `CHARACTERS`, and change each `"name"` to the real name.

**2. Character pictures** — save 13 square pictures in `images/` as `character1.png` … `character13.png`
(or change the paths in `config.js`). The picture is used on the selection screen, on the puck, and in the pop-up.
Until a picture exists, a pastel numbered circle is shown, so nothing breaks.

**3. Coin sounds (30)** — put `.wav` files in `sounds/` (e.g. `coin1.wav` … `coin30.wav`), then in `config.js`
under `COIN_SOUNDS` replace each `"insert wav"` with `"sounds/coin1.wav"` etc.
Each puck plays one; they're shuffled so all 30 play before any repeat, then the shuffle restarts.
Make them about 8 seconds long to match the fall. Any left as `"insert wav"` are skipped.

**4. Character pop-up sounds (13)** — same idea: `sound: "insert wav"` → `sound: "sounds/name1.wav"`
in each character's line. Plays with their pop-up every 15 pucks.

*(Only .wav files are accepted. No plug-ins are needed.)*

## How the game works

- Host opens `index.html`, sees the **game code + QR code** top-left, and clicks **Start the garden**
  (that click is needed so the browser allows sound).
- Players scan the QR (or open `play.html` and type the 4-letter code) → pick a character → **spin the wheel** (0–5).
  That many pucks drop, one after another. Their total shows **top-right on their phone**.
- Each puck falls for exactly 8 seconds on the 6-column, 10-row board, with the player's picture on it
  and one of the 30 coin sounds playing from the host screen.
- Every 15th puck (all players combined) a pop-up shows that player's character name + plays their sound.
- **Spacebar** on the host drops a puck too (works with no phones at all).

## Publishing on GitHub (needed for phones to connect)

1. On github.com create a new **public** repository.
2. Upload **everything in this folder** (keep the `lib`, `images`, `sounds` folders). Phoenix Code's Git panel works, or use *Add file → Upload files* on GitHub.
3. Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.**
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`
   - **Host screen:** that address (`…/index.html`)
   - **Phones:** `…/play.html` — but players never need to type it: the host screen shows a QR code and the code.

Open the host screen from the published address, not from a file on your computer.
(Phoenix Code's live preview is fine for testing the host + spacebar on your own computer, but phones can't reach it.)
After uploading new pictures/sounds, wait a minute and hard-refresh the host page.

## If phones can't connect

The game code uses **PeerJS** — a free public matchmaking server plus direct phone↔computer connections.
It works on most Wi-Fi and cell data, but some school/work networks block it. If the host card says
"Can't reach the connection server", the network is blocking it. **SPACEBAR always works** as a fallback.
Players who lock their phone just get auto-reconnected when they come back (their count is kept).

## Tweaks (top of `config.js`)

`FALL_SECONDS` (8), `MILESTONE_EVERY` (15), `POPUP_SECONDS` (4), `STAGGER_MS` (gap between pucks from one spin).
