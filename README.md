# ~ RetroWave ~

A retro gaming platform built with a Final Fantasy X / PS2-era aesthetic. Play classic games from 22 consoles directly in the browser.

**Live:** [retrowave.pages.dev](https://retrowave.pages.dev)

## Features

- 🎮 **22 consoles** — PS1, SNES, N64, GBA, Genesis, Dreamcast, and more
- 🐉 **In-browser emulation** via [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) v4.2.3
- 🎨 **FFX-inspired UI** — neon blues, animated wave background, SVG console art
- 🔐 **Firebase Auth** — sign in with Google or Email/Password
- ❤️ **Favorites & save states** — persisted per user via Firestore
- 🎵 **Procedural ambient music** — Web Audio API, no MP3 needed
- ☁️ **Cloudflare R2** — ROMs, covers, and EmulatorJS assets hosted on the edge

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Styling | CSS Modules + custom theme vars |
| Emulation | EmulatorJS v4.2.3 (self-hosted on R2) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Cloudflare R2 (S3-compatible) |
| Hosting | Cloudflare Pages |

## Local Development

```bash
# Install dependencies
npm install

# Copy and fill in your environment variables
cp .env.example .env

# Start dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

## Deploy

```bash
npm run build
./node_modules/.bin/wrangler pages deploy dist --project-name retrowave
```
