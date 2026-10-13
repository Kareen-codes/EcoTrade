// EcoMate AI — standalone news feed API server
//
// Purpose: serves the eco news feed without requiring MongoDB, so the Feed
// page works in the Freebuff preview and other environments where the full
// EcoTrade backend (Mongo + auth) is not running.
//
// Endpoints:
//   GET  /api/health              -> { ok: true }
//   GET  /api/news?feed=eco&page=1 -> aggregated eco news (NewsAPI + GNews)
//   POST /api/playground/classify -> AI classification proxy (FastAPI)
//
// Keys: NEWSAPI_KEY and/or GNEWS_API_KEY from the environment.
// Port: NEWS_PORT || 5001.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getEcoFeed } = require('./controllers/newsController');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/playground', require('./routes/playgroundRoutes'));

const PORT = process.env.NEWS_PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅  EcoMate news API listening on http://localhost:${PORT}`);
});
