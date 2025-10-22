# Aviator Full App (Node.js + Express + Socket.io + SQLite)

This repository contains a minimal, ready-to-run **Aviator** game app:
- **Backend:** Node.js + Express + Socket.io
- **Database:** SQLite (using better-sqlite3)
- **Frontend:** Simple HTML/JS served from `/public`

## What's included
- `server.js` — Express server + Socket.io game logic (simulated crash points).
- `public/` — frontend UI to connect and display the game.
- `data/aviator.db` — database will be created when seeding or running.
- `scripts/seed.js` — creates tables and inserts some example history.
- `.env.example` — environment sample.
- `package.json` — dependencies & scripts.

## How to run (local)
1. Unzip and open terminal in project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database (optional):
   ```bash
   npm run seed-db
   ```
4. Start the app:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
5. Open your browser at `http://localhost:3000` (or the port in your .env).

## Notes
- Do **not** commit `.env` with secrets.
- The frontend included is minimal and intended for testing and demonstration.
- Want me to prepare a GitHub repo and push this for you? Share your GitHub username and confirm and I can give instructions to push the created ZIP or repo.

Enjoy! 🚀
