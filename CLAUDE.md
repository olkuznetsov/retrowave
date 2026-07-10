# RetroWave — CLAUDE.md

Live: https://retrowave.pages.dev

## Git — commit & push after every change (standing rule; don't wait to be asked)

After completing any code change, **automatically `git commit` + `git push origin main`** — no need to ask each time.
- Descriptive message, ending `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **Never commit secrets.** R2 + Firebase keys live in the gitignored `.env` (the `upload-*.mjs` scripts read R2 creds via `process.loadEnvFile()`); `.gitignore` covers `.env`, `node_modules/`, `dist/`, `.wrangler/`. Verify no key is staged before committing.
- Repo: `git@github.com:olkuznetsov/retrowave.git`, branch `main`.

## What this is
A retro gaming platform with a Final Fantasy X / PS2-era aesthetic. Users can play classic ROMs directly in the browser via EmulatorJS. Built by Sasha (Oleksandr Kuznetsov).

## Stack
| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Styling | CSS Modules + custom theme vars (`src/styles/theme.css`) |
| Emulation | EmulatorJS v4.2.3 (self-hosted on Cloudflare R2) |
| Auth | Firebase Authentication (Google + Email/Password) |
| Database | Cloud Firestore (favorites, save states per user) |
| ROM/asset storage | Cloudflare R2 (S3-compatible, public bucket) |
| Hosting | Cloudflare Pages |

## Project structure
```
src/
  components/
    AuthModal/         — sign in / sign up modal
    ConsoleCarousel/   — homepage console picker
    EmulatorPlayer/    — desktop iframe wrapper + gamepad indicator
    FavoriteButton/    — heart toggle, writes to Firestore
    GameInfo/          — game detail panel
    GameList/          — grid of games for a console
    Layout/            — shell (navbar + wave bg)
    MusicToggle/       — procedural ambient music toggle
    Navbar/            — top nav
    WaveBackground/    — animated SVG wave (FFX vibe)
  context/
    AuthContext.jsx    — Firebase auth state
    MusicContext.jsx   — ambient music state
  data/
    consoles.js        — all 22 consoles + sample GAMES map (ROM URLs point to R2)
  hooks/
    useAuth.js
    useFavorites.js
    useMusic.js
    useSaveStates.js   — upload/download save states to Firestore
  pages/
    HomePage.jsx       — console carousel
    ConsolePage.jsx    — game list for a console
    PlayPage.jsx       — launches EmulatorPlayer
    ProfilePage.jsx    — user favorites + save states
  styles/
    global.css
    theme.css          — CSS vars: --ffx-glow, --ffx-light, --font-heading, etc.
  firebase.js          — Firebase app init

public/
  emulator.html        — standalone EmulatorJS page (used for desktop iframe + mobile redirect)
  emulatorjs/          — EmulatorJS assets (also mirrored on R2)
  images/consoles/     — SVG console art
  audio/               — ambient music assets
```

## Key architectural decisions

### Desktop vs mobile emulation
- **Desktop**: game runs in an `<iframe src="/emulator.html">` inside `EmulatorPlayer`. The iframe has `allow="gamepad; autoplay; fullscreen"`.
- **Mobile**: `EmulatorPlayer` does a full-page redirect to `/emulator.html` — avoids iOS Safari's WebGL-in-iframe block.

### EmulatorJS config (`public/emulator.html`)
All EmulatorJS globals are set in `configureEmulator()`:
- `EJS_pathtodata` → R2 bucket URL (self-hosted cores/loader)
- `EJS_disableDatabases = true` → avoids iOS Safari IndexedDB quota crash on large ROMs
- `EJS_startOnLoaded = true`
- Mobile gets a tap-to-start overlay (unlocks iOS AudioContext via user gesture)
- Desktop loads immediately

### Gamepad support
EmulatorJS handles gamepads natively via the Gamepad API (RetroArch retropad system). No extra config needed — just connect a controller and **press any button** while the tab is active. The `EmulatorPlayer` shows a live gamepad indicator (green = connected, grey = none detected) so users know their controller was recognised.

### R2 asset layout
```
/roms/{console-id}/{game-id}.{ext}
/covers/{console-id}/{game-id}.jpg
/bios/{filename}
/emulatorjs/           — EmulatorJS loader + cores
```

## Environment variables (`.env`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_R2_PUBLIC_URL=https://pub-44598954bf774754af38263b7890873b.r2.dev
```

## Local dev
```bash
npm install
npm run dev
```

## Deploy
```bash
npm run build
./node_modules/.bin/wrangler pages deploy dist --project-name retrowave
```

## Known issues / future work
- ROM library is small (sample games only) — needs expansion
- Save states work per-user in Firestore but no UI to manage/delete them yet
- NDS (melonds) and Saturn (yabause) cores are heavy and slow to load
- No search / filter on the game list yet
