import express from "express";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const FAVORITES_FILE = "./data/favorites.ndjson";
const appendFile = promisify(fs.appendFile);

router.post("/add", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { movieId, title, extra = {} } = req.body;
  if (!movieId || !title) return res.status(400).json({ error: "Missing fields" });

  const entry = {
    id: `f_${Date.now()}`,
    userId,
    movieId,
    title,
    extra,
    addedAt: new Date().toISOString()
  };

  try {
    // append line (atomic on small writes)
    await appendFile(FAVORITES_FILE, JSON.stringify(entry) + "\n");
    res.json({ ok: true, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add favorite" });
  }
});

router.get("/list", requireAuth, (req, res) => {
  const userId = req.user.id;

  // stream-read and parse NDJSON line-by-line to avoid loading whole file
  const readStream = fs.createReadStream(FAVORITES_FILE, { encoding: "utf8" });
  let leftover = "";
  const results = [];

  readStream.on("data", chunk => {
    const lines = (leftover + chunk).split("\n");
    leftover = lines.pop(); // last partial line
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.userId === userId) results.push(obj);
      } catch (e) {
        // ignore malformed line
      }
    }
  });

  readStream.on("end", () => {
    // try leftover
    if (leftover.trim()) {
      try {
        const obj = JSON.parse(leftover);
        if (obj.userId === userId) results.push(obj);
      } catch (e) {}
    }
    res.json(results);
  });

  readStream.on("error", err => {
    if (err.code === "ENOENT") return res.json([]); // no file yet
    res.status(500).json({ error: "Could not read favorites" });
  });
});

export default router;
