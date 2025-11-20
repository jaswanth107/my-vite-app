import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- FILE PATHS -----
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USER_FILE = path.join(DATA_DIR, "user.ndjson");
const FAVORITES_FILE = path.join(DATA_DIR, "favorites.ndjson");

// ----- READ NDJSON -----
function readNDJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8").trim();
  if (!data) return [];
  return data.split("\n").map((line) => JSON.parse(line));
}

// ----- WRITE TO NDJSON -----
function appendNDJSON(filePath, obj) {
  fs.appendFileSync(filePath, JSON.stringify(obj) + "\n");
}

// ========== SIGNUP ==========
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const users = readNDJSON(USER_FILE);
  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  const newUser = { id: uuidv4(), email, password };
  appendNDJSON(USER_FILE, newUser);

  res.json({ message: "Signup successful", userId: newUser.id, token: uuidv4() });
});

// ========== LOGIN ==========
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readNDJSON(USER_FILE);

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "Login successful", userId: user.id, token: uuidv4() });
});

// ========== GET FAVORITES ==========
app.get("/favorites", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  const favorites = readNDJSON(FAVORITES_FILE);
  res.json(favorites.filter((f) => f.userId === userId));
});

// ========== ADD FAVORITE ==========
app.post("/favorites", (req, res) => {
  const { userId, movie } = req.body;
  if (!userId || !movie)
    return res.status(400).json({ message: "userId and movie are required" });

  const newFav = { id: uuidv4(), userId, movie };
  appendNDJSON(FAVORITES_FILE, newFav);

  res.json({ message: "Favorite added", newFav });
});

// ========== DELETE FAVORITE ==========
app.delete("/favorites/:id", (req, res) => {
  const favId = req.params.id;
  const favorites = readNDJSON(FAVORITES_FILE);
  const updated = favorites.filter((f) => f.id !== favId);

  fs.writeFileSync(
    FAVORITES_FILE,
    updated.map((obj) => JSON.stringify(obj)).join("\n") + "\n"
  );

  res.json({ message: "Favorite removed" });
});

// ----- SERVER START -----
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
