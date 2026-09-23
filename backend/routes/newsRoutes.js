const express = require("express");
const { getEcoFeed } = require("../controllers/newsController");

const router = express.Router();

// GET /api/news?feed=eco&page=1 — aggregated eco news (NewsAPI + GNews)
router.get("/", getEcoFeed);

module.exports = router;
