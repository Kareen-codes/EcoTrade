// EcoMate AI — Playground classification proxy (Express port of the Next.js
// route). Thin layer between the Playground page and the FastAPI classifier:
//
//   1. Receive the multipart "image" field (multer, 5MB limit — mirrors the
//      FastAPI service's own limit).
//   2. Forward it to POST {FASTAPI_CLASSIFIER_URL}/classify.
//   3. Normalize FastAPI's { detail: ... } error shape into { error: string }
//      so the Playground page can display it directly.
//
// The uploaded file is a temporary staging copy (multer requires diskStorage
// to stream the forward) and is deleted immediately after the request.

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // mirrors the FastAPI service's own limit

// multer doesn't create the destination directory — make sure it exists
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname) || ".jpg";
      cb(null, `playground-${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed."));
    }
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

const CLASSIFIER_TIMEOUT_MS = 60 * 1000; // Gemini calls can take a while

/**
 * POST /api/playground/classify
 * Forwards the "image" multipart field to the FastAPI classification service.
 */
const classifyImage = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No image was provided." });
  }

  // The temp upload is never needed after forwarding — best-effort cleanup.
  const cleanup = () => fs.promises.unlink(file.path).catch(() => {});

  if (!process.env.FASTAPI_CLASSIFIER_URL) {
    console.error("FASTAPI_CLASSIFIER_URL is not set.");
    await cleanup();
    return res.status(500).json({ error: "Classification service is not configured." });
  }

  const baseUrl = process.env.FASTAPI_CLASSIFIER_URL.replace(/\/+$/, "");

  try {
    const fileBuffer = await fs.promises.readFile(file.path);
    const upstreamForm = new FormData();
    upstreamForm.append(
      "image",
      new Blob([fileBuffer], { type: file.mimetype || "image/jpeg" }),
      file.originalname || "snapshot.jpg"
    );

    let upstreamRes;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CLASSIFIER_TIMEOUT_MS);
      upstreamRes = await fetch(`${baseUrl}/classify`, {
        method: "POST",
        body: upstreamForm,
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
    } catch (err) {
      console.error("Failed to reach classification service:", err.message);
      await cleanup();
      return res
        .status(502)
        .json({ error: "Couldn't reach the classification service. Please try again." });
    }

    const payload = await upstreamRes.json().catch(() => null);
    await cleanup();

    if (!upstreamRes.ok) {
      const detail =
        payload && typeof payload === "object" && "detail" in payload
          ? payload.detail
          : null;

      const message =
        typeof detail === "string"
          ? detail
          : "The image couldn't be classified. Please check it shows a recyclable item or artwork.";

      return res.status(upstreamRes.status).json({ error: message });
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error("Classification proxy failed:", err);
    await cleanup();
    return res
      .status(500)
      .json({ error: "Something went wrong while classifying the image." });
  }
};

module.exports = { classifyImage, upload };
