const express = require("express");
const { classifyImage, upload } = require("../controllers/playgroundController");

const router = express.Router();

// POST /api/playground/classify — multipart "image" field, forwarded to the
// FastAPI classification service. No auth: the Playground is a public demo.
router.post("/classify", upload.single("image"), classifyImage);

module.exports = router;
