require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/aviator.db';

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id TEXT,
    result REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple API to get recent history
app.get('/api/history', (req, res) => {
  const rows = db.prepare('SELECT * FROM history ORDER BY created_at DESC LIMIT 50').all();
  res.json(rows);
});

// Insert history helper
function saveResult(roundId, result) {
  const stmt = db.prepare('INSERT INTO history (round_id, result) VALUES (?, ?)');
  stmt.run(roundId, result);
}

// Game simulation
// The "Aviator" game starts a round, chooses a random crash multiplier >1.00, counts up then emits crash.
let currentRound = null;
let roundInterval = null;

function startRound() {
  // Choose a random crash multiplier between 1.0 and 10.0, biased to lower values
  const crash = Math.max(1.00, (Math.random() * Math.random() * 10).toFixed(2));
  const roundId = Date.now().toString(36) + Math.floor(Math.random()*1000).toString(36);
  currentRound = { id: roundId, crash: parseFloat(crash), timeStart: Date.now() };
  io.emit('round:start', { roundId: roundId });
  // Simulate multiplier increasing over time
  let multiplier = 1.00;
  const tickMs = 100;
  const growthRate = 0.005 + Math.random()*0.02;
  roundInterval = setInterval(() => {
    multiplier = parseFloat((multiplier + multiplier * growthRate).toFixed(2));
    io.emit('round:tick', { roundId, multiplier });
    if (multiplier >= currentRound.crash) {
      // Crash now
      io.emit('round:crash', { roundId, crash: currentRound.crash });
      saveResult(roundId, currentRound.crash);
      clearInterval(roundInterval);
      currentRound = null;
      // start new round after short delay
      setTimeout(startRound, 3000 + Math.random()*3000);
    }
  }, tickMs);
}

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  // send recent history
  const rows = db.prepare('SELECT * FROM history ORDER BY created_at DESC LIMIT 20').all();
  socket.emit('history', rows);

  socket.on('place:bet', (data) => {
    // For demo only: accept bets, but server does not calculate payouts here.
    console.log('bet placed', data);
    socket.emit('bet:ack', { ok: true, id: data.id || null });
  });
});

// Start loop after server starts
server.listen(PORT, () => {
  console.log('Server listening on port', PORT);
  // wait a couple seconds then start rounds
  setTimeout(startRound, 2000);
});
